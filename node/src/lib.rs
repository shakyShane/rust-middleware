use std::time::Duration;
use neon::prelude::*;

use bs3_lib::{create_server, BrowserSyncMsg};
use once_cell::sync::OnceCell;
use tokio::runtime::Runtime;
use tokio::time::timeout;

// Return a global tokio runtime or create one if it doesn't exist.
// Throws a JavaScript exception if the `Runtime` fails to create.
fn runtime<'a, C: Context<'a>>(cx: &mut C) -> NeonResult<&'static Runtime> {
    static RUNTIME: OnceCell<Runtime> = OnceCell::new();
    RUNTIME.get_or_try_init(|| Runtime::new().or_else(|err| cx.throw_error(err.to_string())))
}

fn init(mut cx: FunctionContext) -> JsResult<JsPromise> {
    let rt = runtime(&mut cx)?;
    let channel = cx.channel();
    let (deferred, promise) = cx.promise();
    let pinned = Box::pin(async move {

        let (sender, _rx) = tokio::sync::mpsc::channel::<BrowserSyncMsg>(1);

        if let Err(_) = timeout(Duration::from_secs(10), create_server(sender)).await {
            println!("did not receive value within 10 secs");
        } else {
            println!("all good");
        }

        deferred.settle_with(&channel, move |mut cx| Ok(cx.string("done")));
    });

    rt.spawn(pinned);

    Ok(promise)
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("init", init)?;
    Ok(())
}
