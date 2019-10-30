"use strict";
angular.module("callburnApp").controller("TemplatesController", [
  "$scope",
  "$rootScope",
  "$state",
  "Restangular",
  "$stateParams",
  "audioFiles",
  "$sce",
  "TemplateService",
  "CallBournModal",
  "FileUploader",
  "$timeout",
  "growl",
  "ttsLanguages",
  "IconsControl",
  "$q",
  "$interval",
  function(
    $scope,
    $rootScope,
    $state,
    Restangular,
    $stateParams,
    audioFiles,
    $sce,
    TemplateService,
    CallBournModal,
    FileUploader,
    $timeout,
    growl,
    ttsLanguages,
    IconsControl,
    $q,
    $interval
  ) {
    ///////////////////////////////////////////////////////// variables////////////////////////////////////
    $rootScope.fileUploader = FileUploader;
    $scope.availableTts = {
      "Alice-ML": true,
      "Anna-ML": true,
      Daniel: true,
      Ellen: true,
      Empar: true,
      Joana: true,
      Jordi: true,
      Lekha: true,
      Milena: true,
      Monica: true,
      Paulina: true,
      Samantha: true,
      Satu: true,
      Tarik: true,
      Thomas: true,
      Zosia: true
    };

    $rootScope.showTutorial = false;
    $scope.IconsControl = IconsControl;
    $scope.currentAudioId = null;
    $rootScope.currentPage = "dashboard";
    $rootScope.currentActiveUrl = $state.current.name;
    $rootScope.currentActiveRoute = "templates";
    $scope.goToNotification = $rootScope.goToNotification;
    $scope.filterData = {
      type: "all",
      order_field: "updated_at",
      order: "DESC"
    };
    $scope.checkedTemplates = {};
    $scope.isAllChecked = false;
    $scope.tableSpinnerLoading = true;
    $scope.showFilesInput = [];
    $scope.audioFilePlayPause = {};
    $scope.showInput = {};
    $scope.orderField = null;
    $scope.currentOrder = "ASC";
    $scope.filterData.checkbox = [];
    $scope.ttsLanguages = ttsLanguages.resource.languages;
    $scope.ttsLanguages.forEach(function(item) {
      item.selectView = item.languageName + "-" + item.ttsEngine;
    });
    $scope.chosedInteractions = [];

    $scope.checkEnter = function($event, id, name, template) {
      var keyCode = $event.which || $event.keyCode;
      if (keyCode === 13) {
        $scope.changeName(id, name, template);
      }
    };

    window.document.title =
      $scope.notSeenNotificationsCount === 0
        ? "Messages - " + "Callburn"
        : "(" +
          $scope.notSeenNotificationsCount +
          ") " +
          "Messages - " +
          "Callburn";

    $scope.filterData.checkbox.all = false;

    var applyTranslations = function() {
      $scope.isLoaded = false;
      setTimeout(function() {
        $scope.isLoaded = true;
      }, 100);
      $scope.multiselectOptionsTemplateOverviewData = [
        {
          id: "UPLOADED",
          label: trans("campaign_template_index_file_upload")
        },
        {
          id: "TTS",
          label: trans("campaign_template_index_tts_generated")
        },
        {
          id: "SMS",
          label: "SMS"
        }
      ];

      $scope.multiselectTemplatesTranslationTexts = {
        dynamicButtonTextSuffix: trans("multi_checked"),
        checkAll: trans("multi_check_all"),
        uncheckAll: trans("multi_uncheck_all")
      };

      var ttsEnginesNames = { en: "Kate", it: "Alice-ML", es: "Monica" };
      $scope.ttsEngineIndicated = ttsEnginesNames[$rootScope.currentLanguage];
    };

    $rootScope.$watch("currentLanguage", applyTranslations);
    $rootScope.$watch("isLangLoaded", applyTranslations);

    ///////////////////////////////////////////////////////// variables////////////////////////////////////
    /**
     * update templates and get updated
     * @param templates
     */
    var updateTemplates = function(templates) {
      $scope.isTemplatesExist =
        templates.resource.total_templates_count > 0 ? true : false;
      $scope.templates = templates.resource.files;
      for (var i = 0; i <= $scope.templates.length; i++) {
        $scope.audioFilePlayPause[i] = false;
      }

      $scope.total = templates.resource.count;
      $scope.templatesPage = templates.resource.page;
      $scope.templatesCount = templates.resource.count;
      $scope.templatesPagesCount = Math.ceil(templates.resource.count / 10);
      $scope.templatesPerPage = 10;
      $scope.tableSpinnerLoading = false;
    };

    /**
     * loading data
     */
    var index = function() {
      updateTemplates(audioFiles);
      //$stateParams.tab = 3;
    };
    //initialize data loading
    index();
    //console.log('audioFiles', audioFiles)
    $scope.isTemplatesExist =
      audioFiles.resource.total_templates_count > 0 ? true : false;

    /**
     * return audio file src
     * @param src
     * @returns {*}
     */
    $scope.getAudioSource = function(audioTemplate) {
      return $sce.trustAsResourceUrl(audioTemplate.amazon_s3_url);
    };

    var stopAllAudios = function() {
      var q = $q.defer();
      //document.getElementById("AudioTemplateFile").pause();
      //$scope.isRecordedFilePlaying = false;
      $scope.templates.forEach(function(template, i, templates) {
        templates[i].playPauseIconClass = "fa-play-circle";
        q.resolve();
      });
      return q.promise;
    };

    var playPauseAudio = function(template) {
      var audio = document.getElementById("AudioTemplateFile");
      if ($scope.isRecordedFilePlaying) {
        audio.pause();
        audio.currentTime = 0;
        template.playPauseIconClass = "fa-play-circle";
      } else {
        audio.play();
        startedPlying("AudioTemplateFile").then(function() {
          template.showAudioSpinner = false;
          template.playPauseIconClass = "fa-stop-circle";
        });
        audio.addEventListener(
          "ended",
          function() {
            $scope.isRecordedFilePlaying = false;
            template.playPauseIconClass = "fa-play-circle";

            // if (!$scope.$$phase) $scope.$apply();
          },
          false
        );
      }
    };

    $scope.playAudio = function() {
      var a = document.getElementById("aaa");
      a.muted = true;
      a.play();
    };
    $scope.playPauseRecordedAudio = function(template) {
      if (template._id === $scope.currentAudioId) {
        $scope.isRecordedFilePlaying = !$scope.isRecordedFilePlaying;
        playPauseAudio(template);
      } else {
        $scope.isRecordedFilePlaying = false;
        stopAllAudios().then(function() {
          if (!template.amazon_s3_url) {
            template.playPauseIconClass = "hidden";
            template.showAudioSpinner = true;
            $rootScope.getAmazonUrlOfAudio(template._id).then(function(url) {
              template.amazon_s3_url = url;
              var currentAudioUrl = $sce.trustAsResourceUrl(url);

              document
                .getElementById("AudioTemplateFile")
                .setAttribute("src", currentAudioUrl);
              playPauseAudio(template);
            });
          } else {
            var currentAudioUrl = $sce.trustAsResourceUrl(
              template.amazon_s3_url
            );

            document
              .getElementById("AudioTemplateFile")
              .setAttribute("src", currentAudioUrl);
            playPauseAudio(template);
            template.showAudioSpinner = false;
          }
        });

        $scope.currentAudioId = template._id;
      }
    };

    /**
     * change template page
     * @param page
     */
    $scope.currentPage = undefined;
    $scope.changeTemplatesPage = function(page) {
      $scope.tableSpinnerLoading = true;
      var postData = $scope.filterData;
      postData.page = page - 1;
      $scope.currentPage = page;

      TemplateService.getAudioTemplates(postData).then(function(data) {
        updateTemplates(data);
      });
    };

    $scope.templateSpinner = false;
    $scope.changeName = function(id, name, template) {
      $scope.templateSpinner = template;
      TemplateService.putUpdateFileName(id, { name: name }).then(function(
        data
      ) {
        if (data.resource.error.no == 0) {
          $scope.templateSpinner = false;
          for (index in $scope.templates) {
            if ($scope.templates[index]._id == id) {
              $scope.templates[index].orig_filename = name;
              $scope.showInput[id] = false;
              break;
            }
          }
        }
      });
    };
    $scope.changeOrder = function(field) {
      $scope.tableSpinnerLoading = true;
      $scope.filterData.page = 0;
      if (field == $scope.filterData.order_field) {
        $scope.currentOrder = $scope.currentOrder == "ASC" ? "DESC" : "ASC";
        $scope.orderField = field;
      }
      $scope.filterData.order_field = field;
      $scope.filterData.order = $scope.currentOrder;
      TemplateService.getAudioTemplates($scope.filterData).then(function(data) {
        updateTemplates(data);
      });
    };
    /**
     * remove template by {template._id}
     * @param template
     */
    $scope.deleteAudioTemplates = function(template) {
      ConfirmDeleteModal().then(function() {
        TemplateService.removeAudioTemplates({ ids: template._id }).then(
          function(data) {
            $scope.changeTemplatesPage($scope.templatesPage);
          }
        );
      });
    };

    /**
     * send message again by template
     * @param template
     */

    $scope.sendMessageAgain = function(template) {
      $state.go("campaign.compose", { audioFile: template, tab: 3 });
    };

    /**
     * filter data
     * @param params
     */
    $scope.filterTemplate = function(status, filter) {
      $scope.tableSpinnerLoading = true;
      TemplateService.getAudioTemplates($scope.filterData).then(function(data) {
        updateTemplates(data);
      });
    };
    /**
     * add new tempalte
     */

    $scope.hasInArray = function(array, item, index, except) {
      if (index) {
        if (array[index] == item) {
          return true;
        }
        return false;
      }

      if (array && array.length) {
        for (var i = 0; i < array.length; i++) {
          if (except) {
            if (except != i && array.indexOf(item) != -1) {
              return true;
            }
          } else {
            if (array.indexOf(item) != -1) {
              return true;
            }
          }
        }
      }

      return false;
    };
    $rootScope.interData = {};
    $rootScope.interData.replayDigit = {
      checkboxChecked: false,
      digit: null,
      onOff: false
    };
    $rootScope.interData.transferDigit = {
      checkboxChecked: false,
      digit: null,
      onOff: false
    };
    $rootScope.interData.callbackDigit = {
      checkboxChecked: false,
      digit: null,
      onOff: false
    };
    $rootScope.interData.blacklistDigit = {
      checkboxChecked: false,
      digit: null,
      onOff: false
    };
    $rootScope.interData.transferDigit.live_transfer_limit = null;
    $rootScope.liveTransferNumbers = [];
    $scope.addNewTemplate = function() {
      CallBournModal.open(
        {
          scope: {
            chosedInteractions: $scope.chosedInteractions,
            ttsEngineIndicated: $scope.ttsEngineIndicated,
            availableTts: $scope.availableTts,
            multiSelectEvents: $scope.multiSelectEvents,
            ttsData: {},
            ttsLanguagesItems: $scope.ttsLanguages,
            audioData: { is_template: 1 },
            textErr: false,
            smsError: false
            // playPauseRecordedAudio:$scope.playPauseRecordedAudio;
          },
          templateUrl: "/app/modals/templates/templates.html",
          size: "modal-md"
        },
        function(scope) {
          scope.templateData = {};

          scope.ttsData.language = scope.ttsEngineIndicated;
          scope.openTemplateAudioSelect = function() {
            $timeout(function() {
              angular.element("#campaignBatchFileInput").trigger("click");
            }, 100);
          };

          scope.createTemplate = function() {};

          scope.getPlaybackCount = function(count) {
            return $rootScope.playbackCount == count;
          };

          scope.changePlaybackCount = function(count) {
            $rootScope.playbackCount = count;
          };

          scope.showInteractionModal = function(checked) {
            console.log(checked);
            if (checked) {
              CallBournModal.open(
                {
                  scope: {
                    chosedInteractions: $scope.chosedInteractions,
                    hasInArray: $scope.hasInArray
                  },
                  templateUrl:
                    "/app/modals/camping-batch/activate-replay-template.html",
                  size: "modal-md"
                },
                function(scope) {
                  scope.isInactive = function(item, index) {
                    switch (index) {
                      case 0:
                        if (
                          $rootScope.interData.callbackDigit.digit == item ||
                          $rootScope.interData.transferDigit.digit == item ||
                          $rootScope.interData.blacklistDigit.digit == item
                        ) {
                          return true;
                        }
                        break;
                    }
                  };
                  scope.selectInteraction = function(interaction) {
                    $scope.chosedInteractions[0] = interaction;
                    $rootScope.interData.replayDigit.digit = interaction;
                    // CallBournModal.close();
                  };

                  /**
                   * activated replay digit
                   */
                  scope.cancelModal = function() {
                    scope.chosedInteractions[0] = null;
                    $rootScope.interData.replayDigit.digit = null;
                    $rootScope.interData.replayDigit.onOff = false;
                    angular
                      .element("call-modal")
                      [angular.element("call-modal").length - 1].remove();
                  };
                  scope.digitError = false;
                  scope.checkboxError = false;
                  scope.finishModal = function(checked) {
                    if (checked) {
                      $rootScope.interData.replayDigit.checkboxChecked = true;
                    }
                    if (
                      !$scope.chosedInteractions[0] &&
                      $scope.chosedInteractions[0] !== 0
                    ) {
                      scope.digitError = true;
                    } else if (
                      !$rootScope.interData.replayDigit.checkboxChecked
                    ) {
                      scope.checkboxError = true;
                    } else {
                      $rootScope.showBlurEffect = false;
                      $rootScope.interData.replayDigit.digit =
                        $scope.chosedInteractions[0];
                      angular
                        .element("call-modal")
                        [angular.element("call-modal").length - 1].remove();
                    }
                  };
                }
              );
            } else {
              $scope.chosedInteractions[0] = null;
              $rootScope.interData.replayDigit = {
                checkboxChecked: false,
                digit: null,
                onOff: false
              };
            }
          };

          scope.showTransferModal = function(checked) {
            if (checked) {
              $rootScope.interData.transferDigit.onOff = false;
              $rootScope.interData.transferDigit.checkboxChecked = false;
              CallBournModal.open(
                {
                  scope: {
                    currentUser: $rootScope.currentUser,
                    transferStep: 1,
                    chosedInteractions: $scope.chosedInteractions,
                    hasInArray: $scope.hasInArray
                  },
                  templateUrl:
                    "/app/modals/camping-batch/activate-transfer-template.html",
                  size: "modal-md"
                },
                function(scope) {
                  scope.transferLimitValue = "";
                  scope.checkRadioForManuallyNumber = function(number) {
                    $rootScope.interData.transferDigit.live_transfer_limit = number;
                  };
                  scope.checkRadioForTransferLimit = function() {
                    $rootScope.interData.transferDigit.live_transfer_limit = "";
                  };
                  scope.transferLimit = {
                    1: {
                      key: $rootScope.trans("transfer_unlimited2"),
                      value: ""
                    },
                    2: { key: 1, value: 1 },
                    3: { key: 2, value: 2 },
                    4: { key: 3, value: 3 },
                    5: { key: 4, value: 4 },
                    6: { key: 5, value: 5 },
                    7: { key: 6, value: 6 },
                    8: { key: 7, value: 7 },
                    9: { key: 8, value: 8 },
                    10: { key: 9, value: 9 },
                    11: { key: 10, value: 10 }
                  };
                  scope.isInactive = function(item, index) {
                    switch (index) {
                      case 1:
                        if (
                          $rootScope.interData.callbackDigit.digit == item ||
                          $rootScope.interData.replayDigit.digit == item ||
                          $rootScope.interData.blacklistDigit.digit == item
                        ) {
                          return true;
                        }
                        break;
                    }
                  };
                  scope.selectInteraction = function(interaction) {
                    $rootScope.interData.transferDigit.onOff = true;
                    $rootScope.interData.transferDigit.digit = interaction;
                    scope.chosedInteractions[1] = interaction;
                  };
                  /**
                   * add remove transsef numbershcedulationData2
                   * @param number
                   * @param countryId
                   */

                  if (
                    $rootScope.currentUser.numbers &&
                    $rootScope.currentUser.numbers[0].phone_number
                  ) {
                    $scope.liveTransferDemo = [];
                    $scope.liveTransferDemo.push({
                      number: $rootScope.currentUser.numbers[0].phone_number,
                      countryId:
                        $rootScope.currentUser.numbers[0].tariff.country_id
                    });
                    $rootScope.liveTransferNumbers.push(
                      $rootScope.currentUser.numbers[0].phone_number
                    );
                  }

                  scope.addRemoveTransfer = function(number, countryId) {
                    var index = $scope.liveTransferDemo
                      .map(function(e) {
                        return e.number;
                      })
                      .indexOf(number);
                    if (index > -1) {
                      $rootScope.liveTransferNumbers.splice(index, 1);
                      $scope.liveTransferDemo.splice(index, 1);
                    } else {
                      if (!scope.liveTransferNumbers.length) {
                        $scope.liveTransferDemo.push({
                          number: number,
                          countryId: countryId
                        });
                        scope.liveTransferNumbers.push(number);
                      } else {
                        $scope.liveTransferDemo.forEach(function(item) {
                          if (item.countryId === countryId) {
                            $scope.liveTransferDemo.push({
                              number: number,
                              countryId: countryId
                            });
                            scope.liveTransferNumbers.push(number);
                          } else {
                            growl.error(
                              $rootScope.trans("country_id_dont_match")
                            );
                          }
                        });
                      }
                    }
                  };

                  scope.chnageTransferStep = function(step) {
                    scope.transferStep = step;
                  };

                  scope.cancelModal = function() {
                    $rootScope.interData.transferDigit.checkboxChecked = false;
                    $rootScope.interData.transferDigit.onOff = false;
                    $rootScope.interData.transferDigit.digit = null;
                    $scope.chosedInteractions[1] = null;
                    angular
                      .element("call-modal")
                      [angular.element("call-modal").length - 1].remove();
                  };
                  scope.digitError = false;
                  scope.checkboxError = false;
                  scope.liveNumberErr = false;
                  scope.finishModal = function(checked) {
                    if (checked) {
                      $rootScope.interData.replayDigit.checkboxChecked;
                    }
                    if (
                      !$scope.chosedInteractions[1] &&
                      $scope.chosedInteractions[1] !== 0
                    ) {
                      scope.digitError = true;
                    } else if (
                      !$rootScope.interData.transferDigit.checkboxChecked
                    ) {
                      scope.checkboxError = true;
                    } else if (!$rootScope.liveTransferNumbers.length) {
                      scope.liveNumberErr = true;
                    } else {
                      $rootScope.showBlurEffect = false;
                      $rootScope.transfer_options = $rootScope.liveTransferNumbers.join();
                      angular
                        .element("call-modal")
                        [angular.element("call-modal").length - 1].remove();
                    }
                  };
                }
              );
            } else {
              $scope.chosedInteractions[1] = null;
            }
          };

          scope.showCallbackModal = function(checked) {
            if (checked) {
              $rootScope.interData.callbackDigit.onOff = false;
              $rootScope.interData.callbackDigit.checkboxChecked = false;
              CallBournModal.open(
                {
                  scope: {
                    availableTts: $scope.availableTts,
                    ttsEngineIndicated: $scope.ttsEngineIndicated,
                    callbackTtsData: {},
                    uploadingCallbackAudioName: "",
                    tempAudioTemplateModel: {},
                    callbackAudioFiles: [],
                    playPauseRecordedAudio: $scope.playPauseRecordedAudio,
                    getAudioSource: $scope.getAudioSource,
                    activationCheckboxStep: false,
                    callbackStep: 1,
                    checkedAll: false,
                    tabIsOpen: [false, false, false],
                    uploadedAudioFile: {},
                    isPlayed: false,
                    isTtsUploaded: false,
                    chosedInteractions: $scope.chosedInteractions,
                    hasInArray: $scope.hasInArray,
                    seletedTemplateId: null
                  },
                  templateUrl:
                    "/app/modals/camping-batch/activate-callback-template.html",
                  size: "modal-md"
                },
                function(scope) {
                  Restangular.one("audio-files/audio-templates")
                    .get({ saved_from: "CALL_ME_BACK" })
                    .then(function(data) {
                      scope.callbackTemplates = data.resource;
                    });
                  scope.selectInteraction = function(interaction) {
                    $rootScope.interData.callbackDigit.onOff = true;
                    $rootScope.interData.callbackDigit.digit = interaction;
                    $scope.chosedInteractions[2] = interaction;
                  };
                  scope.callbackTtsData.language = scope.ttsEngineIndicated;
                  /**
                   * activate callback digit
                   */
                  /**
                   * chnage stap modal
                   * @param step
                   */

                  scope.changeCallbackStep = function(step) {
                    scope.callbackStep = step;
                  };

                  scope.isInactive = function(item, index) {
                    switch (index) {
                      case 2:
                        if (
                          $rootScope.interData.replayDigit.digit == item ||
                          $rootScope.interData.transferDigit.digit == item ||
                          $rootScope.interData.blacklistDigit.digit == item
                        ) {
                          return true;
                        }
                        break;
                    }
                  };

                  scope.openTab = function(index) {
                    angular.element(".openTabs").collapse("hide");
                    angular.element("#collapseMethod" + index).collapse("show");
                    scope.tabIsOpen[index - 1] = !scope.tabIsOpen[index - 1];
                  };
                  /**
                   * open file select by tirger click
                   */
                  scope.openBatchFileSelect = function() {
                    $timeout(function() {
                      angular
                        .element("#campaignBatchFileInput")
                        .trigger("click");
                    }, 100);
                  };
                  scope.checkAll = function() {
                    return !$rootScope.interData.callbackDigit.checkboxChecked;
                  };

                  scope.callbackAudioTemplateSelected = function(file) {
                    scope.callbackTtsData.text = file.tts_text;
                    scope.seletedTemplateId = file._id;
                    $rootScope.interData.callbackDigit.voiceFileId = file._id;
                    scope.selectedCallbackAudioTemplateFile = file;
                    scope.tempNewCreatedModel = file;
                    scope.activationCheckboxStep = true;
                  };

                  scope.slsectAudio = function(template) {
                    $rootScope.interData.callbackDigit.voiceFile = template;
                    $rootScope.interData.callbackDigit.voiceFileId =
                      template._id;
                  };

                  scope.playPauseCallbackTemplateAudio = function(action) {
                    if (!scope.selectedCallbackAudioTemplateFile._id) {
                      return;
                    }
                    var audio = document.getElementById(
                      "callbackAudioFileTemplate"
                    );
                    if (action == "play") {
                      audio.play();
                      scope.isCallbackTemplateFilePlaying = true;
                      audio.addEventListener(
                        "ended",
                        function() {
                          scope.isCallbackTemplateFilePlaying = false;
                          // if (!$scope.$$phase) scope.$apply();
                        },
                        false
                      );
                    } else {
                      audio.pause();
                      scope.isCallbackTemplateFilePlaying = false;
                    }
                  };

                  scope.playPauseCallbackNewCreatedAudio = function(action) {
                    if (!scope.newCallbackSelectedAudioFile._id) {
                      return;
                    }
                    var templateId = scope.newCallbackSelectedAudioFile._id;
                    var audio = document.getElementById(
                      "callbackCreatedAudioFile"
                    );
                    if (action == "play") {
                      audio.play();
                      scope.isCallbackNewCreatedFilePlaying = true;
                      audio.addEventListener(
                        "ended",
                        function() {
                          scope.isCallbackNewCreatedFilePlaying = false;
                          // if (!$scope.$$phase) scope.$apply();
                        },
                        false
                      );
                    } else {
                      audio.pause();
                      scope.isCallbackNewCreatedFilePlaying = false;
                    }
                  };

                  scope.saveTemplateAsCallback = function() {
                    scope.callbackAudioFiles.push({
                      file: scope.selectedCallbackAudioTemplateFile,
                      name:
                        scope.selectedCallbackAudioTemplateFile.map_filename +
                        " - " +
                        scope.selectedCallbackAudioTemplateFile.length
                    });
                  };

                  scope.isCallbackAlreadyAdded = function() {
                    if (!scope.selectedCallbackAudioTemplateFile) {
                      return false;
                    }
                    for (index in scope.callbackAudioFiles) {
                      if (
                        scope.callbackAudioFiles[index].file._id ==
                        scope.selectedCallbackAudioTemplateFile._id
                      ) {
                        return true;
                      }
                      return false;
                    }
                  };

                  /**
                   * file uloader instance
                   */
                  scope.callbackDigitFileUpload = new $rootScope.fileUploader({
                    url: "/campaigns/upload-audio-file",
                    alias: "file",
                    headers: {
                      JWTAuthorization:
                        "Bearer " + localStorage.getItem("jwtToken"),
                      savedFrom: "CALL_ME_BACK"
                    },
                    autoUpload: true
                  });

                  scope.callbackDigitFileUpload.onAfterAddingFile = function(
                    item
                  ) {
                    $rootScope.startModalLoader();

                    scope.uploadingAudioName = item.file.name;
                  };
                  /**
                   * return success data
                   * @param item
                   * @param response
                   * @param status
                   * @param headers
                   */
                  scope.callbackDigitFileUpload.onSuccessItem = function(
                    item,
                    response,
                    status,
                    headers
                  ) {
                    $rootScope.stopModalLoader();
                    if (response.resource.error.no == 0) {
                      scope.uploadingCallbackAudioName = false;
                      var file = response.resource.file;
                      var audioData = {
                        source: $sce.trustAsResourceUrl(file.amazon_s3_url),
                        file: file,
                        name: file.orig_filename + " - " + file.length
                      };
                      scope.callbackAudioFiles.push(audioData);
                      scope.uploadedAudioFile = response.resource.file;
                      scope.seletedTemplateId = response.resource.file._id;
                      scope.isUploaded = true;
                      scope.callbackAudioTemplateSelected(
                        response.resource.file
                      );
                      growl.success(
                        $rootScope.trans(response.resource.error.message)
                      );
                    } else {
                      growl.error(
                        $rootScope.trans(response.resource.error.text)
                      );
                    }
                  };
                  /**
                   * file uploading error action
                   * @param item
                   * @param response
                   * @param status
                   * @param headers
                   */
                  scope.callbackDigitFileUpload.onErrorItem = function(
                    item,
                    response,
                    status,
                    headers
                  ) {
                    $scope.errors = response;
                    $rootScope.stopModalLoader();
                  };
                  /**
                   * start callback upload
                   */
                  scope.startCallbackUpload = function() {
                    $scope.callbackDigitFileUpload.uploadAll();
                  };
                  /**
                   * open file select
                   */
                  scope.openCallbackFileSelect = function() {
                    $timeout(function() {
                      angular
                        .element("#campaignCallbackFileInput")
                        .trigger("click");
                    }, 100);
                  };

                  /**
                   * get tts demo url
                   * @returns {*}
                   */
                  scope.getTTSUrl = function() {
                    return $sce.trustAsResourceUrl(
                      "/assets/callburn/tts/" +
                        scope.callbackTtsData.language +
                        ".wav"
                    );
                  };

                  /**
                   * play tts demo audio
                   */
                  scope.playCallbackTTSDemo = function() {
                    var audio = document.getElementById("ttsCallbackDemoAudio");
                    if ($scope.isRecordedFilePlaying) {
                      audio.pause();
                      audio.currentTime = 0;
                      angular
                        .element("#audioFilePlay")
                        .addClass("fa-play-circle");
                      angular
                        .element("#audioFilePlay")
                        .removeClass("fa-stop-circle");
                    } else {
                      audio.play();
                      angular
                        .element("#audioFilePlay")
                        .removeClass("fa-stop-circle");
                      angular
                        .element("#audioFilePlay")
                        .addClass("fa-stop-circle");
                      audio.addEventListener(
                        "ended",
                        function() {
                          $scope.isRecordedFilePlaying = false;
                          angular
                            .element("#audioFilePlay")
                            .removeClass("fa-stop-circle");
                          angular
                            .element("#audioFilePlay")
                            .addClass("fa-play-circle");
                          // if (!$scope.$$phase) $scope.$apply();
                        },
                        false
                      );
                    }
                    $scope.isRecordedFilePlaying = !$scope.isRecordedFilePlaying;
                  };

                  scope.createAudioFromTextForCallback = function() {
                    $rootScope.startModalLoader();
                    scope.callbackTtsData.saved_from = "CALL_ME_BACK";
                    Restangular.all("campaigns/create-audio-from-text")
                      .post(scope.callbackTtsData)
                      .then(function(data) {
                        $rootScope.stopModalLoader();
                        if (data.resource.error.no == 0) {
                          var file = data.resource.file;
                          var audioData = {
                            source: $sce.trustAsResourceUrl(file.amazon_s3_url),
                            file: file,
                            name: file.orig_filename + " - " + file.length
                          };
                          scope.callbackAudioFiles.push(audioData);
                          scope.ttsUploadedAudioFile = file;
                          $rootScope.interData.callbackDigit.voicefileId =
                            file._id;
                          scope.tempNewCreatedModel = file;
                          scope.seletedTemplateId = file._id;
                          scope.isTtsUploaded = true;
                          scope.activationCheckboxStep = true;
                        } else {
                          growl.error(
                            $rootScope.trans(data.resource.error.text)
                          );
                        }
                      });
                  };

                  scope.cancelModal = function() {
                    $rootScope.interData.callbackDigit.checkboxChecked = false;
                    $rootScope.interData.callbackDigit.digit = null;
                    $rootScope.interData.callbackDigit.onOff = false;
                    $scope.chosedInteractions[2] = null;
                    angular
                      .element("call-modal")
                      [angular.element("call-modal").length - 1].remove();
                  };
                  scope.finishModal = function(checked) {
                    if (checked) {
                      $rootScope.interData.callbackDigit.checkboxChecked = true;
                    }
                    scope.digitError = false;
                    scope.checkboxError = false;
                    scope.tempError = false;
                    if (
                      !$scope.chosedInteractions[2] &&
                      $scope.chosedInteractions[2] !== 0
                    ) {
                      scope.digitError = true;
                    } else if (
                      !$rootScope.interData.callbackDigit.checkboxChecked
                    ) {
                      scope.checkboxError = true;
                    } else if (!scope.tempNewCreatedModel) {
                      scope.tempError = true;
                    } else {
                      $rootScope.showBlurEffect = false;
                      angular
                        .element("call-modal")
                        [angular.element("call-modal").length - 1].remove();
                    }
                  };
                }
              );
            } else {
              $scope.chosedInteractions[2] = null;
            }
          };

          scope.showDoNotCallModal = function(checked) {
            if (checked) {
              $rootScope.interData.blacklistDigit.onOff = false;
              $rootScope.interData.blacklistDigit.checkboxChecked = false;
              CallBournModal.open(
                {
                  scope: {
                    ttsEngineIndicated: $scope.ttsEngineIndicated,
                    doNotCallTtsData: {},
                    uploadingDoNotCallAudioName: "",
                    tempAudioTemplateModel: {},
                    doNotCallAudioFiles: [],
                    doNotCallStep: 1,
                    playPauseRecordedAudio: $scope.playPauseRecordedAudio,
                    getAudioSource: $scope.getAudioSource,
                    checkedAll: false,
                    activationCheckboxStep: false,
                    availableTts: $scope.availableTts,
                    audioTemplates: $scope.audioTemplates,
                    seletedTemplateId: null,
                    tabIsOpen: [false, false, false],
                    chosedInteractions: $scope.chosedInteractions,
                    hasInArray: $scope.hasInArray
                  },
                  templateUrl:
                    "/app/modals/camping-batch/activate-do-not-call-template.html",
                  size: "modal-md",
                  isUploaded: false,
                  isTtsUploaded: false
                },
                function(scope) {
                  Restangular.one("audio-files/audio-templates")
                    .get({ saved_from: "BLACKLIST" })
                    .then(function(data) {
                      scope.blacklistTemplates = data.resource;
                    });

                  scope.isInactive = function(item, index) {
                    switch (index) {
                      case 3:
                        if (
                          $rootScope.interData.replayDigit.digit == item ||
                          $rootScope.interData.transferDigit.digit == item ||
                          $rootScope.interData.callbackDigit.digit == item
                        ) {
                          return true;
                        }
                        break;
                    }
                  };

                  scope.selectInteraction = function(interaction) {
                    $rootScope.interData.blacklistDigit.onOff = true;
                    $rootScope.interData.blacklistDigit.digit = interaction;
                    $scope.chosedInteractions[3] = interaction;
                  };
                  scope.doNotCallTtsData.language = scope.ttsEngineIndicated;
                  /**
                   * chnage stap modal
                   * @param step
                   */

                  scope.openTab = function(index) {
                    angular.element(".openTabs").collapse("hide");
                    angular.element("#collapseMethod" + index).collapse("show");
                    scope.tabIsOpen[index - 1] = !scope.tabIsOpen[index - 1];
                  };

                  scope.changeDoNotCallStep = function(step) {
                    scope.doNotCallStep = step;
                  };
                  /**
                   * open file select by tirger click
                   */
                  scope.openBatchFileSelect = function() {
                    $timeout(function() {
                      angular
                        .element("#campaignBatchFileInput")
                        .trigger("click");
                    }, 100);
                  };

                  scope.checkAll = function() {
                    return !$rootScope.interData.blacklistDigit.checkboxChecked;
                  };

                  scope.doNotCallAudioTemplateSelected = function(file) {
                    scope.doNotCallTtsData.text = file.tts_text;
                    scope.seletedTemplateId = file._id;
                    scope.selectedDoNotCallAudioTemplateFile = file;
                    scope.tempNewCreatedModel = file;
                    $rootScope.interData.blacklistDigit.voiceFileId = file._id;
                    scope.activationCheckboxStep = true;
                  };

                  scope.selectDoNotCallNewCreatedAudioFile = function(file) {
                    scope.newDoNotCallSelectedAudioFile = file.file;
                    $rootScope.interData.blacklistDigit.voiceFileId =
                      file.file._id;
                  };

                  scope.playPauseDoNotCallTemplateAudio = function(action) {
                    if (!scope.selectedDoNotCallAudioTemplateFile._id) {
                      return;
                    }
                    var audio = document.getElementById(
                      "doNotCallAudioFileTemplate"
                    );
                    if (action == "play") {
                      audio.play();
                      scope.isDoNotCallTemplateFilePlaying = true;
                      audio.addEventListener(
                        "ended",
                        function() {
                          scope.isDoNotCallTemplateFilePlaying = false;
                          // if (!$scope.$$phase) scope.$apply();
                        },
                        false
                      );
                    } else {
                      audio.pause();
                      scope.isDoNotCallTemplateFilePlaying = false;
                    }
                  };

                  scope.playPauseDoNotCallNewCreatedAudio = function(action) {
                    if (!scope.newDoNotCallSelectedAudioFile._id) {
                      return;
                    }
                    var templateId = scope.newDoNotCallSelectedAudioFile._id;
                    var audio = document.getElementById(
                      "doNotCallCreatedAudioFile"
                    );
                    if (action == "play") {
                      audio.play();
                      scope.isDoNotCallNewCreatedFilePlaying = true;
                      audio.addEventListener(
                        "ended",
                        function() {
                          scope.isDoNotCallNewCreatedFilePlaying = false;
                          // if (!$scope.$$phase) scope.$apply();
                        },
                        false
                      );
                    } else {
                      audio.pause();
                      scope.isDoNotCallNewCreatedFilePlaying = false;
                    }
                  };

                  scope.saveTemplateAsDoNotCall = function() {
                    scope.doNotCallAudioFiles.push({
                      file: scope.selectedDoNotCallAudioTemplateFile,
                      name:
                        scope.selectedDoNotCallAudioTemplateFile.map_filename +
                        " - " +
                        scope.selectedDoNotCallAudioTemplateFile.length
                    });
                  };

                  scope.isDoNotCallAlreadyAdded = function() {
                    if (!scope.selectedDoNotCallAudioTemplateFile) {
                      return false;
                    }
                    for (index in scope.doNotCallAudioFiles) {
                      if (
                        scope.doNotCallAudioFiles[index].file._id ==
                        scope.selectedDoNotCallAudioTemplateFile._id
                      ) {
                        return true;
                      }
                      return false;
                    }
                  };

                  /**
                   * file uloader instance
                   */
                  scope.blacklistDigitFileUpload = new $rootScope.fileUploader({
                    url: "/campaigns/upload-audio-file",
                    alias: "file",
                    headers: {
                      JWTAuthorization:
                        "Bearer " + localStorage.getItem("jwtToken"),
                      savedFrom: "BLACKLIST"
                    },
                    autoUpload: true
                  });

                  scope.blacklistDigitFileUpload.onAfterAddingFile = function(
                    item
                  ) {
                    $rootScope.startModalLoader();
                    scope.uploadingAudioName = item.file.name;
                  };

                  /**
                   * return success data
                   * @param item
                   * @param response
                   * @param status
                   * @param headers
                   */
                  scope.blacklistDigitFileUpload.onSuccessItem = function(
                    item,
                    response,
                    status,
                    headers
                  ) {
                    $rootScope.stopModalLoader();
                    if (response.resource.error.no == 0) {
                      scope.uploadingDoNotCallAudioName = false;
                      var file = response.resource.file;
                      var audioData = {
                        source: $sce.trustAsResourceUrl(file.amazon_s3_url),
                        file: file,
                        name: file.orig_filename + " - " + file.length
                      };
                      scope.doNotCallAudioFiles.push(audioData);
                      scope.isUploaded = true;
                      scope.uploadedAudioFile = file;
                      scope.doNotCallAudioTemplateSelected(file);
                      scope.seletedTemplateId = file._id;
                      scope.tempNewCreatedModel = file;
                      scope.activationCheckboxStep = true;
                      growl.success(
                        $rootScope.trans(response.resource.error.message)
                      );
                    } else {
                      growl.error(
                        $rootScope.trans(response.resource.error.text)
                      );
                    }
                  };

                  /**
                   * file uploading error action
                   * @param item
                   * @param response
                   * @param status
                   * @param headers
                   */
                  scope.blacklistDigitFileUpload.onErrorItem = function(
                    item,
                    response,
                    status,
                    headers
                  ) {
                    $scope.errors = response;
                    $rootScope.stopModalLoader();
                  };
                  /**
                   * start doNotCall upload
                   */
                  scope.startDoNotCallUpload = function() {
                    $scope.blacklistDigitFileUpload.uploadAll();
                  };
                  /**
                   * open file select
                   */
                  scope.openDoNotCallFileSelect = function() {
                    $timeout(function() {
                      angular
                        .element("#campaignDoNotCallFileInput")
                        .trigger("click");
                    }, 100);
                  };

                  scope.getTTSUrl = function() {
                    return $sce.trustAsResourceUrl(
                      "/assets/callburn/tts/" +
                        scope.doNotCallTtsData.language +
                        ".wav"
                    );
                  };

                  scope.playDoNotCallTTSDemo = function() {
                    var audio = document.getElementById(
                      "ttsDoNotCallDemoAudio"
                    );
                    if ($scope.isRecordedFilePlaying) {
                      audio.pause();
                      audio.currentTime = 0;
                      angular
                        .element("#audioFilePlay")
                        .addClass("fa-play-circle");
                      angular
                        .element("#audioFilePlay")
                        .removeClass("fa-stop-circle");
                    } else {
                      audio.play();
                      angular
                        .element("#audioFilePlay")
                        .removeClass("fa-stop-circle");
                      angular
                        .element("#audioFilePlay")
                        .addClass("fa-stop-circle");
                      audio.addEventListener(
                        "ended",
                        function() {
                          $scope.isRecordedFilePlaying = false;
                          angular
                            .element("#audioFilePlay")
                            .removeClass("fa-stop-circle");
                          angular
                            .element("#audioFilePlay")
                            .addClass("fa-play-circle");
                          // if (!$scope.$$phase) $scope.$apply();
                        },
                        false
                      );
                    }
                    $scope.isRecordedFilePlaying = !$scope.isRecordedFilePlaying;
                  };

                  scope.createAudioFromTextForDoNotCall = function() {
                    $rootScope.startModalLoader();
                    scope.doNotCallTtsData.saved_from = "BLACKLIST";
                    CampingService.createAudioFromText(
                      scope.doNotCallTtsData
                    ).then(function(data) {
                      $rootScope.stopModalLoader();
                      if (data.resource.error.no == 0) {
                        file = data.resource.file;
                        var audioData = {
                          source: $sce.trustAsResourceUrl(file.amazon_s3_url),
                          file: file,
                          name: file.orig_filename + " - " + file.length
                        };

                        scope.ttsUploadedAudioFile = file;
                        scope.seletedTemplateId = file._id;
                        scope.doNotCallAudioTemplateSelected(file);
                        scope.doNotCallAudioFiles.push(audioData);
                        scope.isTtsUploaded = true;
                        scope.tempNewCreatedModel = file;
                        scope.activationCheckboxStep = true;
                      }
                    });
                  };

                  scope.cancelModal = function() {
                    $rootScope.interData.blacklistDigit.onOff = false;
                    $scope.chosedInteractions[3] = null;
                    $rootScope.interData.blacklistDigit.digit = null;
                    angular
                      .element("call-modal")
                      [angular.element("call-modal").length - 1].remove();
                  };
                  scope.finishModal = function(checked) {
                    if (checked) {
                      $rootScope.interData.blacklistDigit.checkboxChecked = true;
                    }
                    scope.digitError = false;
                    scope.checkboxError = false;
                    scope.tempError = false;
                    if (
                      !$scope.chosedInteractions[3] &&
                      $scope.chosedInteractions[3] !== 0
                    ) {
                      scope.digitError = true;
                    } else if (
                      !$rootScope.interData.blacklistDigit.checkboxChecked
                    ) {
                      scope.checkboxError = true;
                    } else if (!scope.tempNewCreatedModel) {
                      scope.tempError = true;
                    } else {
                      $rootScope.showBlurEffect = false;
                      angular
                        .element("call-modal")
                        [angular.element("call-modal").length - 1].remove();
                    }
                  };
                }
              );
            } else {
              $scope.chosedInteractions[3] = null;
              $rootScope.interData.blacklistDigit = {
                checkboxChecked: false,
                digit: null,
                onOff: false
              };
            }
          };

          /**
           * file uloader instance
           */
          scope.callbackDigitFileUpload = new $rootScope.fileUploader({
            url: "/campaigns/upload-audio-file",
            headers: {
              JWTAuthorization: "Bearer " + localStorage.getItem("jwtToken")
            },
            alias: "file",
            autoUpload: true,
            formData: [scope.audioData]
          });

          scope.callbackDigitFileUpload.onAfterAddingFile = function(item) {
            $rootScope.disableButton();
            $rootScope.startModalLoader();
            scope.uploadingAudioName = item.file.name;
          };

          /**
           * return success data
           * @param item
           * @param response
           * @param status
           * @param headers
           */
          scope.callbackDigitFileUpload.onSuccessItem = function(
            item,
            response,
            status,
            headers
          ) {
            $rootScope.enabledButton();
            $rootScope.stopModalLoader();
            if (response.resource.error.no == 0) {
              scope.uploadingCallbackAudioName = false;
              TemplateService.getAudioTemplates({}).then(function(data) {
                updateTemplates(data);
                CallBournModal.close();
                $scope.filterTemplate();
              });
              growl.success($rootScope.trans(response.resource.error.message));
              CallBournModal.close;
            } else {
              growl.error($rootScope.trans(response.resource.error.text));
              CallBournModal.close();
            }
          };

          /**
           * file uploading error action
           * @param item
           * @param response
           * @param status
           * @param headers
           */
          scope.callbackDigitFileUpload.onErrorItem = function(
            item,
            response,
            status,
            headers
          ) {
            $scope.errors = response;
            $rootScope.stopLoader();
            $rootScope.enabledButton();
            $rootScope.stopModalLoader();
            CallBournModal.close();
          };
          /*** start callback upload ***/
          scope.startCallbackUpload = function() {
            //$rootScope.startLoader();
            $scope.callbackDigitFileUpload.uploadAll();
          };

          scope.saveTypes = {
            1: {
              value: "TEMPLATES",
              text: "Templates"
            },
            2: {
              value: "CALL_MESSAGE",
              text: $rootScope.trans("dashboard_welcome_voice_messages")
            },
            3: {
              value: "CALL_ME_BACK",
              text: $rootScope.trans("campaign_statistics_callback")
            },
            4: {
              value: "BLACKLIST",
              text: $rootScope.trans("campaign_statistics_blacklist")
            },
            5: {
              value: "SMS",
              text: "SMS"
            }
          };
          /** Send request to server to create audio file.**/
          scope.ttsData.saved_from = "TEMPLATE";
          scope.createAudioFromTextForVoice = function() {
            scope.ttsData.interactionInfo = {
              replay: {
                digit: $rootScope.interData.replayDigit.digit
              },
              transfer: {
                number: $rootScope.liveTransferNumbers,
                limit: $rootScope.interData.transferDigit.live_transfer_limit,
                digit: $rootScope.interData.transferDigit.digit
              },
              callback: {
                digit: $rootScope.interData.callbackDigit.digit,
                voiceFileId: $rootScope.interData.callbackDigit.voiceFileId
              },
              blacklist: {
                digit: $rootScope.interData.blacklistDigit.digit,
                voiceFileId: $rootScope.interData.blacklistDigit.voiceFileId
              }
            };
            delete scope.ttsData.replayDigit;
            delete scope.ttsData.transferDigit;
            delete scope.ttsData.callbackDigit;
            delete scope.ttsData.blacklistDigit;
            scope.ttsData.playbackNumber = $rootScope.playbackCount;
            scope.textErr = false;
            if (scope.ttsData.text && scope.ttsData.text.length) {
              $rootScope.disableButton();
              $rootScope.startModalLoader();
              Restangular.all("campaigns/create-audio-from-text")
                .post(scope.ttsData)
                .then(function(data) {
                  $rootScope.stopModalLoader();
                  $rootScope.enabledButton();
                  if (data.resource.error.no == 0) {
                    growl.success(trans(data.resource.error.message));
                    TemplateService.getAudioTemplates({}).then(function(data) {
                      updateTemplates(data);
                      CallBournModal.close();
                      $scope.filterData.saved_from = null;
                      $scope.filterTemplate();
                    });
                  } else {
                    if (data.resource.error.no == "-1") {
                      growl.error(trans("endpoint_connecting_failed"));
                    } else {
                      growl.error(trans(data.resource.error.text));
                    }
                  }
                });
              $scope.multiSelectEvents.onSelectionChanged();
            } else {
              scope.textErr = true;
            }
          };

          scope.getTTSUrl = function() {
            return $sce.trustAsResourceUrl(
              "/assets/callburn/tts/" + scope.ttsData.language + ".wav"
            );
            scope.filterTemplate();
          };

          /*** play tts demo audio ***/
          scope.playTTSDemo = function() {
            var audio = document.getElementById("ttsDemoAudio");
            if ($scope.isRecordedFilePlaying) {
              audio.pause();
              angular.element("#audioFilePlay").addClass("fa-play-circle");
              angular.element("#audioFilePlay").removeClass("fa-stop-circle");
            } else {
              audio.play();
              audio.currentTime = 0;
              angular.element("#audioFilePlay").removeClass("fa-stop-circle");
              angular.element("#audioFilePlay").addClass("fa-stop-circle");
              audio.addEventListener(
                "ended",
                function() {
                  $scope.isRecordedFilePlaying = false;
                  angular
                    .element("#audioFilePlay")
                    .removeClass("fa-stop-circle");
                  angular.element("#audioFilePlay").addClass("fa-play-circle");
                  // if (!$scope.$$phase) $scope.$apply();
                },
                false
              );
            }
            $scope.isRecordedFilePlaying = !$scope.isRecordedFilePlaying;
          };

          scope.selectedTemplateType = false;
          scope.selectTemplateType = function(type) {
            scope.selectedTemplateType = type;
          };

          scope.calcSmsText = function() {
            var txt = scope.templateData.sms_text.length;
            var num = 0;
            if (txt >= 0 && txt <= 160) {
              num = 1;
              return " - " + num + " SMS";
            } else if (txt >= 161 && txt <= 320) {
              num = 2;
              return " - " + num + " SMS";
            } else if (txt >= 321 && txt <= 480) {
              num = 3;
              return " - " + num + " SMS";
            } else if (txt >= 481 && txt <= 640) {
              num = 4;
              return " - " + num + " SMS";
            } else if (txt >= 641 && txt <= 800) {
              num = 5;
              return " - " + num + " SMS";
            } else if (txt >= 801 && txt <= 960) {
              num = 6;
              return " - " + num + " SMS";
            } else {
              return;
            }
          };

          scope.createSmsTemplate = function() {
            scope.smsError = false;
            var data = {
              sms_text: scope.templateData.sms_text,
              saved_from: "TEMPLATE",
              interactionInfo: $rootScope.interData,
              playbackCount: $rootScope.playbackCount
            };
            if (data.sms_text && data.sms_text.length) {
              Restangular.all("audio-files/make-sms-template")
                .post(data)
                .then(function(data) {
                  TemplateService.getAudioTemplates({}).then(function(data) {
                    updateTemplates(data);
                    CallBournModal.close();
                    $scope.filterData.saved_from = null;
                    $scope.filterTemplate();
                  });
                });
            } else {
              scope.smsError = true;
            }
          };
        }
      );
    };

    $scope.multiselectOptionsTemplatesDataCallback = function() {
      var q = $q.defer();

      if ($scope.multiselectOptionsTemplateOverviewData) {
        return q.resolve($scope.multiselectOptionsTemplateOverviewData);
      } else {
        $interval(function() {
          if ($scope.multiselectOptionsTemplateOverviewData) {
            return q.resolve($scope.multiselectOptionsTemplateOverviewData);
          }
        }, 500);
      }

      return q.promise;
    };

    $scope.multiselectOptionsTemplatesDataCallback().then(function(data) {
      $scope.checkedOptionsModel = [
        $scope.multiselectOptionsTemplateOverviewData[0],
        $scope.multiselectOptionsTemplateOverviewData[1],
        $scope.multiselectOptionsTemplateOverviewData[2]
      ];

      $scope.multiSelectEvents.onSelectionChanged();
    });

    $scope.multiselectTemplateSettings = {
      template: "{{option.label}}",
      buttonClasses: ""
    };

    $scope.firstLoadForStatuses = true;

    $scope.multiSelectEvents = {
      onSelectionChanged: function() {
        $scope.checkedOptions = [];
        $scope.checkedOptionsModel.forEach(function(option) {
          $scope.checkedOptions.push(option.id);
        });

        $scope.filterData.checkbox = JSON.stringify($scope.checkedOptions);
        if (!$scope.firstLoadForStatuses) {
          $scope.filterTemplate($scope.filterData);
        }
        $scope.firstLoadForStatuses = false;
      }
    };

    $scope.showSearch = false;
    $scope.TempEnterPress = function(key) {
      key.which === 13 ? $scope.filterTemplate() : null;
    };
    $scope.toggleSearch = function() {
      $scope.showSearch && $rootScope.importantShowSearch
        ? $scope.filterTemplate()
        : ($scope.showSearch = true);
    };

    $scope.selectedFilter = null;
    $scope.filterTemplates = function(type) {
      if ($scope.selectedFilter == type) {
        $scope.selectedFilter = null;
        $scope.filterData.saved_from = null;
        $scope.filterTemplate();
      } else {
        $scope.selectedFilter = type;
        $scope.filterData.saved_from = type;
        $scope.filterTemplate();
      }
    };
  }
]);
