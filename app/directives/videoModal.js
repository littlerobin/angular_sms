module.exports = ['$rootScope','$document', function ($rootScope, $document) {
    return {
        restrict: 'E',
        transclude: true,
        templateUrl: "/app/directives/templates/video-modal.html",
        controller: ['$scope', function ($scope) {

            $scope.hideOverlay = function () {
                $scope.isActive = false;
                $rootScope.showBlurEffect = false;
                $rootScope.modalLg = false;
            };

            $scope.closeModal = function () {

                angular.element('video-modal').remove();
                $scope.hideOverlay();
            };

            $scope.$watch('isActive', function (n, o) {
                if (n) {
                    angular.element('body').addClass('body-no-scroll');
                }

                else {
                    angular.element('body').removeClass('body-no-scroll');
                }
            });
        }]
    }
}];