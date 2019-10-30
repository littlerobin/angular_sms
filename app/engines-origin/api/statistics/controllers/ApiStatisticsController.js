angular.module('callburnApp').controller('ApiStatisticsController',
	['$scope', '$rootScope', '$state', 'Restangular', '$stateParams', 'CallBournModal', 'api',
	function ($scope, $rootScope, $state, Restangular, $stateParams, CallBournModal, api) {

	$scope.api = api.resource;

}]);