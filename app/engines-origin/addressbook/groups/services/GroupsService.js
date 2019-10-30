angular
  .module("callburnApp")
  .factory("GroupsService", function(
    $sce,
    $rootScope,
    Restangular,
    $state,
    growl,
    $timeout
  ) {
    /*
     *  @param array groups
     *  @param object selectedGroupIds
     *  @param boolean showSearch
     *  @param number aPage
     */

    var PhoneBookData = function(
      groups,
      addedContacts,
      selectedGroupIds,
      showMoreSelectBox,
      showSearch,
      isComposeEditing
    ) {
      //initialization
      this.groupsData = groups.resource;
      this.isComposeEditing = isComposeEditing;

      this.addedContactsCount =
        addedContacts && addedContacts.resource
          ? addedContacts.resource.valid_contacts_count
          : null;
      if (this.groupsData.lastAddedContactDate) {
        //DELETE at push
        if (
          $rootScope.currentActiveRoute !== "groups" &&
          !this.isComposeEditing
        ) {
          var allGroup = {
            _id: "all",
            name: trans("addressbook_all_contacts"),
            contact_count: [{ count: this.groupsData.allContactsCount }],
            updated_at: this.groupsData.lastAddedContactDate.created_at,
            added_contacts_count: this.addedContactsCount
          };
          this.groupsData.groups.unshift(allGroup);
        }
      }

      this.checkedGroups = selectedGroupIds;
      this.filterOrAddData = {};
      this.filterOrAddContactData = {};
      this.currentOrder = "ASC";
      this.orderField = null;
      this.showArrowByField = "updated_at";
      this.tableSpinnerLoading = false;
      this.removingGroupsLoader = false;
      this.mergeGroupsLoader = false;
      this.exportUrlLoader = false;
      this.showMoreSelectBox = showMoreSelectBox;
      this.groupsMoreDropdown = false;
      this.groupsMoreDropdownToggle = false;
      this.showSearch = false;
      this.showEverything = false;
      this.isAllSelected = false;

      this.page = 1;
      this.inited = false;
      this.aPage = 0;
      this.showSearchVal = false;
      this.searchVal = "";
      this.showMoreLoader = false;
      this.isDone = false;
      this.isCurrentSelected = false;
      this.search_in_groups = 0;
      this.enableSearchInGroups = false;
      this.orderData = {};
      this.newGroupName = "";

      this.socketArr = [];

      // if (this.checkIfAllChecked()) {
      //   this.checkedAllGroups();
      // }
      // this.eventListeners();
    };

    PhoneBookData.prototype.getGroupDate = function(group) {
      var date = group.updated_at ? group.updated_at : group.created_at;
      date = moment(date, "YYYY-MM-DD hh:mm:ss");
      if (group._id == "all") {
        return "--";
      }
      return date.format("DD/MM/YY HH:mm");
    };

    PhoneBookData.prototype.getGroupName = function(group) {
      if (group._id === "all") {
        return trans("addressbook_all_contacts");
      }

      if (!group.name) {
        return trans("add_a_name");
      }

      if (group.type === "CREATED_ON_RETRY_UNDELIVERED") {
        return trans("addressbook_undelivered_group") + " " + group.name;
      }

      return group.name;
    };

    PhoneBookData.prototype.getGroupType = function(group) {
      if (group._id === "all") {
        return "";
      }

      if (
        group.type === "CREATED_BY_USER_MANUALLY" ||
        group.type === "CREATED_BY_USER_FROM_FILE"
      ) {
        return "addressbook_import_added_manually";
      }

      return "address_book_groups_autosaved";
    };

    PhoneBookData.prototype.checkInArray = function(array, item) {
      return array.indexOf(item) > -1 ? true : false;
    };

    PhoneBookData.prototype.checkInObject = function(object, key) {
      return key in object ? object[key] : false;
    };

    PhoneBookData.prototype.getObjectLength = function(object) {
      return Object.keys(object).length;
    };

    PhoneBookData.prototype.checkIfAllChecked = function() {
      return this.checkedGroups["all"] ? true : false;

      for (index in this.groupsData.groups) {
        var currentId = this.groupsData.groups[index]._id;
        if (currentId !== "all") {
          if (!this.checkedGroups[currentId]) {
            return false;
          }
        }
      }

      return true;
    };

    PhoneBookData.prototype.checkedAllGroups = function() {
      this.checkedGroups = {};
      var scope = this;
      this.groupsData.groups.forEach(function(item) {
        scope.checkedGroups[item._id] = true;
      });
    };

    PhoneBookData.prototype.uncheckedAllGroups = function() {
      this.checkedGroups = {};
      var scope = this;
      this.groupsData.groups.forEach(function(item) {
        if (item._id !== "all") {
          scope.checkedGroups[item._id] = false;
        }
      });
    };

    PhoneBookData.prototype.sendMessage = function() {
      this.groupsMoreDropdown = false;
      if (!this.getObjectLength(this.checkedGroups)) {
        growl.info($rootScope.trans("No_group_selected"));
        return;
      }

      $rootScope.hideFormQuestions = true;
      $state.go("campaign.compose", { group_ids: this.checkedGroups });
    };

    PhoneBookData.prototype.getExportUrl = function() {
      if (!this.getObjectLength(this.checkedGroups)) {
        growl.warning($rootScope.trans("No_Contact_Selected"));
        return;
      }
      this.exportUrlLoader = true;
      var scope = this;
      Restangular.one("data/download-token")
        .get()
        .then(function(data) {
          scope.exportUrlLoader = false;
          scope.groupsMoreDropdown = false;
          var token = data.resource.token;
          var locale = $rootScope.currentLanguage;
          var params = JSON.stringify(scope.checkedGroups);
          var url =
            "/address-book/export-contacts?" +
            "group_or_contact=" +
            "group" +
            "&selected_ids=" +
            params +
            "&locale=" +
            locale +
            "&token=" +
            token;
          window.location.href = url;
        });
    };

    PhoneBookData.prototype.mergeGroups = function() {
      if (!this.getObjectLength(this.checkedGroups)) {
        growl.info($rootScope.trans("No_group_selected"));
        return;
      } else if (this.getObjectLength(this.checkedGroups) <= 1) {
        growl.info($rootScope.trans("Select_more_than_one_group"));
        return;
      }
      this.mergeGroupsLoader = true;
      var postData = { name: "New name", ids: this.checkedGroups };
      $rootScope.disableButton();
      var scope = this;
      Restangular.all("address-book/merge-groups")
        .post(postData)
        .then(function(data) {
          scope.groupsMoreDropdown = false;
          scope.mergeGroupsLoader = true;
          scope.reloadGroups({});
        });
    };

    PhoneBookData.prototype.reloadGroups = function(params, type) {
      $rootScope.disableButton();
      var scope = this;
      params.fromCompose = true;
      params.per_page = 14;
      if (type === "delete") {
        params.page = 0;
        scope.aPage = 0;
      }
      Restangular.one("address-book/index-groups")
        .get(params)
        .then(function(data) {
          $rootScope.enabledButton();
          if (type) {
            scope.updateGroups(data, type);
          } else {
            scope.updateGroups(data);
          }
        });
    };

    PhoneBookData.prototype.changePage = function(page) {
      this.tableSpinnerLoading = true;
      if (page < 0) {
        return;
      }
      var postData = this.filterOrAddData;
      postData.page = page;
      //scope.checkedGroups = {};
      this.reloadGroups(postData);
    };

    PhoneBookData.prototype.removeGroups = function(paramData) {
      var postData = paramData ? paramData : JSON.stringify(this.checkedGroups);
      $rootScope.disableButton();
      var requestData = { group_ids: postData };
      var scope = this;
      var deleteUrl = "address-book/remove-groups";

      if (this.isAllSelected) {
        requestData = this.filterOrAddContactData;
        deleteUrl = "address-book/remove-groups-searched";
      }
      Restangular.all(deleteUrl)
        .remove(requestData)
        .then(function(data) {
          $rootScope.enabledButton();
          if (data.resource.error.no === 0) {
            scope.removingGroupsLoader = false;
            scope.groupsMoreDropdown = false;
            // scope.changePage(0);
            scope.isAllSelected = false;
            scope.groupsData.groups.forEach(function(item) {
              scope.checkedGroups[item._id] = false;
            });
            var postData = {};
            postData.page = 0;
            scope.reloadGroups(postData, "delete");
          } else if (data.resource.error.no === -1) {
            growl.error($rootScope.trans("contacts_used_and_cant_be_removed"));
            scope.removingGroupsLoader = false;
          } else {
            scope.removingGroupsLoader = false;
          }
        });
    };

    PhoneBookData.prototype.removeSelected = function() {
      var scope = this;
      if (!this.getObjectLength(this.checkedGroups) && !this.isAllSelected) {
        growl.warning($rootScope.trans("No_Contact_Selected"));
        return;
      }
      if (this.checkInObject(this.checkedGroups, "all")) {
        ConfirmDeleteModal().then(function() {
          scope.removeGroups(scope.checkedGroups);
        });
      } else {
        this.removingGroupsLoader = true;
        scope.removeGroups(this.checkedGroups);
      }
    };

    PhoneBookData.prototype.socketPromise = function() {
      var scope = this;
      return new Promise(function(resolve) {
        Restangular.one("address-book/index-groups")
          .get(scope.filterOrAddContactData)
          .then(function(res) {
            scope.groupsData.allContactsCount = res.resource.allContactsCount;
            scope.groupsData.allGroupsCount = res.resource.allGroupsCount;
            scope.groupsData.count = res.resource.count;
            scope.groupsData.lastAddedContactDate =
              res.resource.lastAddedContactDate;
            scope.groupsData.page = res.resource.page;
            scope.total = res.resource.count;
            resolve(res.resource.groups);
          });
      });
    };

    PhoneBookData.prototype.updateGroups = function(groups, type) {
      var res = groups.resource;
      var scope = this;
      this.groupsData.allContactsCount = res.allContactsCount;
      this.groupsData.allGroupsCount = res.allGroupsCount;
      this.groupsData.count = res.count;
      this.groupsData.lastAddedContactDate = res.lastAddedContactDate;
      this.groupsData.page = res.page;
      this.total = res.count;
      if (type === "search" || type === "delete") {
        // if (res.groups.length) {
        scope.groupsData.groups = res.groups;
        // }
        scope.showMoreLoader = false;
        scope.tableSpinnerLoading = false;
        scope.isDone = false;
      } else if (type === "socket") {
        scope.tableSpinnerLoading = true;
        scope.showMoreLoader = false;
        // scope.filterOrAddContactData.order_field = scope.orderField;
        // scope.filterOrAddContactData.order = scope.currentOrder;
        for (var i = 0; i <= scope.aPage; i++) {
          scope.filterOrAddContactData.page = i;
          scope.socketArr.push(scope.socketPromise());
        }
        Promise.all(scope.socketArr).then(function(result) {
          var tempResult = [];
          result.forEach(function(pageData) {
            tempResult = tempResult.concat(pageData);
          });
          scope.groupsData.groups = tempResult;
          scope.showMoreLoader = false;
          scope.isDone = false;
          scope.tableSpinnerLoading = false;
        });
      } else {
        res.groups.forEach(function(item) {
          scope.groupsData.groups.push(item);
        });
        scope.showMoreLoader = false;
        this.tableSpinnerLoading = false;
        this.isDone = false;
      }
    };

    PhoneBookData.prototype.filterContacts = function() {
      this.tableSpinnerLoading = true;
      var postData = this.filterOrAddContactData;
      postData.page = 0;
      this.aPage = 0;
      this.showEverything = true;
      $rootScope.showEverything = true;
      this.showSearchVal = true;
      this.searchVal = this.filterOrAddContactData.name;
      this.search_in_groups = 0;
      postData.search_in_groups = 0;
      this.reloadGroups(postData, "search");
    };

    PhoneBookData.prototype.goToGroupPage = function($event, group) {
      if (this.tableRowDisable) return;
      var id = group._id;
      if (
        !group.contact_count.length ||
        !group.contact_count[0].count ||
        group.in_progress
      ) {
        return;
      }
      var tag = $event.target.nodeName.toLowerCase();
      if (tag !== "input" && tag !== "label") {
        $state.go("addressbook.contacts", { group_id: id });
      }
    };

    PhoneBookData.prototype.changeOrder = function(field) {
      this.tableSpinnerLoading = true;
      this.showArrowByField = field;
      var postData = this.filterOrAddData;
      if (field == postData.order_field) {
        this.currentOrder = this.currentOrder == "ASC" ? "DESC" : "ASC";
        this.orderField = field;
      }
      postData.order_field = field;
      postData.order = this.currentOrder;
      postData.page = 0;
      this.aPage = 0;
      postData.per_page = 14;
      this.orderData = postData;
      this.reloadGroups(postData, "search");
    };

    PhoneBookData.prototype.eventListeners = function() {
      var scope = this;
      document.addEventListener("keydown", function(e) {
        var keyCode = e.keyCode;
        if (keyCode === 13) {
          var activeFilterSearchBoxId = document.activeElement.id
            ? document.activeElement.id
            : "";
          if (activeFilterSearchBoxId.trim() === "filter-search-box") {
            scope.filterContacts();
          }
        }
      });

      $rootScope.$watch(
        "currentUser",
        function(currentUser) {
          if (currentUser.notifications) {
            currentUser.notifications.forEach(function(item) {
              if (item.other_data === "update_groups_data") {
                scope.reloadGroups({});
              }
            });
          }
        },
        1
      );
    };

    PhoneBookData.prototype.toggleSearch = function() {
      this.showSearch && $rootScope.importantShowSearch
        ? this.filterContacts()
        : (this.showSearch = true);
      var inp = document.querySelector("input[name=addressbook-group-filter]");
      $timeout(function() {
        inp.focus();
      }, 1000);
    };

    PhoneBookData.prototype.enterPress = function(key) {
      // if (key.which === 27)
      key.which === 13 ? this.filterContacts() : null;
    };

    PhoneBookData.prototype.clearSearch = function() {
      this.filterOrAddContactData.name = "";
      this.searchVal = "";
      this.aPage = 0;
      this.search_in_groups = 0;
      this.filterContacts();
      this.showSearchVal = false;
      this.showEverything = false;
      $rootScope.showEverything = false;
    };

    // Fetch more items
    PhoneBookData.prototype.getMore = function() {
      var scope = this;
      if (
        scope.groupsData.count == scope.groupsData.groups.length ||
        scope.groupsData.count < scope.groupsData.groups.length ||
        scope.tableSpinnerLoading
      ) {
        scope.showMoreLoader = false;
        return;
      }
      this.aPage++;
      this.filterOrAddContactData.page = this.aPage;
      if (this.orderData) {
        this.filterOrAddContactData = scope.orderData;
        this.filterOrAddContactData.page = scope.aPage;
      }
      this.filterOrAddContactData.search_in_groups = this.search_in_groups;
      this.filterOrAddContactData.per_page = 14;
      Restangular.one("address-book/index-groups")
        .get(this.filterOrAddContactData)
        .then(function(data) {
          scope.updateGroups(data);
        });
    };

    PhoneBookData.prototype.tableInit = function() {
      if (this.inited) {
        return;
      }
      this.inited = true;
      $rootScope.showEverything = false;
      var scope = this;
      var elem = angular.element(
        document.getElementById("myTable").tBodies[0]
      )[0];
      elem.addEventListener("scroll", function(event) {
        if (this.isDone) {
          return;
        }
        if (
          Math.ceil(elem.scrollTop) + elem.clientHeight == elem.scrollHeight &&
          !scope.tableSpinnerLoading
        ) {
          scope.isDone = true;
          scope.showMoreLoader = true;
          scope.getMore();
        }
      });
    };

    PhoneBookData.prototype.choiceOrRemove = function(object, key) {
      var scope = this;
      if (this.tableRowDisable) return;
      if (this.checkInObject(object, key)) {
        object[key] = false;
      } else {
        object[key] = true;
      }
      var checkedGroupsArr = Object.values(this.checkedGroups);
      if (checkedGroupsArr.length) {
        checkedGroupsArr.some(function(item) {
          if (item) {
            scope.groupsMoreDropdownToggle = true;
            return item;
          } else {
            scope.groupsMoreDropdownToggle = false;
          }
        });
      } else {
        scope.groupsMoreDropdownToggle = false;
      }
    };

    PhoneBookData.prototype.selectCurrentGroup = function() {
      this.isCurrentSelected = !this.isCurrentSelected;
      this.checkedGroups = {};
      var scope = this;
      this.groupsData.groups.forEach(function(item) {
        scope.checkedGroups[item._id] = scope.isCurrentSelected;
      });
      var checkedGroupsArr = Object.values(scope.checkedGroups);
      if (checkedGroupsArr.length) {
        checkedGroupsArr.some(function(item) {
          if (item) {
            scope.groupsMoreDropdownToggle = true;
            return item;
          } else {
            scope.groupsMoreDropdownToggle = false;
          }
        });
      } else {
        scope.groupsMoreDropdownToggle = false;
      }
    };

    PhoneBookData.prototype.selectSearchedGroups = function() {
      var scope = this;
      this.isAllSelected = this.isAllSelected ? false : true;
      this.groupsData.groups.forEach(function(item) {
        scope.checkedGroups[item._id] = scope.isAllSelected;
      });
      var checkedGroupsArr = Object.values(scope.checkedGroups);
      if (checkedGroupsArr.length) {
        checkedGroupsArr.some(function(item) {
          if (item) {
            scope.groupsMoreDropdownToggle = true;
            return item;
          } else {
            scope.groupsMoreDropdownToggle = false;
          }
        });
      } else {
        scope.groupsMoreDropdownToggle = false;
      }
    };

    PhoneBookData.prototype.scrollDown = function() {
      var elem = angular.element("#wrapper")[0];
      angular.element("#wrapper").animate(
        {
          scrollTop: elem.scrollHeight
        },
        800,
        function() {}
      );
    };

    PhoneBookData.prototype.searchInstead = function() {
      var scope = this;
      this.tableSpinnerLoading = true;
      if (scope.enableSearchInGroups) {
        scope.enableSearchInGroups = false;
        scope.clearSearch();
      } else {
        scope.enableSearchInGroups = true;
        scope.search_in_groups = 1;
        var postData = scope.filterOrAddContactData;
        postData.page = 0;
        postData.search_in_groups = scope.search_in_groups;
        scope.aPage = 0;
        scope.reloadGroups(postData, "search");
      }
    };

    PhoneBookData.prototype.showGroupNameInput = function(group) {
      this.newGroupName = group.name;
      this.groupsData.groups.forEach(function(group) {
        group.showInput = false;
      });
      if (group.showInput) {
        group.showInput = false;
      } else {
        group.showInput = true;
      }
    };

    PhoneBookData.prototype.renameGroup = function(group) {
      // request
      group.showInput = false;
      if (this.newGroupName.length) {
        group.name = this.newGroupName;
        console.log(this.newGroupName);
      }
    };

    return PhoneBookData;
  });
