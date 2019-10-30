angular.module('callburnApp').controller('ApiSettingsController',
    ['$scope', '$rootScope', '$state', 'Restangular', '$stateParams', 'apiKeys',"CallBournModal",
        function ($scope, $rootScope, $state, Restangular, $stateParams, apiKeys,CallBournModal) {


            $scope.goToNotification = $rootScope.goToNotification;
            $rootScope.tutorialSidePopup = true;
            // $rootScope.currentPage = 'dashboard';
            $rootScope.currentActiveRoute = 'api';
            $scope.apiKeys = apiKeys.resource.api_keys;

            $scope.typeOptions = [
                {
                    value: 'live',
                    text: trans('modals_api_api_modal_production_key')
                },
                {
                    value: 'test', 
                    text: trans('modals_api_api_modal_test_key')
                }
            ]

            window.document.title = $scope.notSeenNotificationsCount === 0 ? 'API - ' + 'Callburn' : '(' + $scope.notSeenNotificationsCount + ') ' + 'API - ' + 'Callburn';


            $scope.removeKey = function (id) {
                ConfirmDeleteModal().then(function () {
                    Restangular.one('api-keys/remove-api-key', id).remove().then(function (data) {
                        updateKeys();
                    });
                });

            };

            $scope.openModalKeyGenerator = function () {
                Restangular.one('services-callburn').get().then(function (data) {
                    ids = [];
                    data.resource.services.forEach(function (service) {
                        ids.push(service._id);
                    })
                    CallBournModal.open({
                        scope: {
                            newKeydata: {
                                type: "live",
                                services: ids
                            },
                            typeOptions: $scope.typeOptions,
                            services: data.resource.services
                        },
                        templateUrl: "/app/modals/api/api-modal.html"
                    }, function (scope) {
                        scope.check = function (service) {
                            var key = scope.newKeydata.services.indexOf(service._id);
                            if (key === -1) {
                                scope.newKeydata.services.push(service._id);
                            } else {
                                scope.newKeydata.services.splice(key, 1);
                            }
                        }
                        scope.addKey = function () {
                            Restangular.all('api-keys/create-api-key').post(scope.newKeydata).then(function (data) {
                                updateKeys();
                                $scope.newKeydata = {};
                                CallBournModal.close();
                            })
                        };
                    });
                });
            };
            $scope.changePage = function (pageNumber) {
                if (pageNumber < 0) {
                    return;
                }
                $scope.page = pageNumber;
                $scope.listingSkip = $scope.page * 10;
            };
            $scope.openKeyShowModal=function (key) {
                CallBournModal.open({
                    scope: {
                        key:key
                    },
                    templateUrl: "/app/modals/api/show-key.html"
                }, function (scope) {

                });
            };
            
            

            var updateKeys = function () {
                Restangular.one('api-keys/api-keys').get().then(function (apiKeys) {
                    $scope.apiKeys = apiKeys.resource.api_keys;
                });
            };

            $scope.openStatistics = function(id) {
                $state.go('api.statistics', {id});
            }
        }]);