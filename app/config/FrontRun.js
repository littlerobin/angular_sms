module.exports = function (Restangular, $state, $rootScope, notify) {

    Restangular.addResponseInterceptor(function (resp) {
        resp.resource.error.text = $rootScope.trans(resp.resource.error.text);
        return resp;
    });

    Restangular.setErrorInterceptor(function (response) {
        if (response.status == 500) {
            $rootScope.stopLoader();
            notify({message: $rootScope.trans('something__went__wrong'), classes: ['notification-alert-danger']})
        }
    });
};
