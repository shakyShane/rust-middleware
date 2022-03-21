use neon::prelude::*;
use once_cell::sync::OnceCell;
use tokio::runtime::Runtime;
use bs3_lib::{BrowserSyncMsg, start};

// Return a global tokio runtime or create one if it doesn't exist.
// Throws a JavaScript exception if the `Runtime` fails to create.
fn runtime<'a, C: Context<'a>>(cx: &mut C) -> NeonResult<&'static Runtime> {
    static RUNTIME: OnceCell<Runtime> = OnceCell::new();

    RUNTIME.get_or_try_init(|| Runtime::new().or_else(|err| cx.throw_error(err.to_string())))
}

fn hello(mut cx: FunctionContext) -> JsResult<JsString> {
    let _x: Handle<JsFunction> = cx.argument(0)?;

    let _null = cx.null();
    let _undef = cx.undefined();

    // let string_from_rust = cx.string("ping");

    // let result: Handle<JsString> = x.call_with(&cx).arg(string_from_rust).apply(&mut cx)?;
    // let as_rust_string = result.value(&mut cx);

    // let from_lib = bs3_lib::start();
    // if let Ok(result) = from_lib {
    //     Ok(cx.string(result.status))
    // } else {
    //     Ok(cx.string("unknown"))
    // }
    // let channel = cx.channel();
    // std::thread::spawn(|| {
    //     actix_web::rt::System::new().block_on(async {
    //         let (sender, mut rx) = tokio::sync::mpsc::channel::<BrowserSyncMsg>(1);
    //         let server = start(sender);
    //         match server.await {
    //             Ok(_) => {
    //                 dbg!(channel);
    //             },
    //             Err(_) => eprintln!("ERR"),
    //         }
    //     });
    // });

    Ok(cx.string("oops!"))
}

fn init(mut cx: FunctionContext) -> JsResult<JsPromise> {

    let channel = cx.channel();
    let (deferred, promise) = cx.promise();

    std::thread::spawn(move || {
        deferred.settle_with(&channel, move |mut cx| {
            println!("settttttled...");
            Ok(cx.number(42))
        });
    });

    Ok(promise)
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("hello", hello)?;
    cx.export_function("init", init)?;
    Ok(())
}
