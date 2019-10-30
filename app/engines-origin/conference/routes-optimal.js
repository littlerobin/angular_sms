// module.exports = function ($stateProvider, $rootScope) {
// 	$stateProvider
// 	.state('conference', {
// 		url: '/conference',
// 		templateUrl: '/app/engines-origin/conference/main.html',
// 		controller: function ($state, $rootScope) {
// 			if ($state.current.name == 'conference') {
// 				$state.go('conference.overview');
// 			}
// 		}
// 	})
// 	.state('conference.overview', {
// 		url: '/overview',
// 		templateUrl: '/app/engines-origin/conference/overview/views/index.html',
// 		controller: 'ConferenceOverviewController',
// 		resolve: {
// 				// getconferenceCalls: function (Restangular) {
// 				// 	return Restangular.one('/conferenceCalls').get();
// 				// },
// 				deps: ['$ocLazyLoad', function ($ocLazyLoad) {
// 					return $ocLazyLoad.load({
// 						name: 'callburnApp',
// 						files: [
// 							'/app/engines-origin/conference/overview/controllers/ConferenceOverviewController.js',
// 							'/app/engines-origin/conference/services/ConferenceServices.js'
// 						]
// 					});
// 				}]
// 			}
// 		})
// 	.state('conference.create', {
// 		url: '/create',
// 		templateUrl: '/app/engines-origin/conference/create-conference-call/views/index.html',
// 		controller: 'CreateConferenceController',
// 		resolve: {
// 			deps: ['$ocLazyLoad', function ($ocLazyLoad) {
// 				return $ocLazyLoad.load({
// 					name: 'callburnApp',
// 					files: [
// 						'/app/engines-origin/conference/create-conference-call/controllers/CreateConferenceController.js',
// 					]
// 				});
// 			}]
// 		}
// 	});
// }