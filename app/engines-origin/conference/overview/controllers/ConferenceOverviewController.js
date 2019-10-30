angular.module('callburnApp').controller('ConferenceOverviewController', 
	[
	'$scope',
	'$rootScope',
	'$state',
	'$stateParams', 
	function(
		$scope,
		$rootScope,
		$state,
		$stateParams
	) {
		$rootScope.currentActiveRoute = "conference";
	}
])