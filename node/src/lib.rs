use neon::prelude::*;

use std::env::args_os;

use bs3_lib::msg::BrowserSyncMsg;
use bs3_lib::options::Options;
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
    let (sender, mut rx) = tokio::sync::mpsc::channel::<BrowserSyncMsg>(1);
    let _callback = cx.argument::<JsFunction>(0)?.root(&mut cx);
    let channel = cx.channel();
    let (deferred, promise) = cx.promise();

    rt.spawn(async move {
        let opts = Options::try_from_args(args_os().skip(1)).expect("args");
        println!("incoming args: {:#?}", &opts);
        bs3_lib::server::create_server(opts, sender).await.unwrap();

        deferred.settle_with(&channel, move |mut cx| Ok(cx.string("done")));
    });

    rt.spawn(async move {
        println!("listening for channel messages");
        while let Some(bsm) = rx.recv().await {
            println!("got = {:?}", bsm);
        }
        // Send a closure as a task to be executed by the JavaScript event
        // loop. This _will_ block the event loop while executing.
        // c1.send(|mut cx| {
        //     let callback = callback.into_inner(&mut cx);
        //     let this = cx.undefined();
        //     let null = cx.null();
        //     let args = vec![cx.null().upcast::<JsValue>(), cx.number(2).upcast()];
        //
        //     callback.call(&mut cx, this, args)?;
        //
        //     Ok(())
        // });
        // println!("got = {:?}", bsm);
        // let callback = callback.into_inner(&mut cx);
        // let this = cx.undefined();
        // let args = vec![cx.string("oops").upcast()];
        // if let Err(e) = callback.call(&mut cx, this, args) {
        //     eprintln!("ERROR");
        // }
        // }
    });

    Ok(promise)
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("init", init)?;
    Ok(())
}
