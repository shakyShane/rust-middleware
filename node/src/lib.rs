use neon::prelude::*;

fn hello(mut cx: FunctionContext) -> JsResult<JsString> {
    let x: Handle<JsFunction> = cx.argument(0)?;

    let _null = cx.null();
    let _undef = cx.undefined();

    // let string_from_rust = cx.string("ping");

    // let result: Handle<JsString> = x.call_with(&cx).arg(string_from_rust).apply(&mut cx)?;
    // let as_rust_string = result.value(&mut cx);

    let from_lib = bs3_lib::start();
    if let Ok(result) = from_lib {
        Ok(cx.string(result.status))
    } else {
        Ok(cx.string("unknown"))
    }
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("hello", hello)?;
    Ok(())
}
