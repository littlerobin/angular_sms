angular.module('callburnApp').controller('OverviewController',
    [       '$scope', '$rootScope', '$state', '$filter',  'Restangular', '$stateParams', 'getSnippets','SnippetService','CallBournModal','growl', '$q', '$interval','$timeout',
        function($scope,   $rootScope,   $state,   $filter, Restangular, $stateParams, getSnippets, SnippetService, CallBournModal, growl, $q, $interval, $timeout){

            $rootScope.currentActiveRoute = 'snippet';
            $scope.exportStatistics = SnippetService.exportStatistics;
            $scope.currentOrder = 'ASC';
            $scope.statusClass = 'ASC';
            $scope.orderField = null;
            $scope.tableSpinnerLoading = true;
            $rootScope.showTutorial = $stateParams.showTutorial ? true : false;
            $scope.arrowHelper = true;
            $scope.removeTooltip = false;

            $scope.hideArrowHelper = function() {
                $scope.arrowHelper = false;
            }

            var applyTranslations = function() {
                $scope.isLoaded=false;
                setTimeout( function(){$scope.isLoaded=true}, 100);
                $scope.dates = [
                    {
                        value:1,
                        text: $rootScope.trans('campaign_overview_last_day')
                    },
                    {
                        value:7,
                        text: $rootScope.trans('campaign_overview_last_week')
                    },
                    {
                        value:30,
                        text: $rootScope.trans('campaign_overview_last_month')
                    },
                    {
                        value:90,
                        text: $rootScope.trans('campaign_overview_last_90_days')
                    }
                ];

                $scope.multiselectOptionsSnippetOverviewData = [
                    {
                        "id": "ACTIVE",
                        "label": $rootScope.trans('call_chackbox_active')
                    },
                    {
                        "id": "DELETED",
                        "label": $rootScope.trans('call_chackbox_deleted')
                    },
                    {
                        "id": "DRAFT",
                        "label": $rootScope.trans('call_chackbox_draft')
                    },
                    {
                        "id": "IN_PAUSE",
                        "label": $rootScope.trans('call_chackbox_in_pause')
                    },
                    {
                        "id": "DEACTIVATED",
                        "label": $rootScope.trans('call_chackbox_deactivated')
                    }
                ];

                $scope.multiselectSnippetOverviewTranslationTexts = {
                    dynamicButtonTextSuffix: $rootScope.trans('multi_checked'),
                    checkAll: $rootScope.trans('multi_check_all'),
                    uncheckAll: $rootScope.trans('multi_uncheck_all'),
                    selectionCount: $rootScope.trans('multi_checked'),
                    buttonDefaultText: $rootScope.trans('multiselect_statistics_status')
                };
            }

            $rootScope.$watch('currentLanguage', applyTranslations);
            $rootScope.$watch('isLangLoaded', applyTranslations);
           

            $scope.orderData = {};
            $scope.filterData = {};

            $scope.page = 1;
            $scope.snippets = getSnippets.resource.snippets;
            $scope.totalCount = getSnippets.resource.total_count;
            $scope.count = getSnippets.resource.count;

            $scope.total = getSnippets.resource.total_count;
            $scope.hasAnySnippet = getSnippets.resource.hasAnySnippet;
            $scope.pagesCount = Math.ceil(getSnippets.resource.total_count / 30);

            var checkPublishedSnippets = function () {
               var count = 0;
                $scope.snippets.forEach(function (item) {
                    if(item.is_published === 1) {
                        count ++;
                    }
                });

                return count;
            };

            $scope.currentPage = undefined;
            $scope.changePage = function (page) {
                $scope.tableSpinnerLoading = true;
                if (page < 0 || page > $scope.pagesCount) {
                    return;
                }
                $scope.currentPage = page;
                var postData = {};
                postData.page = page;
                $scope.filterData.page = page;

                SnippetService.getSnippets($scope.filterData).then(function (data) {
                    $scope.snippets = data.resource.snippets;
                    $scope.tableSpinnerLoading = false;
                });
            }

            $scope.CurrentDateFormat = function (date) {
                var updatedAt = moment(date, "YYYY-MM-DD HH:mm:ss").format('YYYY-MM-DD HH:mm:ss');

                return $filter('localDate')(updatedAt);
            }

            $scope.goToEdit = function (id) {
                $state.go('snippet.edit', {_id:id});
            }

            $scope.checkInArray = function (array, id) {
                return (array.indexOf(id) > -1) ? true : false;
            };
            $scope.showIntegrationCode = function (snippet) {
                var callRoutes = [],countries = [];

                var urls = snippet.allowed_url.split(',');
                urls = urls.filter(function (item) {
                    return item.length > 0;
                });

               snippet.country.forEach(function(item) {
                    countries.push(item._id);
                });

                var routes = [];
                Restangular.one('data/call-routes').get().then(function(data) {
                    if (data.resource.error.no == 0) {
                        var callRoutes = data.resource.routes

                        for (index in callRoutes) {
                            var newRouteObject = {
                                _id: callRoutes[index]._id,
                                flagImage : '/assets/callburn/images/flags/' + callRoutes[index].code + '.svg',
                                viewText : callRoutes[index].name + ' (+' + callRoutes[index].phonenumber_prefix + ')',
                                countryPrefix : ' (+' + callRoutes[index].phonenumber_prefix + ')'
                            };
                            if ($scope.checkInArray(countries,newRouteObject._id)) {
                                routes.push(newRouteObject);
                            }
                        }
                    } 
                });

                SnippetService.getApiJs(snippet.api_token).then(function (data) {
                    var javascript = data.resource.javascript;
                    var snippetImagePath = snippet.image_url ? snippet.image_url : '/assets/callburn/images/click_to_call_icons/callerid-icon.svg';
                    var imgQRCodeURL = snippet.qr_code_img_url;
                    CallBournModal.open({
                        scope: {
                            javascript: javascript,
                            snippet: snippet,
                            showAll : urls.length > 1,
                            snippetImagePath: snippetImagePath,
                            callburn_domain: 'https://callme.callburn.com/',
                            callRoutes: routes,
                            countries: countries,
                            dropdownOpen: false,
                            copyEffectClass: '',
                            copyEffectPart : null,
                            imgQRCodeURL: imgQRCodeURL,
                            showTargetEmailInput: false,
                            apiToken: snippet.api_token
                        },
                        templateUrl: "/app/modals/clickToCall/confirm_snippet_creation_1.html",
                    }, function (scope) {
                        scope.close = function () {
                            $state.go('snippet.overview');
                            CallBournModal.close();
                        }

                        scope.downloadWordPressPlugin = function (type) {
                            SnippetService.getWordPressPlugin(type, scope.snippet);
                        }

                        scope.sendEmailCTCIntCodes = function (email) {
                            var data = {};
                            data.snippet_id = snippet._id;
                            data.email = email;
                            data.token = scope.apiToken;
                            SnippetService.sendCTCIntegrationCodesEmail(data).then(function (response) {
                                if (response.resource.error.no === 0) {
                                    growl.success($rootScope.trans('email_sucessfully_sent'));
                                } else if (response.resource.error.no === -1) {
                                    growl.error($rootScope.trans('email_wasnt_sent'));
                                }
                            });
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
            };

            $scope.removeSnippet = function (id) {
                ConfirmDeleteModal().then(function () {
                    $rootScope.startModalLoader();
                    $rootScope.disableButton();
                    SnippetService.removeSnippet(id).then(function (data) {
                        $rootScope.stopModalLoader();
                        $rootScope.enabledButton();
                        if (data.resource.error.no == 0) {
                            $scope.snippets = $scope.snippets.filter(function( item ) {
                                return item._id != id;
                            });
                        } else {
                            growl.error(trans(data.resource.error.text));
                        }
                    });
                });
            }

            $scope.changeOrder = function (data) {
                $scope.tableSpinnerLoading = true;
                $scope.currentOrder = ($scope.currentOrder === 'ASC') ? 'DESC' : 'ASC';
                $scope.orderField = data;

                if (data === 'name') {
                    var ordering = {
                        orderBy :'name',
                        type : $scope.currentOrder
                    }
                } else if (data === 'created_at') {
                    var ordering = {
                        orderBy : 'created_at',
                        type : $scope.currentOrder
                    };
                }

                var getData =  Object.assign($scope.filterData, ordering);
                SnippetService.getSnippets(getData).then(function (data) {
                    if (data.resource.error.no === 0) {
                        $scope.snippets = data.resource.snippets;
                        $scope.tableSpinnerLoading = false;
                    }
                });
            }

            $scope.filteringSnippet = function () {
                $scope.tableSpinnerLoading = true;
                SnippetService.getSnippets($scope.filterData).then(function (data) {
                    if (data.resource.error.no == 0) {
                        $scope.snippets = data.resource.snippets;
                        $scope.count = data.resource.count;
                        $scope.tableSpinnerLoading = false;
                    }
                });
            }

            $scope.filterSnippetsCheckbox = function (status) {
                $scope.tableSpinnerLoading = true;
                if (status == 'all') {
                    var allStatus = $scope.filterData.checkbox_all;
                    $scope.filterData.checkbox_active = allStatus;
                    $scope.filterData.checkbox_deleted = allStatus;
                } else {
                    if ( $scope.filterData.checkbox_active 
                        && $scope.filterData.checkbox_deleted
                       ) {
                        $scope.filterData.checkbox_all = true;
                    } else {
                        $scope.filterData.checkbox_all = false;
                    }
                }
                $scope.filteringSnippet();
            }

            if ($rootScope.currentUser.balance < 0.22 && checkPublishedSnippets($scope.snippets)) {
                CallBournModal.open({
                    scope: {},
                    templateUrl: "/app/modals/clickToCall/low-balance.html",
                }, function(scope) {
                    scope.close = function () {
                        CallBournModal.close();
                    }
                });
            }

            $scope.enableSnippet = function (snippet) {
               var postData = {};
                postData._id = snippet._id;
                postData.type = 'enable';

                SnippetService.enableOrDisableSnippet(postData).then(function (data) {
                    if (data.resource.error.no === 0) {
                       var snippets =  $scope.snippets.map(function (item) {
                            if(item._id === data.resource.snippet._id) {
                               var current = item;
                                current.is_active = data.resource.snippet.is_active;
                                return current;
                            } else {
                                return item;
                            }
                        });
                        $scope.snippets = snippets;
                    }
                });
            }

            $scope.disableSnippet = function (snippet) {
               var postData = {};
                postData._id = snippet._id;
                postData.type = 'disable';

                SnippetService.enableOrDisableSnippet(postData).then(function (data) {
                    if(data.resource.error.no === 0) {
                      var snippets =  $scope.snippets.map(function( item) {
                            if(item._id === data.resource.snippet._id) {
                               var current = item;
                                current.is_active = data.resource.snippet.is_active;
                                return current;
                            } else {
                                return item;
                            }
                        });
                        $scope.snippets = snippets;
                    }
                });
            };

            $scope.getStatus = function (snippet) {
                if (snippet.is_blocked ) {
                    return 'ctc_status_deactivated'
                }

                if (!snippet.is_published) {
                    return 'campaign_overview_index_draft';
                }

                if (!snippet.is_active) {
                    return 'ctc_in_pause';
                }

                if (snippet.user.balance >= 0.22 && snippet.is_published) {
                    return snippet.status == 'ACTIVE' ? 'call_click_to_call_active' : snippet.status
                }

                if (snippet.user.balance < 0.22  && snippet.is_published) {
                    return 'low_balance_disabled';
                }
            };

            $scope.getStatusClass = function (snippet) {
                if (snippet.is_blocked ) {
                    return 'dark_orange';
                }

                if (!snippet.is_active || $rootScope.currentUser.numbers.length === 0) {
                    return "ctc-text-warning";
                }

                if (!snippet.is_published) {
                    return "integration-code-blue";
                }

                if (snippet.user.balance < 0.22  && snippet.is_published) {
                    return "dark_orange snippet_blinking";
                }

                if (snippet.status === "ACTIVE") {
                    return "active_status";
                }
            };

            $scope.multiselectOptionsSnippetOverviewDataCallback =  function () {
                var q = $q.defer();
                if ($scope.multiselectOptionsSnippetOverviewData) {
                    return q.resolve($scope.multiselectOptionsSnippetOverviewData)
                } else {
                    $interval(function(){
                        if($scope.multiselectOptionsSnippetOverviewData) {
                            return q.resolve($scope.multiselectOptionsSnippetOverviewData)
                        }
                    },500);
                }
                return q.promise;
            }

            $scope.multiselectOptionsSnippetOverviewDataCallback().then(function (data) {
                $scope.checkedOptionsModel = [];
                $scope.multiSelectEvents.onSelectionChanged();
            });

            $scope.multiselectSnippetOverviewSettings = {
                template: "{{option.label}}",
                buttonClasses: "",
            }

            $scope.multiSelectEvents = {
                onSelectionChanged: function() {
                    $scope.checkedOptions = [];
                    $scope.checkedOptionsModel.forEach(function (option) {
                        $scope.checkedOptions.push(option.id)
                    });
                    $scope.filterData.statuses = JSON.stringify ( $scope.checkedOptions );
                    $scope.filteringSnippet();
                }
            }

            $scope.setHolidayMode = function ($event,snippet) {
               var id = snippet._id;

                CallBournModal.open({
                    scope: {
                        errorMessage : false,
                        holidayMode : snippet.holiday_mode,
                        isActiveHolidayMode : snippet.is_active_holiday_mode,
                        wrongDateRange : ''
                    },
                    templateUrl: "/app/modals/clickToCall/holiday_mode.html",
                }, function (scope) {
                    if(scope.holidayMode) {
                        var holidayModeFrom = scope.holidayMode.split('-')[0].trim();
                        var holidayModeTo = scope.holidayMode.split('-')[1].trim();

                        scope.holidayModeFrom = moment(holidayModeFrom,'DD/MM/.YYYY').format('DD.MM.YYYY');
                        scope.holidayModeTo = moment(holidayModeTo,'DD/MM/YYYY').format('DD.MM.YYYY');
                    } else {
                        scope.holidayModeFrom = moment().format('DD.MM.YYYY');
                        scope.holidayModeTo = moment().add(1,'days').format('DD.MM.YYYY');
                    }

                    scope.close = function () {
                        CallBournModal.close();
                    };

                    scope.downloadWordPressPlugin = function (type) {
                        SnippetService.getWordPressPlugin(type, scope.snippet);
                    };

                    scope.changed = function (holidayModeFrom,holidayModeTo) {
                        var start = moment(holidayModeFrom,'DD.MM.YYYY');
                        var end = moment(holidayModeTo,'DD.MM.YYYY');
                        if (start.diff(end) >= 0 ) {
                            scope.wrongDateRange = 'snippet-wrong-border';
                        } else {
                            scope.wrongDateRange = '';
                        }
                    }

                    scope.saveHolidayMode = function (from, to, isActiveHolidayMode) {
                        var postData = {
                            from: from,
                            to: to,
                            isActiveHolidayMode: isActiveHolidayMode,
                            id: id
                        };

                        SnippetService.saveHolidayMode(postData).then(function (data) {
                            if (data.resource.error.no === 0) {
                                var snippets =  $scope.snippets.map(function( item) {
                                    if(item._id === data.resource.snippet._id) {
                                        var current = item;
                                        current.holiday_mode = data.resource.snippet.holiday_mode;
                                        current.is_active_holiday_mode = data.resource.snippet.is_active_holiday_mode;
                                        return current;
                                    } else {
                                        return item;
                                    }
                                });
                                $scope.snippets = snippets;
                                scope.close();
                            } else {
                                scope.errorMessage = data.resource.error.text;
                            }
                        });
                    }
                });
            };

            window.document.title = $scope.notSeenNotificationsCount === 0 ? 'ClickToCall - ' + 'Callburn' : '(' + $scope.notSeenNotificationsCount + ') ' + 'ClickToCall - ' + 'Callburn';

            $scope.showHolidayModeInStatus = function (snippet) {
                if (!snippet.is_active_holiday_mode) {
                    return false;
                }

                var holidayModeRanges = snippet.holiday_mode.split('-');
                var start = moment(holidayModeRanges[0].trim(), 'DD/MM/YYYY');
                var end = moment(holidayModeRanges[1].trim(), 'DD/MM/YYYY');
                var now = moment();

                if (now.diff(start) >= 0 && now.diff(end) <= 0) {
                    return true;
                }

                return false;
            }
}]);
