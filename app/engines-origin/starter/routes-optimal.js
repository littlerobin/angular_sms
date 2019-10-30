module.exports=function ($stateProvider) {
    $stateProvider
    .state('starter', {
        url: '/',
        templateUrl: '/app/engines/starter/views/index.html',
        controller: 'StarterController',
        resolve: {
            deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load({
                    name: 'callburnApp',
                    files: [
                        '/app/engines/starter/controllers/StarterController.js'
                    ]
                });
            }]
        }
    })
}