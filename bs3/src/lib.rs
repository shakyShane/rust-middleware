use crate::client::script::Script;
use crate::resp_mod::RespModData;
use actix_files::{Files, FilesService};
use std::future::Future;
use std::path::PathBuf;
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
    HttpResponse::Ok().body(format!("Hello !"))
}

#[derive(Clone)]
struct FilesWrap {
    mount_path: String,
    serve_from: PathBuf,
    files: Files,
    files2: Files,
}

struct FilesWrapServices {
    files: Files,
    files2: Files,
    services: Vec<Result<FilesService, ()>>,
}

impl HttpServiceFactory for FilesWrap {
    fn register(self, config: &mut AppService) {
        let d = ResourceDef::new(self.mount_path.clone());
        config.register_service(d, None, self.clone(), None);
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
        // ok().boxed_local()
        let srv = self.files.new_service(());
        let srv2 = self.files2.new_service(());
        let f1 = self.files.clone();
        let f2 = self.files2.clone();
        Box::pin(async move {
            Ok(FilesWrapServices {
                files: f1,
                files2: f2,
                services: vec![srv.await, srv2.await],
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
        // let srv_1 = self.files.new_service(());
        // let (req, _) = req.into_parts();
        // let resp = HttpResponse::NotFound().body("oops!");
        // let srv_resp = ServiceResponse::new(req, resp);
        // ready(Ok(srv_resp))
        let h = self.services.get(1).expect("never empty at this position");
        if let Ok(h) = h {
            h.call(req)
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

pub fn create_server(sender: Sender<BrowserSyncMsg>) -> Server {
    let sender_c = sender.clone();
    let server = HttpServer::new(move || {
        let mods = RespModData {
            items: vec![Box::new(Script)],
        };
        let fw = FilesWrap {
            mount_path: "/".to_string(),
            serve_from: PathBuf::from("./bs3/fixtures"),
            files: Files::new("/", "./bs3/fixtures").index_file("index.html"),
            files2: Files::new("/", "./bs3/fixtures/alt").index_file("index2.html"),
        };
        App::new()
            .app_data(Data::new(mods))
            .app_data(Data::new(sender_c.clone()))
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
