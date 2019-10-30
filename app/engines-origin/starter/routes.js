module.exports=function ($stateProvider, $rootScope) {
    $stateProvider
    .state('starter', {
        url: '/',
        templateUrl: '/app/engines-origin/starter/views/index.html',
        controller: 'StarterController',
        resolve: {
            deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load({
                    name: 'callburnApp',
                    files: [
                        '/app/engines-origin/starter/controllers/StarterController.js'
                    ]
                });
            }]
        }
    })
}