module.exports = function () {
    return function (input) {
        var splitted = input.split('-');
        return splitted[1];
    };
};