use std::{
    future::{Future, Ready},
    pin::Pin,
};

use crate::BrowserSyncMsg;
use actix_web::http::header::{HeaderName, HeaderValue};
use actix_web::{
    body::{to_bytes, BoxBody},
    dev::{self, Service, ServiceRequest, ServiceResponse, Transform},
    http::StatusCode,
    web, Error, HttpResponse,
};

use crate::resp_mod::{process_buffered_body, RespModData, RespModDataTrait};

pub struct RespMod;

impl<S: 'static> Transform<S, ServiceRequest> for RespMod
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
            let req = res.request().clone();
            let uri_string = req.uri().to_string();
            let response = res.response();

            let req_head = req.head();
            let res_head = response.head();

            //
            // These are the transformed registered in config
            //
            let resp_mod_data_opt = req
                .app_data::<web::Data<RespModData>>()
                .map(|x| x.get_ref());

            if resp_mod_data_opt.is_none() {
                log::debug!("no transforms found, at all");
                return Ok(res);
            }

            // //
            // // Access the channel that is used to communicate back to
            // // the parent process
            // //
            // let channel = req
            //     .app_data::<web::Data<tokio::sync::mpsc::Sender<BrowserSyncMsg>>>()
            //     .map(|x| x.get_ref());
            //
            // if let Some(channel) = channel {
            //     channel
            //         .try_send(BrowserSyncMsg::ScriptInjection)
            //         .expect("example");
            // }

            //
            // 'indexes' are the transforms that should be applied to the body.
            // eg: if 'indexes' is [0, 1] -> this means 2 transforms will be applied to this response
            //
            let indexes: Vec<usize> = resp_mod_data_opt
                .map(|resp_mod_data| resp_mod_data.get_transform_indexes(req_head, res_head))
                .unwrap_or_else(Vec::new);

            log::debug!("indexes to process = {:?}", indexes);

            //
            // Early return if no-one wants to edit this response
            //
            if indexes.is_empty() {
                log::trace!("returning early - nothing to process");
                return Ok(res);
            }

            //
            // Create a clone of the headers early
            //
            let mut new_header_map = response.headers().clone();
            let hn = HeaderName::from_static("x-browser-sync");
            let hv = HeaderValue::from_static("3.0");
            new_header_map.append(hn, hv);

            // let original_headers = response.headers().clone();
            let bytes = to_bytes(res.into_body()).await?;
            let out_bytes = process_buffered_body(bytes, uri_string, resp_mod_data_opt, &indexes)?;

            let next_body = BoxBody::new(out_bytes);
            let mut res = HttpResponse::with_body(StatusCode::OK, next_body);
            (*res.headers_mut()) = new_header_map;

            Ok(ServiceResponse::new(req, res))
        })
    }
}
