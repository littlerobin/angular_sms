module.exports = function($stateProvider, $rootScope) {
  $stateProvider
    .state('addressbook', {
      url: '/addressbook',
      templateUrl: '/app/engines-origin/addressbook/main.html',
      controller: function($state, $rootScope) {
        // if(! $rootScope.checkAccessBeta) {
        //     $state.go('dashboard.dashboard');
        // }
        if ($state.current.name === 'addressbook') {
          $state.go('addressbook.groups');
        }
      }
    })

    .state('addressbook.groups', {
      url: '/groups',
      templateUrl: '/app/engines-origin/addressbook/groups/views/index.html',
      controller: 'GroupsController',
      params: {
        group_id: null
      },
      resolve: {
        addedContacts: function(Restangular, $stateParams) {
          return $stateParams.group_id ? Restangular.one('contacts-data/contacts-added', $stateParams.group_id).get() : null;
        },
        groups: function(Restangular) {
          return Restangular.one('address-book/index-groups').get({ per_page: 14, page: 0 });
        },
        deps: [
          '$ocLazyLoad',
          function($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'callburnApp',
              files: [
                '/app/engines-origin/addressbook/groups/services/GroupsService.js',
                '/app/engines-origin/addressbook/groups/controllers/GroupsController.js'
              ]
            });
          }
        ]
      }
    })

    .state('addressbook.blacklist', {
      url: '/blacklist',
      templateUrl: '/app/engines-origin/addressbook/blacklist/views/index.html',
      controller: 'BlacklistController',
      resolve: {
        blacklist: function(Restangular) {
          return Restangular.one('address-book/index-black-list').get({ per_page: 14, page: 0 });
        },
        deps: [
          '$ocLazyLoad',
          function($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'callburnApp',
              files: ['/app/engines-origin/addressbook/blacklist/controllers/BlacklistController.js']
            });
          }
        ]
      }
    })

    .state('addressbook.contacts', {
      url: '/contacts/:group_id?',
      templateUrl: '/app/engines-origin/addressbook/contacts/views/index.html',
      controller: 'ContactsController',
      resolve: {
        contacts: function(Restangular, $stateParams) {
          return Restangular.one('address-book/index-contacts').get({ group_id: $stateParams.group_id, per_page: 50 });
        },

        deps: [
          '$ocLazyLoad',
          function($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'callburnApp',
              files: [
                '/app/engines-origin/addressbook/contacts/controllers/ContactsController.js',
                '/app/engines-origin/addressbook/contacts/services/ContactsService.js'
              ]
            });
          }
        ]
      }
    })

    // .state('addressbook.contacts', {
    //     url: '/contacts',
    //     templateUrl: '/app/engines-origin/addressbook/contacts/views/index.html',
    //     controller: 'ContactsController',
    //     resolve: {
    //         contacts: function (Restangular) {
    //             return Restangular.one('address-book/index-contacts').get();
    //         },
    //         groups: function (Restangular) {
    //             return Restangular.one('address-book/index-groups').get();
    //         },
    //         deps: ['$ocLazyLoad', function ($ocLazyLoad) {
    //             return $ocLazyLoad.load({
    //                 name: 'callburnApp',
    //                 files: [
    //                     '/app/engines-origin/addressbook/contacts/services/ContactsService.js',
    //                     '/app/engines-origin/addressbook/contacts/controllers/ContactsController.js'
    //                 ]
    //             });
    //         }]
    //     }
    // })

    ////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////

    // .state('addressbook.groups', {
    //     url: '/groups',
    //     templateUrl: '/app/engines-origin/addressbook/groups/views/index.html',
    //     controller: 'GroupsController',
    //     params:{SelectedGroups:{}},
    //     resolve: {
    //         groups: function (Restangular) {
    //             return Restangular.one('address-book/index-groups').get();
    //         },
    //         deps: ['$ocLazyLoad', function ($ocLazyLoad) {
    //             return $ocLazyLoad.load({
    //                 name: 'callburnApp',
    //                 files: [
    //                     '/app/engines-origin/addressbook/contacts/services/ContactsService.js',
    //                     '/app/engines-origin/addressbook/groups/controllers/GroupsController.js'
    //                 ]
    //             });
    //         }]
    //     }
    // })
    .state('addressbook.import', {
      url: '/import/:job_id?',
      templateUrl: '/app/engines-origin/addressbook/import/views/import-contact.html',
      controller: 'ContactsImportController',
      resolve: {
        groupsAll: function(Restangular) {
          return Restangular.one('address-book/all-groups').get();
        },
        groups: function(Restangular) {
          return Restangular.one('address-book/index-groups').get();
        },
        job: function(Restangular, $stateParams) {
          if ($stateParams.job_id) {
            return Restangular.one('users/background-job').get($stateParams);
          } else {
            return null;
          }
        },
        deps: [
          '$ocLazyLoad',
          function($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'callburnApp',
              files: ['/app/engines-origin/addressbook/import/controllers/ContactsImportController.js']
            });
          }
        ]
      }
    })
    .state('addressbook.export', {
      url: '/export',
      templateUrl: '/app/engines-origin/addressbook/export/views/export-contacts.html',
      controller: 'ContactsExportController',
      resolve: {
        groups: function(Restangular) {
          return Restangular.one('address-book/index-groups').get();
        },
        contacts: function(Restangular) {
          return Restangular.one('address-book/index-contacts').get();
        },
        deps: [
          '$ocLazyLoad',
          function($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'callburnApp',
              files: ['/app/engines-origin/addressbook/export/controllers/ContactsExportController.js']
            });
          }
        ]
      }
    });
};
