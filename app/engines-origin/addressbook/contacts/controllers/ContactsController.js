angular.module('callburnApp').controller('ContactsController', [
  '$scope',
  '$rootScope',
  '$state',
  'Restangular',
  '$stateParams',
  'growl',
  'contacts',
  'ContactsService',
  function($scope, $rootScope, $state, Restangular, $stateParams, growl, contacts, ContactsService) {
    if (contacts.resource.contacts.length === 0 && $state.params.group_id) {
      growl.error($rootScope.trans('group_doesnt_exist_anymore'));
      $state.go('addressbook.groups');
      return;
    }
    $rootScope.currentActiveUrl = $state.current.name;
    $rootScope.currentActiveRoute = $stateParams.group_id ? 'groups' : 'contacts';
    $scope.contactsService = new ContactsService(contacts, true);
    $rootScope.tutorialSidePopup = true;

    window.document.title =
      $scope.notSeenNotificationsCount === 0
        ? 'Phonebook - ' + 'Callburn'
        : '(' + $scope.notSeenNotificationsCount + ') ' + 'Phonebook - ' + 'Callburn';
  
  }
]);
