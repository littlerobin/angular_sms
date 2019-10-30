angular.module('callburnApp').controller('GroupsController', [
  '$scope',
  '$rootScope',
  '$state',
  'groups',
  'addedContacts',
  'Restangular',
  '$stateParams',
  'growl',
  'CallBournModal',
  '$q',
  '$interval',
  '$timeout',
  'GroupsService',
  '$document',
  function(
    $scope,
    $rootScope,
    $state,
    groups,
    addedContacts,
    Restangular,
    $stateParams,
    growl,
    CallBournModal,
    $q,
    $interval,
    $timeout,
    GroupsService,
    $document
  ) {
    $rootScope.currentActiveUrl = $state.current.name;
    $rootScope.currentActiveRoute = 'groups';
    $rootScope.tutorialSidePopup = true;
    var selectedGroupIds = {};
    var showMoreSelectBox = true;

    $scope.lastSocketEvent = null;

    window.document.title =
      $scope.notSeenNotificationsCount === 0
        ? 'Phonebook - ' + 'Callburn'
        : '(' + $scope.notSeenNotificationsCount + ') ' + 'Phonebook - ' + 'Callburn';

    $scope.phoneBookData = new GroupsService(groups, addedContacts, selectedGroupIds, showMoreSelectBox);

    $rootScope.socket.on('address-book-updated', function(res) {
      if ($rootScope.currentUser._id == res.data.user_id) {
        var now = Math.round(new Date().getTime() / 1000);
        if (!$scope.lastSocketEvent || ($scope.lastSocketEvent && $scope.lastSocketEvent > now + 1)) {
          $scope.phoneBookData.reloadGroups({}, 'socket');
          $scope.lastSocketEvent = now;
        }
      }
    });

    $document.on('click', function(e) {
      if (e.target.id === 'groups-more-dropdown-button') {
        $scope.phoneBookData.groupsMoreDropdown = !$scope.phoneBookData.groupsMoreDropdown;
      } else if (e.target.classList[0] !== 'group_dropdown_inner') {
        $scope.phoneBookData.groupsMoreDropdown = false;
      }
    });

    var findInProgressGroups = function(group) {
      return group.in_progress === 1;
    };

    $scope.inProgress = undefined;

    // var updateGroups = function() {
    // 	Restangular.one('address-book/index-groups').get().then(function (groups) {
    // 		$scope.inProgress = false;
    // 		$scope.phoneBookData = new GroupsService(groups, null, selectedGroupIds, showSearch);
    // 	});
    // }

    // $interval(function () {
    // 	if (!$scope.inProgress) {
    //      $scope.inProgress = groups.resource.groups.find(findInProgressGroups) === undefined ? false : true;
    // 	}
    // 	if ($scope.inProgress) {
    //      updateGroups()
    // 	}
    // }, 15000);

    // $interval(function () {
    //     if (groups.resource.allGroupsCount > 0 && groups.resource.allContactsCount === 0) {
    //         updateGroups();
    //     }
    // }, 2000);
  }
]);
