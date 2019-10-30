module.exports = function () {

    function addZero(i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    }

    return function (input, total) {
        total = parseInt(total);

        for (var i = 0; i <= total; i++) {
            input.push(addZero(i));
        }

        return input;
    };
};