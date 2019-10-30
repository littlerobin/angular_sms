module.exports = function ($stateProvider) {
    $stateProvider
        .state('account', {
            url: '/account',
            templateUrl: '/app/engines/account/main.html',
            controller: function ($state) {
                if ($state.current.name == 'account') {
                    $state.go('account.settings');
                }
            }
        })
        .state('account.settings', {
            url: '/settings',
            templateUrl: '/app/engines/account/settings/views/index.html',
            controller: 'SettingsController',
            params: {
                openDropdown: false,
            },
            resolve: {
                timezones: function (Restangular) {
                    return Restangular.one('data/timezones').get();
                },
                countries: function (Restangular) {
                    return Restangular.one('data/countries').get();
                },
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'callburnApp',
                        files: [
                            '/app/engines/account/settings/services/SettingsService.js',
                            '/app/engines-origin/account/settings/services/CountriesDataService.js',
                            '/app/engines/account/settings/controllers/SettingsController.js',

                        ]
                    });
                }]
            }
        })

        .state('account.invoices', {
            url: '/invoices',
            templateUrl: '/app/engines/account/invoices/views/index.html',
            controller: 'InvoicesController',
            resolve: {
                invoices: function (Restangular) {
                    return Restangular.one('billings/invoices').get();
                },
                orders: function (Restangular) {
                    return Restangular.one('billings/orders').get();
                },
                billings: function (Restangular) {
                    return Restangular.one('billings/billings').get();
                },
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'callburnApp',
                        files: [
                            '/app/engines/account/invoices/controllers/InvoicesController.js'
                        ]
                    });
                }]
            }
        })

        /*.state('account.invoices', {
         url: '/invoices',
         templateUrl: '/app/engines/account/invoices/views/index.html',
         controller: 'BillingsController',
         resolve: {
         billings: function (Restangular) {
         return Restangular.one('billings/billings').get();
         },
         deps: ['$ocLazyLoad', function ($ocLazyLoad) {
         return $ocLazyLoad.load({
         name: 'callburnApp',
         files: [
         '/app/engines/account/invoices/controllers/BillingsController.js'
         ]
         });
         }]
         }
         })*/

        .state('account.financials', {
            url: '/financials?invoice_id',
            templateUrl: '/app/engines/account/financials/views/index.html',
            controller: 'FinancialsController',
            params: {
                oldData: null,
                fromInvoices: false,
            },
            resolve: {
                callRoutes: function (Restangular) {

                    return Restangular.one('data/call-routes').get();
                },
                taxData: function (Restangular) {
                    return Restangular.one('data/tax-data').get();
                },
                orders: function (Restangular) {
                    return Restangular.one('billings/orders').get();
                },
                invoices: function (Restangular) {
                    return Restangular.one('billings/invoices').get();
                },
                billings: function (Restangular) {
                    return Restangular.one('billings/billings').get();
                },
                oldData: function(Restangular,$stateParams) {
                    if($stateParams.oldData ) {
                        return null;
                    } else {
                        return Restangular.one('billings/invoice/' + $stateParams.invoice_id).get();
                    }
                },
                currentUser: function(Restangular) {
                    return Restangular.one('users/show-user').get();
                },
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'callburnApp',
                        files: [
                            '/app/engines/account/financials/controllers/FinancialsController.js',
                            '/app/engines/account/settings/services/SettingsService.js',
                        ]
                    });
                }]
            }
        })
        .state('account.checkout', {
            url: '/checkout/:invoice_id',
            templateUrl: '/app/engines/account/checkout/views/index.html',
            controller: 'CheckoutsController',
            resolve: {
                invoice: function (Restangular, $stateParams) {
                    return Restangular.one('billings/invoice', $stateParams.invoice_id).get();
                },
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'callburnApp',
                        files: [
                            '/app/engines/account/checkout/controllers/CheckoutsController.js',
                        ]
                    });
                }]
            }
        })
        .state('account.success-payment', {
            url: '/success-payment/:invoice_id',
            templateUrl: '/app/engines/account/success-payment/views/index.html',
            controller: 'SuccessPaymentsController',
            resolve: {
                invoice: function (Restangular, $stateParams) {
                    return Restangular.one('billings/invoice', $stateParams.invoice_id).get({is_paid: 1});
                },
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'callburnApp',
                        files: [
                            '/app/engines/account/success-payment/controllers/SuccessPaymentsController.js',
                        ]
                    });
                }]
            }
        })
};