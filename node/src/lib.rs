use neon::prelude::*;

use bs3_lib::{create_server, BrowserSyncMsg};
use once_cell::sync::OnceCell;
use tokio::runtime::Runtime;

// Return a global tokio runtime or create one if it doesn't exist.
// Throws a JavaScript exception if the `Runtime` fails to create.
fn runtime<'a, C: Context<'a>>(cx: &mut C) -> NeonResult<&'static Runtime> {
    static RUNTIME: OnceCell<Runtime> = OnceCell::new();
    RUNTIME.get_or_try_init(|| Runtime::new().or_else(|err| cx.throw_error(err.to_string())))
}

fn init(mut cx: FunctionContext) -> JsResult<JsPromise> {
    let rt = runtime(&mut cx)?;
    let _callback = cx.argument::<JsFunction>(0)?;
    let channel = cx.channel();
    let (deferred, promise) = cx.promise();

    rt.spawn(async move {
        let (sender, _rx) = tokio::sync::mpsc::channel::<BrowserSyncMsg>(1);

        // hangs here
        create_server(sender).await.unwrap();

        deferred.settle_with(&channel, move |mut cx| Ok(cx.string("done")));
    });

    Ok(promise)
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("init", init)?;
    Ok(())
}
