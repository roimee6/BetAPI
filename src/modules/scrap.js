const fs = require("fs");
const util = require("./util");
const axios = require("axios");

const {parse} = require("node-html-parser");

const regex = /[0-9]+(?:\.[0-9]+)?/g;

module.exports = async function (competition, useCache) {
    if (useCache && (cache[competition].last && (Math.round(Date.now() / 1000) - cache[competition].last) <= config.fdj_cache_lifetime)) {
        return cache[competition].data;
    }

    console.log(competition);
    console.log(Date.now() / 1000);

    const data = config.competitions[competition];
    const result = [];

    const page = await getMedPage(data.med + util.getYearWeek(), useCache);

    const odds = (await getCompetitionFdjMatchs(data.fdj)).querySelectorAll(".psel-event");
    const events = page.querySelectorAll("[data-matchid]");

    const _odds = odds.filter((odd) => {
        const opt = odd.querySelector(".psel-bet-option");
        return opt === null || opt.rawText.includes("90");
    }).map(odd => odd.rawText);

    for (const event of events) {
        let [score, hour, status, home, outside] = [
            event.querySelector(".lm3_score").rawText.replaceAll(" ", ""),
            event.querySelector(".lm1").rawText,
            event.querySelector(".lm2").rawText.slice(5),
            event.querySelector(".lm3_eq1").rawText,
            event.querySelector(".lm3_eq2").rawText
        ];

        const homeScore = parseInt(score.split("-")[0]) || 0;
        const outsideScore = parseInt(score.split("-")[1]) || 0;

        const winner = (homeScore === outsideScore) ? null : (homeScore > outsideScore ? home : outside);
        status = status.includes("'") ? 1 : (status.startsWith("Termin") ? 0 : 2);

        const day = util.getMatchDayByPage(page, event);
        let [home_odd, neutral_odd, outside_odd] = [1, 1, 1];

        for (const odd of _odds) {
            if (
                util.stringContains(odd, home.split(" ")) &&
                util.stringContains(odd, outside.split(" "))
            ) {
                const data = odd.replaceAll(",", ".").match(regex);
                [home_odd, neutral_odd, outside_odd] = [parseFloat(data[data.length - 3]), parseFloat(data[data.length - 2]), parseFloat(data[data.length - 1])];
                break;
            }
        }

        result.push({
            home, outside,
            home_odd, neutral_odd, outside_odd,
            day, hour,
            status, score, winner
        });
    }

    cache[competition] = {
        data: result,
        last: Math.round(Date.now() / 1000)
    };

    console.log(Date.now() / 1000);

    fs.writeFileSync("./src/assets/" + competition + ".json", JSON.stringify(result));
    return result;
}

async function getMedPage(link, useCache) {
    if (useCache && (pages.hasOwnProperty(link) && pages[link].last && (Math.round(Date.now() / 1000) - pages[link].last) <= (config.med_cache_lifetime))) {
        return pages[link].data;
    }

    const response = await axios({
        url: link,
        method: "GET",
        headers: {
            "Accept-Encoding": "gzip, deflate",
        }
    });

    const body = await response.data;
    const root = parse(body);

    pages[link] = {
        last: Math.round(Date.now() / 1000),
        data: root
    };

    return root;
}

async function getCompetitionFdjMatchs(link) {
    const response = await axios({
        url: link,
        method: "GET",
        headers: {
            "Accept-Encoding": "gzip, deflate",
        }
    });

    const body = await response.data;
    return parse(body);
}