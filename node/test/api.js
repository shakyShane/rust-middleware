const {fork} = require("child_process");
const {join} = require("path");

const handle = fork(join(__dirname, "init.js"), process.argv.slice(2), {
    stdio: "inherit"
})

handle.on('message', (message) => {
    switch (message?.type) {
        case "listening": {
            console.log('[JS] is listening');
            break;
        }
        default: {
            console.error(`unimplemented handler`, message);
        }
    }
})

handle.on('disconnect', () => console.log('disconnect!'));
handle.on('spawn', () => console.log('spawn!'));
handle.on('error', (err) => console.error('err', err));

handle.on('close', (code) => {
    if (code && code !== 0) {
        console.error("none-zero")
        process.exit(code);
    } else {
        console.error("zero exit code")
        process.exit()
    }
})

process.on('SIGINT', () => console.log('SIGINT'))
