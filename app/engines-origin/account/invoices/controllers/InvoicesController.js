angular.module('callburnApp').controller('InvoicesController', 
    ['$scope', '$rootScope', '$state', 'Restangular', '$stateParams', 'invoices', 'orders', '$httpParamSerializer', 'billings', 'CallBournModal', '$filter',
    function($scope, $rootScope, $state, Restangular, $stateParams, invoices, orders, $httpParamSerializer, billings, CallBournModal, $filter) {

        $rootScope.tutorialSidePopup = false;
        $scope.goToNotification = $rootScope.goToNotification;

        $rootScope.currentPage = 'dashboard';
        $rootScope.currentActiveRoute = 'account';
        $scope.filterData = {};

        $scope.billingData = billings.resource;
        if($stateParams.payment_amount) {
            dataLayer.push({
                'purchased_amount': $stateParams.payment_amount,
                'event': 'order_created'
            });
        }
        // console.log(billings);

        window.document.title = $scope.notSeenNotificationsCount === 0 ? 'Invoices - ' + 'Callburn' : '(' + $scope.notSeenNotificationsCount + ') ' + 'Invoices - ' + 'Callburn';

        var applyTranslations = function() {
            $scope.isLoaded=false;
            setTimeout( function(){$scope.isLoaded=true}, 100);
            $scope.getAppropriateStatus = function(type, billingObj) {
                if (type === 'BILLING') {
                    return trans('account_invocies_billings_billed');
                } else if (type === 'GIFT') {
                    return trans('account_invocies_billings_gifted_2');
                } else if (type === 'TRANSACTION') {
                    return trans('account_invocies_billings_purchased');
                } else if (type === 'REFUND') {
                    return trans('account_invocies_billings_refund');
                } else if (type === 'MANUAL_SERVICE') {
                    return trans('account_invocies_billings_manual_service');
                }
            };

            $scope.invoiceGiftSum = 0;
            $scope.getAppropriateAmount = function(type, billingObj) {
                billingObj.paidFromGift = false;
                billingObj.giftSumText = null;
                if (type === 'BILLING') {
                    if (billingObj.giftSum) {
                        billingObj.paidFromGift = true
                        var giftSum = $rootScope.trans('account_invocies_billings_gift') + ": (€ " + $filter('number')(billingObj.giftSum, 2) + ")";
                        billingObj.giftSumText = giftSum;
                        var final_amount = billingObj.purchasedSum + billingObj.giftSum;
                        return $filter('number')(final_amount, 2);
                    }
                    return $filter('number')(billingObj.purchasedSum, 2);
                } else if (type === 'GIFT') {

                    return billingObj.giftSum ? $filter('number')(billingObj.giftSum, 2) : '0.00'; 
                } else if (type === 'TRANSACTION') {
                    var taxAmount = billingObj.taxAmount && parseInt(billingObj.taxAmount) > 0 ? trans('account_invocies_billings_tax_amount') + ": (€ " + $filter('number')(billingObj.taxAmount, 2) + ")" : "";
                    $scope.invoiceGiftSum = taxAmount;
                    return $filter('number')(billingObj.purchasedSum, 2);
                } else if (type === 'REFUND') {
                    if (billingObj.giftSum) {
                        var giftSum = trans('account_invocies_billings_gift') + ": (€ " + $filter('number')(billingObj.giftSum, 2) + ")";
                        $scope.invoiceGiftSum = giftSum;
                        var final_amount = Math.abs(billingObj.purchasedSum + billingObj.giftSum);
                        return "- " + $filter('number')(final_amount, 2);
                    }
                    return "- " + $filter('number')(Math.abs(billingObj.purchasedSum), 2);
                } else if (type === 'MANUAL_SERVICE') {
                    return $filter('number')(billingObj.purchasedSum, 2);
                }
            };
        }

        $scope.getBalanceAfterBilling = function(billing) {
            var balanceAfterBilling = $filter('number')(billing.current_balance_after_billing, 2);
            return balanceAfterBilling;
        }

        $rootScope.$watch('currentLanguage', applyTranslations);
        $rootScope.$watch('isLangLoaded', applyTranslations);

        $scope.getDateDifference = function(created_at) {
            moment.locale($rootScope.currentLanguage)
            createdAt = moment(created_at);
            $scope.createdAtFormated = $filter('localDate')(moment(created_at));
            
            return createdAt.fromNow();
        }

        $scope.getBillingDetails = function(billingObj) {
            Restangular.one('billings/billing-details').get({date: billingObj.date}).then(function(data) {
                // console.log(data.resource.billings);
                
                var messages = data.resource.billings.messages;
                var snippets = data.resource.billings.snippets;
                
                console.log('messages :', messages);
                console.log('snippets :', snippets);

                CallBournModal.open({
                    scope: {
                        messages: messages,
                        snippets: snippets
                    },
                    templateUrl: "/app/modals/billings/billing-modal.html",
                }, function(scope) {
                    scope.close = function () {
                        $state.go('snippet.overview');
                        CallBournModal.close();
                    }
                });
            });
        }

        var updateBilings = function(billings) {
            $scope.billings = billings.resource.billings;
            $scope.billingsLength = billings.resource.count;
            $scope.billingsPage = billings.resource.page;
            $scope.billingsPagesCount = Math.ceil(billings.resource.count/10);
            $scope.billingsPerPage = 10;
        }

        $scope.changeBillingsPage = function(page) {
            if(page < 0 || page > $scope.billingsPagesCount){
                return;
            }
            var postData = $scope.filterData;
            postData.page = page - 1;
            Restangular.one('billings/billings').get(postData).then(function(data){
                updateBilings(data);
                // console.log(data)
            });
        }

        updateBilings(billings)

        if($rootScope.currentUser.is_autobilling_active){
            var firstText = 'Autorecharge on Low Balance is enabled';
            var secondText = 'You will be always on!';
        } else{
            var firstText = 'Autorecharge on Low Balance is disabled';
            var secondText = 'Enable it to stay always on!';
        }

        var updateInvoices = function(invoicesToUpdate){
            $scope.invoices = invoicesToUpdate.resource.invoices;
            $scope.invoicesLength = invoicesToUpdate.resource.count;
            $scope.invoicesPage = invoicesToUpdate.resource.page;
            $scope.invoicesPagesCount = Math.ceil(invoicesToUpdate.resource.count/5);
            $scope.invoicesPerPage = 5;
        }

        var updateOrders = function(orders){
            $scope.orders = orders.resource.invoices;
            $scope.ordersLength = orders.resource.count;
            $scope.ordersPage = orders.resource.page;
            $scope.ordersPagesCount = Math.ceil(orders.resource.count/5);
            $scope.ordersPerPage = 5;
        }

        updateInvoices( invoices );
        updateOrders( orders );

        $scope.changeInvoicesPage = function(page){
            if(page < 0 || page > $scope.invoicesPagesCount){
                return;
            }
            var postData = $scope.filterData;
            postData.invoices_page = page - 1;
            Restangular.one('billings/invoices').get(postData).then(function(data){
                updateInvoices(data);
            });
        }

        $scope.changeOrdersPage = function(page){
            if(page < 0 || page > $scope.ordersPagesCount || page == $scope.ordersPage - 1){
                return;
            }
            var postData = $scope.filterData;
            postData.orders_page = page - 1;
            Restangular.one('billings/orders').get(postData).then(function(data){
                updateOrders(data);
            });
        }

        $scope.downloadInvoice = function (id) {
            Restangular.one('data/download-token').get().then(function (data) {

                var params = {
                    token:data.resource.token,
                    id:id
                };

                window.location.href = '/billings/download-invoice?' + $httpParamSerializer(params);
            });
        }

}]);