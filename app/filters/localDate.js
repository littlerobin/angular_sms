module.exports = function() {
    return function (input) {

        moment.locale((localStorage.getItem('currentLanguage') === null)  ? window.navigator.language.split("-")[0] : localStorage.currentLanguage);

        var dateTime = moment(input, 'YYYY-MM-DD HH:mm:ss');
        var date = dateTime.format('L H:mm:ss');
        return date;
    };
};