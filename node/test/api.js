const r = require("../index");

const callback = (type) => {
    console.log(type, "<--")
}

const output = r.hello(callback);
console.log(output);
