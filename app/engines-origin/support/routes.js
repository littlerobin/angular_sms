module.exports = function ($stateProvider, $rootScope) {
    $stateProvider
        .state('support', {
            url: '/support',
            templateUrl: '/app/engines-origin/support/main.html',
            controller: function ($state) {
                if ($state.current.name == 'support') {
                    $state.go('docs');
                }
            }
        })
        // .state('docs', {
        //     url: '/docs',
        //     templateUrl: '/app/engines-origin/support/documentation/views/index.html',
        //     controller: 'DocumentationController',
        //     params:{
        //         "dir":"what-is-callburn"
        //     },
        //     resolve: {
        //         deps: ['$ocLazyLoad', function ($ocLazyLoad) {
        //             return $ocLazyLoad.load({
        //                 name: 'callburnApp',
        //                 files: [
        //                    '/app/engines-origin/support/documentation/controllers/DocumentationController.js'
        //                 ]
        //             });
        //         }]
        //     }
        // })
        // .state('tickets', {
        //     url: '/tickets',
        //     templateUrl: '/app/engines-origin/support/tickets/views/index.html',
        //     controller: 'TicketsController',
        //     params:{
        //         showSendForm:false
        //     },
        //     resolve: {
        //         deps: ['$ocLazyLoad', function ($ocLazyLoad) {
        //             return $ocLazyLoad.load({
        //                 name: 'callburnApp',
        //                 files: [
        //                     '/app/engines-origin/support/tickets/controllers/TicketsController.js'
        //                 ]
        //             });
        //         }]
        //     }
        // })
        .state('video', {
            url: '/video',
            templateUrl: '/app/engines-origin/support/videoTutorial/views/index.html',
            controller: 'VideoTutorialController',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'callburnApp',
                        files: [
                            '/app/engines-origin/support/videoTutorial/controllers/VideoTutorialController.js'
                        ]
                    });
                }]
            }
        })
};