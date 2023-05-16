const fs = require("fs");
const axios = require("axios");

const HTMLParser = require("node-html-parser");

const {stringContains, getYearWeek} = require("./functions");

module.exports = async function (competition, useCache) {
    if (useCache && (cache[competition].last && (Math.round(Date.now() / 1000) - cache[competition].last) <= config.fdj_cache_lifetime)) {
        return cache[competition].data;
    }

    console.log(competition);
    console.log(Date.now() / 1000);

    const data = config.competitions[competition];
    const result = {};

    const fdj = await getCompetitionFdjMatchs(data.fdj);
    const fdjInfos = fdj.querySelectorAll(".psel-event");

    const odds = fdjInfos.filter(odd => odd.querySelector(".psel-bet-option") === null).map(odd => odd.rawText);
    const root = await getMedPage(data.med + getYearWeek(), useCache);

    const dm = root.querySelectorAll(".lm3_eq1").map(dm => dm.rawText);
    const ext = root.querySelectorAll(".lm3_eq2").map(ext => ext.rawText);
    const score = root.querySelectorAll(".lm3_score").map(score => score.rawText);
    const time = root.querySelectorAll("*[data-matchid] .lm1").map(time => time.rawText);
    const status = root.querySelectorAll("*[data-matchid] .lm2").map(status => status.rawText);

    for (let count = 0; count < dm.length; count++) {
        const eventScore = score[count].replaceAll(" ", "").split("-");

        const st = status[count].slice(5);
        const hour = time[count];

        const home = dm[count];
        const outside = ext[count];

        const homeScore = parseInt(eventScore[0]) || 0;
        const outsideScore = parseInt(eventScore[1]) || 0;

        const winner = (homeScore === outsideScore) ? null : (homeScore > outsideScore ? home : outside);
        let [home_odd, neutral_odd, outside_odd] = [1, 1, 1];

        const regex = /[0-9]+(?:\.[0-9]+)?/g;
        let day = "";

        for (const odd of odds) {
            if (stringContains(odd, home.split(" ")) && stringContains(odd, outside.split(" "))) {
                day = getDay(fdj, odd);

                const data = odd.replaceAll(",", ".").match(regex);
                [home_odd, neutral_odd, outside_odd] = [parseFloat(data[data.length - 3]), parseFloat(data[data.length - 2]), parseFloat(data[data.length - 1])];
                break;
            }
        }

        result[count] = {
            home,
            outside,

            home_odd,
            neutral_odd,
            outside_odd,

            day,
            hour,

            status: st.includes("'") ? 1 : (st.startsWith("Termin") ? 0 : 2),
            winner
        };
    }

    cache[competition].data = result;
    cache[competition].last = Math.round(Date.now() / 1000);

    fs.writeFileSync("./src/assets/" + competition + ".json", JSON.stringify(result));

    console.log(Date.now() / 1000);
    return cache[competition].data;
};

function getDay(root, string) {
    const events = root.querySelectorAll(".psel-title-rubric, .psel-event");
    let day = "";

    for (const event of events) {
        if (event.querySelector(".psel-bet-option") !== null) {
            continue;
        }

        if (event.rawAttrs.includes("psel-title-rubric")) {
            day = event.rawText;
        } else {
            if (event.rawText === string) {
                return day;
            }
        }
    }
    return "Date inconnue";
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
    const root = HTMLParser.parse(body);

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
    return HTMLParser.parse(body);
}