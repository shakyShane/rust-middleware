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
use actix_web::{App, Error, HttpResponse, HttpServer};

// use crate::multi::{Multi, MultiServiceFuture, MultiServiceTrait};

use tokio::sync::mpsc::Sender;

mod client;
mod multi;
mod read_request_body;
mod read_response_body;
mod redirect;
mod resp_mod;
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
        // let uri = req.uri();
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
        println!("should {}", should);
        if self.index_file == "index2.html".to_string() {
            return true
        }
        false
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

pub fn create_server(sender: Sender<BrowserSyncMsg>) -> Server {
    let server = HttpServer::new(move || {
        let mods = RespModData {
            items: vec![Box::new(Script)],
        };

        let ss = vec![
            ServeStatic {
                mount_path: "/".into(),
                serve_from: "./bs3/fixtures".into(),
                index_file: "index.html".into(),
            },
            ServeStatic {
                mount_path: "/".into(),
                serve_from: "./bs3/fixtures/alt".into(),
                index_file: "index2.html".into(),
            },
        ];

        let fw = FilesWrap {
            ss
            // files: vec![
            //     Files::new("/", "./bs3/fixtures").index_file("index.html"),
            //     Files::new("/", "./bs3/fixtures/alt").index_file("index2.html"),
            // ],
        };
        App::new()
            .app_data(Data::new(mods))
            .app_data(Data::new(sender.clone()))
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
            .service(Files::new("/__bs3/client-js", "./bs3/client-js"))
            // .service(Files::new("/", "./bs3/fixtures/alt").index_file("index2.html"))
            // .service(actix_web::web::scope("").guard(MyGuard).service(
            //     Files::new("/", "./bs3/fixtures").index_file("index.html")
            // ))
            // .service(actix_web::web::scope("").service(srv))
            // .service(Files::new("/", "./bs3/fixtures")
            //     .index_file("index.html")
            // .service(
            //     actix_web::web::resource("/").to(
            //
            //     )
            // )
            // .service(actix_web::web::scope("").service(Files::new("/", "./bs3/fixtures").index_file("index.html")))
            .service(fw)
        // .service(actix_web::web::resource("").to(last_fallback))
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
