angular.module('callburnApp').controller('WelcomeController',
    [ 		'$scope', '$rootScope', '$state','$stateParams',
        function($scope,   $rootScope,   $state,$stateParams){
            $rootScope.showNavbar=false;
            //$stateParams.tutorial=true;
            if($stateParams.tutorial != "index"){
                $state.go('dashboard.dashboard')
            }
        }]);