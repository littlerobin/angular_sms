angular
  .module('callburnApp')
  .controller('ContactsImportController', [
    '$scope',
    '$rootScope',
    '$state',
    'Restangular',
    '$stateParams',
    'FileUploader',
    '$document',
    '$timeout',
    'groups',
    'groupsAll',
    'growl',
    '$location',
    '$anchorScroll',
    'CallBournModal',
    function(
      $scope,
      $rootScope,
      $state,
      Restangular,
      $stateParams,
      FileUploader,
      $document,
      $timeout,
      groups,
      groupsAll,
      growl,
      $location,
      $anchorScroll,
      CallBournModal
    ) {
      $scope.multiselectTrans = {
        buttonDefaultText: $rootScope.trans('group') + ':'
      };
      $rootScope.currentActiveUrl = $state.current.name;
      $scope.goToNotification = $rootScope.goToNotification;
      $rootScope.tutorialSidePopup = false;
      $rootScope.currentPage = 'dashboard';
      $rootScope.currentActiveRoute = 'addressbook';
      $scope.showErrorsFilter = false;
      $scope.import_step = 1;
      $scope.responsePhonenumbers = [];
      $scope.reviewDataContacts = [];
      $scope.formData = {
        selectDelimiter: 'automatic',
        selector: 'importSelect',
        selectGroup: false,
        selectedGroup: {},
        groupName: '',
        columns: [],
        text: '',
        ignoreFirstLine: false
      };
      $scope.contacts = [];
      $scope.contactsColumnsCount = 0;
      $scope.contactsTotal = 0;
      $scope.addedNumbers = {};
      $scope.addedNumbers.text = '';
      $scope.page = 0;
      $scope.pagesCount = 0;

      $scope.listingSkip = 0;
      $scope.uploadingImageName = '';
      $scope.selectedGroup = {};
      $scope.groups = groups.resource.groups;
      $scope.groupsAll = groupsAll.resource.groups;
      $scope.checkedContacts = {};
      $scope.isAllChecked = false;
      $scope.arrowHelper = true;
      $scope.nextArrowHelper = false;

      $scope.fileLoader = false;

      $scope.hideArrowHelper = function() {
        $scope.arrowHelper = false;
        $scope.nextArrowHelper = false;
      };
      $scope.nextArrow = function() {
        $scope.nextArrowHelper = true;
        angular.element('html, body').animate(
          {
            scrollTop: angular.element('#toNextStep').offset().top
          },
          800,
          function() {}
        );
      };
      $scope.formData.selectGroup = 'new_group';
      $scope.$watch('formData.selectGroup', function(newVal, oldVal) {
        if (oldVal == 'new_group') {
          $scope.formData.groupName = '';
        } else if (oldVal == 'selected_group') {
          $scope.formData.selectedGroup = {};
        }
      });
      $scope.selectManual = true;
      $scope.selectImport = false;

      $scope.currentStep = 1;

      $scope.exampleModel = {};
      $scope.tableModel = {};

      var applyTranslations = function() {
        $scope.isLoaded = false;
        setTimeout(function() {
          $scope.isLoaded = true;
        }, 100);
        $scope.columns = [
          { id: '', label: '--' },
          { id: 'name', label: $rootScope.trans('contacts_name') },
          { id: 'phone', label: $rootScope.trans('contacts_phonenumber') },
          { id: 'group', label: $rootScope.trans('contacts_group_name') }
        ];
      };

      $rootScope.$watch('currentLanguage', applyTranslations);
      $rootScope.$watch('isLangLoaded', applyTranslations);

      $scope.multiselectSettings = {
        enableSearch: true,
        showUncheckAll: false,
        showCheckAll: false,
        closeOnSelect: true,
        selectionLimit: 1,
        scrollableHeight: '150px',
        scrollable: true,
        styleActive: true,
        smartButtonMaxItems: 1,
        smartButtonTextConverter: function(itemText, originalItem) {
          return itemText;
        },
        buttonClasses: 'group_button'
      };

      $scope.tableTexts = {
        buttonDefaultText: '--'
      };

      $scope.tableSettings = {
        showUncheckAll: false,
        showCheckAll: false,
        selectionLimit: 1,
        closeOnSelect: true,
        styleActive: true,
        smartButtonMaxItems: 1,
        smartButtonTextConverter: function(itemText, originalItem) {
          return itemText;
        },
        buttonClasses: 'group_button'
      };

      window.document.title =
        $scope.notSeenNotificationsCount === 0
          ? 'Phonebook - ' + 'Callburn'
          : '(' + $scope.notSeenNotificationsCount + ') ' + 'Phonebook - ' + 'Callburn';

      $scope.backImportStep = function(step) {
        if (step !== 1) {
          $scope.currentStep -= 1;
        }
      };

      $scope.columnIndexes = [];

      $scope.toImportStep = function(step) {
        $scope.disableGroupsInStep3 = false;
        $scope.newGroupErr = false;
        $scope.selectGroupErr = false;
        $scope.chooseFile = false;
        if (step === 1) {
          if ($scope.contactsTotal == 0 || $scope.formData.text.length) {
            if ($scope.formData.text && $scope.formData.text.length) {
              Restangular.all('phonenumbers/text-phonenumbers')
                .post($scope.formData)
                .then(function(data) {
                  if (data.resource.error.no === 0) {
                    $scope.delimiter = data.resource.delimiter;
                    $scope.contacts = data.resource.rows;
                    $scope.contactsColumnsCount = data.resource.columnsCount;
                    $scope.contactsTotal = data.resource.total;
                    $scope.formData.columns = [];
                    $scope.formData.fileName = data.resource.fileName;
                    $scope.formData.originalFileName = data.resource.originalFileName;
                    $scope.range(0, $scope.contactsColumnsCount - 1).forEach(function(key) {
                      $scope.formData.columns[key] = { id: '' };
                    });
                    // if ($scope.contactsColumnsCount === 1) {
                    //     $scope.formData.columns[0] = {id: 'phone', name: $rootScope.trans('contacts_phonenumber')};
                    //     $scope.toImportStep(2);
                    //     $scope.finishedStep1 = true;
                    // } else {
                    $scope.finishedStep1 = true;
                    return ($scope.currentStep = 2);
                    // }
                  } else {
                    $scope.contacts = [];
                    $scope.formData.contacts = [];
                    $scope.contactsColumnsCount = 0;
                    $scope.contactsTotal = 0;
                    growl.error(trans(data.resource.error.text));
                  }
                });
            } else {
              growl.error($rootScope.trans('please_select_file_or_type_data_manually'));
              $scope.chooseFile = true;
            }
          } else {
            if ($scope.contactsColumnsCount === 1) {
              $scope.formData.columns[0] = { id: 'phone', name: $rootScope.trans('contacts_phonenumber') };
            }
            $scope.finishedStep1 = true;
            return ($scope.currentStep = 2);
          }
        } else if (step === 2) {
          var length = $scope.formData.columns.length;
          var selectedNumber = false;
          var selectedGroup = false;
          var selectedName = false;
          var duplicateSelected = false;
          $scope.columnIndexes = [];
          $scope.formData.columns.forEach(function(item, index) {
            if (item.id != '') {
              $scope.columnIndexes.push(index);
            }
            if (item.id == 'name') {
              $scope.formData.columns[index] = { id: 'name', name: $rootScope.trans('contacts_name') };
              if (selectedName) {
                growl.error($rootScope.trans('you_selected_name_column_many_times'));
                duplicateSelected = true;
              }
              selectedName = true;
            }
            if (item.id == 'phone') {
              $scope.formData.columns[index] = { id: 'phone', name: $rootScope.trans('contacts_phonenumber') };
              if (selectedNumber) {
                growl.error($rootScope.trans('you_selected_a_phone_number_column_many_times'));
                duplicateSelected = true;
              }
              selectedNumber = true;
            }
            if (item.id == 'group') {
              $scope.disableGroupsInStep3 = true;
              $scope.formData.selectGroup = 'indicated_in_a_column';
              $scope.formData.columns[index] = { id: 'group', name: $rootScope.trans('contacts_group_name') };
              if (selectedGroup) {
                growl.error($rootScope.trans('you_selected_group_name_column_many_times'));
                duplicateSelected = true;
              }
              selectedGroup = true;
            }
          });
          if (!selectedNumber) {
            growl.error($rootScope.trans('you_have_not_selected_a_phone_number_column'));
          } else if ($scope.formData.selectGroup == 'indicated_in_a_column' && !selectedGroup) {
            growl.error($rootScope.trans('you_nee_to_select_group_name_column'));
          } else if (!duplicateSelected) {
            var postData = {
              ignoreFirstLine: $scope.formData.ignoreFirstLine,
              columns: $scope.formData.columns,
              contacts: $scope.contacts
            };

            var phoneIndex = null;
            var phonenumbersValid = true;
            if ($scope.formData.columns && $scope.formData.columns.length) {
              $scope.formData.columns.forEach(function(columnData, columnIndex) {
                if (columnData.id === 'phone') {
                  phoneIndex = columnIndex;
                }
              });
            }

            // if($scope.contacts && $scope.contacts.length && phoneIndex) {
            //     $scope.contacts.forEach(function(contactData) {
            //         var numberToCheck = +contactData[phoneIndex];
            //         if(!Number.isInteger(numberToCheck)) {
            //             phonenumbersValid = false;
            //             growl.error($rootScope.trans('phonenumber_must_contain_only_numbers'));
            //         }
            //     });
            // }
            if (phonenumbersValid) {
              Restangular.all('phonenumbers/validate-phone-numbers')
                .post(postData)
                .then(function(data) {
                  $scope.reviewDataContacts = data.resource.contacts;
                  $scope.reviewDataContacts.forEach(function(contact) {
                    if (contact.group) {
                      return;
                    } else {
                      $scope.disableInColumnChoice = true;
                    }
                  })
                });
              $scope.finishedStep2 = true;
              return ($scope.currentStep = 3);
            }
          }
        } else if (step == 3) {
          if ($scope.formData.selectGroup == 'selected_group' && !$scope.formData.selectedGroup.id) {
            growl.error($rootScope.trans('please_select_group'));
            $scope.selectGroupErr = true;
          } else if ($scope.formData.selectGroup == 'new_group' && $scope.formData.groupName == '') {
            growl.error($rootScope.trans('please_type_new_group_name'));
            $scope.newGroupErr = true;
          } else {
            $rootScope.disableButton();
            $rootScope.showFileLoader();
            $rootScope.showWaitLightBox();
            $scope.formData.delimiter = $scope.delimiter;
            Restangular.all('phonenumbers/upload-phonenumbers')
              .post($scope.formData)
              .then(function(data) {
                $rootScope.enabledButton();
                $rootScope.hideFileLoader();
                $rootScope.hideWaitLightBox();
                if ($scope.formData.originalFileName) {
                  growl.warning($rootScope.trans('your_request_is_been_processed_and_it_may_take_a_few_minute'));
                }
                $rootScope.inProgressFileData.id = data.resource.queue_job._id;
                $rootScope.inProgressFileData.name = data.resource.queue_job.original_file_name;

                $state.go('addressbook.groups', { group_id: data.resource.queue_job.group_id });
              });
          }
        }
      };

      $scope.isContactPossibleIndexes = function(index) {
        var possibleKeys = ['name', 'phone', 'group'];
        if (possibleKeys.indexOf(index) == -1) {
          return false;
        }
        return true;
      };

      $scope.selectImportSection = function() {
        $scope.selectManual = !$scope.selectManual;
        $scope.selectImport = !$scope.selectImport;
      };

      var addPlaceForGroup = function(isNeed) {
        for (index in $scope.responsePhonenumbers) {
          $scope.responsePhonenumbers[index].groups = [];
          if ($scope.responsePhonenumbers[index].group && isNeed) {
            $scope.responsePhonenumbers[index].groups.push($scope.responsePhonenumbers[index].group);
          }
        }
      };

      /*****FILE UPLOAD*****/
      /*file upload listeners*/
      $scope.dragInside = false;
      $scope.dragenter = 0;
      $(window).on('dragenter', function(e) {
        if (e.originalEvent.dataTransfer.types) {
          for (var i = 0; i < e.originalEvent.dataTransfer.types.length; i++) {
            if (e.originalEvent.dataTransfer.types[i] == 'Files') {
              $scope.dragenter++;
              var uploaderContainer = angular.element('#uploaderContainer');
              if ($scope.dragenter > 0) {
                $scope.dragInside = true;
                uploaderContainer.addClass('uploadArea');
              } else {
                $scope.dragInside = false;
                uploaderContainer.removeClass('uploadArea');
              }
            }
          }
        }
        e.preventDefault();
        e.stopPropagation();
      });
      $(window).on('dragleave', function(e) {
        $scope.dragenter--;
        if ($scope.dragenter > 0) {
          $scope.dragInside = true;
        } else {
          var uploaderContainer = angular.element('#uploaderContainer');
          uploaderContainer.removeClass('uploadArea');
          $scope.dragInside = false;
        }
        e.preventDefault();
        e.stopPropagation();
      });

      window.dropEvent = function(e) {
        var uploaderContainer = angular.element('#uploaderContainer');
        console.log('AAAASAQDAD');
        uploaderContainer.removeClass('uploadArea');
      };

      /**
       * open file select
       */
      $scope.openFileSelect = function() {
        $timeout(function() {
          angular.element('#hiddenNumbersFileInput').trigger('click');
        }, 100);
      };

      var numbersFileUpload = ($scope.numbersFileUpload = new FileUploader({
        url: '/phonenumbers/upload-phonenumbers-first-step',
        headers: { JWTAuthorization: 'Bearer ' + localStorage.getItem('jwtToken') },
        alias: 'file',
        autoUpload: true
      }));

      $scope.uploadingFileName = null;
      numbersFileUpload.onAfterAddingFile = function(item) {
        $scope.fileLoader = true;
        $scope.uploadingFileName = item.file.name;
      };

      numbersFileUpload.onSuccessItem = function(item, data, status, headers) {
        if (data.resource.error.no === 0) {
          $scope.delimiter = data.resource.delimiter;
          $scope.formData.text = '';
          $scope.contacts = data.resource.rows;
          $scope.contactsColumnsCount = data.resource.columnsCount;
          $scope.contactsTotal = data.resource.total;
          $scope.formData.columns = [];
          $scope.formData.fileName = data.resource.fileName;
          $scope.formData.originalFileName = data.resource.originalFileName;
          $scope.range(0, $scope.contactsColumnsCount - 1).forEach(function(key) {
            $scope.formData.columns[key] = { id: '' };
          });
          $scope.fileLoader = false;
          $scope.nextArrow();
        } else {
          $scope.contacts = [];
          $scope.formData.contacts = [];
          $scope.contactsColumnsCount = 0;
          $scope.contactsTotal = 0;
          growl.error(trans(data.resource.error.text));
        }
      };

      $scope.range = function(min, max, step) {
        step = step || 1;
        var input = [];
        for (var i = min; i <= max; i += step) {
          input.push(i);
        }
        return input;
      };

      numbersFileUpload.onErrorItem = function(item, response, status, headers) {
        $rootScope.enabledButton();
        $rootScope.hideFileLoader();
        $scope.uploadingImageName = false;
        $rootScope.hideWaitLightBox();
      };

      $scope.showErrors = function(data) {
        if (data) {
          $scope.responsePhonenumbers = [];
          for (var index in $scope.copyResponsePhonenumbers) {
            if ($scope.copyResponsePhonenumbers[index].status != 'success') {
              $scope.responsePhonenumbers.push($scope.copyResponsePhonenumbers[index]);
            }
          }
        } else {
          $scope.responsePhonenumbers = $scope.copyResponsePhonenumbers;
        }
      };

      $scope.startUpload = function() {
        $rootScope.disableButton();
        numbersFileUpload.uploadAll();
      };
      /////////////////////////////////////////////////////////////FIle Upload////////////////////////////////////

      $scope.currentPage = undefined;
      $scope.changePage = function(pageNumber) {
        if (pageNumber < 0 || pageNumber > $scope.pagesCount - 1) {
          return;
        }
        $scope.currentPage = pageNumber + 1;
        $scope.page = pageNumber;
        $scope.listingSkip = $scope.page * 30;
      };
      /**
       * add numbers from textarea
       */
      $scope.addNumbers = function(numbers, group) {
        if (numbers) {
          var postData = { phonenumbers: numbers, group: group ? group : undefined };
          $rootScope.disableButton();
          Restangular.all('phonenumbers/add-phonenumbers')
            .post(postData)
            .then(function(data) {
              $rootScope.enabledButton();
              $rootScope.stopLoader();
              if (data.resource.error.no == 0) {
                $location.hash('saveCancelBlok');
                $anchorScroll();
                $scope.numbersResponseData = data.resource;
                $scope.responsePhonenumbers = data.resource.phonenumbers;

                $scope.copyResponsePhonenumbers = data.resource.phonenumbers;
                addPlaceForGroup();
                $scope.import_step = 2;
                $scope.pagesCount = Math.ceil(data.resource.count / 10);
                growl.success(trans(data.resource.error.text));
                $scope.showUploadedContacts = true;
                $scope.addedNumbers.text = null;
              } else {
                growl.error(trans(data.resource.error.text));
              }
              $scope.responsePhonenumbers.forEach(function(item) {
                var groupName = item.group.name.split(' ');

                if (groupName[0] == 'created_on') {
                  item.group.name = item.group.name.replace('created_on', $rootScope.trans('created_on'));
                }
              });
            });
        } else {
          growl.error($rootScope.trans('Text_area_will_be_required'));
        }
      };

      $scope.cancelSaving = function() {
        /*if($stateParams.job_id){
                    Restangular.one('users/background-job', $stateParams.job_id).remove().then(function(){
                        console.log('yeah')
                    });
                }*/
        $state.go('addressbook.contacts');
      };

      $scope.getGroupName = function(group) {
        var namesArray = group.name.split('(');
        var standardPart = namesArray[0].trim();
        if (namesArray[1]) {
          var customPart = namesArray[1].replace(')', '');
          var translated = trans(standardPart);
          $scope.groupName = translated + ' (' + customPart + ')';
          return translated + ' (' + customPart + ')';
        }
        $scope.groupName = standardPart;
        return standardPart;
      };

      $scope.$watch('addedNumbers.text', function(newVal) {
        if (!newVal) {
          $scope.manualPhonenumbersCount = 0;
        }
      });

      /**
       * save imported contacts
       */
      $scope.saveImportedNumbers = function() {
        var newArray = new Array();
        var actual = $scope.checkedContacts;
        for (actIndex in actual) {
          if (actual[actIndex]) {
            newArray.push(actIndex);
          }
        }
        var sendingArrayData = [];
        if (newArray.length > 0) {
          for (index in newArray) {
            for (tempIndex in $scope.responsePhonenumbers) {
              if ($scope.responsePhonenumbers[tempIndex].number == newArray[index]) {
                sendingArrayData.push($scope.responsePhonenumbers[tempIndex]);
              }
            }
          }
        } else {
          sendingArrayData = $scope.responsePhonenumbers;
        }
        $rootScope.disableButton();
        $rootScope.showFileLoader();
        Restangular.all('address-book/import-contacts')
          .post({
            contacts_data: sendingArrayData,
            group_name: $scope.groupName ? $scope.groupName : null
            /*'job_id': $stateParams.job_id*/
          })
          .then(
            function(data) {
              $rootScope.enabledButton();
              $rootScope.stopModalLoader();
              if (data.resource.error.no == 0) {
                $state.go('addressbook.groups');
              }
              $rootScope.hideFileLoader();
              //$rootScope.updateAlerts();
            },
            function() {
              $rootScope.enabledButton();
              $rootScope.hideFileLoader();
              growl.error($rootScope.trans('contacts_cant_be_saved_try_later'));
            }
          );
      };

      $scope.calcPhonenumbers = function(text) {
        if (text) {
          $scope.manualPhonenumbersCount = text
            .replace(/\r\n/g, ',')
            .replace(/\n/g, ',')
            .replace(/\r/g, ',')
            .split(',').length;
        } else {
          $scope.manualPhonenumbersCount = 0;
        }
      };

      $scope.selectedMethod = 'fileUpload';
      $scope.selectMethod = function(type) {
        $scope.selectedMethod = type;
      };

      $scope.qrUrl = '';
      $scope.loadingQr = true;
      Restangular.one('address-book/mobile-contacts')
        .get()
        .then(function(data) {
          if (data.resource.error.no === 0) {
            $scope.loadingQr = false;
            $scope.qrUrl = 'https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=' + data.resource.token + '&choe=UTF-8';
          }
        });

      // $scope.checkInputNumber = function(e) {
      //     var a = [13,8,46,32,37,38,39,40];
      //     var k = e.which;

      //     for (i = 48; i < 58; i++)
      //         a.push(i);

      //     if (!(a.indexOf(k)>=0)) e.preventDefault();
      // }
    }
  ])
  .filter('notSelected', function() {
    return function(input, scope, number) {
      for (index in scope.responsePhonenumbers) {
        if (scope.responsePhonenumbers[index].number == number) {
          var groups = scope.responsePhonenumbers[index].groups;
        }
      }
      var out = [];
      angular.forEach(input, function(group) {
        var needToAdd = true;
        for (index in groups) {
          if (groups[index].id == group._id) {
            needToAdd = false;
            break;
          }
        }
        if (needToAdd) {
          out.push(group);
        }
      });
      return out;
    };
  });
