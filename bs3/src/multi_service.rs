use crate::{ResourceDef, ServeStatic, Service, ServiceFactory};
use actix_files::{Files, FilesService};
use actix_web::dev::{AppService, HttpServiceFactory, ServiceRequest, ServiceResponse};
use actix_web::{Error, HttpResponse};
use std::future::Future;

use std::pin::Pin;
use std::task::{Context, Poll};

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

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let _uri = req.uri();
        let handler = self
            .serve_static
            .iter()
            .position(|ss| ss.should_serve(&req));

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
                let uri = req.uri();
                let html = r#"<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="ie=edge">
<title>Add a response</title>
</head>
<body>
<pre><code></code></pre>
<bs3-app></bs3-app>
<script src="/__bs3/app-js/dist/index.js"></script>
</body>
</html>"#;

                let resp = HttpResponse::Ok().content_type("text/html").body(html);
                let srv_resp = ServiceResponse::new(req, resp);
                Ok(srv_resp)
            })
        }
    }
}
