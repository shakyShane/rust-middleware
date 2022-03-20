use actix_files::Files;
use actix_web::{web, App, HttpServer};

use crate::client::script::Script;

use crate::resp_mod::RespModData;

use actix_web::web::Data;

mod client;
mod read_request_body;
mod read_response_body;
mod redirect;
mod resp_mod;
mod simple;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    log::info!("starting HTTP server at http://localhost:8080");

    let server =
        HttpServer::new(move || {
            let mods = RespModData {
                items: vec![Box::new(Script)],
            };
            App::new()
                .app_data(Data::new(mods))
                // .wrap(redirect::CheckLogin)
                // .wrap(read_request_body::Logging)
                .wrap(read_response_body::RespMod)
                // .wrap(simple::SayHi)
                // .wrap_fn(|req, srv| {
                //     let p = req.app_data::<Data<Person>>();
                //     let fut = srv.call(req);
                //     async {
                //         let mut res: ServiceResponse = fut.await?;
                //         res.headers_mut()
                //             .insert(CONTENT_TYPE, HeaderValue::from_static("text/plain"));
                //         Ok(res.map_body(|h, b| {
                //
                //         }))
                //     }
                // })
                .service(Files::new("/__bs3/client-js", "./bs3/client-js"))
                // .service(web::resource("/__bs3/client/index.js").to(|| async {
                //     // HttpResponse::Ok()
                //     //     .content_type("application/javascript")
                //     //     .body(include_str!("../client-js/client.js"))
                //     Files::new("")
                // }))
                .service(Files::new("/", "./bs3/fixtures").index_file("index.html"))
                .service(web::resource("/login").to(|| async {
                    "You are on /login. Go to src/redirect.rs to change this behavior."
                }))
                .service(web::resource("/").to(|| async {
                    "Hello, middleware! Check the console where the server is run."
                }))
        });

    server.bind(("127.0.0.1", 8080))?.run().await
}
