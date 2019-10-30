angular.module("callburnApp").config(function (RestangularProvider, $window) {


    Stripe.setPublishableKey(stripeKey);

    RestangularProvider.addResponseInterceptor(function (data, operation, what, url, response, deferred) {
        var extractedData = [];
        if (operation === "getList") {
            extractedData.resource = data.resource;
            extractedData.status = data.status;
        }
        else if (operation === 'get') {
            extractedData.resource = data.resource;
            extractedData.status = data.status;
        }
        else if (operation === 'remove') {
            extractedData.resource = data.resource;
            extractedData.status = data.status;
        }
        else if (operation === 'post') {
            extractedData.message = data.mstatus = data.status;
            extractedData.resource = data.resource
        }
        else if (operation === 'put') {
            extractedData.status = data.status;
            extractedData.resource = data.resource
        }
        else {
            extractedData = data.data;
        }
        extractedData.serverResponseCode = response.status;
        return extractedData;
    });
});