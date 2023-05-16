const fetch = require("fetch");
const accents = require("remove-accents");

module.exports.stringContains = function (str, array) {
    str = accents.remove(str);

    for (const item of array) {
        if (str.includes(accents.remove(item))) {
            return true;
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