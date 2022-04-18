const r = require("../index");

const callback = (...args) => {
    console.log(args, "<--")
}

const output2 = r.init(callback).then(res => {
    console.log('[JS] all done=>', res);
}).catch(e => {
    console.error('[JS] error=>', e);
});

process.send?.({type: "listening"})
