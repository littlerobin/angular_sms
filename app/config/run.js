module.exports = function (Restangular, $state, $rootScope, notify, CallBournModal) {
    var isNotified = false;
    Restangular.addResponseInterceptor(function (resp) {
        if (resp.resource && resp.resource.error) {
            var translatedMessage = $rootScope.trans(resp.resource.error.text);
            resp.resource.error.text = translatedMessage;
        }

        // if (resp.resource.error && resp.resource.error.no == -10) {
        //     if (!isNotified) {
        //         alert($rootScope.trans('your_session_is_expired_please_login_again'));
        //         isNotified = true;
        //     }
        //     window.location = frontUrl;
        // } else if (resp.resource.error && resp.resource.error.no != 0) {

        //     notify({message:translatedMessage, classes: ['notification-alert-danger']})
        // }
        return resp;
    });

    Restangular.setErrorInterceptor(function (response) {
        if (response.data) {
            if(response.data.response && response.data.resource.error) {
                if(response.data.resource.error.no === -2002) {
                    $rootScope.startLoader();
                    localStorage.setItem("jwtToken","");
                    localStorage.setItem("redirectFromBackend",window.location.href);
                    window.location.href = "/";
                }
                if(response.data.error.no === -99) {
                    window.location.href = "/myaccount";
                }
                if (response.status === 422 && response.data.error.no === -70) {
                    if(angular.element('#access-modal')) {
                        CallBournModal.open({
                            scope: {
                                text:response.data.error.text
                            },
                            templateUrl: "/app/modals/access/user-deactivated.html"
                        }, function (scope) {

                            scope.contact = function () {
                                $rootScope.startLoader();
                                $rootScope.logOut('contact-us');
                            };

                            scope.logOut = function () {
                                $rootScope.startLoader();
                                $rootScope.logOut();
                            }

                        });
                    }
                }
            }
            if (response.data.error === "token_not_provided" || response.data.error === "token_invalid" || response.status === 401 ) {
                // if(window.tokenBeingUpdated) {
                //     $state.go('campaign');
                // } else {
                    $rootScope.startLoader();
                    localStorage.setItem("jwtToken","");
                    localStorage.setItem("redirectFromBackend",window.location.href);
                    window.location.href = "/login";
                //}
            }
        }

        if (response.status === 500) {
            $rootScope.stopLoader();
            notify({message: $rootScope.trans('something__went__wrong'), classes: ['notification-alert-danger']})
        }
    });

};
