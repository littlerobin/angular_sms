angular.module('callburnApp').controller('SuccessPaymentsController', 
	[ 		'$scope', '$rootScope', '$state',  'Restangular', '$stateParams', 'invoice',
	function($scope,   $rootScope,   $state,    Restangular,   $stateParams,   invoice){


	$scope.goToNotification = $rootScope.goToNotification;
	$scope.invoice = invoice.resource.invoice;
	$rootScope.currentActiveRoute = 'account';

	if($rootScope.currentUser.is_autobilling_active){
		var firstText = 'Autorecharge on Low Balance is enabled';
		var secondText = 'You will be always on!';
	} else{
		var firstText = 'Autorecharge on Low Balance is disabled';
		var secondText = 'Enable it to stay always on!';
	}
	$rootScope.footerData = {
		first:  '<span ng-click="openChatWindow()">Want support</span>' + 
				'<span ng-click="openChatWindow()">Leave us a chat message</span>',
		second: '<span>' + firstText + '</span>' + 
				'<span>' + secondText + '</span>',
		third:  '<a href="/#/docs" target="_blank"><span>Read our docs</span>' + 
				'<span>They can help you really much</span></a>'
	}

}]);