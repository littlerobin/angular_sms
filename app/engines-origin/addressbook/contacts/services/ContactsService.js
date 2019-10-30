angular
  .module('callburnApp')
  .factory('ContactsService', function($sce, $rootScope, Restangular, $state, growl, $httpParamSerializer, $timeout) {
    /*
        *  @param array contacts
        *  @param boolean showMoreSelectBox
        */
    var PhoneBookData = function(contacts, showMoreSelectBox, isEditing) {
      //initialization
      this.isEditing = isEditing;
      this.contactsData = contacts.resource;
      this.selectedContacts = {};
      this.showEditBox = false;
      this.redBorder = '';
      this.showMoreSelectBox = showMoreSelectBox;
      this.removingGroupsLoader = false;
      this.eventListener();
      this.tableSpinnerLoading = false;
      this.checkedContacts = {};
      //this.checkedAllContacts = false;
      this.checkboxAll = false;
      this.disableSelectAll = false;
      this.contactsData.contacts.forEach(function(contact) {
        contact.selectable = true;
      });
      this.showSearch = false;
      this.showEverything = false;
      this.searchVal = '';
      this.showSearchVal = false;
      this.showMoreLoader = false;
      this.aPage = 0;
      this.isAllSelected = false;
      this.filterOrAddContactData = {};
      this.contactsMoreDropdownToggle = false;
      window.currentUrlHash = window.location.hash.indexOf('compose');
      this.currentUrlHash = window.currentUrlHash;
    };

    PhoneBookData.prototype.getContactDate = function(contact) {
      var date = contact.updated_at ? contact.updated_at : contact.created_at;
      return this.changeDateString(date);
    };

    PhoneBookData.prototype.changeDateString = function(dateString) {
      date = moment(dateString, 'YYYY-MM-DD hh:mm:ss');
      return date.format('DD/MM/YY HH:mm');
    };

    PhoneBookData.prototype.checkInArray = function(array, item) {
      return array.indexOf(item) > -1 ? true : false;
    };

    PhoneBookData.prototype.checkInObject = function(object, key) {
      return key in object ? true : false;
    };

    PhoneBookData.prototype.getObjectLength = function(object) {
      return Object.keys(object).length;
    };

    PhoneBookData.prototype.choiceOrRemove = function(object, key) {
      var scope = this;
      if (this.checkInObject(object, key)) {
        delete object[key];
      } else {
        object[key] = true;
      }
    };

    PhoneBookData.prototype.selectAllContacts = function(disableAll) {
      var scope = this;
      var disableAll = !disableAll ? false : true;
      this.isAllSelected = false;
      this.checkedAllContacts = !this.checkedAllContacts;
      if (this.checkedAllContacts) {
        this.contactsData.contacts.forEach(function(contact) {
          scope.selectedContacts[contact._id] = true;
          contact.selectable = disableAll ? false : true;
        });
      } else {
        this.selectedContacts = {};
      }
      var checkedGroupsArr = Object.values(scope.selectedContacts);
      if (checkedGroupsArr.length) {
        scope.contactsMoreDropdownToggle = true;
      } else {
        scope.contactsMoreDropdownToggle = false;
      }
    };

    PhoneBookData.prototype.selectOrRemoveContact = function(selectedContacts, contact) {
      // if (contact.should_put_three_asterisks) {
      //     return;
      // }
      var scope = this;
      PhoneBookData.prototype.choiceOrRemove(selectedContacts, contact._id);
      var checkedGroupsArr = Object.values(scope.selectedContacts);
      if (checkedGroupsArr.length) {
        scope.contactsMoreDropdownToggle = true;
      } else {
        scope.contactsMoreDropdownToggle = false;
      }
      if (Object.keys(this.selectedContacts).length !== this.contactsData.contacts.length) {
        this.checkedAllContacts = false;
        return;
      }
      for (index in this.selectedContacts) {
        if (!this.selectedContacts[index]) {
          this.checkedAllContacts = false;
          return;
        }
      }
      this.checkedAllContacts = true;
    };

    PhoneBookData.prototype.sendMessage = function() {
      if (!this.getObjectLength(this.selectedContacts)) {
        //growl.warning(trans('No_Contact_Selected'));
        return;
      }
      var data = [];
      var scope = this;
      this.contactsData.contacts.forEach(function(item) {
        if (item._id in scope.selectedContacts) {
          var currentPhonenumber = {
            phone_no: item.phone_number
          };
          data.push(currentPhonenumber);
        }
      });

      $state.go('campaign.compose', { contact_ids: data });
    };

    PhoneBookData.prototype.removeSelected = function() {
      if (!this.getObjectLength(this.selectedContacts)) {
        growl.warning($rootScope.trans('No_Contact_Selected'));
        return;
      }
      this.removingGroupsLoader = true;
      this.removeContacts();
    };

    PhoneBookData.prototype.removeContacts = function() {
      var postData = {
        contact_ids: Object.keys(this.selectedContacts),
        group_id: this.contactsData.currentGroup ? this.contactsData.currentGroup._id : null
      };
      $rootScope.disableButton();

      var scope = this;
      var url = 'address-book/remove-contacts';

      if (this.isAllSelected) {
        postData = {
          key_word: this.filterOrAddData,
          group_id: this.contactsData.currentGroup ? this.contactsData.currentGroup._id : null
        };
        url = 'address-book/remove-contacts-searched';
      }

      Restangular.all(url)
        .post(postData)
        .then(function(data) {
          $rootScope.enabledButton();
          if (data.resource.error.no === 0) {
            if (data.resource.groupIsRemoved) {
              $state.go('addressbook.groups');
            }
            if (scope.isAllSelected) {
              scope.selectSearchedContacts();
              scope.filterOrAddData = '';
              var data = {
                per_page: 50,
                phone_number: '',
                page: 0,
                key_word: '',
                group_id: scope.contactsData.currentGroup ? scope.contactsData.currentGroup._id : null
              };
              scope.contactsData.contacts = [];
              scope.reloadData(data).then(function() {
                scope.removingGroupsLoader = false;
                scope.clearSearch();
              });
            } else {
              var size = Object.keys(scope.selectedContacts).length;
              scope.contactsData.count -= size;
              scope.contactsData.allContactsOfGroupCount -= size;
              // scope.contactsData.contacts = scope.contactsData.contacts.filter(function (item) {
              //     return !scope.checkInObject(scope.selectedContacts,item._id);
              // })

              scope
                .filterContactsRemoved(scope.contactsData.contacts, scope.selectedContacts)
                .then(function(filteredContacts) {
                  scope.contactsData.contacts = filteredContacts;
                  if (!filteredContacts) scope.clearSearch();
                  scope.selectedContacts = {};
                  return;
                })
                .then(function() {
                  scope.removingGroupsLoader = false;
                  scope.checkedAllContacts = false;
                });
            }
          } else {
            $rootScope.enabledButton();
            scope.removingGroupsLoader = false;
          }
        });
    };

    PhoneBookData.prototype.filterContactsRemoved = function(allContacts, removedContacts) {
      var scope = this;
      return new Promise(function(resolve, reject) {
        var result = [];
        if (allContacts.length === removedContacts.length) {
          return resolve(result);
        }
        var i;
        for (i = 0; i < allContacts.length; i++) {
          if (!scope.checkInObject(removedContacts, allContacts[i]._id)) {
            result.push(allContacts[i]);
          }
        }
        return resolve(result);
      });
    };

    PhoneBookData.prototype.updateContacts = function(contacts, type) {
      this.tableSpinnerLoading = false;
      var res = contacts.resource;
      var scope = this;
      this.contactsData.currentGroup = res.currentGroup;
      this.contactsData.allContactsOfGroupCount = res.allContactsOfGroupCount;
      this.contactsData.count = res.count;
      this.contactsData.page = res.page;
      this.total = res.count;
      if (type === 'search') {
        scope.contactsData.contacts = res.contacts;
        scope.showMoreLoader = false;
      } else {
        if (res.contacts.length) {
          res.contacts.forEach(function(item) {
            scope.contactsData.contacts.push(item);
          });
        } else {
          scope.clearSearch();
        }
        scope.showMoreLoader = false;
      }
    };

    PhoneBookData.prototype.reloadData = function(params, type) {
      var scope = this;
      return Restangular.one('address-book/index-contacts')
        .get(params)
        .then(function(data) {
          if (type === 'search') {
            scope.updateContacts(data, type);
          } else {
            scope.updateContacts(data);
          }
        });
    };

    PhoneBookData.prototype.filterContacts = function() {
      this.tableSpinnerLoading = true;
      this.showEverything = true;
      $rootScope.showEverything = true;
      this.showSearchVal = true;
      this.searchVal = this.filterOrAddData;
      this.aPage = 0;
      var data = {
        per_page: 50,
        phone_number: this.filterOrAddData,
        page: 0,
        key_word: this.filterOrAddData
      };

      if (this.contactsData.currentGroup) {
        data['group_id'] = this.contactsData.currentGroup._id;
      }
      var scope = this;
      this.reloadData(data, 'search');
      $rootScope.showEverything = true;
    };

    // PhoneBookData.prototype.changePage = function (page) {
    //     this.tableSpinnerLoading = true;
    //     if (page < 0 || page > this.pagesCount - 1) {
    //         return;
    //     }
    //     var postData = {
    //         phone_number : this.filterOrAddData,
    //         page : page,

    //     };

    //     if(this.contactsData.currentGroup) {
    //         postData['group_id'] = this.contactsData.currentGroup._id;
    //     }

    //     var scope = this;
    //     this.reloadData(postData).then(function (data) {
    //         scope.updateContacts(data);
    //     });
    // };

    PhoneBookData.prototype.showEditNameInput = function() {
      if (this.contactsData.currentGroup._id != 'all') {
        this.contactsData.currentGroup.name = this.contactsData.currentGroup.name
          ? this.contactsData.currentGroup.name
          : trans('add_a_name');

        this.showEditBox = true;
        setTimeout(function() {
          angular.element('#change-group-name').select();
        }, 100);
      }
    };

    PhoneBookData.prototype.changeName = function(id) {
      if (this.showEditBox) {
        if (!this.contactsData.currentGroup.name) {
          return;
        } else {
        }

        var newName = this.contactsData.currentGroup.name;

        $rootScope.disableButton();
        var scope = this;
        Restangular.one('address-book/update-group', id)
          .put({ name: newName })
          .then(function(data) {
            $rootScope.enabledButton();
            if (data.resource.error.no === 0) {
              scope.showEditBox = false;
            }
          });
      }
    };

    PhoneBookData.prototype.getGroupName = function(group) {
      var scope = this;
      if (scope.contactsData.currentGroup._id === 'all') {
        return trans('addressbook_all_contacts');
      }

      if (!group.name) {
        return trans('add_a_name');
      }

      return group.name;
    };

    PhoneBookData.prototype.backToPhonebook = function() {
      $state.go('addressbook.groups');
    };

    //write your event listeners here. this function will call with constructor
    PhoneBookData.prototype.eventListener = function() {
      var scope = this;
      document.addEventListener('keydown', function(e) {
        var keyCode = e.keyCode;

        if (keyCode === 13) {
          var activeFilterSearchBoxId = document.activeElement.id ? document.activeElement.id : '';

          if (activeFilterSearchBoxId.trim() === 'filter-search-box') {
            scope.filterContacts();
          }

          if (scope.showEditBox) {
            if (scope.contactsData.currentGroup) {
              scope.changeName(scope.contactsData.currentGroup._id);
            } else {
              scope.changeName('all');
            }
          }
        }
      });
    };

    PhoneBookData.prototype.toggleSearch = function() {
      this.showSearch && $rootScope.importantShowSearch ? this.filterContacts() : (this.showSearch = true);
      var inp = document.querySelector('input[name=addressbook-group-filter]');
      $timeout(function() {
        inp.focus();
      }, 1000);
    };

    PhoneBookData.prototype.enterPress = function(key) {
      // if (key.which === 27)
      key.which === 13 ? this.filterContacts() : null;
    };

    PhoneBookData.prototype.clearSearch = function() {
      this.filterOrAddData = '';
      this.filterContacts();
      this.aPage = 0;
      this.showEverything = false;
      $rootScope.showEverything = false;
      this.searchVal = '';
      this.showSearchVal = false;
    };

    // Fetch more items
    PhoneBookData.prototype.getMore = function() {
      var scope = this;
      var postData = {};
      this.aPage++;
      this.filterOrAddContactData.per_page = 50;
      this.filterOrAddContactData.page = this.aPage;
      this.filterOrAddContactData.phone_number = this.filterOrAddData;
      this.filterOrAddContactData.key_word = this.filterOrAddData;
      this.filterOrAddContactData.group_id = this.contactsData.currentGroup ? this.contactsData.currentGroup._id : null;
      Restangular.one('address-book/index-contacts')
        .get(this.filterOrAddContactData)
        .then(function(data) {
          scope.updateContacts(data);
        });
    };

    PhoneBookData.prototype.tableInit = function() {
      $rootScope.showEverything = false;
      var scope = this;
      if (scope.contactsData.succeed || scope.contactsData.failed) {
        var data = {
          series: [scope.contactsData.failed || 0, scope.contactsData.succeed || 0]
        };
        var sum = function(a, b) {
          return a + b;
        };

        var responsiveOptions = [
          [
            'screen and (max-width: 992px)',
            {
              width: 200,
              height: 150,
              labelOffset: 40
            }
          ]
        ];

        var options = {
          chartPadding: 30,
          labelOffset: 50,
          labelInterpolationFnc: function(value) {
            return Math.round((value / data.series.reduce(sum)) * 100) + '%';
          },
          width: 300,
          height: 200
        };

        new Chartist.Pie('#ct-chart', data, options, responsiveOptions);
      } else {
        scope.fakeChart = true;
      }
      var elem = angular.element(document.getElementById('myTable').tBodies[0])[0];
      elem.addEventListener('scroll', function(event) {
        if (this.isDone) {
          return;
        }
        event.preventDefault();
        if (elem.scrollTop + elem.clientHeight === elem.scrollHeight && $rootScope.tableToElement < scope.contactsData.count) {
          scope.showMoreLoader = true;
          scope.getMore();
          elem.scrollHeight = 0;
        }
      });
    };

    PhoneBookData.prototype.selectSearchedContacts = function() {
      var scope = this;
      this.isAllSelected = !this.isAllSelected;
      this.checkedAllContacts = this.isAllSelected;
      if (scope.isAllSelected) {
        this.contactsData.contacts.forEach(function(contact) {
          scope.selectedContacts[contact._id] = scope.isAllSelected;
        });
      } else {
        scope.selectedContacts = {};
      }
      var checkedGroupsArr = Object.values(scope.selectedContacts);
      if (checkedGroupsArr.length) {
        scope.contactsMoreDropdownToggle = true;
      } else {
        scope.contactsMoreDropdownToggle = false;
      }
    };

    PhoneBookData.prototype.scrollDown = function() {
      var elem = angular.element('#wrapper')[0];
      angular.element('#wrapper').animate(
        {
          scrollTop: elem.scrollHeight
        },
        800,
        function() {}
      );
    };

    return PhoneBookData;
  });
