module.exports = [
  '$document',
  '$filter',
  function($document, $filter) {
    return {
      restrict: 'EA',
      require: 'ngModel',
      templateUrl: '/app/directives/templates/callburn-select.html',
      scope: {
        options: '=',
        showAttr: '@showAttr',
        keepAttr: '@keepAttr',
        imageUrl: '@imageUrl',
        imageAttr: '=imageAttr',
        selectText: '@selectText',
        keepObject: '=keepObject',
        optionImage: '@optionImage',
        showAutocomplete: '=showAutocomplete',
        makeMultiselect: '=makeMultiselect'
      },
      link: function($scope, elem, attr, ctrl) {
        var copyImageUrl = $scope.imageUrl;

        var ids = [
          'selectBoxMain',
          'data-show-right',
          'data-show-right1',
          'callburn-autocomplete',
          'show-selecct-icon'
        ];
        $scope.filtering = {};
        $scope.showSelect = false;

        $scope.checkeds = [];

        // $scope.choice = function ($event,item) {
        //     if($event.delegateTarget.checked) {
        //         $scope.checkeds.push(item);
        //         ctrl.$setViewValue( $scope.checkeds);
        //
        //         // ctrl.$viewChangeListeners.push(function(){
        //         //     console.log('changed');
        //         // });
        //     } else {
        //
        //         var index = $scope.checkeds.indexOf(item);
        //         $scope.checkeds.splice(index, 1);
        //         ctrl.$setViewValue( $scope.checkeds);
        //
        //         // ctrl.$viewChangeListeners.push(function(){
        //         //     console.log('changed');
        //         // });
        //
        //     }
        // };

        $document.on('click', function($event) {
          if (ids.indexOf($event.target.id) === -1) {
            $scope.showSelect = false;
            $scope.$apply();
          }
        });
        $scope.valueSelected = function(showKey, key, img, index, selectText) {
          $scope.languageSelected = [];
          $scope.languageSelected[index] = 'language-selected';
          $scope.selectedValue = $scope.keepObject ? showKey[$scope.showAttr] : showKey;

          if (showKey === '--------') {
            $scope.showSelect = false;
            ctrl.$setViewValue(key);
            $scope.selectedValue = selectText;
          }
          if (!$scope.makeMultiselect) {
            $scope.showSelect = false;
            ctrl.$setViewValue(key);
          }

          if (img) {
            $scope.imageUrl = img;
          } else if ($scope.imageAttr && $scope.imageAttr[index]) {
            $scope.imageUrl = $scope.imageAttr[index];
          } else {
            $scope.imageUrl = copyImageUrl;
          }

          //$filter('orderBy')($scope.options,  $scope.selectedValue);
          //console.log($filter('orderBy')($scope.options,  'viewText'));
        };
      }
      // compile: function(element, attrs){
      //     if (!attrs.showAutocomplete) {
      //         attrs.showAutocomplete = false;
      //     }
      //
      // },
    };
  }
];
