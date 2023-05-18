module.exports = async function () {
    run();

    setInterval(() => {
        run();
    }, config.interval * 1000);
}

async function run() {
    console.log("run()");

    for (const competition of Object.keys(config.competitions)) {
        await require("./scrap")(competition);
    }
}