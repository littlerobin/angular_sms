module.exports = function () {
    return function (items,ids) {

        var result = [];
        angular.forEach(items, function (item) {

                if (ids.indexOf(item._id) == -1) {
                    result.push(item);
                }
        });
        return result;

    }
};