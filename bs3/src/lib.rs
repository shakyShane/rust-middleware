use actix_web::dev::{ResourceDef, Service, ServiceFactory};

use crate::options::Options;
use crate::path_buf::PathBufWrap;
use crate::serve_static_config::ServeStaticConfig;
use msg::BrowserSyncMsg;
use multi_service::MultiService;
use serve_static::ServeStatic;

mod client;
pub mod msg;
mod multi_service;
pub mod options;
mod path_buf;
mod read_request_body;
mod read_response_body;
mod redirect;
mod resp_mod;
pub mod serve_static;
pub mod serve_static_config;
pub mod server;
mod simple;
