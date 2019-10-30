angular
  .module("callburnApp")
  .service("CampaignComposeService", function(
    $rootScope,
    $sce,
    Restangular,
    $state,
    ModalService,
    CallBournModal,
    CampingService,
    notify,
    growl,
    $filter,
    $q,
    $stateParams
  ) {
    var composeData = {};
    composeData.editingCampaign = null;
    composeData.reusingCampaign = null;
    composeData.campaignData = {
      phonenumbers: [],
      repeats_count: 0,
      repeat_days_interval: 0,
      remaining_repeats: 0,
      caller_id:
        $rootScope.currentUser.numbers &&
        $rootScope.currentUser.numbers.length > 0
          ? $rootScope.currentUser.numbers[
              $rootScope.currentUser.numbers.length - 1
            ].phone_number
          : null,
      max_cost: 0
    };
    window.first_advisable_caller_id =
      $rootScope.currentUser.numbers &&
      $rootScope.currentUser.numbers.length > 0
        ? $rootScope.currentUser.numbers[
            $rootScope.currentUser.numbers.length - 1
          ].phone_number
        : null;
    composeData.step2Phonenumbers = [];
    composeData.step2PhonenumbersPagesCount = 1;
    composeData.finalStepData = {};
    composeData.ttsLanguages = [];
    composeData.audioTemplates = {};
    composeData.interactionsForModal = [];
    composeData.composeStep = 1;
    composeData.chosedInteractions = [];
    composeData.disablePreListenButton = true;

    composeData.replayDigit = {
      showNumbersSelect: false,
      checkboxChecked: false
    };
    composeData.transferDigit = {
      showNumbersSelect: false,
      checkboxChecked: false
    };
    composeData.callbackDigit = {
      showNumbersSelect: false,
      checkboxChecked: false
    };
    composeData.doNotCallDigit = {
      showNumbersSelect: false,
      checkboxChecked: false
    };

    composeData.finalStepData.recipientsCounterLoader = false;

    composeData.clearComposeData = function() {
      composeData.editingCampaign = null;
      composeData.reusingCampaign = null;
      composeData.campaignData = {
        phonenumbers: [],
        repeats_count: 0,
        repeat_days_interval: 0,
        remaining_repeats: 0,
        caller_id:
          $rootScope.currentUser.numbers &&
          $rootScope.currentUser.numbers.length > 0
            ? $rootScope.currentUser.numbers[
                $rootScope.currentUser.numbers.length - 1
              ].phone_number
            : null,
        max_cost: 0
      };
      window.first_advisable_caller_id =
        $rootScope.currentUser.numbers &&
        $rootScope.currentUser.numbers.length > 0
          ? $rootScope.currentUser.numbers[
              $rootScope.currentUser.numbers.length - 1
            ].phone_number
          : null;
      composeData.step2Phonenumbers = [];
      composeData.step2PhonenumbersPagesCount = 1;
      composeData.finalStepData = {};
      composeData.ttsLanguages = [];
      composeData.audioTemplates = {};
      composeData.interactionsForModal = [];
      composeData.composeStep = 1;
      composeData.chosedInteractions = [];
      composeData.disablePreListenButton = true;

      composeData.replayDigit = {
        showNumbersSelect: false,
        checkboxChecked: false
      };
      composeData.transferDigit = {
        showNumbersSelect: false,
        checkboxChecked: false
      };
      composeData.callbackDigit = {
        showNumbersSelect: false,
        checkboxChecked: false
      };
      composeData.doNotCallDigit = {
        showNumbersSelect: false,
        checkboxChecked: false
      };

      composeData.finalStepData.recipientsCounterLoader = false;
    };

    composeData.getAudioSource = function(audio) {
      return $sce.trustAsResourceUrl(audio.amazon_s3_url);
    };

    composeData.scrollToErr = function(elem, type) {
      if (elem == "sms") {
        var elem = angular.element(document.getElementById("sms_err"));
      } else if (elem == "vm") {
        var elem = angular.element(document.getElementById("vm_err"));
      } else if (elem == "recipients") {
        // if (composeData.campaignData.currentTab == "manually") {
        //   var elem = angular.element(
        //     document.getElementById("recipients_err_manually")
        //   );
        // } else {
        //   var elem = angular.element(document.getElementById("recipients_err"));
        // }
        var elem = angular.element(
          document.getElementById("choose-your-recipients")
        );
      }
      angular.element("html, body").animate({
        scrollTop: elem.offset().top - 100
      });
    };

    composeData.doValitation = function(action, from, type) {
      if (action == "start") {
        $rootScope.fileIdErr = false;
        $rootScope.smsTextErr = false;
        $rootScope.recipientsErr = false;
        if (!composeData.campaignData.campaign_name) {
          $rootScope.disableTagWithName = true;
          return;
        } else if ($rootScope.selectedType === "vmSms") {
          if (!composeData.campaignData.campaign_voice_file_id) {
            $rootScope.fileIdErr = true;
            composeData.scrollToErr("vm");
            return;
          } else if (!composeData.campaignData.sms_text) {
            $rootScope.smsTextErr = true;
            composeData.scrollToErr("sms");
            return;
          }
          if (
            !composeData.finalStepData.maxCost ||
            !composeData.finalStepData.maxCostWithSms ||
            composeData.finalStepData.maxCost ==
              composeData.finalStepData.maxCostWithSms
          ) {
            if (
              !composeData.finalStepData.maxCost &&
              !composeData.campaignData.campaign_voice_file_id
            ) {
              $rootScope.fileIdErr = true;
              composeData.scrollToErr("vm");
              return;
            } else if (
              composeData.finalStepData.maxCost ==
              composeData.finalStepData.maxCostWithSms
            ) {
              growl.error(
                $rootScope.trans("there_is_no_sms_tariff_for_your_country")
              );
              return;
            }
            $rootScope.recipientsErr = true;
            composeData.scrollToErr("recipients");
            return;
          }
        } else if ($rootScope.selectedType === "vm") {
          if (
            !composeData.finalStepData.maxCost &&
            composeData.campaignData.campaign_voice_file_id
          ) {
            $rootScope.recipientsErr = true;
            composeData.scrollToErr("recipients");
            return;
          } else if (!composeData.campaignData.campaign_voice_file_id) {
            $rootScope.fileIdErr = true;
            composeData.scrollToErr("vm");
            return;
          }
        } else if ($rootScope.selectedType === "sms") {
          if (
            !composeData.finalStepData.maxCostWithSms &&
            composeData.campaignData.sms_text
          ) {
            $rootScope.recipientsErr = true;
            composeData.scrollToErr("recipients");
            growl.error($rootScope.trans("send_sms_unsupported_error"));
            return;
          } else if (!composeData.campaignData.sms_text) {
            $rootScope.smsTextErr = true;
            composeData.scrollToErr("sms");
            return;
          }
        } else if (checkIfAlreadyStarted()) {
          growl.error($rootScope.trans("this_campaign_already_started"));
          return;
        }
      }
      if (composeData.checkIfAlreadyStarted() && action !== "scheduled") {
        return;
      }

      var isValid = true;
      var errorMessage = "";
      console.log("DoValitation", composeData.campaignData);
      var campaignData = composeData.campaignData;
      campaignData.from = from;
      // if (!composeData.checkedFunctionalities) {
      //   composeData.campaignData.live_answer_only = false;
      //   composeData.campaignData.remaining_repeats = 0;
      //   composeData.campaignData.repeat_days_interval = 7;

      //   composeData.replayDigit.onOff = false;
      //   composeData.transferDigit.onOff = false;
      //   composeData.callbackDigit.onOff = false;
      //   composeData.doNotCallDigit.onOff = false;
      // }

      if (composeData.callbackDigit.onOff) {
        if (
          !(campaignData.callback_digit >= 0) ||
          !campaignData.callback_voice_file_id
        ) {
          isValid = false;
          errorMessage = "callback_voice_file_required_with_callback_digit";
        }
      }

      if (composeData.doNotCallDigit.onOff) {
        if (
          !(campaignData.do_not_call_digit >= 0) ||
          !campaignData.do_not_call_voice_file_id
        ) {
          isValid = false;
          errorMessage = "donotcall_voice_file_required_with_donotcall_digit";
        }
      }

      if (composeData.transferDigit.onOff) {
        if (
          !(campaignData.transfer_digit >= 0) ||
          !campaignData.transfer_options
        ) {
          isValid = false;
          errorMessage = "transfer_options_required_with_transfer_digit";
        }
      }

      if (composeData.replayDigit.onOff) {
        if (!(campaignData.replay_digit >= 0)) {
          isValid = false;
          errorMessage = "replay_digit_is_activated_but_not_selected";
        }
      }

      if (!isValid) {
        if (!errorMessage.length) {
          growl.error(trans("insufficient_funds"));
        } else {
          growl.error(trans(errorMessage));
        }
        return;
      }

      var isAnyActive = false;
      var reminigReperats = false;
      var shcedulationRepeat = false;
      var playback_count = campaignData.playback_count;

      if (composeData.replayDigit.onOff) {
        isAnyActive = true;
        var replayDigitObject = {
          action: $rootScope.trans(
            "campaign_compose_compose_step_3_replay_voice_message"
          ),
          keypress: composeData.campaignData.replay_digit
        };
        composeData.interactionsForModal.push(replayDigitObject);
      }

      if (playback_count != 1) {
        composeData.campaignData.playback_count = playback_count;
      }

      if (composeData.transferDigit.onOff) {
        isAnyActive = true;
        var transferDigitObject = {
          action: $rootScope.trans("campaign_compose_compose_step_3_call_live"),
          keypress: composeData.campaignData.transfer_digit
        };
        composeData.interactionsForModal.push(transferDigitObject);
      }

      if (composeData.callbackDigit.onOff) {
        isAnyActive = true;
        var callbackDigitObject = {
          action: $rootScope.trans(
            "campaign_compose_compose_step_3_call_me_back"
          ),
          keypress: composeData.campaignData.callback_digit
        };
        composeData.interactionsForModal.push(callbackDigitObject);
      }

      if (composeData.doNotCallDigit.onOff) {
        isAnyActive = true;
        var doNotCallDigitObject = {
          action: $rootScope.trans(
            "campaign_compose_compose_step_3_blacklist_me"
          ),
          keypress: composeData.campaignData.do_not_call_digit
        };
        composeData.interactionsForModal.push(doNotCallDigitObject);
      }

      if (campaignData.remaining_repeats > 0) {
        reminigReperats = true;
      }

      if (
        campaignData.schedulations !== undefined &&
        campaignData.schedulations &&
        campaignData.schedulations.length !== 0
      ) {
        campaignData.schedulations_count = campaignData.schedulations.length;
      }

      if (
        (campaignData.schedulations_count !== undefined &&
          campaignData.schedulations_count !== 0) ||
        (campaignData.schedulations !== undefined &&
          campaignData.schedulations &&
          campaignData.schedulations.length !== 0)
      ) {
        shcedulationRepeat = true;
      }

      if (action === "saved") {
        var checkSelectedGroups = !(
          Object.keys(campaignData.selected_groups).length === 0 &&
          campaignData.selected_groups.constructor === Object
        );
        if (!campaignData.campaign_name && checkSelectedGroups) {
          campaignData.campaign_name = campaignData.group_name;
        }
        isAnyActive = false;
      }

      if (isAnyActive) {
        $rootScope.showScheduleSpinner = false;
        $rootScope.disableScheduleBtns = false;
        CallBournModal.close();
        CallBournModal.open(
          {
            scope: {
              interactionsForModal: composeData.interactionsForModal,
              saveWithInteractionsCheckbox: false,
              action: action,
              campaignData: campaignData
            },
            templateUrl: "/app/modals/camping-batch/confirm-interactions.html",
            size: "modal-md"
          },
          function(scope) {
            scope.proceedToSaveWithInteraction = function() {
              composeData.checkForModals(
                reminigReperats,
                shcedulationRepeat,
                action
              );
              CallBournModal.close();
              composeData.interactionsForModal = [];
            };
            scope.dismissModal = function() {
              CallBournModal.close();
              composeData.interactionsForModal = [];
            };
          }
        );
      } else {
        if (action === "preview") {
          composeData.proceedToSaving(action, type);
        } else {
          composeData.checkForModals(
            reminigReperats,
            shcedulationRepeat,
            action
          );
        }
      }
    };

    composeData.checkForSchedulation = function(dateString) {
      if (!composeData.editingCampaign) {
        return true;
      }
      dateString = moment(dateString)
        .format("YYYY-MM-DD hh:mm:ss")
        .trim();
      for (
        var i = 0;
        i < composeData.editingCampaign.schedulations.length;
        i++
      ) {
        var schedulatedDateString = moment(
          composeData.editingCampaign.schedulations[i].scheduled_date
        )
          .format("YYYY-MM-DD hh:mm:ss")
          .trim();
        if (schedulatedDateString === dateString) {
          if (composeData.editingCampaign.schedulations[i].is_finished) {
            return false;
          } else {
            return true;
          }
        }
      }

      return true;
    };

    composeData.isAlreadyStarted = false;

    composeData.checkIfAlreadyStarted = function() {
      if (composeData.editingCampaign) {
        composeData.editingCampaign.schedulations.forEach(function(
          schedulation
        ) {
          if (schedulation.is_finished) {
            composeData.isAlreadyStarted = true;
          }
        });
      }

      return composeData.isAlreadyStarted;
    };

    composeData.checkForModals = function(
      reminigReperats,
      shcedulationRepeat,
      action
    ) {
      if (action === "saved") {
        composeData.proceedToSaving(action);
        return;
      }

      var campaignData = composeData.campaignData;

      if (reminigReperats && shcedulationRepeat) {
        $rootScope.showScheduleSpinner = false;
        $rootScope.disableScheduleBtns = false;
        CallBournModal.close();

        CallBournModal.open(
          {
            scope: {
              CampaignComposeService: composeData,
              campaignData: campaignData
            },
            templateUrl:
              "/app/modals/camping-batch/show-shcdulation-confirm-with-repitation.html",
            size: "modal-md"
          },
          function(scope) {
            scope.schedul = [];
            scope.dataSaved = [];
            scope.Math = Math;
            $rootScope.schedulationModalFlag = true;
            for (var index in campaignData.schedulations) {
              scope.CampaignComposeService.finalStepData.sendingTime =
                campaignData.schedulations[index].delivery_speed > 0
                  ? campaignData.schedulations[index].delivery_speed
                  : scope.CampaignComposeService.finalStepData.sendingTime;
              scope.schedul[0] = moment(campaignData.schedulations[index].start)
                .set({
                  hour: moment(campaignData.schedulations[index].start).format(
                    "HH"
                  ),
                  minute: moment(
                    campaignData.schedulations[index].start
                  ).format("mm")
                })
                .format("dddd DD, MMMM YYYY - HH:mm -");
              scope.dataSaved = moment(
                campaignData.schedulations[index].start
              ).set({
                hour: moment(campaignData.schedulations[index].start).format(
                  "HH"
                ),
                minute: moment(campaignData.schedulations[index].start).format(
                  "mm"
                )
              });
            }
            scope.dates = [];
            for (var i = 0; i < campaignData.remaining_repeats + 1; i++) {
              if (i == 0) {
                continue;
              }
              scope.dates.push(
                moment(scope.dataSaved)
                  .add(i * campaignData.repeat_days_interval, "days")
                  .format("dddd DD, MMMM YYYY - HH:mm -")
              );
            }

            scope.saveTo = function() {
              composeData.proceedToSaving(action);
            };
            scope.dismissModal = function() {
              CallBournModal.close();
              composeData.interactionsForModal = [];
            };
          }
        );
        composeData.interactionsForModal = [];
      } else if (reminigReperats) {
        $rootScope.showScheduleSpinner = false;
        $rootScope.disableScheduleBtns = false;
        CallBournModal.close();
        CallBournModal.open(
          {
            scope: {
              CampaignComposeService: composeData
            },
            templateUrl:
              "/app/modals/camping-batch/show-repiteation-count-confirm.html",
            size: "modal-md"
          },
          function(scope) {
            scope.Math = Math;
            scope.dates = [];
            for (var i = 0; i < campaignData.remaining_repeats + 1; i++) {
              if (i == 0) {
                continue;
              }
              scope.dates.push(
                moment(
                  moment().add(i * campaignData.repeat_days_interval, "days")
                ).format("dddd DD, MMMM YYYY - HH:mm -")
              );
            }
            $rootScope.schedulationModalFlag = true;
            scope.saveTo = function() {
              composeData.proceedToSaving(action);
            };
            composeData.interactionsForModal = [];
          }
        );
      } else if (shcedulationRepeat) {
        if (
          campaignData.schedulations !== undefined &&
          campaignData.schedulations.length !== 0
        ) {
          $rootScope.showScheduleSpinner = false;
          $rootScope.disableScheduleBtns = false;
          CallBournModal.close();
          CallBournModal.open(
            {
              scope: {
                CampaignComposeService: composeData,
                campaignData: campaignData
              },
              templateUrl:
                "/app/modals/camping-batch/show-shcdulation-confirm-with-out-repitation.html",
              size: "modal-md"
            },
            function(scope) {
              if (
                scope.campaignData.schedulation_original_data !== undefined &&
                scope.campaignData.schedulation_original_data &&
                scope.campaignData.schedulation_original_data.length !== 0 &&
                composeData.saveChanges
              ) {
                var events = JSON.parse(
                  scope.campaignData.schedulation_original_data
                );
                events.forEach(function(event, i) {
                  event.start = moment(event.start).format(
                    "YYYY-MM-DD HH:mm:ss"
                  );
                  campaignData.schedulations.forEach(function(schedulation, j) {
                    if (
                      events.indexOf(event) ===
                      campaignData.schedulations.indexOf(schedulation)
                    ) {
                      campaignData.schedulations[j].start = moment(
                        events[i].start
                      );
                    }
                  });
                });
              }
              scope.minDate = scope.campaignData.minDate;
              scope.maxDate = scope.campaignData.maxDate;

              scope.isLiveTransferLimitExist =
                scope.campaignData.live_transfer_limit !== undefined
                  ? true
                  : false;
              $rootScope.schedulationModalFlag = true;
              for (
                var i = 0;
                i < scope.campaignData.schedulations.length;
                i++
              ) {
                if (scope.campaignData.schedulations[i].delivery_speed !== 0) {
                  scope.isAnyDeliverySpeedSet = true;
                  break;
                }
              }

              scope.scheduls = [];
              scope.Math = Math;
              var delivery =
                scope.CampaignComposeService.finalStepData.sendingTime;
              moment.locale($rootScope.currentLanguage);

              for (var index in campaignData.schedulations) {
                if (campaignData.schedulations[index].delivery_speed > 0) {
                  delivery = campaignData.schedulations[index].delivery_speed;
                }
                var schedulData = {
                  schedul: moment
                    .tz(
                      campaignData.schedulations[index].start,
                      $rootScope.currentUser.timezone
                    )
                    .format("dddd DD, MMMM YYYY - HH:mm -"),
                  delivery: delivery,
                  filterData: moment(
                    campaignData.schedulations[index].start
                  ).format(),
                  recipients_count_to_call:
                    campaignData.schedulations[index].recipients_count_to_call
                };
                var check = composeData.checkForSchedulation(
                  campaignData.schedulations[index].start
                );
                if (check) {
                  schedulData.is_pasted = false;
                } else {
                  schedulData.is_pasted = true;
                }
                scope.scheduls.push(schedulData);
              }
              scope.disableButtons = false;
              scope.saveTo = function() {
                if (composeData.saveChanges) {
                  composeData.proceedToSaving(action);
                  scope.disableButtons = true;
                } else {
                  scope.disableButtons = true;
                  $rootScope.schedulationModalFlag = false;
                  campaignData.schedulations.forEach(function(schedulation) {
                    schedulation.start = schedulation.start
                      .utc(window.SERVER_TIMEZONE)
                      .format("YYYY-MM-DD H:mm:ss");
                  });
                }
                composeData.proceedToSaving(action);
              };

              // scope.dismissModal = function () {
              //     CallBournModal.close();
              //     composeData.interactionsForModal = [];
              // }
            }
          );
        }
      } else {
        composeData.proceedToSaving(action);
      }
    };

    composeData.proceedToSaving = function(action, type) {
      var campaignData = composeData.campaignData;
      if (
        composeData.campaignData.schedulations &&
        composeData.campaignData.schedulation_original_data
      ) {
        composeData.campaignData.schedulations.forEach(function(
          schedulation,
          i
        ) {
          var originalSchedulations = JSON.parse(
            composeData.campaignData.schedulation_original_data
          );
          // originalSchedulations.forEach( function(originalSchedulation, j) {
          //     composeData.campaignData.schedulations[i].recipients_count_to_call = originalSchedulations[j].recipients_count_to_call
          // });
        });
      }
      campaignData.is_replay_active = composeData.replayDigit.onOff
        ? true
        : false;
      campaignData.is_transfer_active = composeData.transferDigit.onOff
        ? true
        : false;

      campaignData.is_callback_active = composeData.callbackDigit.onOff
        ? true
        : false;
      campaignData.is_donotcall_active = composeData.doNotCallDigit.onOff
        ? true
        : false;

      if (!campaignData.caller_id) {
        alert("Caller id is required.");
        return;
      }

      if (action != "preview") {
        campaignData.status = action;
      }

      switch (action) {
        case "saved":
          campaignData.schedulations = null;
          var templateUrl = "/app/modals/camping-batch/voice-message-save.html";
          break;
        case "scheduled":
          var templateUrl = "/app/modals/camping-batch/voice-message-sent.html";
          break;
        case "start":
          campaignData.schedulations = null;
          var templateUrl = "/app/modals/camping-batch/voice-message-sent.html";
          break;
        case "preview":
          var templateUrl = "/app/modals/camping-batch/voice-message-sent.html";
          var previewCampaignToCreateString = JSON.stringify(campaignData);
          var previewCampaignToCreate = JSON.parse(
            previewCampaignToCreateString
          );
          composeData.campaignData = $rootScope.editingCampaign;

          delete previewCampaignToCreate.selected_groups;

          previewCampaignToCreate.status = "start";
          previewCampaignToCreate.is_preview = true;
          previewCampaignToCreate.parent_id = $rootScope.editingCampaign._id;

          previewCampaignToCreate.callback_digit =
            $rootScope.editingCampaign.callback_digit;
          previewCampaignToCreate.callback_voice_file_id =
            $rootScope.editingCampaign.callback_digit_file_id;
          previewCampaignToCreate.transfer_digit =
            $rootScope.editingCampaign.transfer_digit;
          previewCampaignToCreate.transfer_options =
            $rootScope.editingCampaign.transfer_options;
          previewCampaignToCreate.transfer_option =
            $rootScope.editingCampaign.transfer_option;
          previewCampaignToCreate.do_not_call_digit =
            $rootScope.editingCampaign.do_not_call_digit;
          previewCampaignToCreate.do_not_call_voice_file_id =
            $rootScope.editingCampaign.do_not_call_digit_file_id;
          previewCampaignToCreate.do_not_call_file =
            $rootScope.editingCampaign.do_not_call_file;
          previewCampaignToCreate.replay_digit =
            $rootScope.editingCampaign.callback_digit;

          previewCampaignToCreate.campaign_voice_file_id =
            $rootScope.editingCampaign.campaign_voice_file_id;
          previewCampaignToCreate.type = $rootScope.editingCampaign.type;
          previewCampaignToCreate.playback_count =
            $rootScope.editingCampaign.playback_count;

          previewCampaignToCreate.is_callback_active =
            $rootScope.editingCampaign.callback_digit;
          previewCampaignToCreate.is_replay_active =
            $rootScope.editingCampaign.replay_digit;
          previewCampaignToCreate.is_donotcall_active =
            $rootScope.editingCampaign.do_not_call_digit;
          previewCampaignToCreate.is_transfer_active =
            $rootScope.editingCampaign.transfer_digit;

          var currentCallerId = composeData.campaignData.caller_id.toString();
          if (currentCallerId[0] !== "+") {
            currentCallerId = "+" + currentCallerId;
          }
          previewCampaignToCreate.phonenumbers = [currentCallerId];
          if (type === "vm") {
            previewCampaignToCreate.sms_text = "";
          } else if (type === "sms") {
            previewCampaignToCreate.campaign_voice_file_id = false;
          }

          // create preview campaign
          Restangular.all("campaigns/create-campaign")
            .post(previewCampaignToCreate)
            .then(function(data) {
              if (data.resource.error.no == 0) {
                composeData.editingCampaign = $rootScope.editingCampaign;
                growl.success($rootScope.trans("Call__made"));

                // get campaign data
                Restangular.one(
                  "campaigns/show-campaign",
                  $stateParams.campaign_id
                )
                  .get()
                  .then(function(res) {
                    // set previews
                    $rootScope.previews = res.resource.campaign.previews;
                    $rootScope.previews.forEach(function(item) {
                      if (
                        item.preview_phonenumbers[0].status === "IN_PROGRESS"
                      ) {
                        $rootScope.enableComposeActions = false;
                      }
                    });

                    // subscribe to socket channel
                    var socket_campaign_id;
                    $rootScope.socket.on("update-preview-message", function(
                      data
                    ) {
                      if (
                        !socket_campaign_id ||
                        socket_campaign_id == data.update.campaign_id
                      ) {
                        socket_campaign_id = data.update.campaign_id;
                        $rootScope.preview_status = data.update.status;

                        // set previews
                        $rootScope.previews.forEach(function(item) {
                          if (
                            item.preview_phonenumbers[0].status ===
                            "IN_PROGRESS"
                          ) {
                            $rootScope.enableComposeActions = false;
                          }
                        });
                      }
                    });

                    // scroll to previews section
                    if ($rootScope.previews.length) {
                      var elem = angular.element(".schedule_sel");
                      angular.element("html, body").animate({
                        scrollTop: elem.offset().top
                      });
                    }
                  });
              } else {
                growl.error($rootScope.trans(data.resource.error.text));
              }
            });
          return;
      }

      var url;

      if (composeData.editingCampaign) {
        if (composeData.saveChanges) {
          url = "campaigns/update-campaign-name-caller-id";
        } else {
          url = "campaigns/update-campaign";
          if (campaignData.schedulations) {
            campaignData.schedulations.forEach(function(schedulation) {
              var check = composeData.checkForSchedulation(schedulation.start);
              if (check) {
                schedulation.is_pasted = false;
              } else {
                schedulation.is_pasted = true;
              }
            });
          }
        }
      } else {
        url = "campaigns/create-campaign";
      }

      if (
        campaignData.currentTab === "contacts" ||
        campaignData.currentTab === "manually"
      ) {
        delete campaignData.selected_groups;
      }

      $rootScope.startModalLoader();

      Restangular.all(url)
        .post(campaignData)
        .then(function(data) {
          $rootScope.blinkSaveButton = false;
          if (data.resource.error.no === 0) {
            $rootScope.stopModalLoader();
            if (!campaignData.from && action !== "saved") {
              $rootScope.showBlurEffect = true;
              CallBournModal.open(
                {
                  scope: {},
                  templateUrl: templateUrl,
                  size: "modal-md"
                },
                function(scope) {
                  scope.goToOverview = function() {
                    $rootScope.blinkSaveButton = false;
                    CallBournModal.close();
                    if (action === "start") {
                      var campaignId = data.resource.campaign_id;
                      if (url === "campaigns/update-campaign") {
                        campaignId = campaignData.campaign_id;
                      }
                      $state.go("campaign.statistics", {
                        campaign_id: campaignId
                      });
                    } else {
                      $state.go("campaign.overview");
                    }
                  };
                  scope.dismissModal = function() {
                    CallBournModal.close();
                  };
                }
              );
            } else {
              $rootScope.blinkSaveButton = false;
              var id = data.resource.campaign_id || $stateParams.campaign_id;
              if (campaignData.from === "preview") {
                $state.go("campaign.edit", {
                  campaign_id: id,
                  from: "preview",
                  type: type
                });
                // $state.go('campaign.overview');
              } else {
                if (campaignData.from != "fromConfirm") {
                  // $state.go('campaign.edit', {
                  //   campaign_id: id
                  // });
                  $state.go("campaign.overview");
                } else {
                  $state.go($rootScope.toState, $rootScope.toParams);
                }
              }
            }
          } else if (data.resource.error.no !== 0) {
            $rootScope.stopModalLoader();
            if (data.resource.error.no == -12) {
              growl.error($rootScope.trans("insufficient_funds"));
            } else {
              growl.error(data.resource.error.text);
            }
          }
        });
    };

    composeData.calculateCostForPreListening = function() {
      var sendData = {};
      sendData.file_id = composeData.campaignData.campaign_voice_file_id;
      sendData.caller_id = composeData.campaignData.caller_id;
      CampingService.calculateCostForPreListening(sendData).then(function(
        data
      ) {
        var maxCost = data.resource.max_cost;
        composeData.disablePreListenButton =
          maxCost >=
          $rootScope.currentUser.balance -
            $rootScope.currentUser.retainedBalance;
      });
    };

    composeData.updateCallerId = function() {
      var deferred = $q.defer();
      var campaignId = composeData.campaignData.campaign_id;
      var callerId = composeData.campaignData.caller_id;
      var updateData = {
        campaign_id: campaignId,
        caller_id: callerId
      };
      Restangular.all("campaigns/update-campaign-caller-id")
        .post(updateData)
        .then(function(data) {
          deferred.resolve(data.resource);
        });
      return deferred.promise;
    };

    return composeData;
  });
