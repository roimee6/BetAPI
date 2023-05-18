const accents = require("remove-accents");

module.exports.stringContains = function (str, array) {
    str = accents.remove(str);

    for (const item of array) {
        const normalizedItem = accents.remove(item);

        if (isSubstring(normalizedItem, str)) {
            return true;
        }
    }
    return false;
}

function isSubstring(sub, str) {
    sub = sub.toLowerCase();
    str = str.toLowerCase();

    let subIndex = 0;

    for (let i = 0; i < str.length; i++) {
        if (str[i] === sub[subIndex]) {
            subIndex++;

            if (subIndex === sub.length) {
                return true;
            }
        }
    }
    return false;
}

module.exports.getYearWeek = function () {
    const currentDate = new Date();
    const year = currentDate.getFullYear();

    const firstDayOfWeek = 1;
    const yearStart = new Date(year, 0, 1);

    const firstDayOffset = (7 + yearStart.getDay() - firstDayOfWeek) % 7;

    const elapsedDays = Math.floor((currentDate - yearStart) / (24 * 60 * 60 * 1000));
    return year + "-" + Math.floor((elapsedDays + firstDayOffset) / 7);
}

function parseDay(date) {
    const currentDate = new Date();

    const regex = /[0-9]+(?:\.[0-9]+)?/g;
    const day = parseInt(date.match(regex)[0]);

    if (day === currentDate.getDate() - 2) {
        return "Avant-Hier";
    } else if (day === currentDate.getDate() - 1) {
        return "Hier";
    } else if (day === currentDate.getDate()) {
        return "Aujourd'hui";
    } else if (day === currentDate.getDate() + 1) {
        return "Demain";
    } else {
        return date.replace("2023", "").trim();
    }
}

module.exports.getMatchDayByPage = function (page, event) {
    const events = page.querySelectorAll("th[colspan=\"4\"], *[data-matchid]");
    let day;

    for (const _event of events) {
        if (_event.rawAttrs.includes("colspan")) {
            day = _event.rawText;
        } else {
            if (_event.rawText === event.rawText) {
                return parseDay(day);
            }
        }
    }
    return "Date inconnue";
};