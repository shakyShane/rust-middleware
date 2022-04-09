use crate::client::script::Script;
use crate::resp_mod::RespModData;
use actix_files::{Files, FilesService};
use std::future::Future;
use std::path::{Path, PathBuf};
use std::pin::Pin;

use std::task::{Context, Poll};

use actix_web::dev::{
    AppService, HttpServiceFactory, ResourceDef, Server, Service, ServiceFactory, ServiceRequest,
    ServiceResponse,
};

use actix_web::http::header::{HeaderValue, CACHE_CONTROL, EXPIRES, PRAGMA};
use actix_web::web::Data;
use actix_web::{web, App, Error, HttpResponse, HttpServer};

use crate::options::Options;
use crate::path_buf::PathBufWrap;
use crate::serve_static::ServeStaticConfig;
use tokio::sync::mpsc::Sender;

mod client;
pub mod options;
mod path_buf;
mod read_request_body;
mod read_response_body;
mod redirect;
mod resp_mod;
mod serve_static;
mod simple;

#[derive(Debug, Clone)]
pub enum BrowserSyncMsg {
    Listening { port: u32 },
    ScriptInjection,
}

#[derive(Clone)]
struct FilesWrap {
    serve_static: Vec<ServeStatic>,
}

struct FilesWrapServices {
    serve_static: Vec<ServeStatic>,
    files: Vec<Files>,
    services: Vec<Result<FilesService, ()>>,
}

impl HttpServiceFactory for FilesWrap {
    fn register(self, config: &mut AppService) {
        let prefixes: Vec<&String> = self.serve_static.iter().map(|ss| &ss.mount_path).collect();
        let rdef = ResourceDef::prefix(prefixes);
        config.register_service(rdef, None, self, None);
    }
}

impl ServiceFactory<ServiceRequest> for FilesWrap {
    type Response = ServiceResponse;
    type Error = actix_web::error::Error;
    type Config = ();
    type Service = FilesWrapServices;
    type InitError = ();
    type Future = Pin<Box<dyn Future<Output = Result<Self::Service, ()>>>>;

    fn new_service(&self, _: Self::Config) -> Self::Future {
        let f1 = self.serve_static.clone();
        Box::pin(async move {
            let mut files: Vec<Files> = vec![];
            for f in &f1 {
                files.push(Files::new(&f.mount_path, &f.serve_from).index_file(&f.index_file));
            }
            let mut services: Vec<Result<FilesService, ()>> = vec![];
            for file in &files {
                services.push(file.new_service(()).await)
            }
            Ok(FilesWrapServices {
                files,
                services,
                serve_static: f1,
            })
        })
    }
}

impl Service<ServiceRequest> for FilesWrapServices {
    type Response = ServiceResponse;
    type Error = actix_web::error::Error;
    type Future = Pin<Box<dyn Future<Output = Result<ServiceResponse, Error>>>>;

    fn poll_ready(&self, _ctx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        Poll::Ready(Ok(()))
    }

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let _uri = req.uri();
        let handler = self.serve_static.iter().position(|ss| ss.check_multi(&req));

        if let Some(index) = handler {
            let s = self.services.get(index);
            if let Some(Ok(srv)) = s {
                println!("{}{}", req.uri(), index);
                srv.call(req)
            } else {
                unreachable!()
            }
        } else {
            Box::pin(async move {
                // let f = h.await.expect("of course");
                // let ff = f.call(req).await;
                // ff
                let (req, _) = req.into_parts();
                let resp = HttpResponse::NotFound().body("oops!");
                let srv_resp = ServiceResponse::new(req, resp);
                Ok(srv_resp)
            })
        }
    }
}

#[derive(Debug, Clone, Default)]
struct ServeStatic {
    mount_path: String,
    serve_from: PathBuf,
    index_file: String,
}

impl ServeStatic {
    fn check_multi(&self, req: &ServiceRequest) -> bool {
        let should = should_serve(self, req);
        should
    }
    pub fn from_dir(dir: impl Into<PathBuf>, opts: &Options) -> Self {
        Self {
            mount_path: "/".into(),
            serve_from: opts.cwd.join(dir.into()),
            index_file: "index.html".into(),
        }
    }
    pub fn from_dir_routed(dir: impl Into<PathBuf>, mount_path: &str, opts: &Options) -> Self {
        Self {
            mount_path: mount_path.into(),
            serve_from: opts.cwd.join(dir.into()),
            index_file: "index.html".into(),
        }
    }
}

fn should_serve(ss: &ServeStatic, req: &ServiceRequest) -> bool {
    req.uri()
        .path_and_query()
        .map(|pq| {
            // let matches = pq.path().starts_with(&ss.mount_path);
            let path = pq.path();
            let trimmed = path.trim_start_matches(&ss.mount_path);
            let exists = file_path(trimmed, &ss.serve_from);
            log::trace!(
                "mount_path=[{}], dir=[{}], exists=[{:?}]",
                ss.mount_path,
                ss.serve_from.display(),
                exists
            );
            exists.is_some()
        })
        .unwrap_or(false)
}

fn file_path(path: &str, dir: &Path) -> Option<PathBuf> {
    if let Ok(real_path) = path.parse::<PathBufWrap>() {
        if let Ok(pb) = dir.join(&real_path).canonicalize() {
            return Some(pb);
        }
    }
    None
}

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

    println!("trying to bind to {:?}", ("127.0.0.1", 8080));
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
    let ss = opts
        .trailing
        .iter()
        .map(|trailing| match trailing {
            ServeStaticConfig::DirOnly(dir) => vec![ServeStatic::from_dir(dir, &opts)],
            ServeStaticConfig::RoutesAndDir(inner) => inner
                .routes
                .iter()
                .map(|r| ServeStatic::from_dir_routed(&inner.dir, r, &opts))
                .collect(),
        })
        .flatten()
        .collect::<Vec<ServeStatic>>();

    dbg!(&ss);

    let fw = FilesWrap { serve_static: ss };
    let mods = RespModData {
        items: vec![Box::new(Script)],
    };
    cfg.app_data(Data::new(mods));
    cfg.app_data(Data::new(sender.clone()));
    let serve_from = if opts.cwd.ends_with("bs3") {
        opts.cwd.join("client-js")
    } else {
        opts.cwd.join("bs3/client-js")
    };
    cfg.service(Files::new(Script::route(), serve_from));
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
        let _as_str = std::str::from_utf8(&bytes).expect("utf8 read");
        assert_eq!(bytes.to_vec(), include_bytes!("../client-js/client.js"));
        Ok(())
    }
}
