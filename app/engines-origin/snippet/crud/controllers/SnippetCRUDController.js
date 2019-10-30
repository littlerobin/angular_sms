angular.module('callburnApp').controller('SnippetCRUDController',
    ['$scope',
    '$document',
    '$rootScope',
    '$state',
    '$filter',
    'Restangular',
    'callRoutes',
    '$log',
    'FileUploader',
    '$timeout',
    'growl',
    'growlMessages',
    '$sce',
    'SnippetService',
    'editSnippet',
    '$q',
    'CallBournModal',
    "$interval",
    'SettingsService',
    'timezones',
    'user',
    'SnippetCrudDataService',
    function(
        $scope,
        $document,
        $rootScope,
        $state,
        $filter,
        Restangular,
        callRoutes,
        $log,
        FileUploader,
        $timeout,
        growl,
        growlMessages,
        $sce,
        SnippetService,
        editSnippet,
        $q,
        CallBournModal,
        $interval,
        SettingsService,
        timezones,
        user,
        SnippetCrudDataService
    ) {

        $scope.tinymceOptions = {
            onChange: function(e) {
                // put logic here for keypress and cut/paste changes
            },
            inline: false,
            plugins : 'advlist autolink link image lists charmap print preview',
            skin: 'lightgray',
            theme : 'modern'
        };

        $scope.editSnippet = editSnippet;

        $scope.weekdays = [
            'weekdays_Monday',
            'weekdays_Tuesday',
            'weekdays_Wednesday',
            'weekdays_Thursday',
            'weekdays_Friday',
            'weekdays_Saturday',
            'weekdays_Sunday',
        ];

        $scope.englishWeekdays = [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
        ];

        $scope.dateRanges = [
            {
                name:trans('click_to_call_entire_daytime'),
                time:"09:00 - 20:00",
            },
            {
                name:trans('click_to_call_full_day'),
                time:"00:00 - 23:59"
            },
            {
                name:trans('click_to_call_morning_only'),
                time:"09:00 - 13:00"
            },
            {
                name:trans('click_to_call_afternoon_only'),
                time:"15:00 - 20:00"
            }
        ];


        $scope.hoursSelect = [];
        $scope.weekDaysCustom = [];
        $scope.invalidUrls = [];
        $scope.defaultDateTab = 0;
        $scope.minutesSelect = [];
        $scope.hoursArrCustom = [];
        $scope.minutesArrCustom = [];
        $scope.selectedCurrentHour = '10';
        $scope.selectedCurrentMinute = '00';

        $scope.choiceMin = function (min) {
            $scope.selectedCurrentMinute = min;
        };

        var ids = [
            'minuteSelect1',
            'minuteSelect2',
            'hourSelect1',
            'hourSelect2',
        ];

        $document.on('click', function ($event) {
            if (ids.indexOf($event.target.id) == -1) {
                $scope.hoursSelectShow = false;
                $scope.minutesSelectShow = false;
                // $scope.$apply();
            }
        });

        $scope.userCallerIds = user.resource.user_data.numbers.length ? user.resource.user_data.numbers : null;

        $scope.hoursSelectShow = false;
        $scope.buttonLoading = false;
        $scope.minutesSelectShow = false;
        $scope.status = {};
        $scope.status.dropdownOpen = false;
        $scope.status.dropdownOpen2 = false;
        $scope.status.dropdownOpen3 = false;
        $scope.status.dropdownOpen4 = false;
        $scope.status.dropdownOpen5 = false;
        $scope.isCustomTime = false;
        $scope.customDateRangeLocal = null;

        $scope.defaultTextTab = 0;
        $scope.defaultAudioTab = 0;

        $scope.firstCountryId = 0;

        $scope.frontDay = '';
        $scope.frontDayCustom = '';
        $scope.saveButtonColor = 'btn-primary';

        $scope.snippetImagePath = '/assets/callburn/images/click_to_call_icons/callerid-icon.svg';

        var subdomainRandomValue = function() {
            var string = "";
            var random_number = new Date().getUTCMilliseconds();
            var possible = random_number + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (var i = 0; i < 8; i++ ) {
                string += possible.charAt(Math.floor(Math.random() * possible.length));
            }

            return string;
        }

        $scope.saveButtonMouseover = true;

        if ($rootScope.currentUser.balance < 0.22) {
            $scope.disabledSubmitButton = true;
        } else {
            $scope.disabledSubmitButton = false;
        }

        if ($scope.editSnippet) {
            $scope.snippetData = $scope.editSnippet.resource.snippets;
            setTimeout(function() {
                $scope.voiceFile = $scope.snippetData.files ? $scope.snippetData.files : null;
            }, 1000);

            if ($scope.snippetData.is_published) {
                $scope.disabledSubmitButton = true;
                $scope.saveButtonMouseover = false;
            } else {
                $scope.saveButtonMouseover = true;
            }

            $scope.snippetData.subdomain = $scope.editSnippet.resource.snippets.subdomain;
            $scope.snippetData.callerIds = [];
            $scope.snippetData.countries = [];
            $scope.minutesSelectCustom = [];
            $scope.customRanges = [];
            $scope.snippetData.allowed_urls = [];
            $scope.snippetData.haveInvalidUrl = false;
            var urls = $scope.snippetData.allowed_url.split(',');

            urls.forEach(function (item) {
                if(item.length)  {
                    var tag = {
                        text : item
                    };
                    $scope.snippetData.allowed_urls.push(tag);
                }
            });

            if ($scope.snippetData.image_url) {
                $scope.snippetImagePath = $scope.snippetData.image_url;
                $rootScope.snippetImagePath = $scope.snippetData.image_url;
            }

            $scope.snippetData.use_default_image_checkbox = $scope.snippetData.image_url ? false : true;

            if (!$scope.snippetData.allowed_date_times) {
                $scope.snippetData.allowed_date_times = {};
                $scope.snippetData.allowed_date_times.weekDays = [];
            }

            if ($scope.snippetData.custom_date_times) {
                $scope.snippetData.custom_date_times =  JSON.parse($scope.snippetData.custom_date_times);
                $scope.customDateRange = true;
                $scope.defaultDateTab = 1;
            } else {
                $scope.snippetData.custom_date_times = [];
                $scope.customDateRange = false;
                $scope.defaultDateTab = 0;
            }

            $scope.snippetData.country.forEach(function(item) {
                $scope.snippetData.countries.push(item._id);
            });

            $scope.snippetData.caller_id.forEach(function(item) {
                $scope.snippetData.callerIds.push(item._id);
            });
            $scope.snippetData.caller_id_id = $scope.snippetData.caller_id_id ? $scope.snippetData.caller_id_id : $scope.userCallerIds[0]._id;
            $scope.snippetData.snippetName = $scope.snippetData.name;
            $scope.snippetData.voice_file_id = $scope.snippetData.file_id;

            /*image*/
            $scope.snippetData.image_file_id =  $scope.snippetData.image_id;

            delete $scope.snippetData.caller_id;
            delete $scope.snippetData.country;
            delete $scope.snippetData.name;
            delete $scope.snippetData.file_id;

            if ($scope.snippetData.default_text) {
                $scope.defaultTextTab = 1;
            } else {
                $scope.defaultTextTab = 0;
            }

            if ($scope.snippetData.voice_file_id) {
                $scope.defaultAudioTab = 1;
            } else {
                $scope.defaultAudioTab = 0;
            }
        } else {
            $scope.snippetData = {};
            $scope.snippetData.callerIds = [];
            $scope.snippetData.countries = [];
            $scope.snippetData.allowed_urls = [];
            $scope.snippetData.allowed_date_times = {};
            $scope.snippetData.custom_date_times = [];
            $scope.snippetData.allowed_date_times.weekDays = [];

            $scope.snippetData.caller_id_id = $scope.userCallerIds ? $scope.userCallerIds[0]._id : null;
            $scope.customDateRange = false;
            $scope.defaultDateTab = 0;
            $scope.customRanges = [];
            $scope.snippetData.default_text = null;
            $scope.snippetData.use_default_image_checkbox = true;
            $scope.snippetData.image_name = null;
            $scope.snippetData.haveInvalidUrl = false;
            $scope.snippetData.subdomain = subdomainRandomValue();
        }

        $scope.wait_time = [
            60,30,15,10,5,3,2
        ];

        $scope.callRoutes = [];

        $scope.snippetData.wait_time = 10 ;

        $scope.snippetData.maxCustomRangesCount = 8 ;

        $scope.ismeridian = true;

        var fromTime = new Date();
        var fHour = fromTime.getHours();
        fromTime.setHours(fHour);
        fromTime.setMinutes(0);
        $scope.fromTime = fromTime;

        var toTime = new Date();
        var fMin = toTime.getHours();
        toTime.setHours(fMin);
        toTime.setMinutes(0);
        $scope.toTime = toTime;

        $scope.hstep = 1;
        $scope.mstep = 5;

        $scope.voiceFile = null;
        $scope.isRecordedFilePlaying = false;
        $scope.options = {
            hstep: [1, 2, 3],
            mstep: [1, 5, 10, 15, 25, 30]
        };

        $scope.imageFile = null;

        $scope.thisCanBeusedInsideNgBindHtml = $sce.trustAsHtml($scope.snippetText);

        $scope.minEndTime = new Date();

        $scope.createCallRoutes = function (callRoutes) {
            var countries = [];
            SnippetService.getCallerIds().then(function(data) {
                if (data.resource.callerIds.length) {
                    var callerIds = data.resource.callerIds.map(function(item){
                        return parseInt(item.tariff.prefix);
                    });
                } else {
                    var callerIds = [];
                }

                if(data.resource.callerIds.length > 0){
                    $scope.snippetData.callerIds.push(data.resource.callerIds[0]._id);
                }

                for (index in callRoutes) {
                    var newRouteObject = {
                        _id: callRoutes[index]._id,
                        flagImage : '/assets/callburn/images/flags/' + callRoutes[index].code + '.svg',
                        viewText : callRoutes[index].name + ' (+' + callRoutes[index].phonenumber_prefix + ')',
                        countryPrefix : ' (+' + callRoutes[index].phonenumber_prefix + ')',
                        customerPrice : callRoutes[index].customer_price
                    };

                    try {
                        if ($rootScope.currentUser.country_code.toLowerCase() === callRoutes[index].code.toLowerCase()) {
                            $scope.snippetData.countries.push(callRoutes[index]._id);
                        }
                    } catch (e) {

                    }
                    countries.push(newRouteObject);
                }

            });

            return countries;
        }

        $scope.callRoutes =  $scope.createCallRoutes(callRoutes.resource.routes);

        $scope.updateCountries = function (ids) {
            Restangular.one('snippets/call-routes/').get({ids:JSON.stringify(ids)}).then(function (data) {
                $scope.callRoutes =  $scope.createCallRoutes(data.resource.routes);
            });
        };

        $scope.removeRedColor = function (id) {
            angular.element('#' + id).removeClass('snippet-not-valid');
            angular.element('#' + id + 'Text').removeClass('snippet-not-valid');
        };

        $scope.choiceCallerId = function (callerID) {
            growlMessages.destroyAllMessages();
            $scope.removeRedColor('callerIds');
            $scope.choiceOrRemove($scope.snippetData.callerIds, callerID._id);
        };

        $scope.selectCallerIdId = function (callerIdId) {
            $scope.snippetData.caller_id_id = callerIdId;
        }

        $scope.choiceCountry = function (id) {
            $scope.removeRedColor('countries');
            growlMessages.destroyAllMessages();
            $scope.choiceOrRemove($scope.snippetData.countries,id);
        };

        $scope.frontCountry = function (id) {
            var firstCountry = false;
            $scope.callRoutes.forEach(function (item) {
                if (item._id == id) {
                    firstCountry = item;
                    return ;
                }
            });

            if (firstCountry) {
                return firstCountry;
            } else {
                return $scope.callRoutes[0];
            }
        };

        $scope.replaceToFrontCountry = function (id) {
            $scope.firstCountryId = id;
            $scope.choice = $scope.frontCountry(id);
        };

        $scope.checkInArray = function (array, id) {
            return (array.indexOf(id) > -1) ? true : false;
        };

        $scope.getInterval = function (start,end,step) {
            if (step === undefined) {
                step = 1;
            }
            start = parseInt(start);
            end = parseInt(end);
            var arr = [];
            for(var i = start; i < end; i +=step) {

                if(i < 10) {
                    arr.push("0" + i);
                } else {
                    arr.push("" + i + "");
                }

            }

            return arr;
        };

        $scope.makeInterval = function(start, end, step) {
            if (step === undefined) {
                step = 1;
            }
            start = parseInt(start);
            end   = parseInt(end);

            if (start > end) {
                $scope.item = start;
                start = end;
                end = $scope.item;
            }

            var interval = [];

            for(var i = start; i <= end; i += step) {


                interval.push(i<10?"0"+i:""+i+"");
            }

            return interval;
        }

        $scope.selectHour = function(hour) {
            $scope.minutesArr = [];
            if (hour == $scope.hoursArr[0]) {
                for (var i = $scope.fromMinute; i < 60; i += 5) {
                    $scope.minutesArr.push(i);
                }
            } else if (hour == $scope.hoursArr[$scope.hoursArr.length - 1]) {
                for (var i = 0; i < $scope.toMinute; i += 5) {
                    $scope.minutesArr.push(i);
                }
            } else {
                for (var i = 0; i < 60; i += 5) {
                    $scope.minutesArr.push(i);
                }
            }
            $scope.selecedHour = hour;
        };

        $scope.selectMinute = function(minute) {
            $scope.selecedMinute = minute;
        };

        $scope.choiceDateRange = function(dateRange) {
           var times = dateRange.time.split('-')

            $scope.addCustomRange(times[0],times[1])
        };

        $scope.$watch('snippetData.snippetName',function (newVal) {
            if(newVal && newVal.length > 0) {
                growlMessages.destroyAllMessages();
                $scope.wrongBorder = "";
            }
        },true);

        $scope.choiceHour = function (hour) {
            $scope.selectedCurrentHour = hour;
            if(hour == $scope.hoursSelect[$scope.hoursSelect.length - 1] && $scope.isCustomTime) {
                $scope.minutesSelect = $scope.minutesSelectCustom;
            } else {
                $scope.minutesSelect = $scope.getInterval(0,60,5);
            }
        };

        $scope.choiceOrRemove = function (array, id) {
            if ($scope.checkInArray(array, id)) {
                var index = array.indexOf(id);
                array.splice(index, 1);
            } else {
                array.push(id);
            }
        };

        $scope.choiceTime = function (time) {
            $scope.snippetData.wait_time = time;
        };

        $scope.choiceWeekDay = function (index,part) {
            growlMessages.destroyAllMessages();
            $scope.removeRedColor('weekDays');

            if (part) {
                $scope.choiceOrRemove($scope.snippetData.allowed_date_times.weekDays,$scope.englishWeekdays[index]);
                if ($scope.snippetData.allowed_date_times.weekDays.length > 0) {
                   var day = $scope.snippetData.allowed_date_times.weekDays[0];
                    $scope.frontDay = $scope.weekdays[$scope.englishWeekdays.indexOf(day)]
                } else {
                    $scope.frontDay = 'ctc_today';
                }
            } else {
                if ($scope.weekDaysCustom.length > 0) {
                   var day = $scope.snippetData.allowed_date_times.weekDays[0];
                    $scope.frontDay = $scope.weekdays[$scope.englishWeekdays.indexOf(day)]
                } else {
                    $scope.frontDay = 'ctc_today';
                }
                $scope.choiceOrRemove($scope.weekDaysCustom,$scope.englishWeekdays[index]);
            }
        };

        $scope.removeCustomRange = function (dateRange) {
            var index = $scope.snippetData.custom_date_times.indexOf(dateRange);
            if (index >= 0) {
                $scope.snippetData.custom_date_times.splice( index, 1 );
            }
            $scope.hideSelectedWeekDays (dateRange);
            if (!$scope.snippetData.custom_date_times.length) {
                $scope.customDateRangeLocal = [];
                $scope.frontDay = '';
            }
        };

        $scope.addCustomRange = function (fromTime,toTime) {
            if (! $scope.weekDaysCustom.length) {
                return false;
            }

           var time = $filter('date')(fromTime, 'HH:mm') + ' - ' + $filter('date')(toTime, 'HH:mm');

            if ($scope.snippetData.custom_date_times.length >= $scope.snippetData.maxCustomRangesCount) {
                return false;
            }

            for (var i = 0; i < $scope.customRanges.length; i++) {
                if ($scope.getCustomRangeTime($scope.customRanges[i]) === time) {
                    return;
                }
            }

            if (!$filter('filter')($scope.dateRanges, {'time':time}).length) {
               var data = {};
                data[time] =  $scope.weekDaysCustom;

                $scope.snippetData.custom_date_times.push(data);

                $scope.weekDaysCustom = [];
            }
        };


            $scope.getSelectedWeekdays = function (customRange) {
               var weekDays = Object.values(customRange)[0];
               var data = {};
               var selectedWeekdays = [];

                weekDays.forEach(function (day) {
                   var index = $scope.englishWeekdays.indexOf(day);
                    data[index] = trans($scope.weekdays[index]);

                });

                Object.keys(data)
                    .sort()
                    .forEach(function(i, day) {
                        selectedWeekdays.push(data[i])
                    });

                return selectedWeekdays.join(', ');
            };


            $scope.showSelectedWeekDays = function (customRange) {
                angular.element('.ng-snippet-choiced-item').removeClass('snippet-choiced-item');

                var weekDays = Object.values(customRange)[0];

                weekDays.forEach(function (day) {

                var block = angular.element("#custom-" + day);
                    block.addClass('snippet-choiced-item');
                });
            };

            $scope.hideSelectedWeekDays = function (customRange) {
               var weekDays = Object.values(customRange)[0];
                weekDays.forEach(function (day) {
                    var block = angular.element("#custom-" + day);
                        block.removeClass('snippet-choiced-item');
                });

                angular.element('.ng-snippet-choiced-item').addClass('snippet-choiced-item');
            };

            $scope.getCustomRangeTime = function (customRange) {
                return Object.keys(customRange)[0];
            };

            $scope.frontWeekDay = function (weekday) {
                $scope.frontDay = weekday;
            };

            $scope.frontWeekDayCustom = function (weekday) {
                $scope.frontDay = $scope.weekdays[$scope.englishWeekdays.indexOf(weekday)];

                SnippetCrudDataService.getHoursAndMinutes($scope.customDateRangeLocal[weekday]).then(function (data) {
                    $scope.customCurrentDayHours = data;
                    $scope.hoursArrCustom = [];
                    data.forEach(function (item) {
                        $scope.hoursArrCustom.push(Object.keys(item)[0]);
                    });
                    $scope.selecedHour = $scope.hoursArrCustom[0];
                });
            };

            $scope.selectHourCustom = function (hour) {
                $scope.selecedHour = hour;
                $scope.customCurrentDayHours.forEach(function (item) {
                    if (Object.keys(item)[0] === hour) {
                       var minutes = Object.values(item)[0];
                        $scope.minutesArrCustom = $scope.makeInterval(minutes.from,minutes.to,5);
                    }
                });
            };
            
            $scope.startTimeChange = function (time) {
                var startTimeHour = $filter('date')(time, 'HH');
                var startTimeMin = $filter('date')(time, 'mm');
                var date = new Date();
                date.setHours( startTimeHour );
                date.setMinutes( startTimeMin );
                $scope.minEndTime = date;
                var endTimeHour = angular.element('.endTimePicker td.hours > input');
                var endTimeMin = angular.element('.endTimePicker td.minutes > input');

                if (endTimeHour.val() <= startTimeHour) {
                    endTimeHour.val(startTimeHour);
                    if (endTimeMin.val() <= startTimeMin) {
                        endTimeMin.val(startTimeMin);
                    }
                }
            }

            $scope.openSnippetVoiceFileSelect = function() {
                $timeout(function() {
                    angular.element('#campaignVoiceFileInput1').trigger('click');
                }, 100);
            }

            var snippetVoiceMessageUpload = $scope.snippetVoiceMessageUpload = new FileUploader({
                url: '/snippets/upload-snippet-file',
                alias: 'file',
                headers: {JWTAuthorization: "Bearer " + localStorage.getItem("jwtToken")},
                autoUpload: true,
                formData: [
                    {
                        part: 'snippet',
                    }
                ]
            });

            /**
             * after file upload
             * @param item
             */

            snippetVoiceMessageUpload.onAfterAddingFile = function(item) {
                $rootScope.disableButton();
                $scope.uploadingAudioName = item.file.name;
            }

            /**
             * on file upload success
             * @param item
             * @param response
             * @param status
             * @param headers
             */
            snippetVoiceMessageUpload.onSuccessItem = function(item, response, status, headers) {
                $rootScope.enabledButton();
                $rootScope.stopModalLoader();
                if (response.resource.error.no == 0) {
                    $scope.voiceFile = response.resource.file;
                    $scope.snippetData.voice_file_id = response.resource.file._id;
                    growl.success(trans(response.resource.error.message));
                } else {
                    growl.error(trans(response.resource.error.text));
                }
            };

            /**
             * on file upload error
             * @param item
             * @param response
             * @param status
             * @param headers
             */
            snippetVoiceMessageUpload.onErrorItem = function(item, response, status, headers) {
                $scope.errors = response;
                $rootScope.enabledButton();
                $rootScope.stopModalLoader();
            }

            /**
             * before file upload
             */
            snippetVoiceMessageUpload.onBeforeUploadItem = function () {
                $rootScope.disableButton();
                $rootScope.startModalLoader();
            }


            $scope.getAudioSource = function (audioTemplate) {
                if (!audioTemplate) {
                    return false;
                }

                return $sce.trustAsResourceUrl(audioTemplate.amazon_s3_url);
            };

            $scope.playPauseRecordedAudio = function (audioTemplate) {
                var audio = document.getElementById("audioFileSnippet");
                var play = angular.element("#audioFilePlay");
                if ($scope.isRecordedFilePlaying) {
                    audio.pause();
                    play.removeClass("pause");
                    play.removeClass("black");
                } else {
                    audio.play();
                    play.addClass("pause");
                    play.addClass("black");
                    audio.addEventListener('ended', function () {
                        $scope.isRecordedFilePlaying = false;
                        play.removeClass("pause");
                        play.removeClass("black");
                        // $scope.$apply();
                    }, false);
                }
                $scope.isRecordedFilePlaying = !$scope.isRecordedFilePlaying;
            };

            /*********************************image upload**************************************/

            $scope.openSnippetImageSelect = function() {
                $timeout(function() {
                    angular.element('#campaignImageInput1').trigger('click');
                }, 100);
            };

            var snippetImageUpload = $scope.snippetImageUpload = new FileUploader({
                url: '/snippets/upload-image-file',
                alias: 'file',
                headers: {JWTAuthorization: "Bearer " + localStorage.getItem("jwtToken")},
                autoUpload: true
            });

            /**
             * after file upload
             * @param item
             */

            snippetImageUpload.onAfterAddingFile = function(item) {
                $rootScope.disableButton();
            }

            /**
             * on file upload success
             * @param item
             * @param response
             * @param status
             * @param headers
             */
            snippetImageUpload.onSuccessItem = function(item, response, status, headers) {
                $rootScope.enabledButton();
                $rootScope.stopModalLoader();
                if (response.resource.error.no == 0) {
                    $scope.snippetImagePath = response.resource.url;
                    $scope.snippetData.image_name = response.resource.name;
                } else {
                    growl.error(trans(response.resource.error.text));
                }
            };

            /**
             * on file upload error
             * @param item
             * @param response
             * @param status
             * @param headers
             */
            snippetImageUpload.onErrorItem = function(item, response, status, headers) {
                $scope.errors = response;
                $rootScope.enabledButton();
                $rootScope.stopModalLoader();
                growl.error($rootScope.trans('something__went__wrong'));
            };

            /**
             * before file upload
             */
            snippetImageUpload.onBeforeUploadItem = function() {
                $rootScope.disableButton();
                $rootScope.startModalLoader();
            }

            /*********************************image upload**************************************/
            try {
               var day = Object.keys($scope.customDateRangeLocal)[0];
                $scope.frontDay = $scope.weekdays[$scope.englishWeekdays.indexOf(day)];
                $scope.selecedHour = $scope.hoursArrCustom[0];
            } catch (e) {
                $scope.frontDay = '';
                $scope.selecedHour = '00';
            }

            $scope.customDateRange = true;
            $scope.defaultDateTab = 1;

            $scope.tabs = function (tabIndex, name) {
                if (name === 'text') {
                    if (tabIndex === 1 ) {
                        $scope.defaultTextTab = 0;
                    } else {
                        $scope.defaultTextTab = 1;
                    }
                } else if (name === 'audio') {
                    if (tabIndex === 1 ) {
                        $scope.defaultAudioTab = 0;
                    } else {
                        $scope.defaultAudioTab = 1;
                    }
                }
            };

            $scope.$watch('snippetData.custom_date_times',function (newVal) {
                var sendData = {};
                sendData.custom_date_times = newVal;
                sendData.offset = (new Date).getTimezoneOffset()/60;

                SnippetService.getMergedDate(sendData).then(function (data) {
                    if (data.resource.error.no === 0) {
                        $scope.customDateRangeLocal = data.resource.date;
                        var day = Object.keys($scope.customDateRangeLocal)[0];
                        $scope.frontWeekDayCustom(day);
                        if (!$scope.frontDay) {
                            $scope.frontDay = $scope.weekdays[$scope.englishWeekdays.indexOf(day)];
                        }
                    }
                });
            }, true);

            // part is 0 if user want to save as draft and 1 if user want to save and create
            $scope.saveSnippet = function (part) {
                if ($scope.disabledSubmitButton && part) {
                    return;
                }

                if (!part && $scope.editSnippet) {
                    $scope.snippetData.saveType = 'save';
                } else if (part){
                    $scope.snippetData.saveType = 'saveAndCreate';
                } else {
                    $scope.snippetData.saveType = 'saveAsDraft';
                }

                $scope.snippetData.has_custom_date_times = $scope.customDateRange;
                $scope.buttonLoading = true;

                if (!$scope.defaultTextTab) {
                    $scope.snippetData.default_text = '';
                }
                var id = $scope.editSnippet ? $scope.editSnippet.resource.snippets._id : false;

                if ($scope.defaultTextTab == 0) {
                    $scope.snippetData.default_text = null;
                }

                if ($scope.defaultAudioTab == 0) {
                    $scope.snippetData.voice_file_id = null;
                }

                var allowed_url = '';
                $scope.snippetData.allowed_urls.forEach(function (item) {
                    allowed_url += (item.text + ',');
                });


                $scope.snippetData.allowed_url = allowed_url;
                var orderedWeekDays = [];

                SnippetService.snippetCRUD($scope.snippetData, id).then(
                    function (data) {
                        var subdomain = data.resource.snippets.subdomain;
                        var snippetId = data.resource.snippets._id;
                        var imgQRCodeURL = data.resource.snippets.qr_code_img_url;
                        $scope.buttonLoading = false;
                        if (data.resource.error.no === 0) {
                            if ($scope.editSnippet) {
                                $state.go('snippet.overview');
                            } else {
                                SnippetService.getApiJs(data.resource.snippets.api_token).then(function (data) {
                                    if (!part) {
                                        $state.go('snippet.overview');
                                        return;
                                    }

                                   var javascript = data.resource.javascript;
                                   var snippetImagePath = $scope.snippetImagePath;
                                   var callRoutes_serv = $scope.callRoutes;
                                   var snippet = $scope.snippetData;
                                   var choice = $scope.choice;
                                   var frontCountry = $scope.frontCountry($scope.snippetData.countries[$scope.firstCountryId]);
                                   var dropdown_false = false;

                                    CallBournModal.open({
                                        scope: {
                                            showAll : $scope.snippetData.allowed_urls.length,
                                            snippetId : snippetId,
                                            javascript:javascript,
                                            callRoutes:callRoutes_serv,
                                            snippetData:snippet,
                                            snippetImagePath:snippetImagePath,
                                            callburn_domain: 'ctc_callmecallburncom_localname',
                                            subdomain:subdomain,
                                            dropdownOpen:dropdown_false,
                                            choice:choice,
                                            frontCountry:frontCountry,
                                            checkInArray:$scope.checkInArray,
                                            replaceToFrontCountry:$scope.replaceToFrontCountry,
                                            imgQRCodeURL:imgQRCodeURL
                                        },
                                        templateUrl: "/app/modals/clickToCall/confirm_snippet_creation_2.html",
                                    }, function(scope, Restangular) {
                                        scope.close = function () {
                                            $state.go('snippet.overview');
                                            CallBournModal.close();
                                        }
                                        scope.copyEffect = function (part) {
                                            scope.copyEffectPart = part;
                                            scope.copyEffectClass = 'animated fadeOutUp';
                                            $timeout(function () {
                                                scope.copyEffectClass = ''
                                            },1000)
                                        }
                                    });
                                });

                            }
                        }
                    }, function(errors) {
                        $scope.buttonLoading = false;
                        if (Object.values(errors.data)) {
                           var ids = [
                                'callerIds',
                                'wait_time',
                                'countries',
                                'weekDays',
                                'dateRange',
                                'dateRangeCustom',
                                'snippetName',
                                'allowed_url',
                            ];

                            for (var i = 0; i < ids.length; i++) {
                                if ($scope.checkInArray(Object.keys(errors.data),ids[i])) {
                                    if(ids[i] === 'snippetName') {
                                        $scope.wrongBorder = "snippet-wrong-border";
                                    } else {
                                        $scope.wrongBorder = "";
                                    }
                                    $scope.navigateScrollTo(ids[i]);
                                    break;
                                }
                            }
                        }
                    }
                );
            };

            $scope.navigateScrollTo = function (id) {
               var element = angular.element(document.getElementById(id));
               var text = angular.element(document.getElementById(id + "Text"));
               var body = angular.element('body');
                body.animate({scrollTop: element.offset().top - 10}, "slow",function () {
                    element.addClass( "animated shake snippet-not-valid");
                    text.addClass( "snippet-not-valid");
                    $timeout(function () {
                        element.removeClass("animated shake");
                    },2000)
                });
                return true;
            };

            $scope.$watch('snippetData.allowed_urls',function (newVal, oldVal) {
                if($scope.snippetData.allowed_urls === 0) {
                    $scope.removeRedColor('allowed_url');
                }
            }, true);

            $scope.checkUrls = function () {
                //
            }

            $scope.checkValidTag = function (tag) {
                return $scope.checkInArray($scope.invalidUrls,tag.text);
            };

            $scope.checkTag = function (tag) {
                SnippetService.checkUrl(tag.text).then(
                    function (data) {
                        if (data.resource.error.no != 0) {
                            $scope.invalidUrls.push(tag.text);
                            $scope.snippetData.haveInvalidUrl = true;
                        } else {
                            $scope.snippetData.haveInvalidUrl = false;
                            $scope.snippetData.allowed_urls.forEach(function (item) {
                                if ($scope.checkInArray($scope.invalidUrls,item.text)) {
                                    $scope.snippetData.haveInvalidUrl = true;
                                    return;
                                }
                            });

                            if (!$scope.snippetData.haveInvalidUrl) {
                                $scope.removeRedColor('allowed_url');
                            }
                        }
                    },
                    function (data) {
                        $scope.invalidUrls.push(tag.text);
                        $scope.snippetData.haveInvalidUrl = true;
                    }
                );
            };

            $scope.removeUrl = function (tag) {
                var index = $scope.invalidUrls.indexOf(tag.text);
                if (index > -1) {
                    $scope.invalidUrls.splice(index, 1);
                }

                if($scope.invalidUrls.length == 0) {
                    $scope.removeRedColor('allowed_url');
                    $scope.snippetData.haveInvalidUrl = false;
                }
            }

            $scope.enableSupportCountries = function () {
                $scope.callRoutes.forEach(function (item) {
                    if(!$scope.checkInArray($scope.snippetData.countries,item._id)) {
                        $scope.snippetData.countries.push(item._id);
                    }
                });
            }

            $scope.copyEffect = function (part) {
                $scope.copyEffectPart = part;
                $scope.copyEffectClass = 'animated fadeOutUp';
                $timeout(function () {
                    $scope.copyEffectClass = '';
                },1000)
            }
    }]);
