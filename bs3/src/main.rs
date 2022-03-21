use anyhow::anyhow;
use bs3_lib::BrowserSyncMsg;

#[actix_web::main]
async fn main() -> anyhow::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let (sender, mut rx) = tokio::sync::mpsc::channel::<BrowserSyncMsg>(1);
    let (done_sender, done_receiver) = tokio::sync::oneshot::channel::<()>();

    //
    // Handle messages outgoing messages here.
    //
    actix_rt::spawn(async move {
        while let Some(msg) = rx.recv().await {
            println!("message={:?}", msg);
        }
    });
    actix_rt::spawn(async move {
        match bs3_lib::create_server(sender).await {
            Ok(_) => {
                done_sender.send(()).unwrap();
            }
            Err(e) => {
                eprintln!("ERR {:?}", e);
            }
        }
    });

    //
    // Prevent this function from ending until we've seen the
    // one-shot from above (which will happen as part of server stop)
    //
    done_receiver.await.map_err(|_e| anyhow!("feck!"))
}
