module.exports=function ($translateProvider) {
    $translateProvider.translations('en', {
        JANUARY: 'January',
        FEBRUARY: 'February',
        MARCH: 'March',
        APRIL: 'April',
        MAI: 'Mai',
        JUNE: 'June',
        JULY: 'July',
        AUGUST: 'August',
        SEPTEMBER: 'September',
        OCTOBER: 'October',
        NOVEMBER: 'November',
        DECEMBER: 'December',

        SUNDAY: 'Sunday',
        MONDAY: 'Monday',
        TUESDAY: 'Tuesday',
        WEDNESDAY: 'Wednesday',
        THURSDAY: 'Thurday',
        FRIDAY: 'Friday',
        SATURDAY: 'Saturday'
    });
    $translateProvider.translations('fr', {
        JANUARY: 'Janvier',
        FEBRUARY: 'Févier',
        MARCH: 'Mars',
        APRIL: 'Avril',
        MAI: 'Mai',
        JUNE: 'Juin',
        JULY: 'Juillet',
        AUGUST: 'Août',
        SEPTEMBER: 'Septembre',
        OCTOBER: 'Octobre',
        NOVEMBER: 'Novembre',
        DECEMBER: 'Décembre',

        SUNDAY: 'Dimanche',
        MONDAY: 'Lundi',
        TUESDAY: 'Mardi',
        WEDNESDAY: 'Mercredi',
        THURSDAY: 'Jeudi',
        FRIDAY: 'Vendredi',
        SATURDAY: 'Samedi'
    });
    $translateProvider.translations('pt', {
        JANUARY: 'Janeiro',
        FEBRUARY: 'Fevereiro',
        MARCH: 'Março',
        APRIL: 'Abril',
        MAI: 'Maio',
        JUNE: 'Junho',
        JULY: 'Julho',
        AUGUST: 'Agosto',
        SEPTEMBER: 'Setembro',
        OCTOBER: 'Outubro',
        NOVEMBER: 'Novembro',
        DECEMBER: 'Dezembro',

        SUNDAY: 'Domingo',
        MONDAY: 'Segunda',
        TUESDAY: 'Terça',
        WEDNESDAY: 'Quarta',
        THURSDAY: 'Quinta',
        FRIDAY: 'Sexta',
        SATURDAY: 'Sábado'
    });
    $translateProvider.preferredLanguage('en');
};