module.exports = [
  '$document',
  '$rootScope',
  'Restangular',
  function($document, $rootScope, Restangular) {
    return {
      restrict: 'EA',
      templateUrl: '/app/directives/templates/item-counter-per-page.html',
      scope: {
        totalItems: '=totalItems',
        page: '=page',
        itemsPerPage: '=itemsPerPage'
      },
      link: function($scope, attrs) {
        var applyTranslations = function() {
          $rootScope.isLoadedPage = false;
          setTimeout(function() {
            $rootScope.isLoadedPage = true;
          }, 100);
          $scope.$watchGroup(['page', 'totalItems'], function(value) {
            // if ($scope.totalItems) {
            $rootScope.tableTotalItems = $scope.totalItems;
            var page = value[0] ? value[0] : 1;
            $scope.fromElement = (page - 1) * $scope.itemsPerPage + 1;
            $rootScope.tableFromElement = $scope.fromElement;
            if (Math.floor($scope.totalItems / (page * $scope.itemsPerPage)) < 1) {
              $scope.toElement = $scope.totalItems % (page * $scope.itemsPerPage);
              $rootScope.tableToElement = $scope.toElement;
            } else {
              $scope.toElement = $scope.fromElement + $scope.itemsPerPage - 1;
              $rootScope.tableToElement = $scope.toElement;
            }
            $scope.counterPerPageReturn =
              $rootScope.trans('page_counter_showing_1') +
              ' ' +
              // + $scope.fromElement
              // + '-'
              $scope.toElement +
              ' ' +
              $rootScope.trans('pagination_of') +
              ' ' +
              $scope.totalItems +
              ' ' +
              ($rootScope.currentActiveUrl === 'addressbook.groups'
                ? $rootScope.trans('addressbook_menu_groups')
                : $rootScope.trans('page_counter_items_1'));
            // }
            //  else {
            // 	// $scope.counterPerPageReturn = $rootScope.trans('page_counter_showing_1') + " " + "0";
            // 	$scope.counterPerPageReturn = "";
            // }
          });
        };

        $rootScope.$watch('currentLanguage', applyTranslations);
        $rootScope.$watch('isLangLoaded', applyTranslations);
      }
    };
  }
];
