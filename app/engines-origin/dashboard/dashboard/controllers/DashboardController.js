angular.module('callburnApp').controller('DashboardController',
    ['$scope', '$rootScope', '$state', 'dashboardData','$location',"growl",
        function ($scope, $rootScope, $state, dashboardData,$location,growl) {
            $rootScope.showNavbar = true;
            $scope.notifyMessage=$location.search();
            if($scope.notifyMessage){
                if($scope.notifyMessage.password){
                    growl.success($rootScope.trans('password_correctly_set_up'),{ttl: -1});
                }
                if($scope.notifyMessage.email){

                }

            }
            $scope.goToNotification = $rootScope.goToNotification;
            $rootScope.currentPage = 'dashboard';
            $rootScope.currentActiveRoute = 'dashboard';
            $scope.dashboardData = dashboardData.resource;
            //console.log($scope.dashboardData.clickToCall_snippets_count);
            // $rootScope.clickToCall_snippets_count = $scope.dashboardData.clickToCall_snippets_count;
            // console.log($rootScope.clickToCall_snippets_count);
            $scope.options1 = [{a: 1, b: 2}];


            $scope.goToStep = function (url, param, check) {
                if(check) {
                    $state.go(url, param);
                }

            }

        }]);