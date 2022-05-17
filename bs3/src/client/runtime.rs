use crate::Options;
use actix_files::Files;
use actix_web::web::ServiceConfig;
use actix_web::{web, HttpRequest, HttpResponse};

#[derive(Debug, Clone, Default)]
pub struct Runtime {
    debug: bool,
}

impl Runtime {
    pub fn with_debug() -> Self {
        Self { debug: true }
    }
    pub fn configure(&self, opts: &Options, cfg: &mut web::ServiceConfig) {
        dbg!(opts.cwd.join("app-js"));
        cfg.service(Files::new("/__bs3/app-js", opts.cwd.join("bs3/app-js")));
    }
}
