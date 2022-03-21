const r = require("../index");

const callback = (type) => {
    console.log(type, "<--")
}

const output = r.hello(callback);
console.log("-", output);

const output2 = r.init(callback).then(res => {
    console.log('hello!', res);
});
