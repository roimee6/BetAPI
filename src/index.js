const express = require("express");
const server = express();

global.cache = {};
global.pages = {};

global.config = require("./config");

require("./modules/cache").load();

server.listen(config.PORT, () => {
    console.log(`Website listening on port ${config.PORT}\n`);
    console.log(config);
    console.log(cache);
    console.log("");

    require("./modules/task")();
});

server.get("/bet/v1/:competition", async (req, res) => {
    const competitions = Object.keys(config.competitions);
    const competition = req.params.competition;

    if (!competitions.includes(competition)) {
        res.send("bad competition, try : " + competitions.join(", "));
        return;
    }

    const resp = await require("./modules/scrap")(competition, true);
    res.json(resp);
});