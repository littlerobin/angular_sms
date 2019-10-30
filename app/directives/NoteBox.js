module.exports =
    ['$document', function ($document) {
        return {
            restrict: 'E',
            transclude: true,
            templateUrl: '/app/directives/templates/metabox.html',
            scope: {
                type: '@type'
            },
            link: function ($scope, elem, attr, ctrl) {
                $scope.tip=attr.type;
            }
        }
    }];