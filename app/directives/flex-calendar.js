(function () {
    "use strict";

    var app = angular
        .module('flexcalendar', ['pascalprecht.translate'])
        .directive('flexCalendar', flexCalendar);

    var defaultTranslation = angular
        .module('flexcalendar.defaultTranslation', ['flexcalendar'])
        .config(defaultTranslationConfig);

    defaultTranslationConfig.$inject = ['$translateProvider'];
    function defaultTranslationConfig($translateProvider) {
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
        $translateProvider.preferredLanguage('en');
        $translateProvider.useSanitizeValueStrategy('escape');
    }

    function flexCalendar() {


        var directive = {
            restrict: 'E',
            scope: {
                options: '=?',
                events: '=?'
            },
            templateUrl: '/app/directives/templates/flex-calendar.html',
            controller: Controller
        };

        return directive;

    }

    Controller.$inject = ['$scope', '$filter'];
    function Controller($scope, $filter) {

        $scope.days = [];
        $scope.options = $scope.options || {};
        $scope.events = $scope.events || [];
        $scope.options.dayNamesLength = $scope.options.dayNamesLength || 1;
        $scope.options.mondayIsFirstDay = $scope.options.mondayIsFirstDay || false;

        $scope.onClick = onClick;
        $scope.allowedPrevMonth = allowedPrevMonth;
        $scope.allowedNextMonth = allowedNextMonth;
        $scope.weekDays = weekDays;
        $scope.isDefaultDate = isDefaultDate;
        $scope.DataCallburnSelected = DataCallburnSelected;
        $scope.prevMonth = prevMonth;
        $scope.nextMonth = nextMonth;
        $scope.hasManyColor = hasManyColor;
        $scope.currentDay = currentDay;

        $scope.getDayClass = getDayClass;
        $scope.getManyColor = getManyColor;
        $scope.addRemoveQueue = addRemoveQueue;
        $scope.addRemoveCheck = addRemoveCheck;

        $scope.arrowPrevClass = "visible";
        $scope.arrowNextClass = "visible";

        var $translate = $filter('translate');

        var MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAI', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
        var WEEKDAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

        if ($scope.options.mondayIsFirstDay) {
            var sunday = WEEKDAYS.shift();
            WEEKDAYS.push(sunday)
        }

        if ($scope.options.minDate) {
            $scope.options.minDate = new Date($scope.options.minDate);
        }

        if ($scope.options.maxDate) {
            $scope.options.maxDate = new Date($scope.options.maxDate);
        }

        if ($scope.options.disabledDates) {
            createMappedDisabledDates();
        }

        if ($scope.events) {
            createMappedEvents();
        }

        registerEvents();

        function createMappedDisabledDates() {
            if (!$scope.options.disabledDates) return;
            $scope.mappedDisabledDates = $scope.options.disabledDates.map(function (date) {
                return new Date(date);
            });
        }

        function createMappedEvents() {
            $scope.mappedEvents = $scope.events.map(function (obj) {
                obj.date = new Date(obj.date);
                return obj;
            });
        }

        function registerEvents() {
            var prevMonthEvent = $scope.options.prevMonthEvent || 'flexcalendar:prevMonthEvent';
            $scope.$on(prevMonthEvent, prevMonth);

            var nextMonthEvent = $scope.options.nextMonthEvent || 'flexcalendar:nextMonthEvent';
            $scope.$on(nextMonthEvent, nextMonth);
        }

        $scope.$watch('options.defaultDate', function () {
            calculateSelectedDate();
        });


        $scope.$watch('options.disabledDates', function () {
            if ($scope.options.disabledDates) {
                createMappedDisabledDates();
                calculateDisabledDates();
            }
        });

        $scope.$watch('events', function () {
            createMappedEvents();
            calculateWeeks();
        });

        $scope.$watch('weeks', function (weeks) {
            var filteredEvents = [];
            angular.forEach(weeks, function (week) {
                angular.forEach(week, function (day) {
                    if (day && day.event) {
                        angular.forEach(day.event, function (event) {
                            filteredEvents.push(event);
                        });
                    }
                });
            });
            if ('function' === typeof $scope.options.filteredEventsChange) {
                $scope.options.filteredEventsChange(filteredEvents);
            }
        });

        $scope.$watch('selectedYear', function (year, previousYear) {
            if (year !== previousYear) calculateWeeks();
        });
        $scope.$watch('selectedMonth', function (month, previousMonth) {
            if (month !== previousMonth) calculateWeeks();
        });

        /////////////////

        function onClick(date, index, domEvent) {
            if (!date || date.disabled) {
                return;
            }
            $scope.options.defaultDate = date.date;
            if (date.event.length && $scope.options.eventClick) {
                $scope.options.eventClick(date, domEvent);
            }

            $scope.options.dateClick(date, domEvent);
        }

        function bindEvent(date) {
            if (!date || !$scope.mappedEvents) {
                return;
            }
            date.event = [];
            $scope.mappedEvents.forEach(function (event) {
                if (date.date.getFullYear() === event.date.getFullYear()
                    && date.date.getMonth() === event.date.getMonth()
                    && date.date.getDate() === event.date.getDate()) {
                    date.event.push(event);
                }
            });
        }

        function allowedDate(date) {
            if (!$scope.options.minDate && !$scope.options.maxDate) {
                return true;
            }
            var currDate = date.date;
            if ($scope.options.minDate && (currDate < $scope.options.minDate)) {
                return false;
            }
            if ($scope.options.maxDate && (currDate > $scope.options.maxDate)) {
                return false;
            }
            return true;
        }

        function disabledDate(date) {
            if (!$scope.mappedDisabledDates) return false;
            for (var i = 0; i < $scope.mappedDisabledDates.length; i++) {
                if (date.year === $scope.mappedDisabledDates[i].getFullYear() && date.month === $scope.mappedDisabledDates[i].getMonth() && date.day === $scope.mappedDisabledDates[i].getDate()) {
                    return true;
                    break;
                }
            }
        }

        function allowedPrevMonth() {
            var prevYear = null;
            var prevMonth = null;
            if (!$scope.options.minDate) {
                return true;
            }
            var currMonth = MONTHS.indexOf($scope.selectedMonth);
            if (currMonth === 0) {
                prevYear = ($scope.selectedYear - 1);
                prevMonth = 11;
            } else {
                prevYear = $scope.selectedYear;
                prevMonth = (currMonth - 1);
            }
            if (prevYear < $scope.options.minDate.getFullYear()) {
                return false;
            }
            if (prevYear === $scope.options.minDate.getFullYear()) {
                if (prevMonth < $scope.options.minDate.getMonth()) {
                    return false;
                }
            }
            return true;
        }

        function allowedNextMonth() {
            var nextYear = null;
            var nextMonth = null;
            if (!$scope.options.maxDate) {
                return true;
            }
            var currMonth = MONTHS.indexOf($scope.selectedMonth);
            if (currMonth === 11) {
                nextYear = ($scope.selectedYear + 1);
                nextMonth = 0;
            } else {
                nextYear = $scope.selectedYear;
                nextMonth = (currMonth + 1);
            }
            if (nextYear > $scope.options.maxDate.getFullYear()) {
                return false;
            }
            if (nextYear === $scope.options.maxDate.getFullYear()) {
                if (nextMonth > $scope.options.maxDate.getMonth()) {
                    return false;
                }
            }
            return true;
        }

        function calculateWeeks() {
            $scope.weeks = [];
            var week = null;
            var daysInCurrentMonth = new Date($scope.selectedYear, MONTHS.indexOf($scope.selectedMonth) + 1, 0).getDate();

            for (var day = 1; day < daysInCurrentMonth + 1; day += 1) {
                var date = new Date($scope.selectedYear, MONTHS.indexOf($scope.selectedMonth), day);
                var dayNumber = new Date($scope.selectedYear, MONTHS.indexOf($scope.selectedMonth), day).getDay();
                if ($scope.options.mondayIsFirstDay) {
                    dayNumber = (dayNumber + 6) % 7;
                }
                week = week || [null, null, null, null, null, null, null];
                week[dayNumber] = {
                    year: $scope.selectedYear,
                    month: MONTHS.indexOf($scope.selectedMonth)+1,
                    day: day,
                    date: date,
                    _month: date.getMonth() + 1
                };

                if (allowedDate(week[dayNumber])) {
                    if ($scope.mappedEvents) {
                        bindEvent(week[dayNumber]);
                    }
                } else {
                    week[dayNumber].disabled = true;
                }

                if (week[dayNumber] && disabledDate(week[dayNumber])) {
                    week[dayNumber].disabled = true;
                }

                if (dayNumber === 6 || day === daysInCurrentMonth) {
                    $scope.weeks.push(week);
                    week = undefined;
                }
            }
            (!$scope.allowedPrevMonth()) ? $scope.arrowPrevClass = "hidden" : $scope.arrowPrevClass = "visible";
            (!$scope.allowedNextMonth()) ? $scope.arrowNextClass = "hidden" : $scope.arrowNextClass = "visible";
        }

        function calculateSelectedDate() {
            if ($scope.options.defaultDate) {
                $scope.options._defaultDate = new Date($scope.options.defaultDate);
            } else {
                $scope.options._defaultDate = new Date();
            }

            $scope.selectedYear = $scope.options._defaultDate.getFullYear();
            $scope.selectedMonth = MONTHS[$scope.options._defaultDate.getMonth()];
            $scope.selectedDay = $scope.options._defaultDate.getDate();
        }

        function calculateDisabledDates() {
            if (!$scope.mappedDisabledDates || $scope.mappedDisabledDates.length === 0) return;
            for (var i = 0; i < $scope.mappedDisabledDates.length; i++) {
                $scope.mappedDisabledDates[i] = new Date($scope.mappedDisabledDates[i]);
            }
            calculateWeeks();
        }

        function weekDays(size) {
            return WEEKDAYS.map(function (name) {
                return $translate(name).slice(0, size);
            });
        }

        function isDefaultDate(date) {
            if (!date) {
                return;
            }
            var result = date.year === $scope.options._defaultDate.getFullYear() &&
                date.month === $scope.options._defaultDate.getMonth() &&
                date.day === $scope.options._defaultDate.getDate();
            return result;
        }

        /**
         * @return {boolean}
         */
        function DataCallburnSelected(date) {
            if (date) {
                var dateFormat = date.year + "-" + date.month + "-" + date.day;
                if ($scope.options.shcedulationData.date[dateFormat]) {
                    return $scope.options.shcedulationData.date[dateFormat].length >= 1
                }
                return false;
            }


            //console.log(date);
        }

        function hasManyColor(date, color) {
            if (date) {
                var dateFormat = date.year + "-" + date.month + "-" + date.day;
                if ($scope.options.shcedulationData.date[dateFormat]) {
                    if ($scope.options.shcedulationData.date[dateFormat].length > 1) {
                        return "many-colors";
                    } else {
                        switch ($scope.options.shcedulationData.date[dateFormat][0]) {
                            case color:
                                return color;
                        }
                    }
                }
            }
        }

        function currentDay(date) {
            if (date) {
                var dateFormat = date.year + "-" + date.month + "-" + date.day;
                if (moment().format("YYYY-M-DD") == dateFormat) {
                    return true;
                }
            }
        }

        /**
         * get color
         * @param date
         * @param color
         * @returns {boolean}
         */
        function getManyColor(date, color) {
            if (date) {
                var dateFormat = date.year + "-" + date.month + "-" + date.day;
                if ($scope.options.shcedulationData.date[dateFormat]) {
                    if ($scope.options.shcedulationData.date[dateFormat].length >= 1) {
                        for (var index in $scope.options.shcedulationData.date[dateFormat]) {
                            if ($scope.options.shcedulationData.date[dateFormat][index] == color) {
                                return color;
                            }
                        }
                    } else {
                        return false;
                    }
                }
            }
        }

        function addRemoveQueue(date, color) {
            var data = String(date.date);
            data = data.substr(0, 2);

            if ($scope.options.CampaignComposeService.campaignData.remaining_repeats > 0) {
                if (Object.keys($scope.options.shcedulationData.date).length > 1) {
                    $scope.options.shcedulationData.date = {};
                }
                if ($scope.options.shcedulationData.date[date.year + '-' + date.month + '-' + date.day]) {
                    //console.log("in if");

                    var index = $scope.options.shcedulationData.date[date.year + '-' + date.month + '-' + date.day].indexOf(color);
                    if (index > -1) {
                        $scope.options.shcedulationData.date[date.year + '-' + date.month + '-' + date.day].splice(index, 1);
                    }
                    if ($scope.options.shcedulationData.date[date.year + '-' + date.month + '-' + date.day].length == 0) {
                        delete $scope.options.shcedulationData.date[date.year + '-' + date.month + '-' + date.day];
                    }
                } else {
                    if (Object.keys($scope.options.shcedulationData.date).length < 1) {
                        //console.log("in if in else");
                        $scope.options.shcedulationData.date[date.year + '-' + date.month + '-' + date.day] = [];
                        $scope.options.shcedulationData.date[date.year + '-' + date.month + '-' + date.day].push(color);
                    }
                }
            } else {
                if ($scope.options.shcedulationData.date[date.year + '-' + date.month + '-' + date.day]) {
                    var index = $scope.options.shcedulationData.date[date.year + '-' + date.month + '-' + date.day].indexOf(color);
                    if (index > -1) {

                        $scope.options.shcedulationData.date[date.year + '-' + date.month + '-' + date.day].splice(index, 1);

                    } else {
                        $scope.options.shcedulationData.date[date.year + '-' + date.month + '-' + date.day].push(color);

                    }
                    if ($scope.options.shcedulationData.date[date.year + '-' + date.month + '-' + date.day].length == 0) {
                        delete $scope.options.shcedulationData.date[date.year + '-' + date.month + '-' + date.day];
                    }

                } else {

                    $scope.options.shcedulationData.date[date.year + '-' + date.month + '-' + date.day] = [];
                    $scope.options.shcedulationData.date[date.year + '-' + date.month + '-' + date.day].push(color);
                }
            }
        }

        function addRemoveCheck(date, color) {
            if (date) {
                if ($scope.options.shcedulationData.date[date.year + '-' + date.month + '-' + date.day]) {
                    var index = $scope.options.shcedulationData.date[date.year + '-' + date.month + '-' + date.day].indexOf(color);
                    return index > -1;
                }
            }
            return false;
        }

        function prevMonth() {
            if (!$scope.allowedPrevMonth()) {
                return;
            }
            var currIndex = MONTHS.indexOf($scope.selectedMonth);
            if (currIndex === 0) {
                $scope.selectedYear -= 1;
                $scope.selectedMonth = MONTHS[11];
            } else {
                $scope.selectedMonth = MONTHS[currIndex - 1];
            }
            var month = {name: $scope.selectedMonth, index: currIndex - 1, _index: currIndex + 2};
            $scope.options.changeMonth(month, $scope.selectedYear);
        }

        function nextMonth() {
            if (!$scope.allowedNextMonth()) {
                return;
            }
            var currIndex = MONTHS.indexOf($scope.selectedMonth);
            if (currIndex === 11) {
                $scope.selectedYear += 1;
                $scope.selectedMonth = MONTHS[0];
            } else {
                $scope.selectedMonth = MONTHS[currIndex + 1];
            }
            var month = {name: $scope.selectedMonth, index: currIndex + 1, _index: currIndex + 2};
            $scope.options.changeMonth(month, $scope.selectedYear);
        }

        function getDayClass(day) {
            if (!day || !day.event || day.event.length === 0) {
                return '';
            }

            return day.event.map(function (e) {
                return e.eventClass || '';
            }).join(' ');
        }

    }

})();
