use crate::client::script::Script;
use crate::resp_mod::RespModData;

use actix_web::dev::{Server, Service};

use actix_web::http::header::{HeaderValue, CACHE_CONTROL, EXPIRES, PRAGMA};
use actix_web::web::Data;
use actix_web::{web, App, HttpServer};

use crate::options::Options;

use crate::client::runtime::{Runtime, TempData};
use crate::{read_response_body, BrowserSyncMsg, MultiService, ServeStatic};
use tokio::sync::mpsc::Sender;
use tokio::sync::Mutex;

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
    let mut ss = ServeStatic::from_configs(&opts.trailing, opts);
    if let Some(serve_static) = &opts.serve_static {
        ss.extend(ServeStatic::from_configs(serve_static, opts));
    }
    dbg!(&ss);

    let services = MultiService { serve_static: ss };

    // todo: How to pass this debug flag?
    let script = Script::with_debug();
    let runtime = Runtime::with_debug();
    let mods = RespModData {
        items: vec![Box::new(script.clone())],
    };

    let temp_data = TempData::default();
    let temp_data_mutex = Mutex::new(temp_data);

    cfg.app_data(Data::new(mods));
    cfg.app_data(Data::new(sender));
    cfg.app_data(Data::new(temp_data_mutex));

    runtime.configure(opts, cfg);
    script.configure(cfg);

    cfg.service(services);
}

#[cfg(test)]
mod tests {
    use actix_web::body::to_bytes;
    use actix_web::{test, App};

    use super::*;

    async fn req_body(uri: &str, args: &[&str]) -> Result<String, ()> {
        let (sender, _rx) = tokio::sync::mpsc::channel::<BrowserSyncMsg>(1);
        let opts = Options::try_from_args(args).expect("args");
        let app = test::init_service(
            App::new()
                .wrap(read_response_body::RespMod)
                .configure(|cfg| config(cfg, &opts, sender.clone())),
        )
        .await;
        let req = test::TestRequest::default()
            .uri(uri)
            .insert_header(("accept", "text/html"))
            .to_request();
        let bytes = test::call_and_read_body(&app, req).await;
        let v = String::from_utf8(bytes.to_vec()).expect("to string");
        Ok(v)
    }

    async fn assert_script_injected(uri: &str, args: &[&str]) -> Result<String, ()> {
        let s = req_body(uri, args).await?;
        assert!(s.contains("injected by Browsersync"));
        Ok(s)
    }

    #[actix_web::test]
    async fn test_index_get() -> Result<(), ()> {
        let _body = assert_script_injected("/", &["bs3", "fixtures"]).await?;
        Ok(())
    }

    #[actix_web::test]
    async fn test_other_html_get() -> Result<(), ()> {
        let body = assert_script_injected("/other.html", &["bs3", "fixtures"]).await?;
        assert!(body.contains("<h1>Other page</h1>"));
        Ok(())
    }

    #[actix_web::test]
    async fn test_serve_static_flag() -> Result<(), ()> {
        let _body = assert_script_injected("/", &["___", "--serve-static", "fixtures"]).await?;
        Ok(())
    }

    #[actix_web::test]
    async fn test_css_get() -> Result<(), ()> {
        let (sender, _rx) = tokio::sync::mpsc::channel::<BrowserSyncMsg>(1);
        let opts = Options::try_from_args(["bs3", "fixtures"]).expect("args");
        let app = test::init_service(
            App::new()
                .wrap(read_response_body::RespMod)
                .configure(|cfg| config(cfg, &opts, sender.clone())),
        )
        .await;
        let req_css = test::TestRequest::default()
            .uri("/css/style.css")
            .to_request();

        let bytes = test::call_and_read_body(&app, req_css).await;
        let v = String::from_utf8(bytes.to_vec()).expect("to string");
        assert!(v.contains("background: pink"));
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
