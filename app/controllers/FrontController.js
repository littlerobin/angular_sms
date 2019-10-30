angular.module('frontCallburnApp').controller('FrontController',
    ['$scope', '$rootScope', '$state', 'Restangular', '$http', 'CallBournModal', 'growl', "$timeout",'LanguageControl',
        function ($scope, $rootScope, $state, Restangular, $http, CallBournModal, growl, $timeout, LanguageControl) {

            $rootScope.languages = {};

            LanguageControl.GetLanguagesList().then(function (data) {
                $rootScope.flags = [];
                $rootScope.languages = data.resource.languages;
                $rootScope.languages.forEach(function (language) {
                    $rootScope.flags.push("/assets/callburn/images/lang-flags/" + language.code + ".svg");

                });
            });

            var CurrentLanguageData = LanguageControl.GetLanguage("CurrentUserLanguageCode",$rootScope.languages);
            $rootScope.currentLanguage = CurrentLanguageData.code;
            $rootScope.currentLanguageName = CurrentLanguageData.name;

            $scope.showPhoneMenu = false;
            $scope.phoneMenu = function () {
                angular.element('.menu_icon_line_container').toggleClass('menu_icon_line_container1')
                $scope.showPhoneMenu = !$scope.showPhoneMenu;
            }

            //$rootScope.currentLanguage = 'en';
            $rootScope.composeAction = 'compose';

            $rootScope.changeComposeAction = function (action) {
                $rootScope.composeAction = action;
            }

            $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                $rootScope.showLoading = true;
            })

            $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                $rootScope.showLoading = false;
            })

            $scope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
                $rootScope.showLoading = false;
            })

            $scope.showRegistrationModal = false;
            //$scope.showLoginModal = false;
            $scope.showRecoveryModal = false;
            $scope.loginErrorMessage = false;
            $scope.showPrivacyModal = false;
            $scope.showConditionsModal = false;


            $scope.PrivacyModal = function () {
                $scope.showPrivacyModal = true;
            }

            $scope.ConditionsModal = function () {
                $scope.showConditionsModal = true;
            }

            $scope.loginErrorMessage = function () {
                $scope.showInvalidLogin = false;
            }

            $scope.login = function () {
                Restangular.all('auth/login').post($scope.loginData).then(function (data) {
                    if (data.resource.error.no == 0) {
                        window.location.assign(appUrl + "#/dashboard/dashboard");
                    } else {
                        $scope.showInvalidLogin = true;
                    }
                });
            }

            $scope.registrationData = {};
            $scope.verificationStep = 1;

            $scope.sendVerificationCall = function () {
                var postData = {
                    phonenumber: $scope.registrationData.phonenumber,
                    action: 'registration'
                }
                Restangular.all('verifications/send-verification-code').post(postData).then(function (data) {
                    if (data.resource.error.no == 0) {
                        $scope.verificationStep = 2;
                        $scope.registrationData.phonenumber = data.resource.phonenumber;
                    } else {
                        $scope.verificationErrorMessage = data.resource.error.text;
                    }
                });
            }

            $scope.validateVoiceCode = function () {
                Restangular.all('verifications/check-voice-code-validation').post($scope.registrationData).then(function (data) {
                    if (data.resource.error.no == 0) {
                        $scope.verificationStep = 3;
                    } else {
                        $scope.verificationErrorMessage = data.resource.error.text;
                    }
                });
            }

            $scope.checkEmail = false;

            // $scope.registration = function () {
            //     Restangular.all('auth/registration').post($scope.registrationData).then(function (data) {
            //         $scope.showRegistrationModal = false;
            //         $scope.showLoginModal = true;
            //         $scope.checkEmail = true;
            //     }, function () {
            //         growl.error($rootScope.trans('registration_error_message_try_again'));
            //     });
            // }




            $scope.showLanguageSelect = false;
            $scope.hideLanguage = function () {
                $scope.showLanguageSelect = false;
            }

            $scope.showHideLanguageBar = function () {
                $scope.showLanguageSelect = !$scope.showLanguageSelect;
            }

            var translate = {};
            var langRequestInProcess = false;
            $rootScope.trans = function (str) {
                var lang = $rootScope.currentLanguage ? $rootScope.currentLanguage : 'en';
                if (!translate[lang]) {
                    if (!langRequestInProcess) {
                        langRequestInProcess = true;
                        $http.get('translations/front_translate_' + lang + '.json').success(function (data) {
                            //console.log(data);
                            translate[lang] = data;
                            langRequestInProcess = false;
                        });
                    }
                } else {
                    return translate[lang][str] ? translate[lang][str] : str;
                }
            }

            $scope.changeLanguage = function (lang) {
                $rootScope.currentLanguage = lang;
                //
                $rootScope.languages.forEach(function (item) {
                    if (item.code == lang) {
                        localStorage.setItem("CurrentUserLanguageCode", lang);
                        localStorage.setItem("CurrentUserLanguageName", item.name);
                        $rootScope.currentLanguageName = item.name;

                    }
                });

            }


            $scope.callRoutes = [];
            $scope.flagImages = [];
            $scope.selectData = [];
            $scope.selectedCallRoute = {};
            $scope.CurrentLanguageIndex = -1;

            Restangular.one('data/current-country').get().then(function (data){
                $scope.CurrentCountry = data.resource.countryCode;

            });

            Restangular.one('data/call-routes').get().then(function (data){
                $scope.callRoutes = data.resource.routes;

                for (index in $scope.callRoutes) {
                    var newRouteObject = {
                        keepAttr: $scope.callRoutes[index],
                        viewText: '+' + $scope.callRoutes[index].phonenumber_prefix
                    }

                    $scope.selectData.push(newRouteObject);
                    $scope.flagImages.push('/assets/callburn/images/flags/' + $scope.callRoutes[index].code + '.svg');


                    if($scope.CurrentCountry  ==  localStorage.getItem("CurrentUserLanguageCode")){
                        $scope.CurrentLanguageIndex = index;

                    }


                }
                if($scope.CurrentLanguageIndex != -1) {
                    $scope.defaultClass = '';
                }
                $scope.selectedCallRoute.route = $scope.callRoutes[$scope.CurrentLanguageIndex];
            });

            $scope.getDefaultSelected = function(index){

                if(! $scope.callRoutes[index]){

                    return {
                        image: "country-icon@2x",
                        text:  "Country",
                    }
                }
                $scope.defaultClass = '';
                return {
                    image:  $scope.callRoutes[index].code,
                    text:  '+' +  $scope.callRoutes[index].phonenumber_prefix
                }
            }

            $scope.showResetModal = function () {
                CallBournModal.open({

                    scope: {
                        dataToSend:{},
                        verificationCall:{},
                        checkEmail:false,
                        checkNumber:false,
                        username:false,
                        validationStep:1,
                        callRoutes:$scope.callRoutes,
                        flagImages:$scope.flagImages,
                        selectData: $scope.selectData,
                        selectedCallRoute:$scope.selectedCallRoute,
                        CurrentLanguageIndex:$scope.CurrentLanguageIndex,
                        defaultClass : 'default-image-step-1'
                    },
                    templateUrl: "/app/modals/front-modal/recovery-modal.html"
                }, function (scope) {
                    /**
                     * reset password
                     */

                    scope.getDefaultSelected = function(index){

                        if(! scope.callRoutes[index]){

                            return {
                                image: "country-icon@2x",
                                text:  "Country",
                            }
                        }
                        scope.defaultClass = '';
                        return {
                            image:  scope.callRoutes[index].code,
                            text:  '+' +  scope.callRoutes[index].phonenumber_prefix
                        }
                    };
                    scope.$watch('selectedCallRoute.route', function(newVal){

                        if(newVal) {

                            scope.defaultClass = '';
                        }

                    });

                    scope.resetPassword=function () {
                        Restangular.all('/auth/send-reset-link').post(scope.dataToSend).then(function (data) {
                            console.log(data);
                            scope.email=null;
                            scope.checkEmail=true;
                            scope.emailMessage=data.resource.error.no==0?"We have sent an email with password reset instructions":data.resource.error.text;
                        }, function (err) {
                            if(err.status==500){
                                growl.error($rootScope.trans('registration_error_message_try_again'));
                            }
                        });
                    };
                    /**
                     * Send verification link
                     */
                    scope.makeResetcall=function () {

                        var data = {};
                        if( typeof scope.selectedCallRoute.route == 'undefined') {
                            data.phonenumber = scope.verificationCall.phonenumber;
                        } else {
                            data.phonenumber = scope.selectedCallRoute.route.phonenumber_prefix + scope.verificationCall.phonenumber;
                        }

                        Restangular.all('verifications/send-verification-code').post(data).then(function(data){
                            if(data.resource.error.no == 0){
                                scope.validationStep = 2;
                            } else{
                                growl.error(trans(data.resource.error.text))
                            }
                        });
                    }
                    /**
                     * Verift and show email if correct
                     */
                     scope.checkVerification = function(){
                        Restangular.all('auth/recover-username').post(scope.verificationCall).then(function(data){
                            if(data.resource.error.no == 0){
                                scope.username = data.resource.username;
                            } else{
                                growl.error(trans(data.resource.error.text))
                            }
                        })
                     }
                });
            }

            $scope.showLoginModal = function () {
                CallBournModal.open({
                    scope: {
                        loginData: {},
                        showInvalidLogin: false
                    },
                    templateUrl: "/app/modals/front-modal/login-modal.html"
                }, function (scope) {
                    scope.showReg = function () {
                        CallBournModal.close();
                        $scope.showRegistrationModal()
                    }
                    scope.showReset = function () {
                        CallBournModal.close();
                        $scope.showResetModal();
                    }
                    scope.loginGoogle = function (event) {
                        var url = 'social/google-login';
                        if ($scope.registrationData.phonenumber && $scope.registrationData.voice_code) {
                            url += '?phonenumber=' + $scope.registrationData.phonenumber + '&voice_code=' + $scope.registrationData.voice_code;
                        }
                        var width = 800;
                        var height = 800;
                        var left = (screen.width / 2) - (width / 2);
                        var top = (screen.height / 2) - (height / 2);
                        var googleWindow = window.open(url, 'Connect google account', 'height=' + height + ',width=' + width + ',top=' + top + ',left=' + left);
                        var interval = setInterval(function () {
                            try {
                                if (googleWindow.success == 'success') {
                                    clearInterval(interval);
                                    window.location.assign(appUrl + "#/dashboard/dashboard");
                                }
                                if (googleWindow.success == 'error') {
                                    clearInterval(interval);
                                    scope.showInvalidLogin = true;
                                }
                            } catch (err) {
                            }
                        }, 1000)
                    }
                    scope.login = function () {
                        Restangular.all('auth/login').post(scope.loginData).then(function (data) {
                            if (data.resource.error.no == 0) {
                                window.location.assign(appUrl + "#/dashboard/dashboard");
                            } else {
                                scope.showInvalidLogin = true;
                            }
                        });
                    }

                    scope.loginFacebook = function (event) {
                        var url = '/social/facebook-login';
                        if ($scope.registrationData.phonenumber && $scope.registrationData.voice_code) {
                            url += '?phonenumber=' + $scope.registrationData.phonenumber + '&voice_code=' + $scope.registrationData.voice_code;
                        }
                        var width = 800;
                        var height = 800;
                        var left = (screen.width / 2) - (width / 2);
                        var top = (screen.height / 2) - (height / 2);
                        var facebookWindow = window.open(url, 'Connect facebook account', 'height=' + height + ',width=' + width + ',top=' + top + ',left=' + left);
                        var interval = setInterval(function () {
                            try {
                                console.log('trying');
                                if (facebookWindow.success == 'success') {
                                    console.log('success');
                                    clearInterval(interval);
                                    window.location.assign(appUrl + "#/dashboard/dashboard");
                                }
                                if (facebookWindow.success == 'error') {
                                    console.log('error');
                                    clearInterval(interval);
                                    scope.showInvalidLogin = true;
                                    //$scope.errors = [['This account is not connected to facebook']];
                                }
                            } catch (err) {
                                console.log(err)
                            }
                        }, 1000)

                    }
                });
            };


            $rootScope.openChatWindow = function () {
                $timeout(function () {
                    angular.element(".nudgespot-launcher").trigger('click');
                }, 100);

            }

            $scope.showRegistrationModal = function () {
                CallBournModal.open({
                    scope: {
                        registrationData: {},
                    },
                    templateUrl: "/app/modals/front-modal/registration-modal.html"
                }, function (scope) {
                    scope.showLog = function () {
                        CallBournModal.close();
                        $scope.showLoginModal()
                    }

                    scope.loginGoogle = function (event) {
                        var url = 'social/google-login';
                        if ($scope.registrationData.phonenumber && $scope.registrationData.voice_code) {
                            url += '?phonenumber=' + $scope.registrationData.phonenumber + '&voice_code=' + $scope.registrationData.voice_code;
                        }
                        var width = 800;
                        var height = 800;
                        var left = (screen.width / 2) - (width / 2);
                        var top = (screen.height / 2) - (height / 2);
                        var googleWindow = window.open(url, 'Connect google account', 'height=' + height + ',width=' + width + ',top=' + top + ',left=' + left);
                        var interval = setInterval(function () {
                            try {
                                if (googleWindow.success == 'success') {
                                    clearInterval(interval);
                                    window.location.assign(appUrl + "#/dashboard/dashboard");
                                }
                                if (googleWindow.success == 'error') {
                                    $scope.errors = [['This account is not connected to facebook']];
                                }
                            } catch (err) {
                            }
                        }, 1000)
                    }
                    scope.registration = function () {
                        scope.registrationData.language = $rootScope.currentLanguage;
                        Restangular.all('auth/registration').post(scope.registrationData).then(function (data) {
                            scope.successMessage=data.resource.error.no==0?$rootScope.trans('modals_front_modal_registration_please_check_your_email'):data.resource.error.text;
                            scope.checkEmail = true;
                        }, function (err) {
                            growl.error($rootScope.trans('registration_error_message_try_again'));
                        });
                    }

                    scope.loginFacebook = function (event) {
                        var url = '/social/facebook-login';
                        if ($scope.registrationData.phonenumber && $scope.registrationData.voice_code) {
                            url += '?phonenumber=' + $scope.registrationData.phonenumber + '&voice_code=' + $scope.registrationData.voice_code;
                        }
                        var width = 800;
                        var height = 800;
                        var left = (screen.width / 2) - (width / 2);
                        var top = (screen.height / 2) - (height / 2);
                        var facebookWindow = window.open(url, 'Connect facebook account', 'height=' + height + ',width=' + width + ',top=' + top + ',left=' + left);
                        var interval = setInterval(function () {
                            try {
                                if (facebookWindow.success == 'success') {
                                    clearInterval(interval);
                                    window.location.assign(appUrl +  "#/dashboard/dashboard");
                                }
                                if (facebookWindow.success == 'error') {
                                    $scope.errors = [['This account is not connected to facebook']];
                                }
                            } catch (err) {
                            }
                        }, 1000)

                    }
                });
            };


            $scope.showTermsModal = function () {
                CallBournModal.open({
                    scope: {
                        registrationData: {},
                    },
                    templateUrl: "/app/modals/front-modal/terms-modal.html"
                }, function (scope) {

                });
            };

            $scope.showPravicyModal = function () {
                CallBournModal.open({
                    scope: {
                        registrationData: {},
                    },
                    templateUrl: "/app/modals/front-modal/pravicy-modal.html"
                }, function (scope) {

                });
            };

        }]);