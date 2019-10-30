module.exports = function ($stateProvider) {
    $stateProvider
        .state('account', {
            url: '/account',
            templateUrl: '/app/engines-origin/account/main.html',
            controller: function ($state) {
                if ($state.current.name == 'account') {
                    $state.go('account.settings');
                }
            }
        })
        .state('account.settings', {
            url: '/settings',
            templateUrl: '/app/engines-origin/account/settings/views/index.html',
            controller: 'SettingsController',
            params: {
                openDropdown: false,
                openCallerIdModal: false,
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
                            '/app/engines-origin/account/settings/services/SettingsService.js',
                            '/app/engines-origin/account/settings/services/CountriesDataService.js',
                            '/app/engines-origin/account/settings/controllers/SettingsController.js',
                        ]
                    });
                }]
            }
        })
        .state('account.invoices', {
            url: '/invoices?payment_amount',
            templateUrl: '/app/engines-origin/account/invoices/views/index.html',
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
                            '/app/engines-origin/account/invoices/controllers/InvoicesController.js'
                        ]
                    });
                }]
            }
        })
        .state('account.financials', {
            url: '/financials?invoice_id',
            templateUrl: '/app/engines-origin/account/financials/views/index.html',
            controller: 'FinancialsController',
            params: {
                fromInvoices: false
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
                currentUser: function(Restangular) {
                    return Restangular.one('users/show-user').get();
                },
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'callburnApp',
                        files: [
                            '/app/engines-origin/account/financials/controllers/FinancialsController.js',
                            '/app/engines-origin/account/settings/services/SettingsService.js'
                        ]
                    });
                }]
            }
        })
        .state('account.affiliate', {
            url: '/affiliate',
            templateUrl: '/app/engines-origin/account/affiliate/views/index.html',
            controller: 'AffiliateController',
            resolve: {
                countries: function (Restangular) {
                    return Restangular.one('data/countries').get();
                },
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'callburnApp',
                        files: [
                            '/app/engines-origin/account/affiliate/controllers/AffiliateController.js',
                        ]
                    });
                }]
            }
        })
        .state('account.checkout', {
            url: '/checkout/:invoice_id',
            templateUrl: '/app/engines-origin/account/checkout/views/index.html',
            controller: 'CheckoutsController',
            resolve: {
                invoice: function (Restangular, $stateParams) {
                    return Restangular.one('billings/invoice', $stateParams.invoice_id).get();
                },
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'callburnApp',
                        files: [
                            '/app/engines-origin/account/checkout/controllers/CheckoutsController.js',
                        ]
                    });
                }]
            }
        })
        .state('account.success-payment', {
            url: '/success-payment/:invoice_id',
            templateUrl: '/app/engines-origin/account/success-payment/views/index.html',
            controller: 'SuccessPaymentsController',
            resolve: {
                invoice: function (Restangular, $stateParams) {
                    return Restangular.one('billings/invoice', $stateParams.invoice_id).get({is_paid: 1});
                },
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'callburnApp',
                        files: [
                            '/app/engines-origin/account/success-payment/controllers/SuccessPaymentsController.js',
                        ]
                    });
                }]
            }
        })
};