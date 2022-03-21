const r = require("../index");

const callback = (type) => {
    console.log(type, "<--")
}

const output2 = r.init(callback).then(res => {
    console.log('all done=>', res);
}).catch(e => {
    console.error('error=>', e);
});
console.log('after...');
