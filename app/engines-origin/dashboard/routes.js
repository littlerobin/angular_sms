module.exports=function ($stateProvider) {
    $stateProvider
        .state('dashboard', {
            url: '/dashboard',
            templateUrl: '/app/engines-origin/dashboard/main.html',
            controller: function ($state) {
                if ($state.current.name == 'dashboard') {
                    $state.go('dashboard.dashboard');
                }
            }
        })
        .state('dashboard.dashboard', {
            url: '/dashboard',
            templateUrl: '/app/engines-origin/dashboard/dashboard/views/index.html',
            controller: "DashboardController",
            params:{
                notify:null
            },
            resolve: {
                dashboardData: function (Restangular) {
                    return Restangular.one('data/dashboard').get();
                },
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'callburnApp',
                        files: [
                            '/app/engines-origin/dashboard/dashboard/controllers/DashboardController.js',
                        ]
                    });
                }]
            }
        })
        .state('dashboard.tutorial', {
            url: '/tutorial',
            templateUrl: '/app/engines-origin/dashboard/tutorial/views/index.html',
            controller: 'TutorialController',
            resolve: {
                dashboardData: function (Restangular) {
                    return Restangular.one('data/dashboard').get();
                },
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'callburnApp',
                        files: [
                            '/app/engines-origin/dashboard/tutorial/controllers/TutorialController.js',
                        ]
                    });
                }]
            }
        })
        .state('dashboard.welcome', {
            url: '/welcome/:tutorial',
            templateUrl: '/app/engines-origin/dashboard/welcome/views/welcome.html',
            controller: 'WelcomeController',
            params:{tutorial:false},
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'callburnApp',
                        files: [
                            '/app/engines-origin/dashboard/welcome/controllers/WelcomeController.js'
                        ]
                    });
                }]
            }
        })
};