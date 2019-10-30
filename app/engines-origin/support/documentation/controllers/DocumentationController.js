angular.module('callburnApp').controller('DocumentationController',
    ['$scope', '$rootScope', '$state', "$stateParams", "$http",
        function ($scope, $rootScope, $state, $stateParams, $http) {


            $scope.redirect = function (link) {
                window.location.href = link;
            };

            $rootScope.currentActiveRoute = 'docs';
            $rootScope.currentActiveUrl = 'docs';
            $rootScope.showWhiteMenu = false;
            $rootScope.showFooter = false;
            $rootScope.showRegistration = false;
            $scope.dir = "/app/engines/support/documentation/markdown/pages/" + $stateParams.dir + "/docs.md";
            $scope.showDocs=true;

            $scope.currentTab = function (link) {
                return link == $stateParams.dir;
            };

            $scope.openSelectedTab = function (tab) {
                var string = $stateParams.dir.split('/');
                return string[0] == tab;
            };

            $scope.searchInDocs = function () {
                $http
                    .get(window.frontNodeUrl, {
                        params: {
                            search_key: $scope.word
                        }
                    }).success(function (data) {
                    if(data.status=="OK"){
                        $scope.showDocs=false;
                        $scope.searchResults=data.data;
                    }else{
                        $scope.showDocs=true;
                    }
                });
            }
        }]);