module.exports = 
	['$document', '$rootScope', 'Restangular', '$q', '$interval', 'growl', '$filter', 'CallBournModal', 'SettingsService', 
	function ($document, $rootScope, Restangular, $q, $interval, growl, $filter, CallBournModal, SettingsService) {
		return {
		    restrict: 'EA',
		    templateUrl: '/app/directives/templates/caller-id-timezone-checker.html',
		    /*scope: {
		    	page: '@',
		    },*/
		    $scope: {
		    	pagename: '@pagename',
		    },
			link: function ($scope, attrs) {

				$scope.pagename = attrs["0"].attributes["0"].nodeValue;
				

				$scope.selectData = [];
				$scope.verified = false;
				$scope.verificationCall = {};
				$scope.flagImages = [];
				$scope.selectedCallRoute = {};
				$scope.CurrentLanguageIndex = -1;

				$scope.reloadUsersData = function () {
				    SettingsService.getShowUser().then(function (data) {
				        if (data.resource.user_data) {
				            $rootScope.currentUser = data.resource.user_data;
				        }
				    })
				}

				Restangular.one('data/timezones').get().then(function(data){
					$scope.timezone = data.resource.timezones;
				});


				Restangular.one('data/current-country').get().then(function (data){
				    $scope.CurrentCountry = data.resource.countryCode;

				});

				Restangular.one('data/call-routes').get().then(function (data){
				    $scope.callRoutesCI = data.resource.routes;
				    for (index in $scope.callRoutesCI) {
				        var newRouteObject = {
				            keepAttr: $scope.callRoutesCI[index],
				            viewText: '+' + $scope.callRoutesCI[index].phonenumber_prefix
				        }
				        $scope.selectData.push(newRouteObject);
				        $scope.flagImages.push('/assets/callburn/images/flags/' + $scope.callRoutesCI[index].code + '.svg');
				
				
				        if($scope.CurrentCountry  ==  localStorage.getItem("CurrentUserLanguageCode")){
				            $scope.CurrentLanguageIndex = index;
				
				        }
				    }
				    if($scope.CurrentLanguageIndex != -1) {
				        $scope.defaultClass = '';
				    }
				    $scope.selectedCallRoute.route = $scope.callRoutesCI[$scope.CurrentLanguageIndex];
				});

				var checkHtmlElement = function(selector) {
				   
				    var queue = $q.defer();

				    var timer = $interval(function() {
				        if(angular.element(selector).length){
				            $interval.cancel(timer);
				            queue.resolve(angular.element(selector));
				        }
				    }, 300);

				    return queue.promise;
				}

				// Caller ID functions
		            $scope.loading = false;
		            $scope.showTimer = false;
		            $scope.addContactData = {};
		            $scope.showCallCodeField = false;
		            $scope.defaultClass = 'default-image-step-1 default-size';
		            $scope.validVerificationCallData = true;
		            $scope.userCountry = ['am', 'es', 'it'].includes($rootScope.currentUser.country_code) ? $rootScope.currentUser.country_code : ""
		        
				$scope.addPrefix = function () {
                    var elem = angular.element('#phone')[0];
                    elem.value[0] === '+' || elem.value === '' ? null : elem.value = '+ ' + sessionStorage.getItem('dial') + ' ' + elem.value;
                }
                checkHtmlElement("#phone").then(function (element) {
                    element.on("countrychange", function (e, countryData) {
                        element.value = sessionStorage.getItem('dial');
                    });
                    var countryData = angular.element("#phone").intlTelInput("getSelectedCountryData");

                    $scope.validator = function () {
                        if (angular.element("#phone").intlTelInput("isValidNumber")) {
                            $scope.isValidNumberClass = "input-success";
                            $scope.validVerificationCallData = false;
                        } else {
                            $scope.isValidNumberClass = "input-error";
                            $scope.validVerificationCallData = true;
                            if ($scope.addContactData.phonenumber === "") {
                                $scope.isValidNumberClass = "inp-placeholder";
                            }
                        }
                    }
                });

                $scope.timer = function(count) {
                    var queue = $q.defer();

                    var timer = $interval(function() {
                        $scope.counter = count;
                        $scope.counter = count--;

                        if(count < 0){
                            $interval.cancel(timer);
                            queue.resolve();
                        }
                    }, 1000);

                    return queue.promise;
                };

                $scope.verified = false;
                $scope.callMade = false;
                var finalPhonenumber = false;

                $scope.getDefaultSelected = function (index){

                    if (! $scope.callRoutes[index]) {
                        return {
                            image: "country-icon@2x",
                            text:  $rootScope.trans("modals_settings_edit_profile_modal_country"),
                        }
                    }
                    $scope.defaultClass = '';
                    return {
                        image:  $scope.callRoutes[index].code,
                        text:  '+' +  $scope.callRoutes[index].phonenumber_prefix
                    }
                };

                $scope.selectedNumber = function () {
                    $scope.defaultClass = '';
                    $scope.phonenumberExample = $scope.selectedCallRoute.route.phonenumber_example;
                }

                $scope.showNameBtn = false;
                $scope.AddCallerId = function () {
                    $rootScope.startModalLoader();
                    $rootScope.disableButton();
                    var requestData = {};
                    angular.copy($scope.addContactData, requestData);
                    requestData.phonenumber = finalPhonenumber;
                    SettingsService.addCallerId(requestData).then(function (data) {
                        $rootScope.stopModalLoader();
                        $rootScope.enabledButton();
                        if (data.resource.error.no == 0) {
                        	$scope.showNameBtn = true;
                            growl.success(data.resource.error.text);
                            $rootScope.wizardStepCallerId = false;
                        } else {
                            growl.error(data.resource.error.text);
                        }
                    })
                };

                $scope.finishCallerId = function() {
                    $scope.reloadUsersData();
                    CallBournModal.close();
                }

                $scope.showCodeInput = false;
                $scope.sendVerificationCall = function () {
                    $rootScope.startModalLoader();
                    $rootScope.disableButton();

                    var addContactData = {};
                    if (typeof $scope.selectedCallRoute.route == 'undefined') {
                        addContactData.phonenumber = $scope.addContactData.phonenumber;
                    } else {
                        addContactData.phonenumber = $scope.addContactData.name;
                    }
                    $scope.loading = true;
                    SettingsService.sendVerificationCode(addContactData).then(function (data) {
                        $scope.showTimer = true;
                        $rootScope.stopModalLoader();
                        $rootScope.enabledButton();
                        $scope.loading = false;
                        if (data.resource.error.no == 0) {
                        	$scope.showCodeInput = true;
                            $scope.timer(40).then(function () {
                                $scope.showTimer = false;
                            });
                            finalPhonenumber = data.resource.phonenumber;
                            $scope.showCallCodeField = true;
                            growl.success(data.resource.error.text);
                            $scope.verified = true;
                            $scope.callMade = true;
                        } else {
                            growl.error(data.resource.error.text);
                        }
                    });
                };

                //
				//$scope.timezone = $scope.timezones.resource.timezones;

				$scope.editTimezone = function () {
				    var timezone = $rootScope.currentUser.timezone;
				    SettingsService.updateMainData({timezone:timezone}).then(function (data) {
				        if (data.resource.error.no === 0) {
				            Restangular.one('users/show-user').get().then(function (data) {
				                if (!isEmpty(data.resource.user_data)) {
				                    $rootScope.currentUser.timezone = timezone;
				                    $rootScope.currentUser = data.resource.user_data;
				                } else {
				                    growl.error(trans(data.resource.error.text));
				                }
				            });

				            Restangular.one('users/users-time').get().then(function (timeData) {
				                $rootScope.currentTime = timeData.resource.time;
				                $rootScope.currentFullTime = timeData.resource.time;
				            });
				        }
				    })
				}

				$scope.toggleTimezoneSelector = false;

				$scope.toggleTimezoneSelectorFunction = function() {
				    $scope.toggleTimezoneSelector = !$scope.toggleTimezoneSelector
				    if ($scope.toggleTimezoneSelector) {
				        angular.element(document).ready(function () {
				            angular.element('.chosen-container').mousedown();
				        });
				        angular.element('div.chosen-container-single').addClass('chosen-container chosen-container-single chosen-container-active chosen-with-drop');
				    }
				}



			}
		}

	}];