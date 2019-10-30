angular.module('callburnApp').controller('CheckoutsController',
    ['$scope', '$rootScope', '$state', 'Restangular', '$stateParams', 'invoice',
        function ($scope, $rootScope, $state, Restangular, $stateParams, invoice) {



            $scope.invoice = invoice.resource.invoice;
            $scope.activeMethod = 'paypal';
            $rootScope.currentActiveRoute = 'account';
            $scope.goToNotification = $rootScope.goToNotification;

            /*if ($rootScope.currentUser.is_autobilling_active) {
                var firstText = 'Autorecharge on Low Balance is enabled';
                var secondText = 'You will be always on!';
            } else {
                var firstText = 'Autorecharge on Low Balance is disabled';
                var secondText = 'Enable it to stay always on!';
            }
            $rootScope.footerData = {
                first: '<span ng-click="openChatWindow()">Want support</span>' +
                '<span ng-click="openChatWindow()">Leave us a chat message</span>',
                second: '<span>' + firstText + '</span>' +
                '<span>' + secondText + '</span>',
                third: '<a href="/#/docs" target="_blank"><span>Read our docs</span>' +
                '<span>They can help you really much</span></a>'
            }*/

            $rootScope.showPreviousIcon = true;
            $rootScope.previousStep = function () {
                $state.go('account.financials', {oldData: $scope.invoice});
            }

            var payByPaypal = function () {
                $rootScope.startLoader();
                Restangular.one('billings/pay-by-paypal', $stateParams.invoice_id).post().then(function (data) {
                    $rootScope.stopLoader();
                    if (data.resource.error.no == 0) {
                        window.location = data.resource.redirect_url;
                    }
                })
            }

            var payByBank = function () {
                $rootScope.startLoader();
                Restangular.one('billings/pay-by-bank', $stateParams.invoice_id).post().then(function (data) {
                    $rootScope.stopLoader();
                    if (data.resource.error.no == 0) {
                        $state.go('account.success-payment', {invoice_id: $stateParams.invoice_id})
                    }
                })
            }

            $scope.proceedPayment = function () {
                if ($scope.activeMethod == 'paypal') {
                    payByPaypal();
                } else if ($scope.activeMethod == 'bank') {
                    payByBank();
                }
            }

        }]);