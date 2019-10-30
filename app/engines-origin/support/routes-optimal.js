module.exports = function ($stateProvider, $rootScope) {
    $stateProvider
        .state('support', {
            url: '/support',
            templateUrl: '/app/engines/support/main.html',
            controller: function ($state) {
                if ($state.current.name == 'support') {
                    $state.go('docs');
                }
            }
        })
        // .state('docs', {
        //     url: '/docs',
        //     templateUrl: '/app/engines/support/documentation/views/index.html',
        //     controller: 'DocumentationController',
        //     params:{
        //         "dir":"what-is-callburn"
        //     },
        //     resolve: {
        //         deps: ['$ocLazyLoad', function ($ocLazyLoad) {
        //             return $ocLazyLoad.load({
        //                 name: 'callburnApp',
        //                 files: [
        //                    '/app/engines/support/documentation/controllers/DocumentationController.js'
        //                 ]
        //             });
        //         }]
        //     }
        // })
        // .state('tickets', {
        //     url: '/tickets',
        //     templateUrl: '/app/engines/support/tickets/views/index.html',
        //     controller: 'TicketsController',
        //     params:{
        //         showSendForm:false
        //     },
        //     resolve: {
        //         deps: ['$ocLazyLoad', function ($ocLazyLoad) {
        //             return $ocLazyLoad.load({
        //                 name: 'callburnApp',
        //                 files: [
        //                     '/app/engines/support/tickets/controllers/TicketsController.js'
        //                 ]
        //             });
        //         }]
        //     }
        // })
        .state('video', {
            url: '/video',
            templateUrl: '/app/engines/support/videoTutorial/views/index.html',
            controller: 'VideoTutorialController',
            resolve: {
                youtubeVideos: function(Restangular, $rootScope) {
                    return Restangular.one('data/youtube-playlists').get({lang: $rootScope.currentLanguage})

                },
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'callburnApp',
                        files: [
                            '/app/engines/support/videoTutorial/controllers/VideoTutorialController.js'
                        ]
                    });
                }]
            }
        })
};