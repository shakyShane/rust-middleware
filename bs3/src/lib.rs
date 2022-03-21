use crate::client::script::Script;
use crate::resp_mod::RespModData;
use actix_files::Files;
use actix_web::web::{block, Data};
use actix_web::{web, App, HttpServer};
use futures::channel::oneshot;
use tokio::sync::mpsc::Sender;
use crate::oneshot::{Canceled, Receiver};

mod client;
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

pub async fn start(sender: Sender<BrowserSyncMsg>) -> anyhow::Result<()> {
    let main_clone = sender.clone();
    let server =
        HttpServer::new(move || {
            let mods = RespModData {
                items: vec![Box::new(Script)],
            };
            App::new()
                .app_data(Data::new(mods))
                .app_data(Data::new(main_clone.clone()))
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

    let (stop_msg_sender, stop_msg_receiver) = oneshot::channel::<()>();

    actix_rt::spawn(async move {
        sender
            .try_send(BrowserSyncMsg::Listening { port: 8090 })
            .unwrap();
        let addr = ("127.0.0.1", 8080);
        log::debug!("Trying to bind at {:?}", addr);
        let binding = server
            .bind(addr)
            .unwrap()
            .run()
            .await
            .map_err(|e| anyhow::anyhow!("{:?}", e));
        match binding {
            Ok(_) => {
                log::debug!("server stopped successfully");
                stop_msg_sender.send(())
            }
            Err(e) => {
                log::error!("server stopped with error {:?}", e);
                stop_msg_sender.send(())
            }
        }
    });

    stop_msg_receiver
        .await
        .map_err(|e| anyhow::anyhow!("{:?}", e))
}

pub fn exec(_sender: Sender<BrowserSyncMsg>) {
    let (sender, mut rx) = tokio::sync::mpsc::channel::<BrowserSyncMsg>(1);
    let server = start(sender);
    actix_web::rt::System::new().block_on(server);
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
