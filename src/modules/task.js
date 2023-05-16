module.exports = function () {
    console.log("run()");
    run();

    setInterval(() => {
        console.log("run()");
        run();
    }, config.interval * 1000);
}

async function run() {
    for (const competition of Object.keys(config.competitions)) {
        await require("./scrap")(competition);
    }
}