angular.module('callburnApp').controller('StatisticsController', 
    ['$scope', '$rootScope', '$state', '$filter', 'Restangular', 'currentSnippet', 'SnippetService', 'CallBournModal', '$q', '$interval',
        function($scope, $rootScope, $state, $filter, Restangular, currentSnippet, SnippetService, CallBournModal, $q, $interval) {

            $scope.ctcPhonenumbers = currentSnippet.resource.snippet.ctc_phonenumbers;
            $scope.snippetData = currentSnippet.resource.snippet;
            //pagination/////////////////////////////////////////////////////////
            $scope.page = 1;
            $scope.total =  currentSnippet.resource.count;

            //$scope.snippetData.allowed_date_times = JSON.parse($scope.snippetData.allowed_date_times);
            $scope.snippetData.callerIds = [];
            $scope.snippetData.countries = [];
            $scope.customRanges = [];
            //$scope.selectedDateRange = $scope.snippetData.allowed_date_times.dateRangeStart.replace(/\s/g,'') + ' - ' + $scope.snippetData.allowed_date_times.dateRangeEnd.replace(/\s/g,'');

            //$scope.customDateRange = true;

            $scope.snippetData.country.forEach(function(item) {
                $scope.snippetData.countries.push(item._id);
            });

            $scope.snippetData.caller_id.forEach(function(item) {
                $scope.snippetData.callerIds.push(item._id);
            });
            $scope.snippetData.snippetName = $scope.snippetData.name;
            $scope.snippetData.voice_file_id = $scope.snippetData.file_id;
            delete $scope.snippetData.caller_id;
            delete $scope.snippetData.country;
            delete $scope.snippetData.name;
            delete $scope.snippetData.file_id;

            $scope.filterData = {};
            $scope.filterData._id = $scope.snippetData._id;

            var applyTranslations = function() {
                $scope.isLoaded=false;
                setTimeout( function(){$scope.isLoaded=true}, 100);
                $scope.days = [
                    {
                        value:1,
                        text: trans('campaign_overview_last_day')
                    },
                    {
                        value:7,
                        text: trans('campaign_overview_last_week')
                    },
                    {
                        value:30,
                        text: trans('campaign_overview_last_month')
                    },
                    {
                        value:90,
                        text: trans('campaign_overview_last_90_days')
                    }
                ];

                $scope.statuses = [
                    {
                        value:"ALL",
                        text: trans("campaign_overview_index_all")
                    },
                    {
                        value:"NO ANSWERED",
                        text: trans("ctc_stastics_not_connected")
                    },
                    {
                        value:"ANSWERED",
                        text: trans("call_click_to_call_connection_ok")
                    },
                    {
                        value:"PENDING",
                        text: trans("call_click_to_call_pending1")
                    },
                    {
                        value:"SCHEDULED",
                        text: trans("campaign_overview_index_scheduled")
                    }
                ];

                $scope.multiselectOptionsSnippetStatisticsData = [
                    {
                        "id":"FAILED",
                        "label": trans("ctc_stastics_not_connected")
                    },
                    {
                        "id":"ANSWERED",
                        "label": trans("call_click_to_call_connection_ok")
                    },
                    {
                        "id":"PENDING",
                        "label": trans("call_click_to_call_pending1")
                    },
                    {
                        "id":"SCHEDULED",
                        "label": trans("campaign_overview_index_scheduled")
                    },
                    {
                        "id":"IN_PROGRESS",
                        "label": trans("")
                    },
                    {
                        "id":"OUT_OF_DATE",
                        "label": trans("click_to_call_status_out_of_date")
                    }
                ];

                $scope.multiselectSnippetStatisticsTranslationTexts = {
                    dynamicButtonTextSuffix: $rootScope.trans('multi_checked'),
                    checkAll: $rootScope.trans('multi_check_all'),
                    uncheckAll: $rootScope.trans('multi_uncheck_all'),
                    selectionCount: $rootScope.trans('multi_checked'),
                    buttonDefaultText: $rootScope.trans('multiselect_statistics_status')
                };
            }

            $rootScope.$watch('currentLanguage', applyTranslations);
            $rootScope.$watch('isLangLoaded', applyTranslations);

            $scope.pagesCount = Math.ceil(currentSnippet.resource.count / 30);

            $scope.showEditNameInput = function () {
                $scope.showEditBox = !$scope.showEditBox;
                setTimeout(function() {
                    angular.element("#change-snippet-name").select();
                },100);
            }

            $scope.changeCampaignName = function() {
                // if ($scope.showEditBox) {
                //     if (!$scope.snippetData.snippetName) {
                //         $scope.errClass = "input-error animated swing";
                //         return;
                //     } else {
                //         $scope.errClass = "";
                //     }
                //     var name = $scope.campingData.campaign_name;
                //     var id = $scope.campingData._id;
                //     var editNameData = {
                //         'campaign_name' : name,
                //         'campaign_id': id
                //     };
                    // Restangular.all('campaigns/update-campaign-name').post(editNameData).then(function(data) {
                    //     if (data.resource.error.no === 0) {
                    //         $scope.showEditBox = false;
                    //         $scope.redBorder = '';
                    //     }
                    // })
                // }
            };

            $scope.currentPage = undefined;
            $scope.changePage = function(page) {
                // if (page < 0 || page > $scope.pagesCount - 1) {
                //     return;
                // }
                $scope.currentPage = page;
                $scope.filterData.page = page;

                SnippetService.currentSnippetStatistics( $scope.filterData).then(function (data) {
                    $scope.ctcPhonenumbers = data.resource.snippet.ctc_phonenumbers;
                });
            };

            $scope.CurrentDateFormat = function(date, full) {

                if(full === undefined) {

                    full = null;
                }


                if(full) {
                    return moment(date).format("DD/MM/YYYY - HH:mm");
                } else {
                    return moment(date).format("DD/MM/YYYY");
                }
            };

            $scope.filterChanged = function() {

                SnippetService.currentSnippetStatistics($scope.filterData).then(function (data) {
                    $scope.ctcPhonenumbers = data.resource.snippet.ctc_phonenumbers;
                    $scope.total = data.resource.count;

                });
            };

            $scope.exportStatistics = SnippetService.exportStatistics;

            $scope.retryPhoneNumber = function(id){
                SnippetService.retryPhoneNumber(id).then(function(data){
                    $scope.filterChanged();
                });
            };
        
            $scope.removeAllFromPending = function(){
                console.log($scope.snippetData._id);
                SnippetService.removeAllFromPending($scope.snippetData._id).then(function(data){
                    $scope.filterChanged();
                });
            };
        
            $scope.addRemovePending = function(id, action){
                SnippetService.addRemovePending(id, action).then(function(data){
                    $scope.filterChanged();
                });
            };

            $scope.isRetryNow = function (lastPhoneNumber) {

                return ((lastPhoneNumber.status === 'OUT_OF_DATE' && lastPhoneNumber.is_pending) || lastPhoneNumber.status === 'FAILED' || lastPhoneNumber.is_pending === 1 || lastPhoneNumber.status === 'TRANSFER_NOT_CONNECTED') && lastPhoneNumber.status !== 'CANCELLED' && lastPhoneNumber.status !== 'CANT_CALL_DUE_TO_EU'

            };

            $scope.callNow = function (lastPhoneNumber) {

                SnippetService.callNow(lastPhoneNumber._id).then(function (data) {

                    if(data.resource.error.no === 0) {
                       var getData = {
                            _id : currentSnippet.resource.snippet._id
                        };
                        SnippetService.currentSnippetStatistics(getData).then(function (data) {
                            $scope.ctcPhonenumbers = data.resource.snippet.ctc_phonenumbers;
                        });
                    }
                });
            };

            $scope.cancelSchedulation = function (lastPhoneNumber) {

               var postData = {
                    
                    id : lastPhoneNumber._id
                };

                SnippetService.cancelSchedulation(postData).then(function (data) {

                    if(data.resource.error.no === 0) {
                       var getData = {
                            _id : currentSnippet.resource.snippet._id
                        };
                        SnippetService.currentSnippetStatistics(getData).then(function (data) {
                            $scope.ctcPhonenumbers = data.resource.snippet.ctc_phonenumbers;
                        });
                    }
                });
                
            };

            $scope.cancelCancellation = function (lastPhoneNumber) {

               //$scope.callNow(lastPhoneNumber);
               var postData = {

                    id : lastPhoneNumber._id
                };

                SnippetService.cancelCancellation(postData).then(function (data) {

                    if(data.resource.error.no === 0) {
                       var getData = {
                            _id : currentSnippet.resource.snippet._id
                        };
                        SnippetService.currentSnippetStatistics(getData).then(function (data) {
                            $scope.ctcPhonenumbers = data.resource.snippet.ctc_phonenumbers;
                        });
                    }
                });
            };

            $scope.isNotConnected = function (phonenumber) {

                if((phonenumber.status === 'TRANSFER_NOT_CONNECTED' || phonenumber.is_pending) && phonenumber.is_current) {
                    
                    return true;
                }

                if(phonenumber.status !== 'FAILED') {

                    return true;
                }

                return false;
            };

            $scope.getStatus = function (phonenumber) {
                if (phonenumber.status === 'CANT_CALL_DUE_TO_EU') {
                    return "<span class='dark_orange'>" + trans("cant_call_due_eu") + "</span>";
                }
                if (phonenumber.status === 'TRANSFER_NOT_CONNECTED'){
                   return "<span class='dark_orange'>" + trans("call_click_to_call_not_connected") + "</span>";
                }
                switch (phonenumber.status) {
                    case "SUCCEED" :
                        return "<span class='ctc-text-success'>" + trans("call_click_to_call_connection_ok") + "</span>";
                        break;
                    case "OUT_OF_DATE" :
                        return "<span class='ctc-text-cancelled'>" + trans("click_to_call_status_out_of_date") + "</span>";
                        break;
                    case "TRANSFER_NOT_CONNECTED_FAILED":
                        return "<span class='dark_orange'>" + trans("call_click_to_call_not_connected") + "</span>";
                        break;
                    case "FAILED" :
                        return "<span class='dark_orange'>" + trans("call_click_to_call_not_connected") + "</span>";
                        break;
                    case "IN_PROGRESS" :
                        if (phonenumber.first_scheduled_date === null && phonenumber.status === 'IN_PROGRESS') {
                            return "<span>" + trans("ctc_in_progress") + "</span>";
                        }
                        if (phonenumber.first_scheduled_date !== null && phonenumber.status === 'IN_PROGRESS'){
                            return "<span class='ctc-text-warning'>" + trans("call_click_to_call_scheduled_on") + "</span><br><span>" + $scope.CurrentDateFormat(phonenumber.first_scheduled_date, 1) + "</span>";
                        }
                        break;
                    case "CANCELLED" :
                        return "<span class='ctc-text-cancelled'>" + trans("ctc_cancelled") + "</span>";
                        break;
                }
            };

            $scope.getMainPhoneNumber = function(phonenumber){

               var retriesLength = phonenumber.manual_retries.length;
               var lastPhoneNumber = ( retriesLength > 0 ) ? phonenumber.manual_retries[retriesLength - 1] : phonenumber;
                //console.log(585,lastPhoneNumber)
                return lastPhoneNumber
            }

            $scope.getRetry = function(phonenumber) {
                var retriesLength = phonenumber.manual_retries.length;
                if (retriesLength > 1) {
                    return  $scope.CurrentDateFormat(phonenumber.manual_retries[retriesLength - 2].created_at, 1);
                } if (retriesLength > 0) {
                    return  $scope.CurrentDateFormat(phonenumber.created_at, 1);
                } else {
                    return "N/A";
                }
            };

            $scope.getDuration = function(phonenumber) {
                var sum = 0;
                phonenumber.calls.forEach(function(call) {
                    sum += call.duration;
                });

                phonenumber.manual_retries.forEach(function(retry) {
                    retry.calls.forEach(function(call) {
                        sum += call.duration;
                    });
                });
                
                return sum;
            }

            $scope.getCost = function(phonenumber) {
                var sum = 0;
                 phonenumber.calls.forEach(function(call) {
                    sum += call.cost;
                });

                phonenumber.manual_retries.forEach(function(retry) {
                    retry.calls.forEach(function(call) {
                        sum += call.cost;
                    });
                });
                
                return sum;
            }

            $scope.openExportModal = function (snippetId, filterData) {
                CallBournModal.open({
                    scope: {
                        snippetId: snippetId,
                        filterData: filterData
                    },
                    templateUrl: "/app/modals/campaign-export/campaign-export.html",
                }, function (scope) {
                    scope.close = function() {
                        CallBournModal.close();
                    }
                    scope.exportHandler = function (fileFormat) {
                        $scope.exportStatistics(snippetId, filterData, fileFormat);
                        CallBournModal.close();
                    };
                });
            }

            $scope.showAllAttempts = function(phonenumber) {
                CallBournModal.open({
                    scope: {
                        phonenumber:phonenumber,
                        //getStatus: $scope.getStatus
                    },
                    templateUrl: "/app/modals/clickToCall/show-all-attemps-modal.html",
                }, function (scope) {
                    //scope.getStatus = $scope.getStatus;
                    scope.close = function() {
                        CallBournModal.close();
                    };

                    scope.getStatus = function (phonenumber) {

                        return $scope.getStatus(phonenumber);
                    }
                });
            };

            $scope.multiselectOptionsSnippetStatisticsDataCallback =  function() {
                var q = $q.defer();

                if($scope.multiselectOptionsSnippetStatisticsData) {
                    return q.resolve($scope.multiselectOptionsSnippetStatisticsData)
                } else {
                    $interval(function(){
                        if($scope.multiselectOptionsSnippetStatisticsData) {
                            return q.resolve($scope.multiselectOptionsSnippetStatisticsData)
                        }
                    },500);
                }

                return q.promise;
            }

            $scope.checkPending = function(){
                $scope.result = false;
                angular.forEach($scope.ctcPhonenumbers, function(ctcItem){
                    if ((ctcItem.is_pending == 1 || ctcItem.status == 'TRANSFER_NOT_CONNECTED')) {
                        $scope.result = true;
                    }
                })
                return $scope.result;
            }
            
            $scope.multiselectSnippetStatisticsSettings = {
                //showCheckAll : false,
                //showUncheckAll: false,
                //dynamicTitle: false,
                //checkBoxes: true,
                template: "{{option.label}}",
                buttonClasses: "new_snippet_statistic",
            };

            $scope.multiselectOptionsSnippetStatisticsDataCallback().then(function(data) {
                $scope.checkedOptionsModel = [];
                $scope.multiSelectEvents.onSelectionChanged();
             });

            $scope.MultiselectButtonText = {buttonDefaultText: trans('call_click_to_call_status')};
            
            /*function checkAll() {
                var auxiliaryArr = [];
                for (var i = 0; i < $scope.multiselectOptionsSnippetStatisticsData.length; i++) {
                    auxiliaryArr.push($scope.multiselectOptionsSnippetStatisticsData[i]);
                }
                $scope.checkedOptionsModel = auxiliaryArr;
                $scope.checkedOptions = [];
                $scope.checkedOptionsModel.forEach(function (option) {
                    $scope.checkedOptions.push(option.id)
                });
            }

            function uncheckAll() {
                $scope.checkedOptionsModel = [];
                $scope.checkedOptions = [];
            }*/

            $scope.isAllSelected = 0;

            $scope.multiSelectEvents = {
                onSelectionChanged: function() {
                    $scope.checkedOptions = [];
                    $scope.checkedOptionsModel.forEach(function (option) {
                        $scope.checkedOptions.push(option.id)
                    });
                    /*if($scope.isAllSelected && $scope.checkedOptions.length != $scope.multiselectOptionsSnippetStatisticsData.length && $scope.checkedOptions.indexOf('ALL') != -1) {
                        var index = $scope.checkedOptions.indexOf('ALL');
                        $scope.checkedOptions.splice(index, 1);
                        $scope.checkedOptionsModel.splice(index, 1);
                        $scope.isAllSelected = 0;
                    }
                    else if ($scope.checkedOptions.indexOf('ALL') != -1) {
                        $scope.isAllSelected = 1;
                        checkAll();
                    } else {
                        if ($scope.isAllSelected == 1) {
                            $scope.isAllSelected = 0;
                            uncheckAll();
                        }else if ($scope.checkedOptions.length == $scope.multiselectOptionsSnippetStatisticsData.length - 1) {
                            $scope.isAllSelected = 1;
                            checkAll();
                        } 
                    }*/

                    $scope.filterData.statuses = JSON.stringify ( $scope.checkedOptions );
                    $scope.filterChanged();
                    console.log('checkedOptions', $scope.checkedOptions);
                }
            }

        }]);

        