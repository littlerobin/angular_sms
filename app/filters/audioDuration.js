module.exports = function () {
    return function (input) {
        var roundPart = Math.floor(input / 60);
        var modulPart = input % 60;
        return roundPart + "'" + modulPart + '"';
    };
};