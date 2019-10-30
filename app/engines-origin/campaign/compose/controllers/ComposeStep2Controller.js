angular.module("callburnApp").controller("ComposeStep2Controller", [
  "$scope",
  "$rootScope",
  "$q",
  "Restangular",
  "notify",
  "FileUploader",
  "$stateParams",
  "CampaignComposeService",
  "CampingService",
  "$timeout",
  "growl",
  "ContactsService",
  "GroupsService",
  "$interval",
  function(
    $scope,
    $rootScope,
    $q,
    Restangular,
    notify,
    FileUploader,
    $stateParams,
    CampaignComposeService,
    CampingService,
    $timeout,
    growl,
    ContactsService,
    GroupsService,
    $interval
  ) {
    CampaignComposeService.campaignData.currentTab = "groups";
    $rootScope.currentTab = "groups";
    $scope.CampaignComposeService = CampaignComposeService;
    $rootScope.tutorialSidePopup = false;

    window.currentUrlHash = window.location.hash.indexOf("compose");

    $scope.filteredData = {};
    $scope.filtereGroupdData = {};
    CampaignComposeService.canGoToStep3 = false;
    $rootScope.checkedGroups = {};
    $scope.checkedGroupsName = {};
    $scope.activeTab = 1;
    $scope.disableManually = false;
    $scope.addNumbersManually = {};
    $scope.tagPhonenumbers = [];
    $scope.invalidPhoneNumbers = [];
    $scope.contactsPassingValidation = false;
    $scope.showCurrentGroupContacts = false;
    $scope.showContactsOfGroup = false;
    $scope.copyPasteContacts = false;
    $scope.showGroupsSpinner = false;
    $scope.manuallyPhonenumbersCount = 0;
    var canGoToStep3From = {};
    $scope.percent = 0;
    CampaignComposeService.finalStepData.recipientsCounterLoader = false;

    $scope.checkInArray = function(array, id) {
      return array.indexOf(id) > -1 ? true : false;
    };

    var applyTranslations = function() {
      $scope.isLoaded = false;
      setTimeout(function() {
        $scope.isLoaded = true;
      }, 100);
      $scope.tagPlacholdersText = $rootScope.trans("add_phonenumber");
    };

    $rootScope.$watch("isLangLoaded", applyTranslations);

    /**
     * check step 3 and go to step 3
     */

    var checkRecipentObject = function(object) {
      if (!object) {
        return false;
      }
      if (!Object.keys(object).length) {
        return false;
      }

      for (index in object) {
        if (object[index]) {
          return true;
        }
      }
      return false;
    };

    var finalValidationForStep3 = function(data) {
      CampaignComposeService.fileNotExist = false;
      $scope.contactsPassingValidation = false;
      CampaignComposeService.finalStepData.maxCost =
        data.resource.max_cost + data.resource.max_gift_cost;
      CampaignComposeService.finalStepData.sendingTime =
        data.resource.sending_time;
      CampaignComposeService.campaignData.max_cost = data.resource.max_cost;
      CampaignComposeService.finalStepData.maxCostWithSms =
        data.resource.max_cost_with_sms;
      CampaignComposeService.campaignData.max_gift_cost =
        data.resource.max_gift_cost;
      if (
        $rootScope.selectedType == "sms" ||
        $rootScope.selectedType == "vmSms"
      ) {
        if (
          data.resource.sms_not_supported > 0 &&
          data.resource.sms_not_supported ==
            CampaignComposeService.finalStepData.numbersCount
        ) {
          CampaignComposeService.finalStepData.maxCostWithSms = 0;
          CampaignComposeService.finalStepData.maxCost = 0;
        } else if (
          data.resource.sms_not_supported > 0 &&
          data.resource.sms_not_supported !=
            CampaignComposeService.finalStepData.numbersCount
        ) {
          growl.info(
            data.resource.sms_not_supported +
              " " +
              $rootScope.trans("not_supported_contacts")
          );
        }
      }

      if (CampaignComposeService.campaignData.currentTab === "groups") {
        CampaignComposeService.finalStepData.numbersCount =
          data.resource.recipients_count;
      } else if (data.resource.phonenumbers) {
        CampaignComposeService.finalStepData.numbersCount =
          data.resource.phonenumbers.length;
        CampaignComposeService.campaignData.phonenumbers =
          data.resource.phonenumbers;
      }

      $rootScope.stopLoader();

      if (
        (CampaignComposeService.campaignData.currentTab === "groups" &&
          data.resource.recipients_count == 0) ||
        (CampaignComposeService.campaignData.currentTab !== "groups" &&
          data.resource.phonenumbers &&
          data.resource.phonenumbers.length == 0)
      ) {
        CampaignComposeService.composeStep3 = false;
        canGoToStep3From[
          CampaignComposeService.campaignData.currentTab
        ] = false;
      } else {
        CampaignComposeService.composeStep3 = true;
        canGoToStep3From[CampaignComposeService.campaignData.currentTab] = true;
      }

      CampaignComposeService.finalStepData.numbersCount =
        "recipients_count" in data.resource
          ? data.resource.recipients_count
          : data.resource.phonenumbers.length;
      CampaignComposeService.finalStepData.recipientsCounterLoader = false;
    };

    var abortRequest;
    $rootScope.postData = {};
    $rootScope.dataForCostCalculation = {};
    $rootScope.goToStep3 = function() {
      if (abortRequest) abortRequest.resolve();
      abortRequest = $q.defer();
      // if (
      //   checkRecipentObject($scope.manuallyAddedNumbers) ||
      //   checkRecipentObject($scope.checkedContacts) ||
      //   checkRecipentObject($rootScope.checkedGroups)
      // ) {
      //   CampaignComposeService.hasResipent = true;
      // } else {
      //   CampaignComposeService.hasResipent = false;
      // }

      CampaignComposeService.composeStep3 = false;
      CampaignComposeService.finalStepData.recipientsGroupNames = false;

      switch (CampaignComposeService.campaignData.currentTab || $rootScope.currentTab) {
        case "manually":
          $scope.recipientsActiveTab = 2;
          $rootScope.postData = [];
          for (index in $scope.manuallyAddedNumbers) {
            if ($scope.manuallyAddedNumbers[index].phone_no) {
              $rootScope.postData.push(
                $scope.manuallyAddedNumbers[index].phone_no
              );
            } else if ($scope.manuallyAddedNumbers[index].number) {
              $rootScope.postData.push(
                "+" + $scope.manuallyAddedNumbers[index].number
              );
            }
          }
          break;
        case "contacts":
          $rootScope.postData = $scope.checkedContacts;
          break;
        case "groups":
          $scope.recipientsActiveTab = 1;
          $rootScope.postData = $rootScope.checkedGroups;
          if ($rootScope.checkedGroups["all"]) {
            CampaignComposeService.campaignData.all_contacts = true;
          } else {
            CampaignComposeService.campaignData.all_contacts = false;
          }
          CampaignComposeService.campaignData.selected_groups =
            $rootScope.checkedGroups;

          var groupsToCheck = [];
          for (index in $rootScope.checkedGroups) {
            if ($rootScope.checkedGroups[index]) {
              for (groupIndex in $scope.groups) {
                if ($scope.groups[groupIndex]._id === index) {
                  groupsToCheck.push($scope.groups[groupIndex]);
                }
              }
            }
          }
          if (groupsToCheck.length > 1) {
            CampaignComposeService.finalStepData.recipientsGroupNames =
              groupsToCheck.length +
              " " +
              $rootScope.trans(
                "campaign_compose_compose_step_3_recipients_groups"
              ) +
              " - ";
          } else if (groupsToCheck[0]) {
            CampaignComposeService.finalStepData.recipientsGroupNames =
              groupsToCheck[0].name + " - ";
          }
          break;
        default:
          break;
      }

      var keyWord = "groups";
      if (
        CampaignComposeService.campaignData.currentTab === "groups" ||
        CampaignComposeService.campaignData.currentTab === "manually"
      ) {
        keyWord = CampaignComposeService.campaignData.currentTab;
      }

      // if (CampaignComposeService.campaignData.currentTab) {
        $rootScope.dataForCostCalculation = {
          file_id: CampaignComposeService.campaignData.campaign_voice_file_id,
          data: $rootScope.postData,
          all_contacts: CampaignComposeService.campaignData.all_contacts,
          type: CampaignComposeService.campaignData.type,
          sms_text: CampaignComposeService.campaignData.sms_text
        };
      // }

      Restangular.all("phonenumbers/add-numbers-and-calculate-cost-" + keyWord)
        .withHttpConfig({ timeout: abortRequest.promise })
        .post($rootScope.dataForCostCalculation)
        .then(function(data) {
          if (data.resource.error.no === 0 && data.resource.max_cost === 0) {
            keyWord = "manually";
            if (
              CampaignComposeService.campaignData.currentTab == "groups" ||
              CampaignComposeService.campaignData.currentTab == "manually"
            ) {
              keyWord = CampaignComposeService.campaignData.currentTab;
            }
            Restangular.all(
              "phonenumbers/add-numbers-and-calculate-cost-" + keyWord
            )
              .withHttpConfig({ timeout: abortRequest.promise })
              .post($rootScope.dataForCostCalculation)
              .then(function(secondRequestData) {
                finalValidationForStep3(secondRequestData);
              });
          } else {
            finalValidationForStep3(data);
          }
        });
    };

    var setPhonemumbers = function(phonenumbers) {
      CampaignComposeService.campaignData.currentTab = "manually";
      $scope.manuallyAddedNumbers = phonenumbers;
      phonenumbers.forEach(function(item) {
        var tag = {
          text: item.phone_no,
          success: true
        };
        $scope.tagPhonenumbers.push(tag);
      });
    };

    if (CampaignComposeService.editingCampaign) {
      if (CampaignComposeService.editingCampaign.phonenumbers.length) {
        var phonenumbers = CampaignComposeService.editingCampaign.phonenumbers.slice();
        // phonenumbers.forEach(function(item, i, array) {
        //   array[i].phone_no = "+" + array[i].phone_no;
        // });
        // setPhonemumbers(CampaignComposeService.editingCampaign.phonenumbers);
      } else if (
        CampaignComposeService.editingCampaign.should_use_all_contacts
      ) {
        CampaignComposeService.campaignData.currentTab = "groups";
        $rootScope.currentTab = "groups";
        $rootScope.checkedGroups["all"] = true;
        $rootScope.goToStep3();
      } else if (CampaignComposeService.editingCampaign.groups.length) {
        CampaignComposeService.campaignData.currentTab = "groups";
        $rootScope.currentTab = "groups";
        CampaignComposeService.editingCampaign.groups.forEach(function(item) {
          $rootScope.checkedGroups[item._id] = true;
        });
      }
      $rootScope.goToStep3();
    } else if (CampaignComposeService.reusingCampaign) {
      if (
        CampaignComposeService.reusingCampaign.phonenumbers.length &&
        !CampaignComposeService.reusingCampaign.groups.length
      ) {
        // var phonenumbers = CampaignComposeService.reusingCampaign.phonenumbers.slice();
        // phonenumbers.forEach(function(item, i, array) {
        //   array[i].phone_no = "+" + array[i].phone_no;
        // });
        // setPhonemumbers(CampaignComposeService.reusingCampaign.phonenumbers);
      } else if (
        CampaignComposeService.reusingCampaign.should_use_all_contacts
      ) {
        CampaignComposeService.campaignData.currentTab = "groups";
        $rootScope.currentTab = "groups";
        $rootScope.checkedGroups["all"] = true;
        $rootScope.goToStep3();
      } else if (CampaignComposeService.reusingCampaign.groups.length) {
        CampaignComposeService.campaignData.currentTab = "groups";
        $rootScope.currentTab = "groups";
        CampaignComposeService.reusingCampaign.groups.forEach(function(item) {
          $rootScope.checkedGroups[item._id] = true;
        });
      }
      $rootScope.goToStep3();
    }

    /*
             |---------------------------------------------------------
             | Send Messages from Phonebook
             |---------------------------------------------------------
             | Here will go  logic for send messages
             |
             |
             */

    if ($stateParams.group_ids) {
      CampaignComposeService.campaignData.currentTab = "groups";
      $rootScope.currentTab = "groups";
      $rootScope.checkedGroups = $stateParams.group_ids;
      $rootScope.goToStep3();
    }

    if ($stateParams.contact_ids) {
      setPhonemumbers($stateParams.contact_ids);
      $rootScope.goToStep3();
    }

    if ($stateParams.reusing_source === "receipents") {
      if (CampaignComposeService.reusingCampaign.groups.length > 0) {
        CampaignComposeService.campaignData.currentTab = "groups";
        $rootScope.currentTab = "groups";
      } else {
        CampaignComposeService.campaignData.currentTab = "manually";
        $rootScope.currentTab = "manually";
      }
    }

    $scope.$watch(
      "CampaignComposeService.finalStepData.voiceFile",
      function(newValue) {
        $rootScope.goToStep3();
      },
      true
    );

    /*
             |---------------------------------------------------------
             | MANUALLY
             |---------------------------------------------------------
             | Here will go all logic for compose step 2 , when user
             | wants to manually add, or upload file as a source of numbers.
             |
             */

    var tagPhoneNumbersToString = function() {
      var final = "";

      $scope.tagPhonenumbers.forEach(function(item) {
        final += item.text + ",";
      });

      final = final
        .replace(/;/g, ",")
        .replace(/\r\n/g, ",")
        .replace(/\n/g, ",")
        .replace(/\r/g, ",")
        .replace(/-/g, ",");

      final = final.substring(0, final.length - 1);
      final = final.split(",");

      var stillHasSpaces = true;

      while (stillHasSpaces) {
        stillHasSpaces = false;
        for (var i = 0; i < final.length; i++) {
          if (final[i].length <= 5 && final[i + 1]) {
            final[i] += final[i + 1];
            final.splice(i + 1, 1);
            stillHasSpaces = true;
            break;
          }

          if (!parseInt(final[i])) {
            final.splice(i, 1);
          }
        }
      }

      return final;
    };

    $scope.removeAllManuallyPhonenumbers = function() {
      CampaignComposeService.campaignData.currentTab = "manually";
      $rootScope.currentTab = "manually";
      $scope.tagPhonenumbers = [];
      $rootScope.postData = {
        is_campaign_create: true,
        data: []
      };

      $scope.validatePhoneNumbers($rootScope.postData, false);
    };

    $scope.removeAllInvalidManuallyPhonenumbers = function() {
      var successes = [];
      $scope.tagPhonenumbers.forEach(function(number) {
        if (number.success) {
          successes.push(number);
        }
      });

      $scope.tagPhonenumbers = successes;
    };

    var addAndValidatePhonenumbers = function(allPhonenumbers) {
      $rootScope.postData = {
        is_campaign_create: true,
        data: allPhonenumbers
      };

      $scope.validatePhoneNumbers($rootScope.postData, true);
    };

    var abortRequest;

    $scope.validatePhoneNumbers = function(postData, forAddPhonenumbers) {
      if (abortRequest) abortRequest.resolve();
      abortRequest = $q.defer();

      $scope.showManuallyAddedSpinner = true;

      postData["file_id"] =
        CampaignComposeService.campaignData.campaign_voice_file_id;
      postData["all_contacts"] =
        CampaignComposeService.campaignData.all_contacts;
      postData.type = CampaignComposeService.campaignData.type;
      postData.sms_text = CampaignComposeService.campaignData.sms_text;
      CampaignComposeService.campaignData.currentTab = "manually";
      $rootScope.currentTab = "manually";
      $scope.manuallyPhonenumbersCount = 0;
      CampingService.addNumbersAndCalculateCostManually(
        abortRequest,
        postData
      ).then(function(data) {
        var validatedPhoneNumbers = data.resource.statuses;

        if (data.resource.max_gift_cost > 0) {
          CampaignComposeService.campaignData.is_gift_being_used = true;
        } else {
          CampaignComposeService.campaignData.is_gift_being_used = false;
        }

        if (forAddPhonenumbers) {
          validatedPhoneNumbers.forEach(function(item) {
            var currentNum = item.number;
            var tag = {
              text: currentNum
            };

            if (item.status === "success") {
              $scope.manuallyPhonenumbersCount++;
              tag["success"] = true;
            } else {
              tag["success"] = false;
            }

            $scope.tagPhonenumbers.push(tag);
          });
        }

        $scope.manuallyAddedNumbers = validatedPhoneNumbers;
        $scope.manuallyPhonenumbersCount = $scope.manuallyAddedNumbers.length;

        $scope.showManuallyAddedSpinner = false;
        finalValidationForStep3(data);
      });
    };

    $scope.checkValidTag = function(tag) {
      return tag.success;
    };

    $scope.addNumbers = function(tag) {
      $scope.allPhonenumbers = tagPhoneNumbersToString();
      $scope.allPhonenumbersLength = $scope.allPhonenumbers.length;
      $scope.tagPhonenumbers = [];

      if ($scope.allPhonenumbers.length <= 500) {
        addAndValidatePhonenumbers($scope.allPhonenumbers);
        $scope.moreThen500 = false;
      } else {
        $scope.moreThen500 = true;
      }
    };

    $scope.removeNumbers = function(tag) {
      var index = $scope.invalidPhoneNumbers.indexOf(tag.text);

      if (index > -1) {
        $scope.invalidPhoneNumbers.splice(index, 1);
      }

      var allPhonenumbers = tagPhoneNumbersToString();

      $rootScope.postData = {
        is_campaign_create: true,
        data: allPhonenumbers
      };

      $scope.validatePhoneNumbers($rootScope.postData, false);
    };

    /*
             |---------------------------------------------------------
             | CONTACTS
             |---------------------------------------------------------
             | Here will go all logic for compose step 2 , when user
             | wants to use contacts as the source of the phonenumbers
             |
             */
    $scope.checkedContacts = {};

    var checkedUncheckContact = function(contactId) {
      $scope.checkedContacts[contactId] = $scope.checkedContacts[contactId]
        ? !$scope.checkedContacts[contactId]
        : true;
      $rootScope.goToStep3();
    };

    /*
             |---------------------------------------------------------
             | GROUPS
             |---------------------------------------------------------
             |
             | Here will go all logic for compose step 2 , when user
             | wants to use groups(s) as the source of the phonenumbers
             |
             */
    var checkedUncheckGroup = function(groupId) {
      if (!(groupId in $rootScope.checkedGroups)) {
        $rootScope.checkedGroups[groupId] = true;
        return;
      }
      $rootScope.checkedGroups[groupId] = !$rootScope.checkedGroups[groupId];

      $rootScope.goToStep3();
    };

    var checkUncheckAllGroups = function(groups) {
      for (index in groups) {
        if (groups[index]._id !== "all") {
          $rootScope.checkedGroups[groups[index]._id] = $rootScope
            .checkedGroups[groups[index]._id]
            ? !$rootScope.checkedGroups[groups[index]._id]
            : true;
        }
      }
      $rootScope.goToStep3();
    };

    var showMoreSelectBox = false;
    $scope.showGroupsTableLoader = true;
    new Promise(function(resolve, reject) {
      if (
        !CampaignComposeService.editingCampaign ||
        (CampaignComposeService.editingCampaign &&
          CampaignComposeService.editingCampaign.status == "saved")
      ) {
        return Restangular.one("address-book/index-groups")
          .get({ fromCompose: true })
          .then(function(data) {
            return resolve(data);
          })
          .catch(function(error) {
            return reject(error);
          });
      } else {
        return resolve(CampaignComposeService.tableData);
      }
    })
      .then(function(groupsResponse) {
        if (
          CampaignComposeService.editingCampaign &&
          !CampaignComposeService.tableData &&
          !CampaignComposeService.checkIfAlreadyStarted() &&
          CampaignComposeService.editingCampaign.status !== "saved"
        ) {
          $scope.activeTab = 2;
          $scope.disableManually = true;
        }
        $scope.phoneBookData = new GroupsService(
          groupsResponse,
          null,
          $rootScope.checkedGroups,
          showMoreSelectBox,
          false,
          CampaignComposeService.editingCampaign &&
            CampaignComposeService.checkIfAlreadyStarted()
        );
        // $rootScope.$broadcast('table-init');
        $rootScope.checkedGroups = $scope.phoneBookData.checkedGroups;
        $rootScope.phoneBookData = $scope.phoneBookData;
        $scope.showGroupsTableLoader = false;
        // if (! && !$stateParams.group_ids) {
        //    $rootScope.checkedGroups = {};
        // }
        // if ($stateParams.group_ids) {
        //     $scope.checkSelectedItem = function() {
        //         var objKeys = Object.keys($rootScope.checkedGroups);
        //         objKeys.forEach(function(j) {
        //             $scope.phoneBookData.groupsData.groups.forEach(function(item, i) {
        //                 console.log(j)
        //                 if(item._id === j) {
        //                     var index = $scope.phoneBookData.groupsData.groups.indexOf(item);
        //                     console.log(index);
        //                     var new_item = item;
        //                     $scope.phoneBookData.groupsData.groups.splice(index,1);
        //                     $scope.phoneBookData.groupsData.groups.unshift(new_item);
        //                 }
        //             })
        //         })
        //     }
        //     $scope.checkSelectedItem();
        // }
        if (!$scope.phoneBookData.groupsData.allContactsCount) {
          $scope.recipientsActiveTab = 2;
        }
        var checkedUncheckGroupName = function(name) {
          if (!(name in $scope.checkedGroupsName)) {
            $scope.checkedGroupsName[name] = true;
          } else {
            delete $scope.checkedGroupsName[name];
          }
          CampaignComposeService.campaignData.group_name = Object.keys(
            $scope.checkedGroupsName
          )[0];
        };
        $scope.phoneBookData.choiceOrRemove = function(object, key, name) {
          if (CampaignComposeService.editingCampaign && CampaignComposeService.editingCampaign.status != 'saved') return;
          CampaignComposeService.campaignData.currentTab = "groups";
          $rootScope.currentTab = "groups";
          checkedUncheckGroup(key);
          checkedUncheckGroupName(name);
          CampaignComposeService.finalStepData.recipientsCounterLoader = true;
          $rootScope.goToStep3();
          if (!$rootScope.step1Arrow) {
            $rootScope.step1Arrow = true;
            $rootScope.arrowHelper = true;
            // if ($rootScope.step1Arrow && !$rootScope.step2Arrow && !$rootScope.hideAllArrows) {
            //     angular.element('html, body').animate({
            //         scrollTop: angular.element('body').offset().top }, 800, function(){
            //     })
            // }
            if ($rootScope.step1Arrow && $rootScope.step2Arrow) {
              $rootScope.nextArrowHelper = true;
              $rootScope.step1Arrow = false;
              $rootScope.arrowHelper = false;
              $rootScope.nextArrow();
            }
          }
        };
        $scope.phoneBookData.goToGroupPage = function($event, group) {
          if (CampaignComposeService.editingCampaign) return;
          $scope.showGroupsSpinner = true;
          $rootScope.showWaitLightBox();
          var id = group._id;
          if (!group.contact_count[0].count) {
            return;
          }
          var tag = $event.target.nodeName.toLowerCase();
          if (tag !== "input" && tag !== "label") {
            var getData = {
              group_id: id
            };
            CampingService.getContacts(getData).then(function(data) {
              $scope.showCurrentGroupContacts = true;
              $scope.recipientsActiveTab = 1;
              $scope.contactsService = new ContactsService(
                data,
                false,
                CampaignComposeService.editingCampaign
              );
              CampaignComposeService.campaignData.currentTab = "contacts";
              $rootScope.currentTab = "contacts";
              $scope.showGroupsSpinner = false;
              $rootScope.hideWaitLightBox();
              if ($rootScope.checkedGroups[id]) {
                $scope.contactsService.selectAllContacts(true);
                $scope.contactsService.disableSelectAll = true;
              }
              $scope.contactsService.selectOrRemoveContact = function(
                selectedContacts,
                contact
              ) {
                ContactsService.prototype.selectOrRemoveContact.call(
                  this,
                  selectedContacts,
                  contact
                );
                checkedUncheckContact(contact._id);
              };
              $scope.contactsService.backToPhonebook = function() {
                CampaignComposeService.campaignData.currentTab = "groups";
                $rootScope.currentTab = "groups";
                $scope.checkedContacts = {};
                $scope.showCurrentGroupContacts = false;
                $rootScope.goToStep3();
              };
            });
          }
        };
      })
      .catch(function() {});

    $scope.qrUrl = "";
    $scope.loadingQr = true;
    Restangular.one("address-book/mobile-contacts")
      .get()
      .then(function(data) {
        if (data.resource.error.no === 0) {
          $scope.loadingQr = false;
          $scope.qrUrl =
            "https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=" +
            data.resource.token +
            "&choe=UTF-8";
        }
      });

    $scope.initTable = function() {
      setTimeout(function() {
        $rootScope.phoneBookData ? $rootScope.phoneBookData.tableInit() : null;
      }, 2000);
    };

    $scope.tableOverlay = true;
    $scope.hideTableOverlay = function() {
      $scope.tableOverlay = false;
    };
  }
]);
