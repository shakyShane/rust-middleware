use std::{
    future::{Future, Ready},
    pin::Pin,
};

use actix_web::body::{BoxBody, MessageBody};
use actix_web::{dev::{self, Service, ServiceRequest, ServiceResponse, Transform}, Error, HttpResponse};
use actix_web::http::header::ContentRangeSpec::Bytes;
use actix_web::http::header::HeaderName;
use futures_util::StreamExt;

pub struct Logging;

impl<S: 'static> Transform<S, ServiceRequest> for Logging
where
    S: Service<ServiceRequest, Response = ServiceResponse, Error = Error> + 'static,
{
    type Response = ServiceResponse;
    type Error = Error;
    type Transform = ResponseModMiddleware<S>;
    type InitError = ();
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        std::future::ready(Ok(ResponseModMiddleware { service }))
    }
}

pub struct ResponseModMiddleware<S> {
    service: S,
}

impl<S> Service<ServiceRequest> for ResponseModMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse, Error = Error> + 'static,
{
    type Response = ServiceResponse;
    type Error = Error;
    type Future = Pin<Box<dyn Future<Output = Result<ServiceResponse, Error>>>>;

    dev::forward_ready!(service);

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let _uri = req.uri().clone();
        let srv_v = self.service.call(req);
        Box::pin(async move {
            let s = srv_v.await;
            let res: ServiceResponse = s.unwrap();
            let should_mod = true;
            if !should_mod {
                return Ok(res)
            }
            Ok(res.map_body(|h, b| {
                let mut out_bytes = bytes::BytesMut::new();
                let bytes = b.try_into_bytes().unwrap();
                out_bytes.extend("BEFORE".as_bytes());
                out_bytes.extend(bytes);
                out_bytes.extend("AFTER".as_bytes());
                BoxBody::new(out_bytes)
            }))
        })
    }
}
