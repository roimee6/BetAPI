const {readFileSync} = require("fs");

module.exports.load = function () {
    for (const competition of Object.keys(config.competitions)) {
        try {
            cache[competition] = {
                data: JSON.parse(readFileSync("./src/assets/" + competition + ".json"), "utf-8"),
                time: 0
            };
        } catch (e) {
            cache[competition] = {
                data: {},
                time: 0
            };
        }
    }
}