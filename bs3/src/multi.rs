use actix_web::dev::{Service, ServiceFactory};
use actix_web::{
    dev::{AppService, HttpServiceFactory, ResourceDef, ServiceRequest, ServiceResponse},
    error::Error,
    HttpResponse,
};
use futures::future::{ok, ready, Either, LocalBoxFuture, Ready};
use futures::{Future, FutureExt};
use std::pin::Pin;
use std::task::{Context, Poll};

pub type MultiServiceFuture = Either<
    Ready<Result<ServiceResponse, Error>>,
    Pin<Box<dyn Future<Output = Result<ServiceResponse, Error>>>>,
>;

pub trait MultiServiceTrait:
    Service<ServiceRequest, Response = ServiceResponse, Error = Error, Future = MultiServiceFuture>
{
    fn check_multi(&self, req: &ServiceRequest) -> bool;
}

pub struct Multi {
    pub f: Box<dyn Fn() -> Vec<Box<dyn MultiServiceTrait>>>,
}

impl Multi {
    pub fn new<F>(f: F) -> Self
    where
        F: Fn() -> Vec<Box<dyn MultiServiceTrait>>,
        F: 'static,
    {
        Self { f: Box::new(f) }
    }
}

impl ServiceFactory<ServiceRequest> for Multi {
    type Response = ServiceResponse;
    type Error = Error;
    type Config = ();
    type Service = MultiService;
    type InitError = ();
    type Future = LocalBoxFuture<'static, Result<Self::Service, Self::InitError>>;

    fn new_service(&self, _: ()) -> Self::Future {
        let srv = MultiService { items: (self.f)() };
        ok(srv).boxed_local()
    }
}

impl HttpServiceFactory for Multi {
    fn register(self, config: &mut AppService) {
        let rdef = ResourceDef::root_prefix("/");
        config.register_service(rdef, None, self, None)
    }
}

pub struct MultiService {
    pub items: Vec<Box<dyn MultiServiceTrait>>,
}

impl Service<ServiceRequest> for MultiService {
    type Response = ServiceResponse;
    type Error = Error;
    type Future = MultiServiceFuture;

    fn poll_ready(&self, _ctx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        Poll::Ready(Ok(()))
    }

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let handler = self
            .items
            .iter()
            .position(|item| item.check_multi(&req))
            .and_then(|pos| self.items.get(pos));

        // if a handler was selected, call it
        if let Some(handler) = handler {
            return handler.call(req);
        }

        // Otherwise return a not-found response
        let resp = HttpResponse::NotFound().finish();
        let (req, _) = req.into_parts();
        let srv_resp = ServiceResponse::new(req, resp);
        Either::Left(ready(Ok(srv_resp)))
    }
}
