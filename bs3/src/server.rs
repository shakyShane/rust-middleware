use crate::client::script::Script;
use crate::resp_mod::RespModData;
use actix_files::{Files, NamedFile};
use actix_web::dev::{Server, Service};

use actix_web::http::header;
use actix_web::http::header::{HeaderValue, CACHE_CONTROL, CONTENT_TYPE, EXPIRES, PRAGMA};
use actix_web::web::Data;
use actix_web::{web, App, HttpRequest, HttpResponse, HttpServer};

use crate::options::Options;

use crate::serve_static_config::ServeStaticConfig;
use crate::{read_response_body, BrowserSyncMsg, MultiService, ServeStatic};
use tokio::sync::mpsc::Sender;

pub fn create_server(opts: Options, sender: Sender<BrowserSyncMsg>) -> Server {
    let server = HttpServer::new(move || {
        App::new()
            .wrap(read_response_body::RespMod)
            .wrap_fn(|req, srv| {
                let fut = srv.call(req);
                async {
                    let mut res = fut.await?;
                    let headers = res.headers_mut();
                    headers.insert(
                        CACHE_CONTROL,
                        HeaderValue::from_static("no-cache, no-store, must-revalidate"),
                    );
                    headers.insert(PRAGMA, HeaderValue::from_static("no-cache"));
                    headers.insert(EXPIRES, HeaderValue::from_static("0"));
                    Ok(res)
                }
            })
            .configure(|cfg| config(cfg, &opts.clone(), sender.clone()))
    });

    println!("trying to bind to 🚀 {:?}", ("127.0.0.1", 8080));
    let addr = ("127.0.0.1", 8080);
    server
        .disable_signals()
        .workers(1)
        .bind(addr)
        .unwrap()
        .run()
}

// this function could be located in a different module
fn config(cfg: &mut web::ServiceConfig, opts: &Options, sender: Sender<BrowserSyncMsg>) {
    let ss: Vec<ServeStatic> = opts
        .trailing
        .iter()
        .map(|trailing| match trailing {
            ServeStaticConfig::DirOnly(dir) => vec![ServeStatic::from_dir(dir, opts)],
            ServeStaticConfig::RoutesAndDir(inner) => inner
                .routes
                .iter()
                .map(|r| ServeStatic::from_dir_routed(&inner.dir, r, opts))
                .collect(),
        })
        .flatten()
        .collect();

    dbg!(&ss);

    let fw = MultiService { serve_static: ss };

    // todo: How to pass this debug flag?
    let script = Script::with_debug();
    let mods = RespModData {
        items: vec![Box::new(script.clone())],
    };
    cfg.app_data(Data::new(mods));
    cfg.app_data(Data::new(sender));

    // let serve_from = if opts.cwd.ends_with("bs3") {
    //     opts.cwd.join("client-js")
    // } else {
    //     opts.cwd.join("bs3/client-js")
    // };
    // cfg.service(Files::(Script::route(), serve_from));

    script.configure(cfg);

    cfg.service(fw);
}

#[cfg(test)]
mod tests {
    use actix_web::body::to_bytes;
    use actix_web::{test, App};

    use super::*;

    #[actix_web::test]
    async fn test_index_get() -> Result<(), ()> {
        let (sender, _rx) = tokio::sync::mpsc::channel::<BrowserSyncMsg>(1);
        let opts = Options::try_from_args(["bs3", "fixtures"]).expect("args");
        let app = test::init_service(
            App::new()
                .wrap(read_response_body::RespMod)
                .configure(|cfg| config(cfg, &opts, sender.clone())),
        )
        .await;
        let req = test::TestRequest::default()
            .uri("/")
            .insert_header(("accept", "text/html"))
            .to_request();
        let bytes = test::call_and_read_body(&app, req).await;
        let v = String::from_utf8(bytes.to_vec()).expect("to string");
        assert!(v.contains("injected by Browsersync"));
        Ok(())
    }

    #[actix_web::test]
    async fn test_index_html_get() -> Result<(), ()> {
        let (sender, _rx) = tokio::sync::mpsc::channel::<BrowserSyncMsg>(1);
        let opts = Options::try_from_args(["___", "fixtures"]).expect("args");
        let app = test::init_service(
            App::new()
                .wrap(read_response_body::RespMod)
                .configure(|cfg| config(cfg, &opts, sender.clone())),
        )
        .await;
        let req = test::TestRequest::default()
            .uri(Script::uri().as_str())
            .to_request();
        let srv_resp = test::call_service(&app, req).await;
        assert!(srv_resp.status().is_success());
        let bytes = to_bytes(srv_resp.into_body()).await.expect("body");
        assert_eq!(bytes.to_vec(), include_bytes!("../client-js/client.js"));
        Ok(())
    }
}
