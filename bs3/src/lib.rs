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

use actix_web::web::Data;
use actix_web::{web, App, Error, HttpResponse, HttpServer};

// use crate::multi::{Multi, MultiServiceFuture, MultiServiceTrait};

use crate::options::Options;
use tokio::sync::mpsc::Sender;

mod client;
mod multi;
pub mod options;
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

async fn last_fallback() -> HttpResponse {
    HttpResponse::Ok().body("Hello!")
}

#[derive(Clone)]
struct FilesWrap {
    ss: Vec<ServeStatic>,
}

struct FilesWrapServices {
    ss: Vec<ServeStatic>,
    files: Vec<Files>,
    services: Vec<Result<FilesService, ()>>,
}

impl HttpServiceFactory for FilesWrap {
    fn register(self, config: &mut AppService) {
        let d = ResourceDef::new("/");
        config.register_service(d, None, self, None);
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
        let f1 = self.ss.clone();
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
                ss: f1,
            })
        })
    }
}

impl Service<ServiceRequest> for FilesWrapServices {
    type Response = ServiceResponse;
    type Error = actix_web::error::Error;
    // type Future = Pin<Box<dyn Future<Output = Result<ServiceResponse<BoxBody>, Error>>>>;
    type Future = Pin<Box<dyn Future<Output = Result<ServiceResponse, Error>>>>;
    // type Future = Ready<Result<ServiceResponse, Error>>;

    fn poll_ready(&self, _ctx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        Poll::Ready(Ok(()))
    }

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let _uri = req.uri();
        let handler = self.ss.iter().position(|ss| ss.check_multi(&req));

        if let Some(index) = handler {
            let s = self.services.get(index);
            if let Some(Ok(srv)) = s {
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
    fn check_multi(&self, _req: &ServiceRequest) -> bool {
        let should = should_serve(self, _req);
        should
    }
}

fn should_serve(ss: &ServeStatic, req: &ServiceRequest) -> bool {
    req.uri()
        .path_and_query()
        .map(|pq| {
            let matches = pq.path().starts_with(&ss.mount_path);
            let exists = file_path(pq.path(), &ss.serve_from);
            log::trace!(
                "mount_path=[{}], dir=[{}], exists=[{:?}]",
                ss.mount_path,
                ss.serve_from.display(),
                exists
            );
            dbg!(&exists);
            matches && exists.is_some()
        })
        .unwrap_or(false)
}

fn file_path(path: &str, dir: &Path) -> Option<PathBuf> {
    if let Ok(real_path) = path.parse::<PathBuf>() {
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

    // let (stop_msg_sender, stop_msg_receiver) = oneshot::channel::<()>();
    //
    // actix_rt::spawn(async move {
    //     sender
    //         .try_send(BrowserSyncMsg::Listening { port: 8090 })
    //         .unwrap();
    //     let addr = ("127.0.0.1", 8080);
    //     log::debug!("Trying to bind at {:?}", addr);
    //     let binding = server
    //         .bind(addr)
    //         .unwrap()
    //         .run()
    //         .await
    //         .map_err(|e| anyhow::anyhow!("{:?}", e));
    //     match binding {
    //         Ok(_) => {
    //             log::debug!("server stopped successfully");
    //             stop_msg_sender.send(())
    //         }
    //         Err(e) => {
    //             log::error!("server stopped with error {:?}", e);
    //             stop_msg_sender.send(())
    //         }
    //     }
    // });
    //
    // stop_msg_receiver
    //     .await
    //     .map_err(|e| anyhow::anyhow!("{:?}", e))
}

// this function could be located in a different module
fn config(cfg: &mut web::ServiceConfig, _opts: &Options, sender: Sender<BrowserSyncMsg>) {
    let mods = RespModData {
        items: vec![Box::new(Script)],
    };

    let ss = vec![
        ServeStatic {
            mount_path: "/".into(),
            serve_from: "/Users/shaneosbourne/WebstormProjects/examples/middleware/middleware/bs3/fixtures".into(),
            index_file: "index.html".into(),
        },
        ServeStatic {
            mount_path: "/".into(),
            serve_from: "/Users/shaneosbourne/WebstormProjects/examples/middleware/middleware/bs3/fixtures/alt".into(),
            index_file: "index2.html".into(),
        },
    ];

    let fw = FilesWrap { ss };
    cfg.app_data(Data::new(mods));
    cfg.app_data(Data::new(sender.clone()));
    // cfg.wrap_fn(|req, srv| {
    //     let fut = srv.call(req);
    //     async {
    //         let mut res = fut.await?;
    //         let headers = res.headers_mut();
    //         headers.insert(
    //             CACHE_CONTROL,
    //             HeaderValue::from_static("no-cache, no-store, must-revalidate"),
    //         );
    //         headers.insert(PRAGMA, HeaderValue::from_static("no-cache"));
    //         headers.insert(EXPIRES, HeaderValue::from_static("0"));
    //         Ok(res)
    //     }
    // });
    cfg.service(fw);
    cfg.service(Files::new("/__bs3/client-js", "./bs3/client-js"));
}

pub fn exec(_sender: Sender<BrowserSyncMsg>) {
    let (_sender, _rx) = tokio::sync::mpsc::channel::<BrowserSyncMsg>(1);
    // let server = start(sender);
    // actix_web::rt::System::new().block_on(server);
    // actix_web::rt::System::new().block_on(async {
    //     let server = start(sender);
    //
    // });
    // tokio::spawn(|| async move {
    //     let server = start(sender);
    //     match server.await.await {
    //         Ok(_) => {
    //             println!("erm");
    //         }
    //         Err(_) => {
    //             println!("bad!")
    //         }
    //     };
    // });
}

#[cfg(test)]
mod tests {
    use actix_web::{test, App};
    

    use super::*;

    #[actix_web::test]
    async fn test_index_get() {
        // let dir1 = "fixtures";
        // let dir2 = "fixtures/alt";
        // let cwd = current_dir().expect("current_dir");
        // let _joined1 = cwd.join(dir1);
        // let _joined2 = cwd.join(dir2);

        let (sender, _rx) = tokio::sync::mpsc::channel::<BrowserSyncMsg>(1);
        let opts = Options::default();
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
    }
}
