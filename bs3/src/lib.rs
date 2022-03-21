use crate::client::script::Script;
use crate::resp_mod::RespModData;
use actix_files::Files;
use actix_web::dev::Server;
use actix_web::web::Data;
use actix_web::{App, HttpServer};

use tokio::sync::mpsc::Sender;

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

pub fn create_server(sender: Sender<BrowserSyncMsg>) -> Server {
    let sender_c = sender.clone();
    let server = HttpServer::new(move || {
        let mods = RespModData {
            items: vec![Box::new(Script)],
        };
        App::new()
            .app_data(Data::new(mods))
            .app_data(Data::new(sender_c.clone()))
            .wrap(read_response_body::RespMod)
            .service(Files::new("/__bs3/client-js", "../bs3/client-js"))
            .service(Files::new("/", "../bs3/fixtures").index_file("index.html"))
    });

    println!("trying to bind to {:?}", ("127.0.0.1", 8080));
    let addr = ("127.0.0.1", 8080);
    server.bind(addr).unwrap().run()

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
