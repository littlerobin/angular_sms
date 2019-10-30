angular.module("callburnApp").controller("ComposeStep3Controller", [
  "$scope",
  "$rootScope",
  "ModalService",
  "Restangular",
  "notify",
  "FileUploader",
  "CampaignComposeService",
  "CallBournModal",
  "CampingService",
  "$timeout",
  "$interval",
  "$sce",
  "$q",
  "growl",
  "SettingsService",
  "uiCalendarConfig",
  "$timeout",
  "$stateParams",
  "$state",
  function(
    $scope,
    $rootScope,
    ModalService,
    Restangular,
    notify,
    FileUploader,
    CampaignComposeService,
    CallBournModal,
    CampingService,
    $timeout,
    $interval,
    $sce,
    $q,
    growl,
    SettingsService,
    uiCalendarConfig,
    $timeout,
    $stateParams,
    $state
  ) {
    $scope.CampaignComposeService = CampaignComposeService;

    if (CampaignComposeService.campaignData.same_sms_text == undefined) {
      CampaignComposeService.campaignData.same_sms_text = true;
    }
    $rootScope.tutorialSidePopup = false;

    CampaignComposeService.ttsLanguages.forEach(function(item) {
      item.selectView = item.languageName + "-" + item.ttsEngine;
    });
    CampaignComposeService.audioTemplates.files.forEach(function(item) {
      item.selectView = item.orig_filename + " - " + item.length;
    });
    $scope.chosedInteractions = CampaignComposeService.chosedInteractions;

    $scope.resipentsCount = 1;
    $scope.lessThan = CampaignComposeService.editingCampaign ? "" : 3;

    $scope.resipentsCountUnsigned = false;
    $scope.tempNewCreatedModel = {};
    $scope.finalStepData = {};
    $scope.campaignData = {};
    $scope.showSaveTemlate = true;
    $scope.isPlayed = false;
    $scope.showMaxPriceMouseover = false;
    $scope.showMaxPriceMouseoverOnSendNow = false;
    $scope.onRecipientMouseover = false;
    $scope.onMaxPriceMouseover = false;
    $scope.recipientMouseoverClass = "";
    $scope.maxPriceMouseoverClass = "";
    $scope.usedRecipentsCount = 0;
    $rootScope.blinkSaveButton = false;
    $scope.pastSchedulations = [];
    $rootScope.previews = [];
    $rootScope.enableComposeActions = true;
    window.first_advisable_caller_id =
      $rootScope.currentUser.numbers &&
      $rootScope.currentUser.numbers.length > 0
        ? $rootScope.currentUser.numbers[
            $rootScope.currentUser.numbers.length - 1
          ].phone_number
        : null;
    $scope.campaignData.caller_id = window.first_advisable_caller_id || null;
    if (!CampaignComposeService.campaignData.caller_id) {
      CampaignComposeService.campaignData.caller_id = window.first_advisable_caller_id || null;
    } else if (CampaignComposeService.editingCampaign) {
      CampaignComposeService.campaignData.caller_id = CampaignComposeService.editingCampaign.caller_id;
    } else if (CampaignComposeService.reusingCampaign) {
      CampaignComposeService.campaignData.caller_id = CampaignComposeService.reusingCampaign.caller_id;
    }
      
    $scope.campaignData.country_code =
      $rootScope.currentUser.caller_id_country_code || null;
    $rootScope.recipientsErr = false;

    if (CampaignComposeService.editingCampaign) {
      $rootScope.editingCampaign = CampaignComposeService.editingCampaign;
      $rootScope.previews = CampaignComposeService.editingCampaign.previews;
      $rootScope.previews.forEach(function(item) {
        if (item.preview_phonenumbers[0].status == "IN_PROGRESS") {
          console.log("Disable");
          $rootScope.enableComposeActions = false;
        }
      });
      CampaignComposeService.campaignData.sender_name =
        CampaignComposeService.editingCampaign.sender_name;
      CampaignComposeService.editingCampaign.schedulations.forEach(function(
        item
      ) {
        if (item.is_finished) {
          $scope.usedRecipentsCount += item.calls_limit;
          $scope.pastSchedulations.push(item);
        }
      });
    } else if (CampaignComposeService.reusingCampaign) {
      CampaignComposeService.reusingCampaign.schedulations.forEach(function(
        item
      ) {
        if (item.is_finished) {
          $scope.usedRecipentsCount += item.calls_limit;
        }
      });
    } else {
      CampaignComposeService.replayDigit.onOff = false;
      CampaignComposeService.transferDigit.onOff = false;
      CampaignComposeService.callbackDigit.onOff = false;
      CampaignComposeService.doNotCallDigit.onOff = false;
      CampaignComposeService.campaignData.playback_count = 1;
    }

    $scope.audioTemplates = {};

    if (!CampaignComposeService.campaignData.playback_count) {
      CampaignComposeService.campaignData.playback_count = 1;
    }
    if (CampaignComposeService.campaignData.remaining_repeats == undefined) {
      CampaignComposeService.campaignData.remaining_repeats = 0;
    }
    if (CampaignComposeService.campaignData.repeat_days_interval == null) {
      CampaignComposeService.campaignData.repeat_days_interval = 7;
    }

    $scope.addFunctionalitiesObjectChecker = function() {
      if (
        CampaignComposeService.campaignData.live_answer_only == false &&
        CampaignComposeService.campaignData.remaining_repeats == 0 &&
        CampaignComposeService.campaignData.repeat_days_interval == 7 &&
        CampaignComposeService.replayDigit.onOff == false &&
        CampaignComposeService.transferDigit.onOff == false &&
        CampaignComposeService.callbackDigit.onOff == false &&
        CampaignComposeService.doNotCallDigit.onOff == false
      ) {
        return false;
      } else {
        return true;
      }
    };

    $scope.checkboxFunctionalities =
      (CampaignComposeService.editingCampaign ||
        CampaignComposeService.reusingCampaign) &&
      $scope.addFunctionalitiesObjectChecker()
        ? 1
        : 1;
    // $scope.checkboxFunctionalities = 1;
    $scope.CampaignComposeService.checkedFunctionalities =
      (CampaignComposeService.editingCampaign ||
        CampaignComposeService.reusingCampaign) &&
      $scope.addFunctionalitiesObjectChecker()
        ? true
        : false;
    $scope.enableFunctionalitiesParam =
      (CampaignComposeService.editingCampaign ||
        CampaignComposeService.reusingCampaign) &&
      $scope.addFunctionalitiesObjectChecker()
        ? true
        : false;

    /***************************************_VARIABLES_*******************************************************/

    var applyTranslations = function() {
      $scope.isLoaded = false;
      setTimeout(function() {
        $scope.isLoaded = true;
      }, 100);
      var ttsEnginesNames = { en: "Kate", it: "Alice-ML", es: "Monica" };
      $scope.ttsEngineIndicated = ttsEnginesNames[$rootScope.currentLanguage];
    };

    $rootScope.$watch("currentLanguage", applyTranslations);
    $rootScope.$watch("isLangLoaded", applyTranslations);

    /****************************************_MODALS_**********************************************************/

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

    $scope.changeRepeatsCount = function(action) {
      if (
        action == "-" &&
        CampaignComposeService.campaignData.remaining_repeats > 0
      ) {
        CampaignComposeService.campaignData.remaining_repeats =
          Number(CampaignComposeService.campaignData.remaining_repeats) - 1;
      }
      if (action == "+") {
        CampaignComposeService.campaignData.remaining_repeats =
          Number(CampaignComposeService.campaignData.remaining_repeats) + 1;
      }
      CampaignComposeService.campaignData.repeat_days_interval =
        Number(CampaignComposeService.campaignData.remaining_repeats) > 0 &&
        Number(CampaignComposeService.campaignData.repeat_days_interval) == 0
          ? 1
          : CampaignComposeService.campaignData.repeat_days_interval;
    };

    $scope.checkCampaignName = function() {
      if (CampaignComposeService.campaignData.campaign_name.length) {
        $rootScope.showSaveModal = true;
        $rootScope.blinkSaveButton = true;
        $scope.disableTagWithName = false;
        return;
      }
      $rootScope.showSaveModal = false;
      $rootScope.blinkSaveButton = false;
      $scope.disableTagWithName = true;
    };

    $rootScope.proceedToSave = function(editableCampaign, from) {
      if (
        !CampaignComposeService.campaignData.campaign_name &&
        from != "fromConfirm"
      ) {
        $scope.disableTagWithName = true;
      } else {
        if (!CampaignComposeService.campaignData.campaign_name) {
          CampaignComposeService.campaignData.campaign_name = "Saved";
        }
        if (editableCampaign) {
          switch (editableCampaign.status) {
            case "saved":
              CampaignComposeService.doValitation("saved", from);
              return;
            case "scheduled":
              CampaignComposeService.saveChanges = true;
              CampaignComposeService.doValitation("scheduled");
              return;
            default:
              return;
          }
        } else if (CampaignComposeService.campaignData.remaining_repeats == 0) {
          CampaignComposeService.doValitation("saved", from);
        }
      }
    };

    $scope.composeSendNow = function() {
      if (!CampaignComposeService.campaignData.campaign_name) {
        $scope.disableTagWithName = true;
      } else {
        CampaignComposeService.doValitation("start");
      }
    };

    $scope.changePlaybackCount = function(count) {
      if (CampaignComposeService.checkIfAlreadyStarted()) {
        return;
      }
      if ($scope.playBackCountActivated || count === 1) {
        CampaignComposeService.campaignData.playback_count = count;
      } else {
        $scope.showPlaybackModal(count);
      }
      $rootScope.blinkSaveButton = true;
    };

    $scope.getPlaybackCount = function(count) {
      if (!CampaignComposeService.campaignData.playback_count)
        CampaignComposeService.campaignData.playback_count = 1;
      return CampaignComposeService.campaignData.playback_count == count;
    };

    $scope.showInteractionModal = function(checked) {
      if (checked) {
        CampaignComposeService.replayDigit.onOff = false;
        CallBournModal.open(
          {
            scope: {
              CampaignComposeService: CampaignComposeService,
              chosedInteractions: $scope.chosedInteractions,
              hasInArray: $scope.hasInArray
            },
            templateUrl: "/app/modals/camping-batch/activate-replay.html",
            size: "modal-md"
          },
          function(scope) {
            scope.isInactive = function(item, index) {
              switch (index) {
                case 0:
                  if (
                    CampaignComposeService.campaignData.do_not_call_digit ==
                      item ||
                    CampaignComposeService.campaignData.transfer_digit ==
                      item ||
                    CampaignComposeService.campaignData.callback_digit == item
                  ) {
                    return true;
                  }
                  break;
              }
            };
            scope.selectInteraction = function(interaction) {
              CampaignComposeService.replayDigit.onOff = true;
              CampaignComposeService.campaignData.replay_digit = interaction;
              $scope.chosedInteractions[0] = interaction;
              // CallBournModal.close();
            };
            scope.arrowHelper = true;
            scope.hideArrowHelper = function() {
              scope.arrowHelper = false;
            };
            //unchecked by default
            CampaignComposeService.replayDigit.checkboxChecked = false;

            /**
             * activated replay digit
             */
            scope.replyDigitActivated = function() {
              if (!CampaignComposeService.replayDigit.checkboxChecked) {
                return;
              }

              CallBournModal.close();

              CallBournModal.open(
                {
                  scope: {
                    chosedInteractions: $scope.chosedInteractions,
                    hasInArray: $scope.hasInArray
                  },
                  templateUrl: "/app/modals/camping-batch/dijit-choosen.html"
                },
                function(scope) {
                  scope.selectInteraction = function(interaction) {
                    CampaignComposeService.replayDigit.onOff = true;
                    CampaignComposeService.campaignData.replay_digit = interaction;
                    $scope.chosedInteractions[0] = interaction;
                    CallBournModal.close();
                  };
                }
              );
            };
            scope.cancelModal = function() {
              CampaignComposeService.replayDigit.onOff = false;
              $scope.chosedInteractions[0] = null;
              CampaignComposeService.campaignData.replay_digit = null;
              CallBournModal.close();
            };
            scope.digitError = false;
            scope.checkboxError = false;
            scope.finishModal = function() {
              if (
                !$scope.chosedInteractions[0] &&
                $scope.chosedInteractions[0] !== 0
              ) {
                scope.digitError = true;
              } else if (!CampaignComposeService.replayDigit.checkboxChecked) {
                scope.checkboxError = true;
              } else {
                $rootScope.blinkSaveButton = true;
                $rootScope.showBlurEffect = false;
                CallBournModal.close();
              }
            };
          }
        );
      } else {
        $scope.chosedInteractions[0] = null;
      }
    };

    $scope.reloadUsersData = function() {
      SettingsService.getShowUser().then(function(data) {
        if (data.resource.user_data) {
          $rootScope.currentUser = data.resource.user_data;
        }
      });
    };

    $scope.isBalanceAvailableForPreListen = function() {
      if (
        $rootScope.currentUser.balance - $rootScope.currentUser.bonus > 0.15 &&
        CampaignComposeService.finalStepData.maxCost
      ) {
        return (
          $rootScope.currentUser.balance - $rootScope.currentUser.bonus >
          CampaignComposeService.finalStepData.maxCost
        );
      }
    };

    $scope.isBalanceAvailable = function() {
      var realBalance = 0;

      if ($rootScope.selectedType === "vm") {
        var minBalanceForSingleCall =
          CampaignComposeService.finalStepData.maxCost /
          scope.finalRecipientsCount;
        realBalance =
          $rootScope.currentUser.balance -
          $rootScope.currentUser.bonus -
          minBalanceForSingleCall;
      } else {
        realBalance =
          $rootScope.currentUser.balance -
          CampaignComposeService.finalStepData.maxCostWithSms;
      }

      return realBalance > 0 ? true : false;
    };

    $scope.isBalanceAvailablenceNotEnoughtToCallAllRecipients = function() {
      if (
        $rootScope.currentUser.balance <
        CampaignComposeService.finalStepData.maxCost
      ) {
        // because of amount is not enought
        $scope.disabledCampaignButtonText = $rootScope.trans(
          "compose_step_3_disable_send_now"
        );
        $scope.disabledCampaignSchedulationButtonText = $rootScope.trans(
          "compose_step_3_disable_schedule"
        );
        return true;
      } else if (
        $rootScope.currentUser.bonus > 0 &&
        CampaignComposeService.campaignData.max_gift_cost === 0 &&
        CampaignComposeService.finalStepData.maxCost >
          $rootScope.currentUser.balance - $rootScope.currentUser.bonus
      ) {
        // because of not matchin any criteria
        $scope.disabledCampaignButtonText = $rootScope.trans(
          "compose_step_3_disable_send_now_because_of_criteria"
        );
        $scope.disabledCampaignSchedulationButtonText = $rootScope.trans(
          "compose_step_3_disable_send_now_because_of_criteria"
        );
        return true;
      }
      $scope.disabledCampaignButtonText = "";
      return false;
    };

    /**
     *
     */
    $scope.showBatchesChangeMessageDeliverySpeedModal = function() {
      CallBournModal.open(
        {
          scope: {
            campaignData: $scope.campaignData,
            inside: "",
            minutes: ""
          },
          templateUrl:
            "/app/modals/camping-batch/change-message-delivery-speed.html"
        },
        function(scope) {
          /**
           * select sending time
           * @param data
           */
          scope.inside = $rootScope.trans(
            "message_delivery_speed_modal_Inside"
          );
          scope.minutes = $rootScope.trans(
            "message_delivery_speed_modal_minutes"
          );
          var text = $rootScope.trans("message_delivery_speed_modal_max_speed");
          var text1 = scope.inside + " 15 " + scope.minutes;
          var text2 = scope.inside + " 30 " + scope.minutes;
          var text3 = scope.inside + " 45 " + scope.minutes;
          var text4 = scope.inside + " 60 " + scope.minutes;
          var text5 = scope.inside + " 75 " + scope.minutes;
          var text6 = scope.inside + " 90 " + scope.minutes;
          var text7 = scope.inside + " 105 " + scope.minutes;
          var text8 = scope.inside + " 120 " + scope.minutes;
          scope.maxSpeedSelect = [
            { value: "", text: text },
            { value: 15, text: text1 },
            { value: 30, text: text2 },
            { value: 45, text: text3 },
            { value: 60, text: text4 },
            { value: 75, text: text5 },
            { value: 90, text: text6 },
            { value: 105, text: text7 },
            { value: 120, text: text8 }
          ];

          scope.selectSendingTime = function(data) {
            CampaignComposeService.finalStepData.sendingTime = data.sending_time
              ? data.sending_time
              : 1;
            CampaignComposeService.campaignData.sending_time = data.sending_time
              ? data.sending_time
              : 3;
          };
        }
      );
    };
    /**
     * Voice message
     */
    $scope.showVoiceMessageModal = function() {
      CampaignComposeService.doValitation("start");
    };

    /**
     * show activate compose activate call back modal
     */

    $scope.showComposeActivateCallbackModal = function(checked) {
      if (checked) {
        CampaignComposeService.callbackDigit.onOff = false;
        CampaignComposeService.callbackDigit.checkboxChecked = false;
        CallBournModal.open(
          {
            scope: {
              availableTts: $scope.availableTts,
              CampaignComposeService: CampaignComposeService,
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
            templateUrl: "/app/modals/camping-batch/activate-callback.html",
            size: "modal-md"
          },
          function(scope) {
            Restangular.one("audio-files/audio-templates")
              .get({ saved_from: "CALL_ME_BACK" })
              .then(function(data) {
                scope.callbackTemplates = data.resource;
              });

            scope.arrowHelper = true;
            scope.finishArrow = false;
            scope.hideArrowHelper = function() {
              scope.arrowHelper = false;
              scope.finishArrow = false;
            };
            scope.showFinishArrow = function() {
              scope.finishArrow = true;
              scope.arrowHelper = true;
            };
            scope.isInactive = function(item, index) {
              switch (index) {
                case 2:
                  if (
                    CampaignComposeService.campaignData.replay_digit == item ||
                    CampaignComposeService.campaignData.transfer_digit ==
                      item ||
                    CampaignComposeService.campaignData.do_not_call_digit ==
                      item
                  ) {
                    return true;
                  }
                  break;
              }
            };
            scope.selectInteraction = function(interaction) {
              CampaignComposeService.callbackDigit.onOff = true;
              CampaignComposeService.campaignData.callback_digit = interaction;
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
              scope.arrowHelper = true;
              scope.hideArrowHelper = function() {
                scope.arrowHelper = false;
              };
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
                angular.element("#campaignBatchFileInput").trigger("click");
              }, 100);
            };
            scope.checkAll = function() {
              return !CampaignComposeService.callbackDigit.checkboxChecked;
            };

            scope.callbackAudioTemplateSelected = function(file) {
              scope.callbackTtsData.text = file.tts_text;
              scope.seletedTemplateId = file._id;
              CampaignComposeService.campaignData.callback_voice_file_id =
                file._id;
              scope.selectedCallbackAudioTemplateFile = file;
              scope.tempNewCreatedModel = file;
              scope.activationCheckboxStep = true;
              scope.showFinishArrow();
            };

            scope.slsectAudio = function(template) {
              CampaignComposeService.finalStepData.voiceFile = template;
              CampaignComposeService.campaignData.campaign_voice_file_id =
                template._id;
              CampaignComposeService.goToStep(2);
            };

            scope.playPauseCallbackTemplateAudio = function(action) {
              if (!scope.selectedCallbackAudioTemplateFile._id) {
                return;
              }
              var audio = document.getElementById("callbackAudioFileTemplate");
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
              var audio = document.getElementById("callbackCreatedAudioFile");
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
            scope.callbackDigitFileUpload = new FileUploader({
              url: "/campaigns/upload-audio-file",
              alias: "file",
              headers: {
                JWTAuthorization: "Bearer " + localStorage.getItem("jwtToken"),
                savedFrom: "CALL_ME_BACK"
              },
              autoUpload: true
            });

            scope.callbackDigitFileUpload.onAfterAddingFile = function(item) {
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
                scope.callbackAudioTemplateSelected(response.resource.file);
                growl.success(
                  $rootScope.trans(response.resource.error.message)
                );
              } else {
                growl.error($rootScope.trans(response.resource.error.text));
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
                angular.element("#campaignCallbackFileInput").trigger("click");
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
                angular.element("#audioFilePlay").addClass("fa-play-circle");
                angular.element("#audioFilePlay").removeClass("fa-stop-circle");
              } else {
                audio.play();
                angular.element("#audioFilePlay").removeClass("fa-stop-circle");
                angular.element("#audioFilePlay").addClass("fa-stop-circle");
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
                    CampaignComposeService.campaignData.callback_voice_file_id =
                      file._id;
                    scope.tempNewCreatedModel = file;
                    scope.seletedTemplateId = file._id;
                    scope.isTtsUploaded = true;
                    scope.activationCheckboxStep = true;
                    scope.showFinishArrow();
                  } else {
                    growl.error($rootScope.trans(data.resource.error.text));
                  }
                });
            };

            scope.cancelModal = function() {
              CampaignComposeService.callbackDigit.onOff = false;
              $scope.chosedInteractions[2] = null;
              CampaignComposeService.campaignData.callback_digit = null;
              CallBournModal.close();
            };
            scope.finishModal = function() {
              scope.digitError = false;
              scope.checkboxError = false;
              scope.tempError = false;
              if (
                !$scope.chosedInteractions[2] &&
                $scope.chosedInteractions[2] !== 0
              ) {
                scope.digitError = true;
              } else if (
                !CampaignComposeService.callbackDigit.checkboxChecked
              ) {
                scope.checkboxError = true;
              } else if (!scope.tempNewCreatedModel) {
                if (!scope.callbackTtsData.text) {
                  scope.tempError = true;
                } else {
                  scope.createAudioFromTextForCallback();
                  $rootScope.blinkSaveButton = true;
                  $rootScope.showBlurEffect = false;
                  CallBournModal.close();
                }
              } else {
                $rootScope.blinkSaveButton = true;
                $rootScope.showBlurEffect = false;
                CallBournModal.close();
              }
            };
          }
        );
      } else {
        $scope.chosedInteractions[2] = null;
      }
    };

    /**
     * show activate compose do not call back modal
     */
    $scope.showDoNotCallModal = function(checked) {
      if (checked) {
        CampaignComposeService.doNotCallDigit.onOff = false;
        CampaignComposeService.doNotCallDigit.checkboxChecked = false;
        CallBournModal.open(
          {
            scope: {
              CampaignComposeService: CampaignComposeService,
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
            templateUrl: "/app/modals/camping-batch/activate-do-not-call.html",
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
            scope.arrowHelper = true;
            scope.finishArrow = false;
            scope.hideArrowHelper = function() {
              scope.arrowHelper = false;
              scope.finishArrow = false;
            };
            scope.showFinishArrow = function() {
              scope.finishArrow = true;
              scope.arrowHelper = true;
            };
            scope.isInactive = function(item, index) {
              switch (index) {
                case 3:
                  if (
                    CampaignComposeService.campaignData.replay_digit == item ||
                    CampaignComposeService.campaignData.transfer_digit ==
                      item ||
                    CampaignComposeService.campaignData.callback_digit == item
                  ) {
                    return true;
                  }
                  break;
              }
            };
            scope.selectInteraction = function(interaction) {
              CampaignComposeService.doNotCallDigit.onOff = true;
              CampaignComposeService.campaignData.do_not_call_digit = interaction;
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
              scope.arrowHelper = true;
            };
            /**
             * open file select by tirger click
             */
            scope.openBatchFileSelect = function() {
              $timeout(function() {
                angular.element("#campaignBatchFileInput").trigger("click");
              }, 100);
            };

            scope.checkAll = function() {
              return !CampaignComposeService.doNotCallDigit.checkboxChecked;
            };

            scope.doNotCallAudioTemplateSelected = function(file) {
              scope.doNotCallTtsData.text = file.tts_text;
              scope.seletedTemplateId = file._id;
              scope.selectedDoNotCallAudioTemplateFile = file;
              scope.tempNewCreatedModel = file;
              CampaignComposeService.campaignData.do_not_call_voice_file_id =
                file._id;
              scope.activationCheckboxStep = true;
              scope.showFinishArrow();
            };

            scope.selectDoNotCallNewCreatedAudioFile = function(file) {
              scope.newDoNotCallSelectedAudioFile = file.file;
              CampaignComposeService.campaignData.do_not_call_voice_file_id =
                file.file._id;
            };

            scope.playPauseDoNotCallTemplateAudio = function(action) {
              if (!scope.selectedDoNotCallAudioTemplateFile._id) {
                return;
              }
              var audio = document.getElementById("doNotCallAudioFileTemplate");
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
              var audio = document.getElementById("doNotCallCreatedAudioFile");
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
            scope.doNotCallDigitFileUpload = new FileUploader({
              url: "/campaigns/upload-audio-file",
              alias: "file",
              headers: {
                JWTAuthorization: "Bearer " + localStorage.getItem("jwtToken"),
                savedFrom: "BLACKLIST"
              },
              autoUpload: true
            });

            scope.doNotCallDigitFileUpload.onAfterAddingFile = function(item) {
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
            scope.doNotCallDigitFileUpload.onSuccessItem = function(
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
                growl.error($rootScope.trans(response.resource.error.text));
              }
            };

            /**
             * file uploading error action
             * @param item
             * @param response
             * @param status
             * @param headers
             */
            scope.doNotCallDigitFileUpload.onErrorItem = function(
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
              $scope.doNotCallDigitFileUpload.uploadAll();
            };
            /**
             * open file select
             */
            scope.openDoNotCallFileSelect = function() {
              $timeout(function() {
                angular.element("#campaignDoNotCallFileInput").trigger("click");
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
              var audio = document.getElementById("ttsDoNotCallDemoAudio");
              if ($scope.isRecordedFilePlaying) {
                audio.pause();
                audio.currentTime = 0;
                angular.element("#audioFilePlay").addClass("fa-play-circle");
                angular.element("#audioFilePlay").removeClass("fa-stop-circle");
              } else {
                audio.play();
                angular.element("#audioFilePlay").removeClass("fa-stop-circle");
                angular.element("#audioFilePlay").addClass("fa-stop-circle");
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
              CampingService.createAudioFromText(scope.doNotCallTtsData).then(
                function(data) {
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
                }
              );
              scope.showFinishArrow();
            };

            scope.cancelModal = function() {
              CampaignComposeService.doNotCallDigit.onOff = false;
              $scope.chosedInteractions[3] = null;
              CampaignComposeService.campaignData.do_not_call_digit = null;
              CallBournModal.close();
            };
            scope.finishModal = function() {
              scope.digitError = false;
              scope.checkboxError = false;
              scope.tempError = false;
              if (
                !$scope.chosedInteractions[3] &&
                $scope.chosedInteractions[3] !== 0
              ) {
                scope.digitError = true;
              } else if (
                !CampaignComposeService.doNotCallDigit.checkboxChecked
              ) {
                scope.checkboxError = true;
              } else if (!scope.tempNewCreatedModel) {
                if (!scope.doNotCallTtsData.text) {
                  scope.tempError = true;
                } else {
                  createAudioFromTextForDoNotCall;
                  $rootScope.blinkSaveButton = true;
                  $rootScope.showBlurEffect = false;
                  CallBournModal.close();
                }
              } else {
                $rootScope.blinkSaveButton = true;
                $rootScope.showBlurEffect = false;
                CallBournModal.close();
              }
            };
          }
        );
      } else {
        $scope.chosedInteractions[3] = null;
      }
      $rootScope.blinkSaveButton = true;
    };

    /**
     * Open modal for activating transfer interaction.
     */
    $scope.showTransferModal = function(checked) {
      if (checked) {
        CampaignComposeService.transferDigit.onOff = false;
        CampaignComposeService.transferDigit.checkboxChecked = false;
        CallBournModal.open(
          {
            scope: {
              CampaignComposeService: CampaignComposeService,
              currentUser: $rootScope.currentUser,
              liveTransferNumbers: [],
              transferStep: 1,
              chosedInteractions: $scope.chosedInteractions,
              hasInArray: $scope.hasInArray
            },
            templateUrl: "/app/modals/camping-batch/activate-transfer.html",
            size: "modal-md"
          },
          function(scope) {
            scope.arrowHelper = true;
            scope.hideArrowHelper = function() {
              scope.arrowHelper = false;
            };
            scope.transferLimitValue = "";
            scope.checkRadioForManuallyNumber = function(number) {
              CampaignComposeService.campaignData.live_transfer_limit = number;
              console.log(
                CampaignComposeService.campaignData.live_transfer_limit
              );
            };
            scope.checkRadioForTransferLimit = function() {
              CampaignComposeService.campaignData.live_transfer_limit = "";
              console.log(
                CampaignComposeService.campaignData.live_transfer_limit
              );
            };
            scope.transferLimit = {
              1: { key: $rootScope.trans("transfer_unlimited2"), value: "" },
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
            if (CampaignComposeService.editingCampaign) {
              CampaignComposeService.audioTemplates.files.unshift();
            }
            if (
              CampaignComposeService.editingCampaign &&
              CampaignComposeService.editingCampaign.transfer_options
            ) {
              $scope.liveTransferNumbers = CampaignComposeService.editingCampaign.transfer_options.split();
            } else {
              $scope.liveTransferNumbers = [];
            }
            scope.isInactive = function(item, index) {
              switch (index) {
                case 1:
                  if (
                    CampaignComposeService.campaignData.replay_digit == item ||
                    CampaignComposeService.campaignData.callback_digit ==
                      item ||
                    CampaignComposeService.campaignData.do_not_call_digit ==
                      item
                  ) {
                    return true;
                  }
                  break;
              }
            };
            scope.selectInteraction = function(interaction) {
              CampaignComposeService.transferDigit.onOff = true;
              CampaignComposeService.campaignData.transfer_digit = interaction;
              $scope.chosedInteractions[1] = interaction;
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
                countryId: $rootScope.currentUser.numbers[0].tariff.country_id
              });
              scope.liveTransferNumbers.push(
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
                scope.liveTransferNumbers.splice(index, 1);
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
                      growl.error($rootScope.trans("country_id_dont_match"));
                    }
                  });
                }
              }
            };

            scope.chnageTransferStep = function(step) {
              scope.arrowHelper = true;
              scope.transferStep = step;
            };

            scope.cancelModal = function() {
              CampaignComposeService.transferDigit.onOff = false;
              $scope.chosedInteractions[1] = null;
              CampaignComposeService.campaignData.transfer_digit = null;
              CallBournModal.close();
            };
            scope.digitError = false;
            scope.checkboxError = false;
            scope.liveNumberErr = false;
            scope.finishModal = function() {
              if (
                !$scope.chosedInteractions[1] &&
                $scope.chosedInteractions[1] !== 0
              ) {
                scope.digitError = true;
              } else if (
                !CampaignComposeService.transferDigit.checkboxChecked
              ) {
                scope.checkboxError = true;
              } else if (!scope.liveTransferNumbers.length) {
                scope.liveNumberErr = true;
              } else {
                $rootScope.blinkSaveButton = true;
                $rootScope.showBlurEffect = false;
                CampaignComposeService.campaignData.transfer_options = scope.liveTransferNumbers.join();
                CallBournModal.close();
              }
            };
          }
        );
      } else {
        $scope.chosedInteractions[1] = null;
      }
      $rootScope.blinkSaveButton = true;
    };

    // CampaignComposeService.campaignData.caller_id =
    // CampaignComposeService.campaignData.caller_id ?
    // CampaignComposeService.campaignData.caller_id :
    // $rootScope.currentUser.numbers[0]

    /**
     * Open modal for changing repeats count
     */
    $scope.showChangeRepeatsCountModal = function() {
      CallBournModal.open(
        {
          scope: {},
          templateUrl: "/app/modals/camping-batch/change-repeat-count.html"
        },
        function(scope) {
          scope.testFunction = function() {
            alert("ok");
          };
        }
      );
    };
    /*** caller id modal inject ***/
    $scope.verified = false;
    $scope.callRoutes = [];
    $scope.flagImages = [];
    $scope.selectData = [];
    $scope.CurrentLanguageIndex = -1;
    $scope.selectedCallRoute = {};
    $scope.defaultClass = "default-image-step-1";
    Restangular.one("data/current-country")
      .get()
      .then(function(data) {
        $scope.CurrentCountry = data.resource.countryCode;
      });
    Restangular.one("data/call-routes")
      .get()
      .then(function(data) {
        $scope.callRoutes = data.resource.routes;
        for (index in $scope.callRoutes) {
          var newRouteObject = {
            keepAttr: $scope.callRoutes[index],
            viewText:
              $scope.callRoutes[index].original_name +
              "+" +
              $scope.callRoutes[index].phonenumber_prefix
          };
          $scope.selectData.push(newRouteObject);
          $scope.flagImages.push(
            "/assets/callburn/images/flags/" +
              $scope.callRoutes[index].code +
              ".svg"
          );
          if (
            $scope.CurrentCountry ==
            localStorage.getItem("CurrentUserLanguageCode")
          ) {
            $scope.CurrentLanguageIndex = index;
          }
        }
        if ($scope.CurrentLanguageIndex != -1) {
          $scope.defaultClass = "";
        }
        $scope.selectedCallRoute.route =
          $scope.callRoutes[$scope.CurrentLanguageIndex];
      });
    var checkHtmlElement = function(selector) {
      var queue = $q.defer();

      var timer = $interval(function() {
        if (angular.element(selector).length) {
          $interval.cancel(timer);
          queue.resolve(angular.element(selector));
        }
      }, 300);

      return queue.promise;
    };
    // $scope.isExist ? ... :
    $scope.showCallerIdModal = function() {
      CallBournModal.open(
        {
          scope: {
            currentUser: $rootScope.currentUser,
            senderName: CampaignComposeService.campaignData.sender_name,
            selectedCallerId: CampaignComposeService.campaignData.caller_id
              || $rootScope.currentUser.numbers[
                  $rootScope.currentUser.numbers.length - 1
                ].phone_number
          },
          templateUrl: "/app/modals/camping-batch/change-caller-id.html"
        },
        function(scope) {
          $scope.isCampaginExist(scope.selectedCallerId);
          // if (!$scope.isExist) {
          //   scope.selectedCallerId =
          //     $rootScope.currentUser.numbers[$rootScope.currentUser.numbers.length - 1].phone_number;
          //   $scope.campaignData.caller_id = scope.selectedCallerId;
          //   CampaignComposeService.campaignData.caller_id = scope.selectedCallerId;
          // }
          scope.smsObj = {};
          scope.smsObj.senderName = scope.senderName ? scope.senderName : "";
          scope.callerIdSelected = function(number, code) {
            $rootScope.blinkSaveButton = true;
            scope.selectedCallerId = number;
            scope.selectedCode = code;
          };
          scope.changeCallerId = function() {
            window.first_advisable_caller_id = scope.selectedCallerId;
            $scope.campaignData.caller_id = scope.selectedCallerId;
            CampaignComposeService.campaignData.caller_id =
            scope.selectedCallerId;
            CampaignComposeService.campaignData.code = scope.selectedCode;
            CampaignComposeService.calculateCostForPreListening();
            $scope.showCallerIDName(CampaignComposeService.campaignData.caller_id);
            if (CampaignComposeService.campaignData.campaign_id) {
              CampaignComposeService.updateCallerId().then(function(response) {
                if (response.error.no === 0) {
                  growl.success($rootScope.trans("campaign_caller_id_updated"));
                  CallBournModal.close();
                } else {
                  growl.error(
                    $rootScope.trans("something_went_wrong_on_caller_id_update")
                  );
                }
              });
            } else {
              CallBournModal.close();
            }
            if (
              $rootScope.selectedType === "vmSms" ||
              $rootScope.selectedType === "sms"
            ) {
              if (scope.smsObj.senderName) {
                if (
                  scope.smsObj.senderName.length < 3 ||
                  scope.smsObj.senderName.length > 11
                ) {
                  growl.error(
                    $rootScope.trans("sender_name_must_be_3_to_11_characters")
                  );
                } else {
                  CampaignComposeService.campaignData.sender_name =
                    scope.smsObj.senderName;
                  CallBournModal.close();
                }
              } else {
                CampaignComposeService.campaignData.sender_name = "";
                CallBournModal.close();
              }
            }
          };

          scope.AddCallerIdModal = function() {
            CallBournModal.open(
              {
                scope: {
                  loading: false,
                  showTimer: false,
                  addContactData: {},
                  showCallCodeField: false,
                  verified: $scope.verified,
                  callRoutes: $scope.callRoutes,
                  flagImages: $scope.flagImages,
                  selectData: $scope.selectData,
                  selectedCallRoute: $scope.selectedCallRoute,
                  CurrentLanguageIndex: $scope.CurrentLanguageIndex,
                  defaultClass: "default-image-step-1 default-size",
                  validVerificationCallData: true,
                  userCountry: ["am", "es", "it"].includes(
                    $rootScope.currentUser.country_code
                  )
                    ? $rootScope.currentUser.country_code
                    : ""
                },
                templateUrl: "/app/modals/settings/settings-modal.html"
              },
              function(scope) {
                scope.closeModal = function() {
                  angular.element("#phone")[0].value = "";
                  CallBournModal.close();
                };
                scope.isValidNumberClass = "inp-placeholder";
                scope.addPrefix = function() {
                  var elem = angular.element("#phone")[0];
                  elem.value[0] === "+" || elem.value === ""
                    ? null
                    : (elem.value =
                        "+ " +
                        sessionStorage.getItem("dial") +
                        " " +
                        elem.value);
                };

                checkHtmlElement("#phone").then(function(element) {
                  element.on("countrychange", function(e, countryData) {
                    element.value = sessionStorage.getItem("dial");
                  });

                  var countryData = angular
                    .element("#phone")
                    .intlTelInput("getSelectedCountryData");

                  scope.validator = function() {
                    if (
                      angular.element("#phone").intlTelInput("isValidNumber")
                    ) {
                      scope.isValidNumberClass = "input-success";
                      scope.validVerificationCallData = false;
                    } else {
                      scope.isValidNumberClass = "input-error";
                      scope.validVerificationCallData = true;
                      if (scope.addContactData.phonenumber === "") {
                        scope.isValidNumberClass = "inp-placeholder";
                      }
                    }
                  };
                });

                scope.timer = function(count) {
                  var queue = $q.defer();

                  var timer = $interval(function() {
                    scope.counter = count;
                    scope.counter = count--;

                    if (count < 0) {
                      $interval.cancel(timer);
                      queue.resolve();
                    }
                  }, 1000);

                  return queue.promise;
                };

                scope.verified = false;
                scope.callMade = false;
                var finalPhonenumber = false;

                scope.getDefaultSelected = function(index) {
                  if (!scope.callRoutes[index]) {
                    return {
                      image: "country-icon@2x",
                      text: $rootScope.trans(
                        "modals_settings_edit_profile_modal_country"
                      )
                    };
                  }
                  scope.defaultClass = "";
                  return {
                    image: scope.callRoutes[index].code,
                    text: "+" + scope.callRoutes[index].phonenumber_prefix
                  };
                };

                scope.selectedNumber = function() {
                  scope.defaultClass = "";
                  scope.phonenumberExample =
                    scope.selectedCallRoute.route.phonenumber_example;
                };

                scope.showNameBtn = false;
                scope.AddCallerId = function() {
                  $rootScope.startModalLoader();
                  $rootScope.disableButton();
                  var requestData = {};
                  angular.copy(scope.addContactData, requestData);
                  requestData.phonenumber = finalPhonenumber;
                  requestData.name = scope.addContactData.name;
                  SettingsService.addCallerId(requestData).then(function(data) {
                    $rootScope.stopModalLoader();
                    $rootScope.enabledButton();
                    if (data.resource.error.no == 0) {
                      $scope.reloadUsersData();
                      scope.showNameBtn = true;
                      scope.showCodeInput = false;
                      $scope.lastAddedId = data.resource._id;
                      growl.success(data.resource.error.text);
                    } else {
                      growl.error(data.resource.error.text);
                    }
                  });
                };

                scope.showCodeInput = false;
                scope.sendVerificationCall = function() {
                  $rootScope.startModalLoader();
                  $rootScope.disableButton();

                  var addContactData = {};
                  if (typeof scope.selectedCallRoute.route == "undefined") {
                    addContactData.phonenumber =
                      scope.addContactData.phonenumber;
                  } else {
                    addContactData.phonenumber = scope.addContactData.name;
                  }

                  scope.loading = true;
                  SettingsService.sendVerificationCode(addContactData).then(
                    function(data) {
                      scope.showCodeInput = true;
                      $rootScope.socket.on(
                        "update-verification-message",
                        function(data) {
                          if (
                            !scope.phonenumber_id ||
                            scope.phonenumber_id == data.message.phonenumber_id
                          ) {
                            scope.phonenumber_id = data.message.phonenumber_id;
                            scope.verification_status = data.message.status;
                            if (
                              scope.verification_status == "FAILED" ||
                              scope.verification_status == "SUCCEED"
                            ) {
                              // scope.timer(20).then(function() {
                              // scope.showTimer = false;
                              // });
                            }
                          }
                        }
                      );
                      // scope.showTimer = true;
                      $rootScope.stopModalLoader();
                      $rootScope.enabledButton();
                      scope.loading = false;
                      if (data.resource.error.no == 0) {
                        // scope.showCodeInput = true;
                        // scope.timer(20).then(function() {
                        //   scope.showTimer = false;
                        // });
                        window.first_advisable_caller_id =
                          data.resource.phonenumber;
                        CampaignComposeService.campaignData.caller_id =
                          data.resource.phonenumber;
                        finalPhonenumber = data.resource.phonenumber;
                        scope.showCallCodeField = true;
                        // growl.success(data.resource.error.text);
                        scope.verified = true;
                        scope.callMade = true;
                      } else {
                        growl.error(data.resource.error.text);
                      }
                    }
                  );
                };

                scope.finishCallerId = function(name) {
                  SettingsService.updateCallerId({
                    id: $scope.lastAddedId,
                    name: name
                  }).then(function(data) {
                    $scope.reloadUsersData();
                  });
                  CallBournModal.close();
                };
              }
            );
          };
        }
      );
    };
    // Show playback count modal
    $scope.playBackCountActivated = false;
    $scope.showPlaybackModal = function(count) {
      if (!$scope.isPlaybackConfirmed) {
        CallBournModal.open(
          {
            scope: {},
            templateUrl: "/app/modals/camping-batch/confirm-playback.html"
          },
          function(scope) {
            scope.playbackIsChecked = false;
            scope.confirmPlayback = function() {
              $scope.playBackCountActivated = true;
              CampaignComposeService.campaignData.playback_count = count;
              CallBournModal.close();
            };
            scope.closeModal = function() {
              CallBournModal.close();
            };
          }
        );
      }
      $rootScope.blinkSaveButton = true;
    };

    /////////////////////////////////////////////////////////MODALS/////////////////////////////////////////////

    ///////////////////////////////////////////////////////////FUNCTIONS////////////////////////////////////////

    $scope.createAudioFromTextForCallback = function() {
      $rootScope.disableButton();
      $scope.callbackTtsData.saved_from = "CALL_ME_BACK";
      Restangular.all("campaigns/create-audio-from-text")
        .post($scope.callbackTtsData)
        .then(function(data) {
          $rootScope.enabledButton();
          if (data.resource.error.no == 0) {
            $scope.callbackTtsData = { language: null };
            var audioData = {
              source: $sce.trustAsResourceUrl(
                apiUrl +
                  "?key=" +
                  $rootScope.currentUser.api_token +
                  "&file_id=" +
                  data.resource.file._id
              ),
              file: data.resource.file
            };
            $scope.callbackAudioFiles.push(audioData);
            $scope.audioTemplates.push(data.resource.file);
          } else {
            growl.error($rootScope.trans(data.resource.error.text));
          }
        });
    };

    $scope.showSendPreviewModal = function() {
      $rootScope.fileIdErr = false;
      $rootScope.smsTextErr = false;
      if (!CampaignComposeService.campaignData.campaign_name) {
        $scope.disableTagWithName = true;
        return;
      } else if ($rootScope.selectedType === "vmSms") {
        if (!CampaignComposeService.campaignData.campaign_voice_file_id) {
          $rootScope.fileIdErr = true;
          $scope.scrollToErr("vm");
          return;
        } else if (!CampaignComposeService.campaignData.sms_text) {
          $rootScope.smsTextErr = true;
          $scope.scrollToErr("sms");
          return;
        }
      } else if (
        $rootScope.selectedType === "vm" &&
        !CampaignComposeService.campaignData.campaign_voice_file_id
      ) {
        $rootScope.fileIdErr = true;
        $scope.scrollToErr("vm");
        return;
      } else if (
        $rootScope.selectedType === "sms" &&
        !CampaignComposeService.campaignData.sms_text
      ) {
        $rootScope.smsTextErr = true;
        $scope.scrollToErr("sms");
        return;
      }
      CallBournModal.open(
        {
          scope: {
            campaignData: $scope.campaignData,
            composeData: CampaignComposeService.campaignData
          },
          templateUrl: "/app/modals/camping-batch/send-preview.html"
        },
        function(scope) {
          scope.selectedPreviewType = "vm";
          scope.selectPreviewType = function(type) {
            scope.selectedPreviewType = type;
          };
          scope.sendPreviewToYourPhone = function(type) {
            $rootScope.proceedToSave(
              CampaignComposeService.editingCampaign,
              "preview"
            );
            CallBournModal.close();
          };
        }
      );
    };

    $scope.scrollToErr = function(elem) {
      if (elem == "sms") {
        var elem = angular.element(document.getElementById("sms_err"));
      } else if (elem == "vm") {
        var elem = angular.element(document.getElementById("vm_err"));
      } else if (elem == "recipients") {
        var elem = angular.element(document.getElementById("recipients_err"));
      }
      angular.element("html, body").animate({
        scrollTop: elem.offset().top - 100
      });
    };

    $scope.showRepitationConfirmModal = function() {
      CallBournModal.open(
        {
          scope: {
            CampaignComposeService: CampaignComposeService
          },
          templateUrl:
            "/app/modals/camping-batch/show-repiteation-count-confirm.html"
        },
        function(scope) {
          scope.dates = [];
          scope.newStart = scope.dayDate._i;
          for (
            var i = 0;
            i < CampaignComposeService.campaignData.remaining_repeats;
            i++
          ) {
            scope.dates.push(
              moment()
                .add(
                  i * CampaignComposeService.campaignData.repeat_days_interval,
                  "days"
                )
                .format("LLLL")
            );
          }
        }
      );
    };

    $scope.Math = Math;
    moment.tz.setDefault($rootScope.currentUser.timezone);

    $rootScope.scheduleModalOpened = false;
    $scope.showScedulationModal = function() {
      if (CampaignComposeService.campaignData.same_sms_text == undefined) {
        CampaignComposeService.campaignData.same_sms_text = true;
      }
      $rootScope.scheduleModalOpened = true;
      $rootScope.fileIdErr = false;
      $rootScope.smsTextErr = false;
      $rootScope.recipientsErr = false;
      if (!CampaignComposeService.campaignData.campaign_name) {
        $scope.disableTagWithName = true;
        return;
      } else if ($rootScope.selectedType === "vmSms") {
        if (!CampaignComposeService.campaignData.campaign_voice_file_id) {
          $rootScope.fileIdErr = true;
          $scope.scrollToErr("vm");
          return;
        } else if (!CampaignComposeService.campaignData.sms_text) {
          $rootScope.smsTextErr = true;
          $scope.scrollToErr("sms");
          return;
        }
        if (
          !CampaignComposeService.finalStepData.maxCost ||
          !CampaignComposeService.finalStepData.maxCostWithSms ||
          CampaignComposeService.finalStepData.maxCost ==
            CampaignComposeService.finalStepData.maxCostWithSms
        ) {
          if (CampaignComposeService.finalStepData.maxCost == 0) {
            $rootScope.recipientsErr = true;
            $scope.scrollToErr("recipients");
            return;
          } else if (
            CampaignComposeService.finalStepData.maxCost ==
            CampaignComposeService.finalStepData.maxCostWithSms
          ) {
            growl.error(
              $rootScope.trans("there_is_no_sms_tariff_for_your_country")
            );
            return;
          }
          $rootScope.recipientsErr = true;
          $scope.scrollToErr("recipients");
          return;
        }
      } else if ($rootScope.selectedType === "vm") {
        if (
          !CampaignComposeService.finalStepData.maxCost &&
          CampaignComposeService.campaignData.campaign_voice_file_id
        ) {
          $rootScope.recipientsErr = true;
          $scope.scrollToErr("recipients");
          return;
        } else if (
          !CampaignComposeService.campaignData.campaign_voice_file_id
        ) {
          $rootScope.fileIdErr = true;
          $scope.scrollToErr("vm");
          return;
        }
      } else if ($rootScope.selectedType === "sms") {
        if (!CampaignComposeService.finalStepData.maxCostWithSms) {
          $rootScope.recipientsErr = true;
          $scope.scrollToErr("recipients");
          return;
        } else if (!CampaignComposeService.campaignData.sms_text) {
          $rootScope.smsTextErr = true;
          $scope.scrollToErr("sms");
          return;
        }
      } else if (CampaignComposeService.checkIfAlreadyStarted()) {
        growl.error($rootScope.trans("this_campaign_already_started"));
        return;
      }
      moment.locale($rootScope.currentLanguage);
      CallBournModal.open(
        {
          scope: {
            CampaignComposeService: CampaignComposeService,
            usedRecipentsCount: $scope.usedRecipentsCount,
            pastSchedulations: $scope.pastSchedulations,
            options: $scope.options,
            uiCalendarConfig: uiCalendarConfig,
            recipients_count_to_call: 0,
            forEverySingleSchedulation:
              CampaignComposeService.finalStepData.numbersCount || 0,
            stringLocaleFormat:
              moment.localeData().longDateFormat("L") + " HH:mm:ss",
            firstDelSpeed: 0,
            lastDelSpeed: 0,
            finalRecipientsCount: 0
          },
          animation: false,
          templateUrl: "/app/modals/camping-batch/schedulation-modal.html",
          size: "modal-lg"
        },
        function(scope) {
          // scope.dataForRecepientsCountChange = CampaignComposeService.finalStepData.numbersCount;
          scope.finalRecipientsCount =
            CampaignComposeService.finalStepData.numbersCount;
          scope.stopBlink = function($event, time) {
            angular.element($event.target).addClass("no_animation");
          };

          scope.eventSources = [];
          scope.events = [];
          scope.dayEvents = [];
          scope.noEvents = true;
          scope.repeatIsTrue = false;

          function addZero(i) {
            if (i < 10) {
              i = "0" + i;
            }
            return i;
          }

          scope.initCalendar = function() {
            if (scope.uiCalendarConfig.calendars.myCalendar !== undefined) {
              scope.uiCalendarConfig.calendars.myCalendar = undefined;
            }

            angular
              .element("#calendar")
              .parent()
              .parent()
              .parent()
              .css({ width: 1140 });

            var getScheduledEvents = function() {
              if (
                CampaignComposeService.campaignData
                  .schedulation_original_data !== undefined &&
                CampaignComposeService.campaignData.schedulation_original_data
              ) {
                var originalEventsData =
                  CampaignComposeService.campaignData
                    .schedulation_original_data;
                originalEventsData = JSON.parse(originalEventsData);
                var schedulations =
                  CampaignComposeService.campaignData.schedulations;
                originalEventsData.forEach(function(event, i) {
                  // console.log(event.start);
                  // event.start = moment(event.start).format(
                  //   "YYYY-MM-DD H:mm:ss"
                  // );
                  schedulations.forEach(function(schedulation, j) {
                    if (
                      originalEventsData.indexOf(event) ===
                      schedulations.indexOf(schedulation)
                    ) {
                      originalEventsData[i].recipients_count_to_call =
                        schedulations[j].recipients;
                      originalEventsData[i].is_finished =
                        schedulations[j].is_finished;
                      originalEventsData[i].title =
                        $rootScope.trans("compose_step_3_text_recipients") +
                        (schedulations[j].delivery_speed
                          ? " - " +
                            $rootScope.trans(
                              "voice_message_schedule_modal1_message_delivery_speed"
                            )
                          : "");
                      originalEventsData[i].description =
                        schedulations[j].recipients +
                        (schedulations[j].delivery_speed
                          ? " - " +
                            schedulations[j].delivery_speed +
                            " " +
                            $rootScope.trans(
                              "message_delivery_speed_modal_minutes"
                            )
                          : "");
                      originalEventsData[i].color = schedulations[j].is_finished
                        ? "rgb(0, 0, 0)"
                        : originalEventsData[i].color;
                    }
                  });
                });

                return originalEventsData;
              } else {
                return null;
              }
            };
            angular.element("#widget").draggable();
            angular.element("#widget").draggable = true;
            $timeout(function() {
              scope.pastedEventSourcesLength = 0;
              scope.pastedEventsRecipients = 0;
              scope.scheduledEvents = getScheduledEvents();
              if (scope.scheduledEvents && scope.scheduledEvents.length) {
                scope.scheduledEvents.forEach(function(item) {
                  if (item.color === "rgb(0, 0, 0)") {
                    scope.pastedEventSourcesLength++;
                    scope.pastedEventsRecipients +=
                      item.recipients_count_to_call;
                  }
                });
              }
              scope.uiConfig = {
                calendar: {
                  lang: $rootScope.currentLanguage,
                  editable: true,
                  eventStartEditable: true,
                  eventDurationEditable: true,
                  droppable: true,
                  dragRevertDuration: 0,
                  defaultDate: moment(),
                  defaultView: "month",
                  events: scope.scheduledEvents,
                  timeFormat: "HH:mm",
                  dropAccept: ".ui-draggable-dragging",
                  buttonText: {
                    today: $rootScope.trans("calendar_todaybutton")
                  },
                  eventRender: function(eventObj, $el) {
                    // if (!descr) {
                    // var descr = eventObj.description.toString();
                    $el.popover({
                      html: true,
                      title: eventObj.title,
                      content: eventObj.description,
                      trigger: "hover",
                      placement: "top",
                      container: "body"
                    });
                    // }
                  },
                  drop: function(date, jsEvent, ui, resourceId) {
                    var rightColor = ui.helper[0].style.background;
                    scope.updateDayEvents(date, rightColor);
                    scope.addTimeSlot(this.innerText);
                    scope.noEventsError = false;
                  },
                  eventClick: function(event, jsEvent, ui, view) {
                    scope.disableOrEnableCalendar(true);
                  },
                  eventDragStart: function(event, jsEvent, ui, view) {
                    if (event.color === "rgb(0, 0, 0)") {
                      growl.error($rootScope.trans("this_even_already_fired"));
                      scope.disableOrEnableCalendar(false);
                    } else {
                      scope.disableOrEnableCalendar(true);
                    }
                  },
                  eventDragStop: function(event, jsEvent, ui, view) {
                    scope.enableCalendarWithTimeOut();
                  },
                  eventDrop: function(
                    event,
                    delta,
                    revertFunc,
                    jsEvent,
                    ui,
                    view
                  ) {
                    scope.times.forEach(function(time) {
                      if (time.color === event.color) {
                        var h = time.hour;
                        var m = time.minute;
                        var s = time.second;
                        var recivedStartDateString = moment(event.start._d)
                          .tz(window.SERVER_TIMEZONE)
                          .format();
                        var startDate = moment(
                          new Date(recivedStartDateString)
                        ).format("L");
                        var date = startDate + " " + h + ":" + m + ":" + s;
                        scope.startEventDate = moment(
                          date,
                          scope.stringLocaleFormat
                        );

                        var resultSources = $.grep(scope.eventSources, function(
                          e
                        ) {
                          return (
                            moment(e.start).format("L") == startDate &&
                            e.color == event.color
                          );
                        });

                        var isafter = moment(new Date()).isAfter(
                          scope.startEventDate
                        );

                        if (
                          isafter ||
                          resultSources.length > 0 ||
                          (CampaignComposeService.campaignData
                            .remaining_repeats > 0 &&
                            scope.events.length + scope.dayEvents.length == 1)
                        ) {
                          revertFunc();
                        } else {
                          if (scope.dayEvents.length) {
                            var samePreviousEventFromCalendar = scope.dayEvents.find(
                              function(dayEvent) {
                                return dayEvent.color === event.color;
                              }
                            );
                            scope.dayEvents.splice(
                              scope.dayEvents.indexOf(
                                samePreviousEventFromCalendar
                              ),
                              1
                            );
                          }

                          scope.dayEvents.push({
                            color: event.color,
                            start: scope.startEventDate,
                            className: ["openSesame"],
                            delivery_speed: time.delivery_speed,
                            is_finished: time.is_finished,
                            week_days: event.week_days,
                            week_number: event.week_number
                          });
                          scope.calculateEventSource();
                        }
                      }
                    });
                  },
                  eventResizeStart: function(event, jsEvent, ui, view) {},
                  eventResizeStop: function(event, jsEvent, ui, view) {},
                  eventResize: function(
                    event,
                    dayDelta,
                    minuteDelta,
                    revertFunc,
                    jsEvent,
                    ui,
                    view
                  ) {}
                }
              };

              scope.disableOrEnableCalendar = function(value) {
                scope.uiConfig.calendar.editable = value;
                scope.uiConfig.calendar.eventStartEditable = value;
                scope.uiConfig.calendar.eventDurationEditable = value;
                scope.uiConfig.calendar.droppable = value;
              };

              scope.enableCalendarWithTimeOut = function() {
                $timeout(function() {
                  scope.disableOrEnableCalendar(true);
                }, 1000);
              };

              $(document).on("mouseover", function(e) {
                //did not click a popover toggle, or icon in popover toggle, or popover
                if (
                  $(e.target).data("toggle") !== "popover" &&
                  $(e.target).parents('[data-toggle="popover"]').length === 0 &&
                  $(e.target).parents(".popover.in").length === 0
                ) {
                  $(".popover").removeClass("in");
                }
              });
            }, 1000);

            scope.firstTime1 = false;
            scope.firstTime2 = false;
            scope.firstTime3 = false;
            scope.firstTime4 = false;
            $timeout(function() {
              if (scope.scheduledEvents) {
                scope.times = [];

                scope.colors = [
                  "rgb(98, 178, 247)",
                  "rgb(255, 152, 0)",
                  "rgb(243, 86, 83)",
                  "rgb(98, 243, 229)"
                ];
                scope.scheduledEvents.forEach(function(event) {
                  event.start = event.start.replace(/-/g, "/");
                  var eventStart = moment(event.start);
                  var hour = moment(eventStart).format("HH");
                  var minute = moment(eventStart).format("mm");
                  var second = moment(eventStart).format("ss");
                  // scope.times = [[],[],[],[]];
                  var time = {};
                  time.is_finished = event.is_finished;
                  time.color = event.color;
                  time.hour = hour;
                  time.minute = minute;
                  time.second = second;
                  time.recipients_count_to_call =
                    event.recipients_count_to_call;
                  time.delivery_speed = event.delivery_speed;
                  time.is_multiple = event.is_multiple;
                  time.week_days = event.week_days;
                  time.week_number = event.week_number;
                  time.timeslot = true;
                  var index = scope.colors.indexOf(event.color);
                  if (
                    event.color === "rgb(98, 178, 247)" &&
                    !scope.firstTime1
                  ) {
                    scope.times.push(time);
                    scope.colors.splice(index, 1);
                    scope.firstTime1 = true;
                  } else if (
                    event.color === "rgb(255, 152, 0)" &&
                    !scope.firstTime2
                  ) {
                    scope.times.push(time);
                    scope.colors.splice(index, 1);
                    scope.firstTime2 = true;
                  } else if (
                    event.color === "rgb(243, 86, 83)" &&
                    !scope.firstTime3
                  ) {
                    scope.times.push(time);
                    scope.colors.splice(index, 1);
                    scope.firstTime3 = true;
                  } else if (
                    event.color === "rgb(98, 243, 229)" &&
                    !scope.firstTime4
                  ) {
                    scope.colors.splice(index, 1);
                    scope.times.push(time);
                    scope.firstTime4 = true;
                  }
                });
                var notFinishedSchedulations = scope.times.filter(function(
                  time
                ) {
                  return time.is_finished === 0;
                });
                if (notFinishedSchedulations.length === 0) {
                  if (scope.scheduledEvents) {
                    var eventStart = scope.scheduledEvents[0].start;
                    var hour = moment(eventStart).format("HH");
                    var minute = moment(eventStart).format("mm");
                    var second = moment(eventStart).format("ss");
                  } else {
                    var hour = moment
                      .tz($rootScope.currentUser.timezone)
                      .format("HH");
                    var minute = moment
                      .tz($rootScope.currentUser.timezone)
                      .format("mm");
                    var second = moment
                      .tz($rootScope.currentUser.timezone)
                      .format("ss");
                  }
                  scope.times = [
                    {
                      is_finished: 0,
                      color: "rgb(98, 178, 247)",
                      hour: hour,
                      minute: minute,
                      second: second,
                      delivery_speed: 0,
                      is_multiple: false,
                      week_days: {
                        Monday: false,
                        Tuesday: false,
                        Wednesday: false,
                        Thursday: false,
                        Friday: false,
                        Saturday: false,
                        Sunday: false
                      },
                      week_number: 0
                    }
                  ];
                }
              } else {
                var hour = moment
                  .tz($rootScope.currentUser.timezone)
                  .format("HH");
                var minute = moment
                  .tz($rootScope.currentUser.timezone)
                  .format("mm");
                var second = moment
                  .tz($rootScope.currentUser.timezone)
                  .format("ss");

                scope.times = [
                  {
                    is_finished: 0,
                    color: "rgb(98, 178, 247)",
                    hour: hour,
                    minute: minute,
                    second: second,
                    delivery_speed: 0,
                    is_multiple: false,
                    week_days: {
                      Monday: false,
                      Tuesday: false,
                      Wednesday: false,
                      Thursday: false,
                      Friday: false,
                      Saturday: false,
                      Sunday: false
                    },
                    week_number: 0,
                    timeslot: false
                  }
                ];
              }

              if (CampaignComposeService.campaignData.remaining_repeats > 0) {
                scope.repeatIsTrue = true;
              }

              scope.schedulDays = [];
              scope.schedulDays = scope.scheduledEvents;
              if (scope.schedulDays) {
                scope.noEvents = false;
                var schedulations = scope.schedulDays;
                schedulations.forEach(function(schedulation, index) {
                  schedulations[index].start = moment(
                    schedulation.start,
                    "YYYY/MM/DD HH:mm:ss"
                  ); //.format(scope.stringLocaleFormat);
                });
                scope.setEventSource(schedulations);
              } else {
                scope.noEvents = true;
              }
              // scope.calculateEachRecipent();
            }, 1300);
          };

          scope.setEventSource = function(eventSources) {
            var usedColor = [];
            usedColor["rgb(98, 178, 247)"] = false;
            usedColor["rgb(243, 86, 83)"] = false;
            usedColor["rgb(255, 152, 0)"] = false;
            usedColor["rgb(98, 243, 229)"] = false;

            var usedColorWeekNumber = [];
            usedColorWeekNumber["rgb(98, 178, 247)"] = 0;
            usedColorWeekNumber["rgb(243, 86, 83)"] = 0;
            usedColorWeekNumber["rgb(255, 152, 0)"] = 0;
            usedColorWeekNumber["rgb(98, 243, 229)"] = 0;

            var usedColorIndex = [];

            var i = 0;

            if (eventSources !== null) {
              eventSources.forEach(function(eventSource) {
                if (eventSource.week_number === 0) {
                  if (scope.repeatIsTrue && scope.dayEvents.length === 1) {
                    return;
                  }
                  scope.dayEvents.push({
                    color: eventSource.color,
                    start: eventSource.start,
                    className: ["openSesame"],
                    delivery_speed: eventSource.delivery_speed,
                      is_finished: eventSource.is_finished,
                    week_days: eventSource.week_days,
                    week_number: eventSource.week_number
                  });
                  scope.calculateEventSource();
                }
              });

              eventSources.forEach(function(eventSource) {
                var noResult = true;
                for (var k in eventSource.week_days) {
                  if (eventSource.week_days[k] === true) {
                    noResult = false;
                  }
                }

                if (scope.repeatIsTrue) {
                  noResult = true;
                }

                if (
                  !noResult &&
                  eventSource.week_number !== 0 &&
                  usedColor[eventSource.color] === false
                ) {
                  usedColor[eventSource.color] = true;
                  usedColorWeekNumber[eventSource.color] =
                    eventSource.week_number;
                }

                var start = moment(eventSource.start, scope.stringLocaleFormat);

                var hour = start.format("HH");
                var minute = start.format("mm");
                var second = start.format("ss");
                //console.log(scope.times) // crashed
                scope.times.forEach(function(time, i) {
                  if (eventSource.color === scope.times[i].color) {
                    usedColorIndex[eventSource.color] = i;
                    scope.times[usedColorIndex[eventSource.color]] = {
                      is_finished: eventSource.is_finished,
                      color: scope.times[i].color,
                      hour: scope.times[i].hour,
                      minute: scope.times[i].minute,
                      second: scope.times[i].second,
                      delivery_speed: eventSource.delivery_speed,
                      changedManually: true,
                      is_multiple: usedColor[eventSource.color],
                      recipients_count_to_call:
                        eventSource.recipients_count_to_call,
                      week_days: {
                        Monday: eventSource.week_days.Monday,
                        Tuesday: eventSource.week_days.Tuesday,
                        Wednesday: eventSource.week_days.Wednesday,
                        Thursday: eventSource.week_days.Thursday,
                        Friday: eventSource.week_days.Friday,
                        Saturday: eventSource.week_days.Saturday,
                        Sunday: eventSource.week_days.Sunday
                      },
                      week_number: usedColorWeekNumber[eventSource.color],
                      timeslot: true
                    };
                  }
                });
              });
            }
          };

          scope.updateDayEvents = function(start, color) {
            scope.times.forEach(function(time) {
              if (time.color !== color) {
                return;
              }

              var h = time.hour;
              var m = time.minute;
              var s = time.second;

              var date = start.format("L") + " " + h + ":" + m + ":" + s;
              scope.dayDate = moment(date, "L HH:mm:ss");
              var isafter;

              if (scope.dayDate.isSame(moment(), "d")) {
                isafter = false;
              } else {
                isafter = moment(new Date()).isAfter(
                  moment(scope.dayDate._i, "L HH:mm:ss")
                );
              }

              if (isafter) {
                growl.error(
                  $rootScope.trans("schedule_date_cannot_be_in_the_past")
                );
              }

              var result = $.grep(scope.dayEvents, function(e) {
                return (
                  moment(e.start).format("L") ==
                    moment(scope.dayDate).format("L") && e.color == time.color
                );
              });

              var resultEvents = $.grep(scope.events, function(e) {
                return (
                  moment(e.start).format("L") ==
                    moment(scope.dayDate).format("L") && e.color == time.color
                );
              });

              if (result.length > 0 || resultEvents.length > 0) {
                return;
              }

              if (scope.isLimitReached()) {
                scope.calculateEventSource();
                return;
              }

              if (
                isafter ||
                (scope.repeatIsTrue && scope.dayEvents.length == 1)
              ) {
                return;
              }

              scope.dayEvents.push({
                color: time.color,
                start: scope.dayDate,
                className: ["openSesame"],
                  is_finished: time.is_finished,
                delivery_speed: time.delivery_speed,
                week_days: time.week_days,
                week_number: time.week_number
              });

              scope.calculateEventSource();
            });
          };

          scope.clearCalendar = function() {
            scope.dayEvents = [];
            scope.repeatIsTrue = false;
            if (scope.finalRecipientsCount == 1) {
              scope.oneRecipient = true;
            }
            scope.pastSchedulations.forEach(function(item) {
              scope.dayEvents.push({
                color: "rgb(0, 0, 0)",
                start: moment(item.scheduled_date),
                className: ["openSesame"],
                  is_finished: item.is_finished,
                delivery_speed: item.delivery_speed,
                week_days: item.week_days,
                week_number: item.week_number
              });
            });
            scope.colors = [
              "rgb(243, 86, 83)",
              "rgb(255, 152, 0)",
              "rgb(98, 243, 229)"
            ];
            scope.times = [
              {
                is_finished: 0,
                color: "rgb(98, 178, 247)",
                hour: hour,
                minute: minute,
                second: second,
                delivery_speed: 0,
                is_multiple: false,
                week_days: {
                  Monday: false,
                  Tuesday: false,
                  Wednesday: false,
                  Thursday: false,
                  Friday: false,
                  Saturday: false,
                  Sunday: false
                },
                week_number: 0,
                timeslot: false
              }
            ];
            scope.usedRecipentsCount = 0;
            scope.calculateEventSource();
            scope.forEverySingleSchedulation = scope.finalRecipientsCount || 0;
          };

          scope.updateEvents = function(times) {
            scope.events = [];

            times.forEach(function(time) {
              if (!time.is_multiple) {
                return;
              }

              var week_count = time.week_number;
              var past_dates = [];

              for (var i = 0; i < week_count; i++) {
                var j = 1;
                for (var week_day in time.week_days) {
                  if (!time.week_days[week_day]) {
                    j++;
                    continue;
                  }

                  var week;

                  if (
                    moment()
                      .add(i, "week")
                      .day(j) <= moment() ||
                    past_dates.indexOf(j) > -1
                  ) {
                    if (past_dates.indexOf(j) < 0) {
                      past_dates.push(j);
                    }
                    week = moment()
                      .add(i + 1, "week")
                      .day(j);
                  } else {
                    week = moment()
                      .add(i, "week")
                      .day(j);
                  }

                  var h = addZero(time.hour);
                  var m = addZero(time.minute);
                  var s = addZero(time.second);

                  var startDate = moment(week).format("L");
                  var date = startDate + " " + h + ":" + m + ":" + s;
                  scope.finalDate = moment(new Date(date)).format("LLLL");

                  var result = $.grep(scope.dayEvents, function(e) {
                    return (
                      moment(e.start).format("L") ==
                        moment(scope.finalDate).format("L") &&
                      e.color == time.color
                    );
                  });

                  if (result.length > 0) {
                    scope.dayEvents.splice(
                      scope.dayEvents.indexOf(result[0]),
                      1
                    );
                  }

                  if (scope.isLimitReached()) {
                    scope.calculateEventSource();
                    return;
                  }

                  if (scope.repeatIsTrue && scope.dayEvents.length == 1) {
                    return;
                  }

                  scope.events.push({
                    color: time.color,
                    start: moment(scope.finalDate)
                      .tz(timezone)
                      .format("LLLL"),
                    className: ["openSesame"],
                    delivery_speed: time.delivery_speed,
                      is_finished: time.is_finished,
                    week_days: time.week_days,
                    week_number: time.week_number
                  });

                  scope.calculateEventSource();
                  j++;
                }
                scope.calculateEventSource();
              }
            });
          };

          scope.isLimitReached = function() {
            return scope.eventSources.length >= scope.finalRecipientsCount;
          };

          scope.calculateEventSource = function() {
            scope.eventSources = [];
            scope.eventSources = [scope.events, scope.dayEvents];

            var array1 = scope.eventSources[0];
            var array2 = scope.eventSources[1];
            scope.eventSources = array1.concat(array2);
            scope.eventSourcesLength = scope.eventSources.length;

            angular.element(".calendar").fullCalendar("removeEvents");

            angular
              .element(".calendar")
              .fullCalendar("addEventSource", scope.eventSources);

            var dates = [];
            scope.weekDayIsTrue = true;
            scope.eventSources.forEach(function(eventSource, index) {
              if (eventSource.delivery_speed == 0) {
                eventSource.delivery_speed =
                  CampaignComposeService.finalStepData.sendingTime;
              }
              dates.push({
                start: eventSource.start,
                color: eventSource.color
              });
              dates.sort(function(a, b) {
                return Date.parse(a) - Date.parse(b);
              });

              scope.times.forEach(function(time, index) {
                if (time.color === eventSource.color) {
                  scope.lastDelSpeed = time.delivery_speed;
                  eventSource.delivery_speed = time.delivery_speed;
                  eventSource.is_finished = time.is_finished;
                }
                eventSource.recipients_count_to_call =
                  time.recipients_count_to_call;
              });
            });

            scope.eventSources.sort(function(a, b) {
              return Date.parse(a.start) - Date.parse(b.start);
            });

            if (
              dates.length &&
              dates[dates.length - 1].color !== "rgb(0, 0, 0)"
            ) {
              var endDateObj = dates[dates.length - 1].start || null;
              // var endDateObjCopy = Object.assign({}, endDateObj) || null;
              var lastSchedueDelSpeed = scope.eventSources.length
                ? scope.eventSources[scope.eventSources.length - 1]
                    .delivery_speed
                : 0;
              scope.maxDateToDisplay = endDateObj
                ? moment(endDateObj)
                    .add(lastSchedueDelSpeed, "minutes")
                    .format("L HH:mm")
                : null;
            }
            dates.forEach(function(date, i) {
              if (date.color !== "rgb(0, 0, 0)") {
                scope.minDateToDisplay = dates[i].start.format("L HH:mm");
                return;
              }
            });

            if (scope.eventSources.length === 0) {
              scope.noEvents = true;
            } else {
              scope.noEvents = false;
            }
            scope.checkEventsRepeat();
          };

          scope.discardSchedulation = function() {
            scope.events = [];
            scope.dayEvents = [];
            scope.calculateEventSource();
            $rootScope.scheduleModalOpened = false;
            if (
              CampaignComposeService.editingCampaign &&
              CampaignComposeService.editingCampaign.status ===
                "schedulation_idle"
            )
              $state.go("campaign.overview");
          };

          scope.getAllRecipientsCountToCall = function(eventSources) {
            return new Promise(function(resolve, reject) {
              if (!eventSources) {
                reject();
              }
              var result = 0;
              for (var i = 0; i < eventSources.length; i++) {
                if (eventSources[i].color != "rgb(0, 0, 0)") {
                  result += eventSources[i].recipients_count_to_call;
                }
              }
              resolve(result);
            });
          };

          scope.$watch(
            "times",
            function(times) {
              scope.events = [];
              if (scope.uiCalendarConfig.calendars.myCalendar != undefined) {
                scope.dayEvents.forEach(function(dayEvent, index) {
                  var result = $.grep(times, function(e) {
                    return e.color == dayEvent.color;
                  });
                  if (result.length) {
                    // var newResultDate = dayEvent.start;
                    //   var newResultDate = moment(
                    //     dayEvent.start.format("L") +
                    //       " " +
                    //       result[0].hour +
                    //       ":" +
                    //       result[0].minute +
                    //       ":" +
                    //       result[0].second,
                    //     scope.stringLocaleFormat
                    //   );
                    // if (
                    //   moment().isAfter(newResultDate) &&
                    //   dayEvent.color !== "rgb(0, 0, 0)"
                    // ) {
                    //   dayEvent.start = moment().add(3, "minutes");
                    //   result[0].hour = moment().format("HH");
                    //   result[0].minute = moment().format("mm");
                    //   result[0].second = moment().format("ss");
                    // }

                    var start = dayEvent.start;

                    var h = result[0].hour;
                    var m = result[0].minute;
                    var s = result[0].second;

                    var startDay = start.format("L");

                    var date = startDay + " " + h + ":" + m + ":" + s;
                    scope.finalDate = moment(date, scope.stringLocaleFormat);
                    dayEvent.start = scope.finalDate;
                    scope.dayEvents[index] = dayEvent;

                    var isafter = moment().isAfter(start);
                  }
                });
                scope.calculateEventSource();

                scope.updateEvents(times);
              }

              if (times) {
                scope.eventSources.forEach(function(eventSource, i) {
                  times.forEach(function(time) {
                    if (time.color === eventSource.color) {
                      eventSource.recipients_count_to_call =
                        time.recipients_count_to_call;
                      eventSource.changedManually = time.changedManually;
                    }
                  });
                });
              }

              var recipentsCount = scope.finalRecipientsCount || 0;
              scope.countOfAllRecepients().then(function(allRecepientsCount) {
                var recipentsCountToCall = 0;
                if (allRecepientsCount >= 0) {
                  recipentsCountToCall = allRecepientsCount;
                }
                var campaign = null;
                scope
                  .countOfUsedRecepients(CampaignComposeService.editingCampaign)
                  .then(function(usedRecepientsCount) {
                    if (
                      scope.firstTime &&
                      recipentsCountToCall == 0 &&
                      scope.times &&
                      scope.times.length == 1 &&
                      scope.times[0].timeslot
                    ) {
                      recipentsCountToCall =
                        recipentsCount - usedRecepientsCount;
                    }
                    if (
                      !scope.firstTime &&
                      scope.times &&
                      scope.times.length > 0
                    ) {
                      var firstTimeNotChangedMenualy = false;
                      var counter = 0;
                      for (var i = 0; i < scope.times.length; i++) {
                        if (scope.times[i].timeslot) {
                          if (!scope.times[i].changedManually) {
                            firstTimeNotChangedMenualy = true;
                          }
                          counter++;
                        }
                      }
                      if (firstTimeNotChangedMenualy && counter == 1) {
                        recipentsCountToCall =
                          recipentsCount - usedRecepientsCount;
                      }
                    }
                    scope.forEverySingleSchedulation =
                      recipentsCount -
                      recipentsCountToCall -
                      usedRecepientsCount;
                    if (recipentsCountToCall > recipentsCount) {
                      scope.recipentsCountToCallRedBorder = true;
                    } else {
                      scope.recipentsCountToCallRedBorder = false;
                    }
                  });
              });
            },
            true
          );

          // scope.$watch('dataForRecepientsCountChange', function () {
          //     var recipentsCount = CampaignComposeService.finalStepData.numbersCount || 0;
          //     scope.countOfAllRecepients().then(function(allRecepientsCount){
          //         var recipentsCountToCall = 0
          //         if (allRecepientsCount >= 0) {
          //             recipentsCountToCall = allRecepientsCount;
          //         }
          //         scope.countOfUsedRecepients(CampaignComposeService.editingCampaign).then(function(usedRecepientsCount){
          //             if(!scope.firstTime && scope.times && scope.times.length > 0) {
          //                 var firstTimeNotChangedMenualy = false;
          //                 var counter = 0;
          //                 for(var i = 0; i < scope.times.length; i++) {
          //                     if( !scope.times[i].changedManually && scope.times[i].timeslot) {
          //                         firstTimeNotChangedMenualy = true;
          //                         counter++;
          //                     }
          //                 }
          //                 if(firstTimeNotChangedMenualy && counter == 1) {
          //                     recipentsCountToCall = recipentsCount - usedRecepientsCount;
          //                 }
          //             }
          //             scope.forEverySingleSchedulation = recipentsCount - recipentsCountToCall - usedRecepientsCount;
          //             if (recipentsCountToCall > recipentsCount) {
          //                 scope.recipentsCountToCallRedBorder = true;
          //             } else {
          //                 scope.recipentsCountToCallRedBorder = false;
          //             }
          //         });
          //     });
          // }, true);

          scope.countOfAllRecepients = function() {
            return new Promise(function(resolve, reject) {
              var result = 0;
              if (CampaignComposeService.editingCampaign) {
                if (
                  CampaignComposeService.editingCampaign.status ==
                  "schedulation_idle"
                ) {
                  scope
                    .getAllRecipientsCountToCall(scope.eventSources)
                    .then(function(res) {
                      if (Number.isInteger(res)) {
                        return resolve(res);
                      } else {
                        for (var i = 0; i < scope.times; i++) {
                          result += scope.times[i].recipients_count_to_call;
                        }
                        return resolve(result);
                      }
                    });
                } else {
                  scope
                    .getAllRecipientsCountToCall(scope.eventSources)
                    .then(function(res) {
                      return resolve(res);
                    });
                }
              } else {
                scope
                  .getAllRecipientsCountToCall(scope.eventSources)
                  .then(function(res) {
                    return resolve(res);
                  });
              }
            });
          };

          scope.countOfUsedRecepients = function(campaign) {
            return new Promise(function(resolve, reject) {
              if (campaign == null || campaign.status != "schedulation_idle") {
                return resolve(0);
              }
              var result = 0;
              if (campaign.schedulations.length > 0) {
                for (var i = 0; i < campaign.schedulations.length; i++) {
                  if (campaign.schedulations[i].is_finished) {
                    result += campaign.schedulations[i].recipients;
                  }
                  if (i == campaign.schedulations.length - 1) {
                    return resolve(result);
                  }
                }
              }
            });
          };

          var timezone = $rootScope.currentUser.timezone
            ? $rootScope.currentUser.timezone
            : "UTC";
          var dateNow = moment().tz(timezone);

          var hour = dateNow.format("HH");
          var minute = dateNow.format("mm");
          var second = dateNow.format("ss");

          scope.checkEmptys = function() {
            var emptysCount = 0;
            scope.times.forEach(function(time) {
              if (time.timeslot && !time.recipients_count_to_call) {
                emptysCount++;
              }
            });

            return emptysCount;
          };

          $rootScope.disableScheduleBtns = false;
          $rootScope.showScheduleSpinner = false;
          scope.noEventsError = false;
          scope.emptysError = false;
          scope.saveSchedulation = function() {
            $rootScope.disableScheduleBtns = true;
            $rootScope.showScheduleSpinner = true;
            if (scope.noEvents) {
              scope.noEventsError = true;
              $rootScope.disableScheduleBtns = false;
              $rootScope.showScheduleSpinner = false;
              return false;
            } else if (!scope.getAllRecipientsCountToCall(scope.eventSources)) {
              $rootScope.disableScheduleBtns = false;
              $rootScope.showScheduleSpinner = false;
              return false;
            } else if (scope.checkEmptys()) {
              scope.emptysError = true;
              $rootScope.disableScheduleBtns = false;
              $rootScope.showScheduleSpinner = false;
              return false;
            }

            scope.eventSources.forEach(function(eventSource) {
              scope.times.forEach(function(time) {
                if (time.color === eventSource.color) {
                  eventSource.delivery_speed = time.delivery_speed;
                  eventSource.is_finished = time.is_finished;
                  eventSource.recipients_count_to_call =
                    time.recipients_count_to_call;
                }
              });
            });

            if (!scope.repeatIsTrue) {
              CampaignComposeService.campaignData.schedulations_count =
                scope.eventSources.length;
            }
            CampaignComposeService.campaignData.schedulations =
              scope.eventSources;
            CampaignComposeService.doValitation("scheduled");
          };

          scope.slider = {
            value: 120,
            options: {
              showSelectionBar: true,
              hideLimitLabels: true,
              hidePointerLabels: true,
              ceil: 120,
              floor: 0,
              step: 15
            }
          };

          scope.colors = [
            "rgb(243, 86, 83)",
            "rgb(255, 152, 0)",
            "rgb(98, 243, 229)"
          ];

          scope.countRecipientsReminder = function() {
            var reminder = scope.finalRecipientsCount;
            scope.eventSources.forEach(function(time) {
              if (time.changedManually) {
                var currentRecipentCount = time.recipients_count_to_call
                  ? time.recipients_count_to_call
                  : 0;
                reminder -= currentRecipentCount;
              }
            });

            return reminder;
          };

          scope.countEmptyOrManuallyRecipients = function(times) {
            if (!times) {
              return 0;
            }
            var count = 0;
            times.forEach(function(time) {
              if (!time.recipients_count_to_call || !time.changedManually) {
                count++;
              }
            });

            return count;
          };

          scope.recipentCountChangedManually = function(time) {
            time.changedManually = true;
            scope.calculateEachRecipent();
          };
          scope.firstTime = true;
          scope.calculateEachRecipent = function() {
            var recipentsCount = scope.finalRecipientsCount || 0;
            var numberOfSlots = 0;
            scope
              .countOfUsedRecepients(CampaignComposeService.editingCampaign)
              .then(function(usedRecepientsCount) {
                recipentsCount -= usedRecepientsCount;
                scope.times.forEach(function(time) {
                  if (!time.changedManually) {
                    numberOfSlots++;
                  } else {
                    recipentsCount -= time.recipients_count_to_call;
                  }
                });
                if (scope.firstTime) {
                  return scope
                    .countOfAllRecepients()
                    .then(function(allRecepientsCount) {
                      scope.firstTime = false;
                      return recipentsCount;
                    });
                } else {
                  return scope
                    .countOfAllRecepients()
                    .then(function(allRecepientsCount) {
                      var schedulationsCount = 0;
                      for (var i = 0; i < scope.eventSources.length; i++) {
                        if (!scope.eventSources[i].changedManually) {
                          schedulationsCount++;
                        }
                      }
                      if (
                        CampaignComposeService.editingCampaign &&
                        CampaignComposeService.editingCampaign.status ==
                          "schedulation_idle" &&
                        scope.times &&
                        scope.times.length > 0
                      ) {
                        schedulationsCount = 0;
                        scope.times.forEach(function(time) {
                          if (time.timeslot && !time.changedManually) {
                            schedulationsCount++;
                          }
                        });
                      }

                      if (schedulationsCount == 0) {
                        return 0;
                      }
                      var recipentsPerTimeSlot = Math.floor(
                        recipentsCount / schedulationsCount
                      );
                      return recipentsPerTimeSlot >= 0
                        ? recipentsPerTimeSlot
                        : 0;
                    });
                }
              })
              .then(function(recipentsPerTimeSlot) {
                scope.times.forEach(function(time) {
                  if (!time.changedManually) {
                    time.recipients_count_to_call = recipentsPerTimeSlot;
                  }
                });
              });
          };
          scope.disableBlueSquare = false;
          if (scope.finalRecipientsCount == 1) {
            scope.oneRecipient = true;
          }
          scope.addTimeSlot = function(currentColor) {
            if (
              scope.oneRecipient ||
              scope.times.length > scope.finalRecipientsCount
            ) {
              if (scope.oneRecipient) {
                scope.oneRecipient = false;
              } else {
                scope.repeatIsTrue = true;
                return;
              }
            }

            // if (scope.isLimitReached()) {
            //   scope.calculateEventSource();
            //   return;
            // }

            scope.times.forEach(function(time) {
              if (time.color === currentColor && !time.timeslot) {
                time.timeslot = true;
              }
            });

            if (scope.times.length >= 4) {
              scope.repeatIsTrue = true;
            }

            var currentColorIndex = scope.colors.indexOf(currentColor);
            if (currentColorIndex != -1) {
              scope.colors.splice(currentColorIndex, 1);
            }

            var start = new Date();
            var nextColor = scope.colors[0];

            if (
              scope.times.length < 4 &&
              scope.times[scope.times.length - 1].color === currentColor &&
              nextColor
            ) {
              scope.times.push({
                color: nextColor,
                hour: hour,
                minute: minute,
                second: second,
                delivery_speed: 0,
                is_multiple: false,
                week_days: {
                  Monday: false,
                  Tuesday: false,
                  Wednesday: false,
                  Thursday: false,
                  Friday: false,
                  Saturday: false,
                  Sunday: false
                },
                week_number: 0,
                timeslot: false
              });
            }

            scope.calculateEachRecipent();
            scope.checkEventsRepeat();
          };
          scope.removeTimeSlot = function(index) {
            if (index <= -1) {
              return;
            }

            var color = scope.times[index].color;
            scope.colors.push(color);
            scope.times.splice(index, 1);

            scope.dayEvents = $.grep(scope.dayEvents, function(e) {
              return e.color !== color;
            });

            scope.events = $.grep(scope.events, function(e) {
              return e.color !== color;
            });

            scope.calculateEventSource();
            scope.calculateEachRecipent();
          };
          scope.dpOptions = {
            customClass: getDayClass,
            minDate: new Date(),
            showWeeks: false,
            startingDay: 1
          };
          function getDayClass(data) {
            var date = data.date,
              mode = data.mode;
            if (mode === "day") {
              var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

              for (var i = 0; i < scope.events.length; i++) {
                var currentDay = new Date(scope.events[i].date).setHours(
                  0,
                  0,
                  0,
                  0
                );

                if (dayToCheck === currentDay) {
                  return scope.events[i].status;
                }
              }
            }

            return "";
          }
          scope.checkEventsRepeat = function() {
            scope.blueX = 0;
            scope.orangeX = 0;
            scope.redX = 0;
            scope.cyanX = 0;
            scope.eventSources.forEach(function(event) {
              if (event.color === "rgb(98, 178, 247)") {
                scope.blueX++;
              }
              if (event.color === "rgb(255, 152, 0)") {
                scope.orangeX++;
              }
              if (event.color === "rgb(243, 86, 83)") {
                scope.redX++;
              }
              if (event.color === "rgb(98, 243, 229)") {
                scope.cyanX++;
              }
            });
          };
          scope.checkEventsRepeat();
          scope.popoverWeekCount = $sce.trustAsHtml(
            "" + $rootScope.trans("tell_us_number")
            // Now tell us the number of week/s you want to multiple select. The selection will start from first choosen day
          );
          scope.popoverWeekDay = $sce.trustAsHtml(
            "" + $rootScope.trans("choose_which_day")
            // Choose here which day/s you want to multiple select on schedulation calendar
          );
          scope.addTimeSlotExplain = $sce.trustAsHtml(
            "" + $rootScope.trans("add_time_slot")
            // Add time slot
          );
          scope.removeTimeSlotExplain = $sce.trustAsHtml(
            "" + $rootScope.trans("remove_time_slot")
            // Remove time slot
          );
          scope.refreshOpenExplain = $sce.trustAsHtml(
            "" + $rootScope.trans("same_days")
            // If you want to batch select same-days for multiple times, click here
          );
          scope.deliveryExplanation = $sce.trustAsHtml(
            "" + $rootScope.trans("configure_message_delivery")
            // From here, you can configure message delivery speed specifing in how much time the delivery should be done'+
            // 'until a maximum of 2 hours
          );
          scope.timeSlotColorExplanation = $sce.trustAsHtml(
            "" + $rootScope.trans("drag_time")
            // Drag your selected time into the calendar day you want to start the delivery at.' +
            // 'You can also add more time slots by clicking on plus icon,' +
            // 'for maximum four times, every event will be added with dragged items color
          );
          scope.calendarExplanation = $sce.trustAsHtml(
            "" + $rootScope.trans("select_scheduled_days")
            // Select here your preferred scheduled days by dragging the time slots inside the calendar; ' +
            // 'to remove them instead, you must dragging them into delete icon. You can also add recurrent days from right panel (week days), ' +
            // 'but in this case, they cannot be removed by dragging them in delete icon
          );
          scope.deleteScheduleExplanation = $sce.trustAsHtml(
            "" + $rootScope.trans("drag_schedulation")
            // You can drag and drop any schedulation from calendar into this icon.' +
            // 'remember, that you can not drag-drop or delete schedulations added from right panel (week days),' +
            // 'but only from schedulations that were added by dragging time slot into calendar by color.
          );
          scope.dragColor = $sce.trustAsHtml(
            "" + $rootScope.trans("drag_time_slot")
            // Drag your selected time slots colored rectangle into the calendar day you want to start the delivery at.' +
            // 'You can also add more time slots by clicking on plus icon,' +
            // 'for maximum four times, every added event will have same color and options as the dragged colored rectangle.
          );
          scope.disableForRepeatation = $sce.trustAsHtml(
            "" +
              $rootScope.trans("why_cannot_select") +
              /*** Why I cannot select multiple days for my delivery? ***/ +$rootScope.trans(
                "split_delivery"
              )
            // Since you have selected to repeat voice messages delivery more than one time, multiple days selection is not allowed. ' +
            // 'If you want to split your delivery to more days you can exit from this modal and change repetition settings.' +
            // 'for maximum four times, every added event will have same color and options as the dragged colored rectangle.
          );

          scope.recipientText = $sce.trustAsHtml(
            "" + $rootScope.trans("recipient_text")
          );
          scope.placement = {
            options: [
              "top",
              "top-left",
              "top-right",
              "bottom",
              "bottom-left",
              "bottom-right",
              "left",
              "left-top",
              "left-bottom",
              "right",
              "right-top",
              "right-bottom"
            ],
            selected: "bottom-left"
          };
        }
      );
    };

    /**
     * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
     * @param obj1
     * @param obj2
     * @returns obj3 a new object based on obj1 and obj2
     */
    function merge_objects(obj1, obj2) {
      var obj3 = {};
      for (var attrname in obj1) {
        if (!obj3[attrname]) {
          obj3[attrname] = obj1[attrname];
        }
      }
      for (var attrname in obj2) {
        if (!obj3[attrname]) {
          obj3[attrname] = obj2[attrname];
        }
      }
      return obj3;
    }

    $scope.checkSendingStatus = function() {
      if (
        CampaignComposeService.campaignData.replay_digit ||
        CampaignComposeService.campaignData.transfer_digit ||
        CampaignComposeService.campaignData.callback_digit ||
        CampaignComposeService.campaignData.do_not_call_digit
      ) {
      }
    };
    $scope.CampaignComposeService.checkedFunctionalities = true;
    $scope.enableFunctionalities = function() {
      $scope.CampaignComposeService.checkedFunctionalities = !$scope
        .CampaignComposeService.checkedFunctionalities;
      // if (!CampaignComposeService.editingCampaign && !CampaignComposeService.reusingCampaign) {
      //     CampaignComposeService.replayDigit.onOff = false;
      //     CampaignComposeService.transferDigit.onOff = false;
      //     CampaignComposeService.callbackDigit.onOff = false;
      //     CampaignComposeService.doNotCallDigit.onOff = false;
      //     CampaignComposeService.campaignData.playback_count = 1;
      // }
    };
    // $scope.enableFunctionalities();

    $scope.navigateScrollTo = function(id) {
      var element = angular.element(document.getElementById(id));
      var body = angular.element("body");
      body.animate(
        { scrollTop: element.offset().top - 10 },
        "slow",
        function() {}
      );
      return true;
    };
    if ($stateParams.from === "preview") {
      CampaignComposeService.doValitation("preview", $stateParams.type);
    }
    if ($stateParams.openModal) {
      var modalInterval = setInterval(function() {
        if (CampaignComposeService.finalStepData.numbersCount > 0) {
          $scope.showScedulationModal();
          clearInterval(modalInterval);
        }
      }, 200);
    }

    $scope.selectedAction = false;
    $scope.selectAction = function(type) {
      $scope.selectedAction = type;
    };

    $scope.shouldShufflePressed = function() {
      $rootScope.blinkSaveButton = true;
    };
    $scope.getEmailNotify = function() {
      $rootScope.blinkSaveButton = true;
    };

    $scope.isCampaginExist = function(callerId) {
      $scope.isExist = false;
      $rootScope.currentUser.numbers.forEach(function(item) {
        if (item.phone_number === callerId) {
          $scope.isExist = true;
          return;
        } else {
          CampaignComposeService.campaignData.caller_id =
            $rootScope.currentUser.numbers[
              $rootScope.currentUser.numbers.length - 1
            ].phone_number;
          window.first_advisable_caller_id =
            $rootScope.currentUser.numbers[
              $rootScope.currentUser.numbers.length - 1
            ].phone_number;
          if (CampaignComposeService.campaignData.campaign_id) {
            CampaignComposeService.updateCallerId().then(function(response) {
              if (response.error.no === 0) {
                growl.success($rootScope.trans("campaign_caller_id_updated"));
              } else {
                growl.error(
                  $rootScope.trans("something_went_wrong_on_caller_id_update")
                );
              }
            });
          }
        }
      });
    };

    $scope.nameForCallerID = '';
    $scope.showCallerIDName = function(callerID) {
      $scope.currentUser.numbers.forEach(function(number) {
        if (number.phone_number == callerID) {
          $scope.nameForCallerID = '(' + number.name + ')';
          // $scope.nameForCallerID = number.name;
        }
      })
    }
    $scope.showCallerIDName(CampaignComposeService.campaignData.caller_id);
  }
]);
