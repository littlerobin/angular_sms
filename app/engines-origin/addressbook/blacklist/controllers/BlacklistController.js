angular.module('callburnApp').controller('BlacklistController', [
  '$scope',
  '$rootScope',
  '$state',
  'Restangular',
  '$stateParams',
  'growl',
  'blacklist',
  '$timeout',
  'CallBournModal',
  function($scope, $rootScope, $state, Restangular, $stateParams, growl, blacklist, $timeout, CallBournModal) {
    $rootScope.currentActiveUrl = $state.current.name;
    $rootScope.currentActiveRoute = 'blacklist';

    $scope.blacklist = blacklist.resource;

    $scope.showSearch = false;
    $scope.searchVal = '';
    $scope.showMoreLoader = false;
    $scope.aPage = 0;
    $scope.isAllSelected = false;
    $scope.showObj = {
      showEverything: false,
      showSearchVal: false
    };
    $scope.filterData = {
      searchValue: ''
    };
    $scope.newBlacklistPhone = '';

    $scope.filterContacts = function() {
      $scope.searchVal = $scope.filterData.searchValue;
      $scope.showObj.showEverything = true;
      $scope.showObj.showSearchVal = true;
      $rootScope.showEverything = true;
      var data = {
        phone_number: $scope.filterData.searchValue,
        page: 0,
        key_word: $scope.filterData.searchValue
      };
      $scope.reloadData(data, 'search');
    };

    $scope.reloadData = function(params, type) {
      return Restangular.one('address-book/index-black-list')
        .get(params)
        .then(function(data) {
          var arrLength = $scope.blacklist.contacts.length || data.resource.contacts.length;
          for (var i = 0; i < arrLength; i++) {
            if ($scope.blacklist.contacts[i] !== data.resource.contacts[i]) {
              if (type === 'search') {
                $scope.updateContacts(data, type);
              } else {
                $scope.updateContacts(data);
              }
            }
          }
        });
    };

    $scope.updateContacts = function(contacts, type) {
      $scope.tableSpinnerLoading = false;
      var res = contacts.resource;
      $scope.blacklist.allCount = res.allCount;
      $scope.blacklist.count = res.count;
      $scope.blacklist.page = res.page;
      if (type === 'search') {
        $scope.blacklist.contacts = res.contacts;
      } else {
        if (res.contacts.length) {
          $scope.blacklist.contacts = res.contacts;
        } else {
          $scope.clearSearch();
        }
      }
    };

    $scope.clearSearch = function() {
      $scope.filterData.searchValue = '';
      $scope.searchVal = '';
      $scope.filterContacts();
      $scope.aPage = 0;
      $scope.showObj.showEverything = false;
      $scope.showObj.showSearchVal = false;
      $rootScope.showEverything = false;
    };

    $scope.toggleSearch = function() {
      $scope.showSearch && $rootScope.importantShowSearch ? $scope.filterContacts() : ($scope.showSearch = true);
      var inp = document.querySelector('input[name=addressbook-group-filter]');
      $timeout(function() {
        inp.focus();
      }, 1000);
    };

    $scope.changeDateString = function(dateString) {
      date = moment(dateString, 'YYYY-MM-DD hh:mm:ss');
      return date.format('DD/MM/YY HH:mm');
    };

    $scope.removeFromBlacklist = function(id) {
      var data = {
        phonenumber_ids: [id]
      };
      Restangular.all('address-book/remove-black-list')
        .post(data)
        .then(function(data) {
          if (data.resource.error.no === 0) {
            $scope.reloadData();
          }
        });
    };

    $scope.openBlacklistModal = function() {
      CallBournModal.open(
        {
          scope: {},
          templateUrl: '/app/modals/addressbook_modal/add-blacklist.html'
        },
        function(scope) {
          scope.blacklistData = {};
          scope.addNewBlacklist = function(number) {
            if (Number.isInteger(+number)) {
              var data = {
                phonenumbers: [+number],
                name: scope.blacklistData.name
              };
              CallBournModal.close();
              Restangular.all('address-book/add-black-list')
                .post(data)
                .then(function(data) {
                  if (data.resource.error.no === 0) {
                    $scope.reloadData();
                  }
                });
            } else {
              growl.error($rootScope.trans('phonenumber_is_not_valid'));
            }
          };
        }
      );
    };

    $scope.setStatusText = function(contact) {
      switch (contact.blacklist_type) {
        case 'MANUALLY_TYPED':
          return $rootScope.trans('manually_typed');
        case 'MANUALLY_ADDED':
          return $rootScope.trans('manually_added_from') +  contact.campaign && contact.campaign.campaign_name ? ' ' + contact.campaign.campaign_name : '';
        case 'REQUESTED':
          return $rootScope.trans('requested_blacklist_from') +  contact.campaign && contact.campaign.campaign_name ? ' ' + contact.campaign.campaign_name : '';
        default:
          break;
      }
    };
  }
]);
