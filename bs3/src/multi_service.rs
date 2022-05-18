use crate::{ResourceDef, ServeStatic, Service, ServiceFactory};
use actix_files::{Files, FilesService};
use actix_web::dev::{AppService, HttpServiceFactory, ServiceRequest, ServiceResponse};
use actix_web::{web, Error, HttpResponse};
use std::future::Future;
use std::ops::Deref;

use crate::client::html::BASE_HTML;
use crate::client::runtime::TempData;
use std::pin::Pin;
use std::task::{Context, Poll};
use tokio::sync::Mutex;

#[derive(Clone)]
pub struct MultiService {
    pub serve_static: Vec<ServeStatic>,
}

pub trait MultiServiceImpl {
    fn should_serve(&self, req: &ServiceRequest) -> bool;
}

pub struct FilesWrapServices {
    serve_static: Vec<ServeStatic>,
    files: Vec<Files>,
    services: Vec<Result<FilesService, ()>>,
}

impl HttpServiceFactory for MultiService {
    fn register(self, config: &mut AppService) {
        let mut prefixes = self
            .serve_static
            .iter()
            .map(|ss| &ss.mount_path)
            .collect::<Vec<&String>>();

        // If a root was given, ensure that an empty prefix is added
        // this ensures that file-serving works correctly.
        let v = String::from("");

        if prefixes.contains(&&String::from("/")) {
            prefixes.push(&v);
        }

        let rdef = ResourceDef::prefix(prefixes);
        config.register_service(rdef, None, self, None);
    }
}

impl ServiceFactory<ServiceRequest> for MultiService {
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
            println!("multi services count: {:?}", services.len());
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

    fn call(&self, srv_req: ServiceRequest) -> Self::Future {
        let _uri = srv_req.uri();
        let handler = self
            .serve_static
            .iter()
            .position(|ss| ss.should_serve(&srv_req));

        // let temp_handlers = req
        //     .app_data::<web::Data<Mutex<TempData>>>()
        //     .map(|x| x.get_ref());
        //
        // if let Some(v) = temp_handlers {
        //     dbg!("hanlders", v.lock().deref().routes.len())
        // }
        let future;
        if let Some(index) = handler {
            let s = self.services.get(index);
            if let Some(Ok(srv)) = s {
                future = srv.call(srv_req);
            } else {
                unreachable!("how did we get here?");
            }
        } else {
            future = Box::pin(async move {
                let (req, _) = srv_req.into_parts();
                let uri = req.uri();
                let temp_handlers = req
                    .app_data::<web::Data<Mutex<TempData>>>()
                    .map(|x| x.get_ref());

                if let Some(temp_data) = temp_handlers {
                    let temp_data = temp_data.lock().await;
                    let temp_data = temp_data.deref();
                    let routes = temp_data.route_for(uri);
                    let _cloned = routes.clone();
                    if let Some(temp_route) = temp_data.route_for(uri) {
                        let resp = HttpResponse::Ok()
                            .content_type("text/html")
                            .body(temp_route.body.clone());
                        let cloned_req = req.clone();
                        let srv_resp = ServiceResponse::new(cloned_req, resp);
                        return Ok(srv_resp);
                    }
                }

                // let f = h.await.expect("of course");
                // let ff = f.call(req).await;
                // ff
                let _uri = req.uri();
                let resp = HttpResponse::Ok().content_type("text/html").body(BASE_HTML);
                let srv_resp = ServiceResponse::new(req, resp);
                Ok(srv_resp)
            })
        }

        future
    }
}
