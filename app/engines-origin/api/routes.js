module.exports = function ($stateProvider, $rootScope) {
    $stateProvider
        .state('api', {
            url: '/api',
            templateUrl: '/app/engines-origin/api/main.html',
            controller: function ($state, $rootScope) {

                /*if(! $rootScope.checkAccessBeta) {
                    $state.go('dashboard.dashboard');
                }*/
                
                if ($state.current.name == 'api') {
                    $state.go('api.settings');
                }
            }
        })
        .state('api.settings', {
            url: '/settings',
            templateUrl: '/app/engines-origin/api/settings/views/index.html',
            controller: 'ApiSettingsController',
            resolve: {
                apiKeys: function (Restangular) {
                    return Restangular.one('api-keys/api-keys').get();
                },
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'callburnApp',
                        files: [
                            '/app/engines-origin/api/settings/controllers/ApiSettingsController.js',
                        ]
                    });
                }]
            }
        })
        .state('api.statistics', {
            url: '/statistics/:id',
            templateUrl: '/app/engines-origin/api/statistics/views/index.html',
            controller: 'ApiStatisticsController',
            resolve: {
                api: function (Restangular, $stateParams) {
                    return Restangular.one('api-keys/api-key-statistics', $stateParams.id).get();
                },
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'callburnApp',
                        files: [
                            '/app/engines-origin/api/statistics/controllers/ApiStatisticsController.js',
                        ]
                    });
                }]
            }
        })
};