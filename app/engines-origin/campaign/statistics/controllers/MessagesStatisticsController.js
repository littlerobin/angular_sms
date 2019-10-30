angular.module("callburnApp").controller("MessagesStatisticsController", [
  "$scope",
  "$rootScope",
  "$state",
  "Restangular",
  "$stateParams",
  "growl",
  "phonenumbers",
  "$httpParamSerializer",
  "$sce",
  "$interval",
  "IconsControl",
  "CallBournModal",
  "$q",
  "$filter",
  function(
    $scope,
    $rootScope,
    $state,
    Restangular,
    $stateParams,
    growl,
    phonenumbers,
    $httpParamSerializer,
    $sce,
    $interval,
    IconsControl,
    CallBournModal,
    $q,
    $filter
  ) {
    if (phonenumbers.resource.error.no === -13) {
      growl.error($rootScope.trans("this_campaign_doesnt_exist"));
      $state.go("campaign.overview");
    }
    if (
      !phonenumbers.resource.phonenumbers.length &&
      !phonenumbers.resource.campaign.schedulations.length
    ) {
      $state.go("campaign.edit", {
        campaign_id: phonenumbers.resource.campaign._id
      });
    }

    $scope.batchRepeats = null;
    $scope.batchRepeatsText = null;
    $scope.showEditBox = false;
    $scope.redBorder = "";
    $scope.goToNotification = $rootScope.goToNotification;
    $rootScope.tutorialSidePopup = false;
    $scope.isMultiple = $stateParams.is_multiple;
    $rootScope.currentActiveRoute = "campaign";
    $scope.page = 1;
    $scope.tableSpinnerLoading = false;
    $scope.showArrowByField = null;
    $scope.orderField = null;
    $scope.firstLoadForStatuses = true;
    $scope.firstLoadForInteractions = true;
    $rootScope.currentPage = "dashboard";
    $scope.phonenumbers = [];
    $scope.currentCampaign = phonenumbers.resource.campaign;
    $scope.serverTimezone = phonenumbers.resource.server_timezone;
    $scope.interactions = phonenumbers.resource.interactions;
    $scope.exportCampaignLoader = false;

    var applyTranslations = function() {
      $scope.isLoaded = false;
      setTimeout(function() {
        $scope.isLoaded = true;
      }, 100);
      $scope.multiselectOptionsMessageStatisticsStatusData = [
        {
          id: "success",
          label: trans("campaign_statistics_delivered")
        },
        {
          id: "failed",
          label: trans("campaign_statistics_not_delivered")
        },
        {
          id: "sent",
          label: trans("campaign_overview_calling_in_progress")
        },
        {
          id: "IN_PROGRESS",
          label: trans("waiting_for_schedulation")
        },
        {
          id: "IDLE",
          label: trans("campaign_statistics_idle")
        },
        {
          id: "CANT_CALL_DUE_TO_EU",
          label: trans("cant_call_due_eu")
        }
      ];

      $scope.multiselectOptionsMessageStatisticsInteractionsData = [
        {
          id: "TRANSFER_REQUESTED",
          label: trans("campaign_statistics_transfer")
        },
        {
          id: "REPLAY_REQUESTED",
          label: trans("campaign_statistics_replay")
        },
        {
          id: "CALLBACK_REQUESTED",
          label: trans("campaign_statistics_callback")
        },
        {
          id: "DONOTCALL_REQUESTED",
          label: trans("campaign_statistics_blacklist")
        }
      ];

      if ($scope.currentCampaign.type == 'VOICE_WITH_SMS') {
        $scope.smsCount = $scope.currentCampaign.total_phonenumbers[0] && $scope.currentCampaign.total_phonenumbers[0].count && (
          ($scope.currentCampaign.is_archived && ($scope.currentCampaign.archived_sms_count[0] && $scope.currentCampaign.archived_sms_count[0].count) || 0) ||
          (!$scope.currentCampaign.is_archived && ($scope.currentCampaign.sms_count[0] && $scope.currentCampaign.sms_count[0].count) || 0)
        )
        $scope.voiceCount = $scope.currentCampaign.total_phonenumbers[0] && $scope.currentCampaign.total_phonenumbers[0].count && (
          ($scope.currentCampaign.is_archived && ($scope.currentCampaign.success_phonenumbers[0] && ($scope.currentCampaign.success_phonenumbers[0].count) - (($scope.currentCampaign.archived_sms_count[0] && $scope.currentCampaign.archived_sms_count[0].count) || 0)) || 0) ||
          (!$scope.currentCampaign.is_archived && ($scope.currentCampaign.success_phonenumbers[0] && ($scope.currentCampaign.success_phonenumbers[0].count) - (($scope.currentCampaign.sms_count[0] && $scope.currentCampaign.sms_count[0].count) || 0)) || 0)
        )
      }
      $scope.typeContactsDropdown = {
        0: {
          value: "all",
          text:
            $rootScope.trans("dashboard_welcome_voice_messages") +
            " + " +
            "SMS: " +
            ($scope.smsCount + $scope.voiceCount)
        },
        1: {
          value: "sms",
          text: "SMS: " + $scope.smsCount
        },
        2: {
          value: "callmessage",
          text:
            $rootScope.trans("dashboard_welcome_voice_messages") +
            ": " +
            $scope.voiceCount
        }
      };

      $scope.multiselectStatisticsStatusTranslationTexts = {
        dynamicButtonTextSuffix: trans("multi_checked"),
        checkAll: trans("multi_check_all"),
        uncheckAll: trans("multi_uncheck_all"),
        selectionCount: trans("multi_checked"),
        buttonDefaultText: trans("multiselect_statistics_status")
      };
      $scope.multiselectStatisticsInteractionsTranslationTexts = {
        dynamicButtonTextSuffix: trans("multi_checked"),
        checkAll: trans("multi_check_all"),
        uncheckAll: trans("multi_uncheck_all"),
        selectionCount: trans("multi_checked"),
        buttonDefaultText: trans("multiselect_statistics_interactions")
      };
    };

    $rootScope.$watch("currentLanguage", applyTranslations);
    $rootScope.$watch("isLangLoaded", applyTranslations);

    $scope.IconsControl = IconsControl;

    $scope.checkedPhonenumbers = {};
    var totalCostOfCampaign = 0;

    $rootScope.showPreviousIcon = true;

    $rootScope.previousStep = function() {
      $state.go("campaign.overview");
    };

    if (
      phonenumbers.resource.campaign &&
      phonenumbers.resource.campaign.grouping_type == "REPEAT"
    ) {
      $scope.batchRepeats = [];
      var tempRepeats = phonenumbers.resource.campaign;
      $scope.batchRepeatsText = "Batch #1" + " - " + tempRepeats.created_at;
      var counter = 0;
      var object = {
        campaign_id: tempRepeats._id,
        showAttr: "Batch #" + counter + " - " + tempRepeats.created_at
      };
      $scope.batchRepeats.push(object);
    }

    var updatePhonenumbers = function(data) {
      $scope.tableSpinnerLoading = false;
      totalCostOfCampaign = data.resource.total_cost;
      $scope.phonenumbers = data.resource.phonenumbers;
      if (data.resource.campaign) {
        try {
          $scope.totalCost = data.resource.total_cost;
        } catch (e) {
          $scope.totalCost = null;
        }

        $scope.campaignRepeats = [];
        var campTempRepeats = data.resource.campaign;
        var counter = 1;
      }

      $scope.campingData = data.resource.campaign;
      $scope.schedulations = data.resource.campaign.schedulations;
      $scope.campingData.campaign_name = $scope.campingData.campaign_name
        ? $scope.campingData.campaign_name
        : trans("add_a_name");
      $scope.totalPhonenumbers = data.resource.phonenumbers_count;
      $scope.totalPhonenumbersOrigin = data.resource.total_phonenumbers_count;
      $scope.succedPhonenumbers = data.resource.campaign.success_phonenumbers[0]
        ? data.resource.campaign.success_phonenumbers[0].count
        : 0;

      $scope.schedulationDropdownData = {
        0: {
          value: "all",
          text: $rootScope.trans("reset_filter")
        }
      };
      var i = 0;
      $scope.schedulations.forEach(function(item, index) {
        var date = moment(item.scheduled_date)
          .tz($rootScope.currentUser.timezone)
          .format("MMMM Do YYYY, HH:mm");
        if (
          !moment()
            .tz($rootScope.currentUser.timezone)
            .isBefore(date)
        ) {
          var past = true;
          i++;
        }
        if (past) {
          $scope.schedulationDropdownData[i] = {
            value: item._id,
            text:
              "#" +
              i +
              " " +
              $rootScope.trans("account_invocies_date") +
              ": " +
              item.scheduled_date +
              " " +
              $rootScope.trans("compose_step_3_text_recipients") +
              ": " +
              "---"
          };
        }
      });
    };

    updatePhonenumbers(phonenumbers);

    if (
      $scope.campingData.total_phonenumbers &&
      $scope.campingData.total_phonenumbers[0] &&
      $scope.campingData.total_phonenumbers[0].count &&
      $scope.campingData.success_phonenumbers
    ) {
      if (!$scope.campingData.success_phonenumbers[0]) {
        // All Failed
        var data = {
          series: [$scope.campingData.total_phonenumbers[0].count, 0]
        };
      } else {
        var data = {
          series: [
            $scope.campingData.total_phonenumbers[0].count -
              $scope.campingData.success_phonenumbers[0].count,
            $scope.campingData.success_phonenumbers[0].count
          ]
        };
      }

      var sum = function(a, b) {
        return a + b;
      };

      var responsiveOptions = [
        [
          "screen and (max-width: 992px)",
          {
            width: 320,
            height: 150,
            labelOffset: 40
          }
        ]
      ];

      var options = {
        chartPadding: 30,
        labelOffset: 50,
        labelInterpolationFnc: function(value) {
          return Math.round((value / data.series.reduce(sum)) * 100) + "%";
        },
        width: 300,
        height: 200
      };

      new Chartist.Pie(".ct-chart", data, options, responsiveOptions);
    }

    $scope.replayCount = $scope.interactions.reply;
    $scope.transferCount = $scope.interactions.transfer;
    $scope.callbackCount = $scope.interactions.callback;
    $scope.blacklistCount = $scope.interactions.blacklist;

    var barsData = {
      labels: [
        $rootScope.trans("campaign_statistics_replay") +
          " (" +
          $scope.replayCount +
          ")",
        $rootScope.trans("campaign_statistics_transfer") +
          " (" +
          $scope.transferCount +
          ")",
        $rootScope.trans("campaign_statistics_callback") +
          " (" +
          $scope.callbackCount +
          ")",
        $rootScope.trans("campaign_statistics_blacklist") +
          " (" +
          $scope.blacklistCount +
          ")"
      ],
      series: [
        $scope.replayCount,
        $scope.transferCount,
        $scope.callbackCount,
        $scope.blacklistCount
      ]
    };

    var responsiveOptions = [
      [
        "screen and (max-width: 992px)",
        {
          width: 320,
          height: 150
        }
      ]
    ];

    var barsOptions = {
      width: 400,
      height: 200,
      distributeSeries: true
    };
    new Chartist.Bar(".ct-bars", barsData, barsOptions, responsiveOptions);

    $scope.checkedUncheckPhonenumber = function(phonenumberId, event) {
      $scope.checkedPhonenumbers[phonenumberId] = $scope.checkedPhonenumbers[
        phonenumberId
      ]
        ? !$scope.checkedPhonenumbers[phonenumberId]
        : true;
    };

    $scope.currentOrder = "ASC";

    $scope.filterData = $stateParams;

    $scope.getInteractionSelectData = function() {
      switch ($scope.filterData.action) {
        case "TRANSFER_REQUESTED":
          return $rootScope.trans("campaign_statistics_transfer");
        case "REPLAY_REQUESTED":
          return $rootScope.trans("campaign_statistics_replay");
        case "CALLBACK_REQUESTED":
          return $rootScope.trans("campaign_statistics_callback");
        case "DONOTCALL_REQUESTED":
          return $rootScope.trans("campaign_statistics_blacklist");
        default:
          return $rootScope.trans("campaign_statistics_all_values_shown");
      }
    };

    $scope.interactionsArray = [
      {
        keepValue: "",
        showValue: $rootScope.trans("campaign_statistics_all_values_shown")
      },
      {
        keepValue: "TRANSFER_REQUESTED",
        showValue: $rootScope.trans("campaign_statistics_transfer")
      },
      {
        keepValue: "REPLAY_REQUESTED",
        showValue: $rootScope.trans("campaign_statistics_replay")
      },
      {
        keepValue: "CALLBACK_REQUESTED",
        showValue: $rootScope.trans("campaign_statistics_callback")
      },
      {
        keepValue: "DONOTCALL_REQUESTED",
        showValue: $rootScope.trans("campaign_statistics_blacklist")
      }
    ];

    $scope.getStatusesSelectData = function() {
      switch ($scope.filterData.status) {
        case "success":
          return $rootScope.trans("campaign_statistics_delivered");
        case "failed":
          return $rootScope.trans("campaign_statistics_not_delivered");
        case "sent":
          return $rootScope.trans("campaign_sending_in_progress");
        case "IN_PROGRESS":
          return $rootScope.trans("waiting_for_schedulation");
        case "IDLE":
          return $rootScope.trans("campaign_statistics_idle");
        case "CANT_CALL_DUE_TO_EU":
          return $rootScope.trans("cant_call_due_eu");
        default:
          return $rootScope.trans("campaign_statistics_all_values_shown");
      }
    };

    var getPhonenumberSchedulationDate = function(phonenumber) {
      if (!$scope.schedulations) {
        return null;
      }

      for (var i = 0; i < $scope.schedulations.length; i++) {
        if ($scope.schedulations[i]._id === phonenumber.schedulation_id) {
          return $scope.schedulations[i].scheduled_date;
        }
      }

      return null;
    };

    $scope.getStatus = function(phonenumber, campaign) {
      if (phonenumber.status === "IN_PROGRESS") {
        if (!phonenumber.schedulation_id) {
          phonenumber.statusClass = "save-as-draft-status snippet_blinking";
          return $rootScope.trans("campaign_sending_in_progress");
        }
        var scheduleDate = getPhonenumberSchedulationDate(phonenumber);
        if (scheduleDate) {
          scheduleDate = moment(scheduleDate, "YYYY-MM-DD h:mm:ss");
          if (
            moment()
              .tz(window.SERVER_TIMEZONE)
              .diff(scheduleDate) >= 0
          ) {
            phonenumber.statusClass = "save-as-draft-status snippet_blinking";
            return $rootScope.trans("campaign_sending_in_progress");
          } else {
            phonenumber.statusClass = "schedulation-in-progress-status";
            return trans("waiting_for_schedulation");
          }
        }
        phonenumber.statusClass = "schedulate-status";
        return trans("waiting_for_schedulation");
      }

      if (campaign.type === "VOICE_MESSAGE") {
        if (phonenumber.status === "SUCCEED") {
          phonenumber.statusClass = "sent-statistics-status";
          return trans("campaign_statistics_delivered");
        }
      } else if (campaign.type === "VOICE_WITH_SMS") {
        if (
          phonenumber.status === "SUCCEED" ||
          phonenumber.status === "CALL_FAILED_SMS_SUCCEED"
        ) {
          phonenumber.statusClass = "sent-statistics-status";
          return trans("campaign_statistics_delivered");
        }
      } else if (campaign.type === "SMS") {
        if (phonenumber.status === "SUCCEED") {
          phonenumber.statusClass = "sent-statistics-status";
          return trans("campaign_statistics_delivered");
        }
      }

      if (phonenumber.status === "IDLE") {
        phonenumber.statusClass = "schedulate-status";
        return trans("campaign_statistics_idle");
      }

      if (phonenumber.status === "SUCCEED") {
        phonenumber.statusClass = "save-as-draft-status";
        if (phonenumber.calls.length) {
          return $filter("localDate")(
            phonenumber.calls[phonenumber.calls.length - 1].dialled_datetime
          );
        }
      }

      if (phonenumber.status === "CANT_CALL_DUE_TO_EU") {
        phonenumber.statusClass = "dark_orange";
        return trans("cant_call_due_eu");
      }

      phonenumber.statusClass = "dark_orange";

      return trans("campaign_statistics_not_delivere");
    };

    $scope.statusesArray = [
      {
        keepValue: "",
        showValue: $rootScope.trans("campaign_statistics_all_values_shown")
      },
      {
        keepValue: "success",
        showValue: $rootScope.trans("campaign_statistics_delivered")
      },
      {
        keepValue: "failed",
        showValue: $rootScope.trans("campaign_statistics_not_delivered")
      },
      {
        keepValue: "sent",
        showValue: $rootScope.trans("campaign_statistics_in_progress")
      },
      {
        keepValue: "IN_PROGRESS",
        showValue: $rootScope.trans("campaign_statistics_delivered")
      },
      {
        keepValue: "IDLE",
        showValue: $rootScope.trans("campaign_statistics_not_delivered")
      },
      {
        keepValue: "CANT_CALL_DUE_TO_EU",
        showValue: $rootScope.trans("cant_call_due_eu")
      }
    ];

    $scope.getCost = function(tariff, duration) {
      if (duration < 20) {
        duration = 20;
      }

      return (tariff.country.customer_price * duration) / 60;
    };

    $scope.filterChanged = function(rejectSpinner) {
      $scope.tableSpinnerLoading = rejectSpinner ? false : true;
      Restangular.all("phonenumbers/campaign-phonenumbers")
        .post($scope.filterData)
        .then(function(phonenumbers) {
          updatePhonenumbers(phonenumbers);
        });
    };

    var intervalPromise = $interval($scope.filterChanged(true), 15000);

    $scope.$on("$destroy", function() {
      $interval.cancel(intervalPromise);
    });

    $scope.searchPhonenumbers = function(phonenumber) {
      $scope.filterData.phonenumber = phonenumber;
      $scope.page = 1;
      $scope.filterChanged();
    };

    $scope.changeCampaignName = function() {
      if ($scope.showEditBox) {
        if (!$scope.campingData.campaign_name) {
          $scope.errClass = "input-error animated swing";
          return;
        } else {
          $scope.errClass = "";
        }
        var name = $scope.campingData.campaign_name;
        var id = $scope.campingData._id;
        var editNameData = {
          campaign_name: name,
          campaign_id: id
        };
        Restangular.all("campaigns/update-campaign-name")
          .post(editNameData)
          .then(function(data) {
            if (data.resource.error.no === 0) {
              $scope.showEditBox = false;
              $scope.redBorder = "";
            }
          });
      }
    };

    $scope.showEditNameInput = function() {
      $scope.showEditBox = !$scope.showEditBox;
      setTimeout(function() {
        angular.element("#change-message-name").select();
      }, 100);
    };

    $scope.currentPage = undefined;

    $scope.changePage = function(page) {
      $scope.filterData.page = page - 1;
      $scope.currentPage = page;
      $scope.filterChanged();
    };

    $scope.changeOrder = function(field, status) {
      $scope.showArrowByField = field;
      $scope.currentPage = 1;
      $scope.page = 1;
      $scope.filterData.page = 0;
      if (field == $scope.filterData.order_field) {
        $scope.currentOrder = $scope.currentOrder == "ASC" ? "DESC" : "ASC";
        if (status) {
          if (status == "delivered") {
            $scope.filterData.statuses = "success";
          } else if (status == "not_delivered") {
            $scope.filterData.statuses = "failed";
          }
        }
      } else {
        $scope.currentOrder = "ASC";
      }
      $scope.orderField = field;
      $scope.filterData.order_field = field;
      $scope.filterData.order = $scope.currentOrder;

      $scope.changePage(1);
    };

    $scope.activePhonenumber = { actions: [] };
    $scope.openActionsModal = function(phonenumber) {
      $scope.activePhonenumber = phonenumber;
      $scope.showAttemptsModal = true;
    };

    $scope.removeFromPhonebook = function() {
      if (isPhonenumbersEmpty()) {
        alert("No phonenumber selected");
        return;
      }

      $rootScope.startLoader();
      Restangular.all("phonenumbers/remove-from-phonebook")
        .post({ phonenumber_ids: $scope.checkedPhonenumbers })
        .then(function(data) {
          $rootScope.stopLoader();
          if (data.resource.error.no === 0) {
            // alert('done');
          }
        });
    };

    window.playPauseRecordedAudio = function(campaignId) {
      var template = $scope.currentCampaign.voice_file;
      var audioId = template._id;
      if (!template.amazon_s3_url) {
        if (document.getElementById("audioFilePlay" + audioId)) {
          document
            .getElementById("audioFilePlay" + audioId)
            .setAttribute(
              "src",
              "assets/callburn/images/images/blue-audio-spinner.svg"
            );
        }
        $rootScope.getAmazonUrlOfAudio(template._id).then(function(url) {
          if (document.getElementById("audioFilePlay" + audioId)) {
            document
              .getElementById("audioFilePlay" + audioId)
              .setAttribute("src", "/assets/callburn/images/stop.svg");
            $scope.currentCampaign.voice_file.amazon_s3_url = url;
            playPauseAudio(audioId, url);
          }
        });
      } else {
        playPauseAudio(audioId);
      }
    };

    var playPauseAudio = function(audioId, url) {
      var audio = document.getElementById("campaignAudio");
      if (url) {
        audio.setAttribute("src", url);
      }
      if ($scope.isRecordedFilePlaying) {
        audio.pause();
        audio.currentTime = 0;
        if (document.getElementById("audioFilePlay" + audioId)) {
          document
            .getElementById("audioFilePlay" + audioId)
            .setAttribute("src", "/assets/callburn/images/play.svg");
          document.getElementById("audioFilePlayText" + audioId).innerHTML =
            "&nbsp;&nbsp;Play";
        }
      } else {
        audio.play();
        document
          .getElementById("audioFilePlay" + audioId)
          .setAttribute("src", "/assets/callburn/images/stop.svg");
        document.getElementById("audioFilePlayText" + audioId).innerHTML =
          "&nbsp;Pause";
        audio.addEventListener(
          "ended",
          function() {
            $scope.isRecordedFilePlaying = false;
            if (document.getElementById("audioFilePlay" + audioId)) {
              document
                .getElementById("audioFilePlay" + audioId)
                .setAttribute("src", "/assets/callburn/images/play.svg");
              document.getElementById("audioFilePlayText" + audioId).innerHTML =
                "&nbsp;&nbsp;Play";
              // if (!$scope.$$phase) $scope.$apply();
            }
          },
          false
        );
      }
      $scope.isRecordedFilePlaying = !$scope.isRecordedFilePlaying;
    };

    $scope.sendAgain = function(phonenumber) {
      var pushingObject = {
        number: phonenumber.phone_no,
        status: "success",
        tariff: phonenumber.tariff
      };
      var sendingPhonenumbers = [];
      sendingPhonenumbers.push(pushingObject);
      $state.go("campaign.compose", { phonenumbers: sendingPhonenumbers });
    };

    // Export Modal
    $scope.openExportModal = function(campaign) {
      CallBournModal.open(
        {
          scope: {},
          templateUrl: "/app/modals/campaign-export/campaign-export.html"
        },
        function(scope) {
          scope.close = function() {
            CallBournModal.close();
          };
          scope.exportHandler = function(fileFormat) {
            $scope.exportCampaign(fileFormat);
            CallBournModal.close();
          };
        }
      );
    };

    $scope.exportCampaign = function(fileFormat) {
      $scope.exportCampaignLoader = true;
      $scope.filterData.file_format = fileFormat;
      Restangular.all("phonenumbers/export-statistics")
        .post($scope.filterData)
        .then(function(data) {
          if (data.resource.error.no === 0) {
            $scope.exportCampaignLoader = false;
            growl.success($rootScope.trans("email_will_be_sent_to_you"));
          } else {
            $scope.exportCampaignLoader = false;
            growl.error($rootScope.trans("email_will_not_be_sent_to_you"));
          }
        });
    };

    window.document.title =
      $scope.notSeenNotificationsCount === 0
        ? "Messages - " + "Callburn"
        : "(" +
          $scope.notSeenNotificationsCount +
          ") " +
          "Messages - " +
          "Callburn";

    var convertedAudioTooltips = {};
    $scope.getTooltipHtml = function(campaign) {
      if (!campaign.voice_file) return; // NEED BACKEND HELP
      if (convertedAudioTooltips.hasOwnProperty(campaign._id)) {
        return convertedAudioTooltips[campaign._id];
      }
      if (campaign.voice_file.type === "TTS") {
        var name = $filter("limitTo")(campaign.voice_file.tts_text, 25);
      } else if (campaign.voice_file.type === "UPLOADED") {
        var name = campaign.voice_file.orig_filename;
      }
      var str = '<p><span class="in_blue">Name</span>: ' + name + "</p>";
      str =
        str +
        '<p class="in_blue">' +
        campaign.voice_file.type +
        " - " +
        $filter("audioDuration")(campaign.voice_file.length) +
        "</p>";
      str =
        str +
        '<div class="stop-play left"> <img src="/assets/callburn/images/play.svg" class="compose_method3_icons" id="audioFilePlay' +
        campaign.voice_file._id +
        '"style="cursor:pointer;width:20px;" onclick="playPauseRecordedAudio(' +
        campaign._id +
        ')"/><span id="audioFilePlayText' +
        campaign.voice_file._id +
        '">&nbsp;&nbsp;Play</span> </div>';
      str = $sce.trustAsHtml(str);
      convertedAudioTooltips[campaign._id] = str;

      return str;
    };

    $scope.getAudioTooltipHtml = function(campaign, action) {
      if (!campaign) {
        return;
      }
      if (action == "callback") {
        var voiceFileId = campaign.callback_digit_file_id;
      } else if (action == "donotcall") {
        var voiceFileId = campaign.do_not_call_digit_file_id;
      } else {
        var voiceFileId = campaign.campaign_voice_file_id;
      }

      var str =
        '<audio src="' +
        apiUrl +
        "?key=" +
        $rootScope.currentUser.api_token +
        "&file_id=" +
        voiceFileId +
        '" controls style="display:none;" id="campaignAudio' +
        voiceFileId +
        '"></audio>';
      str =
        str +
        '<img src="/assets/callburn/images/play.png" class="compose_method3_icons" onclick="playAudio(' +
        voiceFileId +
        ')" />&nbsp;&nbsp;Play <br><br>';
      str =
        str +
        '<img src="/assets/callburn/images/stop1.png" class="compose_method3_icons" onclick="pauseAudio(' +
        voiceFileId +
        ')" />&nbsp;&nbsp;Pause ';

      return str;
    };

    $scope.addToBlacklist = function(number, name) {
      var data = {
        phonenumbers: [+number],
        name: name,
        campaign_id: $scope.currentCampaign._id
      };
      Restangular.all("address-book/add-black-list")
        .post(data)
        .then(function(data) {
          if (data.resource.error.no == 0) {
            growl.success($rootScope.trans("contact_added_to_blacklist"));
            var elemPos = $scope.phonenumbers
              .map(function(item) {
                return item.phone_no;
              })
              .indexOf(number);
            $scope.phonenumbers[elemPos].black_list = [{ number: number }];
          } else if (data.resource.error.no != 0) {
            growl.error($rootScope.trans(data.resource.error.text));
          }
        });
    };

    $scope.removeFromBlacklist = function(contact_id, phone_id, id) {
      var data = {
        phonenumber_ids: [id]
      };
      Restangular.all("address-book/remove-black-list")
        .post(data)
        .then(function(data) {
          if (data.resource.error.no === 0) {
            var elemPos = $scope.phonenumbers
              .map(function(phonenumber) {
                if (phonenumber._id == contact_id) {
                  return phonenumber._id;
                }
              })
              .indexOf(contact_id);
            $scope.phonenumbers[elemPos].black_list = {};
          }
        });
    };

    var isPhonenumbersEmpty = function() {
      for (index in $scope.checkedPhonenumbers) {
        if ($scope.checkedPhonenumbers[index]) {
          return false;
        }
      }

      return true;
    };

    window.playAudio = function(id) {
      var audio = document.getElementById("campaignAudio" + id);
      audio.play();
    };

    window.pauseAudio = function(id) {
      var audio = document.getElementById("campaignAudio" + id);
      audio.pause();
    };

    $scope.getFirstElemet = function() {
      for (var index in $scope.campaignRepeats) {
        return $scope.campaignRepeats[index].showAttr;
      }
    };

    $scope.getTotalTime = function(phonenumber) {
      return phonenumber.total_cost;
    };

    $scope.getDuration = function(phonenumber) {
      return phonenumber.total_duration;
    };

    $scope.showAllAttempts = function(phonenumber) {
      CallBournModal.open(
        {
          scope: {
            calls: phonenumber.calls
          },
          templateUrl: "/app/modals/campaign-statistics/show-attemps-modal.html"
        },
        function(scope) {
          scope.getTranslatedStatus = function(status) {
            switch (status) {
              case "SENT_TO_ASTERISK":
                return $rootScope.trans(
                  "campaign_statistics_status_sent_to_asterix"
                );
                break;
              case "DIALLED":
                return $rootScope.trans("campaign_statistics_status_dialled");
                break;
              case "CHANNEL_UNAVAILABLE":
                return $rootScope.trans(
                  "campaign_statistics_status_channel_unavailable"
                );
                break;
              case "CONGESTION":
                return $rootScope.trans(
                  "campaign_statistics_status_congestion"
                );
                break;
              case "BUSY":
                return $rootScope.trans("campaign_statistics_status_busy");
                break;
              case "NO_ANSWER":
                return $rootScope.trans("campaign_statistics_status_no_answer");
                break;
              case "ANSWERED":
                return $rootScope.trans("campaign_statistics_status_answer");
                break;
              case "BLACKLISTED":
                return $rootScope.trans(
                  "campaign_statistics_status_blacklisted"
                );
                break;
              case "TRANSFER":
                return $rootScope.trans("campaign_statistics_status_transfer");
                break;
              case "ERROR_MARKED":
                return $rootScope.trans(
                  "campaign_statistics_status_error_marked"
                );
                break;
              case "FATAL_ERROR":
                return $rootScope.trans(
                  "campaign_statistics_status_fatal_error"
                );
                break;
            }
          };
          scope.close = function() {
            CallBournModal.close();
          };
        }
      );
    };

    $scope.getCampaignStatusText = function(campaign) {
      if (campaign.status === "scheduled" && campaign.first_scheduled_date) {
        for (var i = 0; i < campaign.schedulations.length; i++) {
          if (!campaign.schedulations[i].is_finished) {
            var nextSchedule = moment(
              moment.tz(
                campaign.schedulations[i].scheduled_date,
                "YYYY-MM-DD HH:mm:ss",
                "utc"
              )._d
            ).add(1, "minute");

            var duration = moment().diff(nextSchedule);
            var humanize = humanizeDuration(duration, {
              units: ["d", "h", "m"],
              round: true,
              language: $rootScope.currentLanguage
            });

            return trans("next_run_in") + " " + humanize;
          }
        }
      }
      var updatedAt = moment(campaign.updated_at, "YYYY-MM-DD HH:mm:ss")
        .tz($scope.serverTimezone)
        .format("YYYY-MM-DD HH:mm:ss");
      var createdAt = moment(campaign.created_at, "YYYY-MM-DD HH:mm:ss")
        .tz($scope.serverTimezone)
        .format("YYYY-MM-DD HH:mm:ss");

      //SENT
      if (campaign.status === "dialing_completed") {
        return trans("completed_on") + " " + $filter("localDate")(updatedAt);
      }

      //IN PROGRESS
      if (campaign.status === "start" && !campaign.schedulation_original_data) {
        return trans("started_on") + " " + $filter("localDate")(createdAt);
      }
      // IN PROGRESS NEW
      if (campaign.status === "schedulation_in_progress") {
        return trans("started_on") + " " + $filter("localDate")(updatedAt);
      }

      //SAVED AS DRAFT
      if (campaign.status === "saved") {
        return trans("saved_on") + " " + $filter("localDate")(createdAt);
      }

      //MANUALLY STOPPED
      if (campaign.status === "stop") {
        return (
          trans("manually_stopped_on") + " " + $filter("localDate")(updatedAt)
        );
      }

      return null;
    };

    // Example If() $rootScope.currentUser.balance - $rootScope.currentUser.retainedBalance < 0.15
    $scope.getStatusClass = function(campaign) {
      if ($rootScope.currentUser.balance <= 0) {
        if (
          campaign.status !== "dialing_completed" &&
          campaign.status !== "saved"
        ) {
          return "dark_orange snippet_blinking";
        }
      } else if (campaign.status === "stop") {
        return "dark_orange";
      } else if (campaign.status === "stopped_low_balance") {
        return "dark_orange";
      } else if (campaign.status === "saved") {
        return "schedulation-in-progress-status";
      } else if (campaign.status === "dialing_completed") {
        return "sent-statistics-status";
      } else if (campaign.status === "schedulation_idle") {
        return "schedulation-idle-status";
      } else if (campaign.status === "scheduled") {
        return "schedulate-status";
      } else if (campaign.status === "start") {
        return "save-as-draft-status";
      } else if (campaign.status === "schedulation_in_progress") {
        return "save-as-draft-status snippet_blinking";
      }
    };

    $scope.getCostOfCampaign = function(campaign) {
      return campaign.amount_spent;
    };

    $scope.getSuccessOfCampaign = function(campaign) {
      return campaign.success_phonenumbers[0]
        ? campaign.success_phonenumbers[0].count
        : 0;
    };

    $scope.getTotalOfCampaign = function(campaign) {
      if (campaign.totalRecipientsIfGroups) {
        return campaign.totalRecipientsIfGroups;
      }
      return campaign.total_phonenumbers[0]
        ? campaign.total_phonenumbers[0].count
        : 0;
    };

    $scope.hideOnDisabled = false;

    // Example if() $rootScope.currentUser.balance - $rootScope.currentUser.retainedBalance >0.15
    $scope.getCampaignStatus = function(campaign) {
      if (
        campaign.is_first_run == 1 &&
        campaign.status !== "saved" &&
        campaign.status !== "scheduled" &&
        campaign.status !== "stop" &&
        campaign.status !== "schedulation_idle"
      ) {
        return $rootScope.trans("in_process");
      }
      switch (campaign.status) {
        case "stopped_low_balance":
          return $rootScope.trans("stopped_low_balance");
        case "dialing_completed":
          return $rootScope.trans(
            "campaign_overview_chackbox_dialing_completed"
          );
        case "start":
          if (campaign.schedulation_original_data) {
            if ($rootScope.currentUser.balance > 0) {
              return $rootScope.trans(
                "campaign_overview_chackbox_dialing_scheduled"
              );
            } else {
              $scope.hideOnDisabled = true;
              return $rootScope.trans("low_balance_disabled");
            }
          } else {
            if ($rootScope.currentUser.balance > 0) {
              return $rootScope.trans("campaign_sending_in_progress");
            } else {
              $scope.hideOnDisabled = true;
              return $rootScope.trans("low_balance_disabled");
            }
          }
        case "saved":
          return $rootScope.trans("campaign_overview_chackbox_dialing_saved");
        case "scheduled":
          if ($rootScope.currentUser.balance > 0) {
            return $rootScope.trans(
              "campaign_overview_chackbox_dialing_scheduled"
            );
          } else {
            $scope.hideOnDisabled = true;
            return $rootScope.trans("low_balance_disabled");
          }
        case "schedulation_idle":
          if ($rootScope.currentUser.balance > 0) {
            return $rootScope.trans(
              "campaign_overview_chackbox_schedulation_idle"
            );
          } else {
            return $rootScope.trans("low_balance_disabled");
          }
        case "stop":
          if ($rootScope.currentUser.balance > 0) {
            return $rootScope.trans(
              "campaign_overview_chackbox_dialing_stopped"
            );
          } else {
            return $rootScope.trans("low_balance_disabled");
          }
        case "schedulation_in_progress":
          if ($rootScope.currentUser.balance > 0) {
            return $rootScope.trans("campaign_sending_in_progress");
          } else {
            return $rootScope.trans("low_balance_disabled");
          }
        default:
          return "";
      }
    };

    $scope.accessForMarkAsCompleted = function(campaign) {
      if (campaign.status === "stop") {
        return true;
      }

      return false;
    };

    $scope.transferClass = function(phonenumber) {
      var transClass = "";
      phonenumber.actions_log.forEach(function(item) {
        if (item.call_status == "TRANSFER_ENDED") {
          return ($scope.transClass = "sent-statistics-status");
        } else if (
          item.call_status == "TRANSFER_REQUESTED" ||
          item.call_status == "TRANSFER_CONNECTED"
        ) {
          return ($scope.transClass = "dark_orange");
        }
      });
    };

    $scope.multiselectOptionsMessageStatisticsDataCallback = function() {
      var q = $q.defer();

      if ($scope.multiselectOptionsMessageStatisticsStatusData) {
        return q.resolve($scope.multiselectOptionsMessageStatisticsStatusData);
      } else {
        $interval(function() {
          if ($scope.multiselectOptionsMessageStatisticsStatusData) {
            return q.resolve(
              $scope.multiselectOptionsMessageStatisticsStatusData
            );
          }
        }, 500);
      }

      return q.promise;
    };

    $scope
      .multiselectOptionsMessageStatisticsDataCallback()
      .then(function(data) {
        $scope.checkedOptionsModel = [];
        $scope.checkedInteractionsOptionsModel = [];
        $scope.multiSelectEventsStatuses.onSelectionChanged();
        $scope.multiSelectEventsInteractions.onSelectionChanged();
      });

    $scope.multiselectMessageStatisticsStatusSettings = {
      template: "{{option.label}}",
      buttonClasses: ""
    };

    $scope.multiSelectEventsStatuses = {
      onSelectionChanged: function() {
        $scope.checkedOptions = [];
        $scope.filterData.page = 0;
        $scope.page = 1;
        $scope.checkedOptionsModel.forEach(function(option) {
          $scope.checkedOptions.push(option.id);
          if ($scope.checkedOptionsModel.length > 0) {
            $scope.checkedInteractionsOptionsModel.length = 0;
          }
        });
        $scope.filterData.actions = null;
        $scope.filterData.statuses = JSON.stringify($scope.checkedOptions);
        if (!$scope.firstLoadForStatuses) {
          $scope.filterChanged();
        }
        $scope.firstLoadForStatuses = false;
      }
    };

    $scope.multiSelectEventsInteractions = {
      onSelectionChanged: function() {
        $scope.checkedInteractionsOptions = [];
        $scope.filterData.page = 0;
        $scope.page = 1;
        $scope.checkedInteractionsOptionsModel.forEach(function(option) {
          $scope.checkedInteractionsOptions.push(option.id);
          if ($scope.checkedInteractionsOptions.length > 0) {
            $scope.checkedOptionsModel.length = 0;
          }
        });
        $scope.filterData.statuses = null;
        $scope.filterData.actions = JSON.stringify(
          $scope.checkedInteractionsOptions
        );
        if (!$scope.firstLoadForInteractions) {
          $scope.filterChanged();
        }
        $scope.firstLoadForInteractions = false;
      }
    };

    $scope.showStatusLoader = false;

    $scope.reuseCampaign = function(campaign) {
      return;
      $state.go("campaign.compose", {
        reusing_source: "both",
        campaign_id: campaign._id
      });
    };

    $scope.reuseReceipents = function(campaignId) {
      return;
      $state.go("campaign.compose", {
        reusing_source: "receipents",
        campaign_id: campaignId
      });
    };

    $scope.reuseMessage = function(campaignId) {
      return;
      $state.go("campaign.compose", {
        reusing_source: "message",
        campaign_id: campaignId
      });
    };

    $scope.changeMessageStatus = function(status, campaign) {
      id = campaign._id;
      $scope.showStatusLoader = true;
      Restangular.all("campaigns/update-campaign-status")
        .post({ status: status, campaign_id: id })
        .then(function(data) {
          if (data.resource.error.no === 0) {
            var copy = Object.assign({}, campaign);
            $scope.showStatusLoader = false;
            copy.status = status;
            $scope.currentCampaign = copy;
          }
        });
    };

    $scope.showSearch = false;
    $scope.StatsEnterPress = function(key) {
      key.which === 13 ? $scope.searchPhonenumbers() : null;
    };
    $scope.toggleSearch = function() {
      $scope.showSearch && $rootScope.importantShowSearch
        ? $scope.searchPhonenumbers()
        : ($scope.showSearch = true);
    };

    $scope.filterBy = function(field) {
      if ($scope.activeFilterField == field) {
        $scope.filterChanged();
        $scope.activeFilterField = null;
        $scope.filterData.only = null;
        $scope.filterData.except = null;
        return;
      }
      $scope.activeFilterField = field;
      $scope.currentPage = 1;
      $scope.page = 1;
      $scope.filterData.page = 0;
      if (field == "delivered") {
        $scope.filterData.only = "status";
        $scope.filterData.except = null;
      } else if (field == "not_delivered") {
        $scope.filterData.except = "status";
        $scope.filterData.only = null;
      }

      $scope.changePage(1);
    };

    $scope.resetFilters = function() {
      $scope.filterData = $stateParams;
      $scope.activeFilterInteraction = null;
      $scope.activeFilterField = null;
      $scope.filterData.except = null;
      $scope.filterData.only = null;
      $scope.filterData.actions = null;
      $scope.filterChanged();
    };

    $scope.filterInteraction = function(filterType) {
      $scope.activeFilterInteraction = filterType;
      $scope.checkedInteractionsOptions = [];
      $scope.filterData.page = 0;
      $scope.page = 1;
      $scope.multiselectOptionsMessageStatisticsInteractionsData.forEach(
        function(option) {
          if (option.id == filterType)
            $scope.checkedInteractionsOptions.push(option.id);
        }
      );
      $scope.filterData.statuses = null;
      $scope.filterData.actions = JSON.stringify(
        $scope.checkedInteractionsOptions
      );
      if (!$scope.firstLoadForInteractions) {
        $scope.filterChanged();
      }
      $scope.firstLoadForInteractions = false;
    };

    $scope.resetInteractionFilter = function(type) {
      $scope.activeFilterInteraction = null;
      $scope.checkedInteractionsOptions = [];
      $scope.filterData.actions = null;
      $scope.filterChanged();
    };

    setTimeout(function() {
      var seriesA = angular.element(".ct-series-a")[1];
      var seriesB = angular.element(".ct-series-b")[1];
      var seriesC = angular.element(".ct-series-c")[0];
      var seriesD = angular.element(".ct-series-d")[0];
      if (seriesA) {
        seriesA.addEventListener("click", function() {
          if ($scope.activeFilterInteraction == "REPLAY_REQUESTED") {
            angular.element(".ct-bars .ct-series-a").removeClass("active");
            $scope.resetInteractionFilter("REPLAY_REQUESTED");
          } else {
            angular.element(".ct-bars .ct-series-a").addClass("active");
            angular.element(".ct-bars .ct-series-b").removeClass("active");
            angular.element(".ct-bars .ct-series-c").removeClass("active");
            angular.element(".ct-bars .ct-series-d").removeClass("active");
            $scope.filterInteraction("REPLAY_REQUESTED");
          }
        });
      }
      if (seriesB) {
        seriesB.addEventListener("click", function() {
          if ($scope.activeFilterInteraction == "TRANSFER_REQUESTED") {
            angular.element(".ct-bars .ct-series-b").removeClass("active");
            $scope.resetInteractionFilter("TRANSFER_REQUESTED");
          } else {
            angular.element(".ct-bars .ct-series-b").addClass("active");
            angular.element(".ct-bars .ct-series-a").removeClass("active");
            angular.element(".ct-bars .ct-series-c").removeClass("active");
            angular.element(".ct-bars .ct-series-d").removeClass("active");
            $scope.filterInteraction("TRANSFER_REQUESTED");
          }
        });
      }
      if (seriesC) {
        seriesC.addEventListener("click", function() {
          if ($scope.activeFilterInteraction == "CALLBACK_REQUESTED") {
            angular.element(".ct-bars .ct-series-c").removeClass("active");
            $scope.resetInteractionFilter("CALLBACK_REQUESTED");
          } else {
            angular.element(".ct-bars .ct-series-c").addClass("active");
            angular.element(".ct-bars .ct-series-a").removeClass("active");
            angular.element(".ct-bars .ct-series-b").removeClass("active");
            angular.element(".ct-bars .ct-series-d").removeClass("active");
            $scope.filterInteraction("CALLBACK_REQUESTED");
          }
        });
      }
      if (seriesD) {
        seriesD.addEventListener("click", function() {
          if ($scope.activeFilterInteraction == "DONOTCALL_REQUESTED") {
            angular.element(".ct-bars .ct-series-d").removeClass("active");
            $scope.resetInteractionFilter("DONOTCALL_REQUESTED");
          } else {
            angular.element(".ct-bars .ct-series-d").addClass("active");
            angular.element(".ct-bars .ct-series-a").removeClass("active");
            angular.element(".ct-bars .ct-series-b").removeClass("active");
            angular.element(".ct-bars .ct-series-c").removeClass("active");
            $scope.filterInteraction("DONOTCALL_REQUESTED");
          }
        });
      }
    }, 1000);

    $scope.filterOrReset = function(type) {
      switch (type) {
        case "REPLAY_REQUESTED":
          if ($scope.activeFilterInteraction == "REPLAY_REQUESTED") {
            angular.element(".ct-bars .ct-series-a").removeClass("active");
            $scope.resetInteractionFilter("REPLAY_REQUESTED");
          } else {
            angular.element(".ct-bars .ct-series-a").addClass("active");
            angular.element(".ct-bars .ct-series-b").removeClass("active");
            angular.element(".ct-bars .ct-series-c").removeClass("active");
            angular.element(".ct-bars .ct-series-d").removeClass("active");
            $scope.filterInteraction("REPLAY_REQUESTED");
          }
          break;
        case "TRANSFER_REQUESTED":
          if ($scope.activeFilterInteraction == "TRANSFER_REQUESTED") {
            angular.element(".ct-bars .ct-series-b").removeClass("active");
            $scope.resetInteractionFilter("TRANSFER_REQUESTED");
          } else {
            angular.element(".ct-bars .ct-series-b").addClass("active");
            angular.element(".ct-bars .ct-series-a").removeClass("active");
            angular.element(".ct-bars .ct-series-c").removeClass("active");
            angular.element(".ct-bars .ct-series-d").removeClass("active");
            $scope.filterInteraction("TRANSFER_REQUESTED");
          }
          break;
        case "CALLBACK_REQUESTED":
          if ($scope.activeFilterInteraction == "CALLBACK_REQUESTED") {
            angular.element(".ct-bars .ct-series-c").removeClass("active");
            $scope.resetInteractionFilter("CALLBACK_REQUESTED");
          } else {
            angular.element(".ct-bars .ct-series-c").addClass("active");
            angular.element(".ct-bars .ct-series-a").removeClass("active");
            angular.element(".ct-bars .ct-series-b").removeClass("active");
            angular.element(".ct-bars .ct-series-d").removeClass("active");
            $scope.filterInteraction("CALLBACK_REQUESTED");
          }
          break;
        case "DONOTCALL_REQUESTED":
          if ($scope.activeFilterInteraction == "DONOTCALL_REQUESTED") {
            angular.element(".ct-bars .ct-series-d").removeClass("active");
            $scope.resetInteractionFilter("DONOTCALL_REQUESTED");
          } else {
            angular.element(".ct-bars .ct-series-d").addClass("active");
            angular.element(".ct-bars .ct-series-a").removeClass("active");
            angular.element(".ct-bars .ct-series-b").removeClass("active");
            angular.element(".ct-bars .ct-series-c").removeClass("active");
            $scope.filterInteraction("DONOTCALL_REQUESTED");
          }
          break;
      }
    };
    
    $scope.OpenMarUnmarkModal = function(phonenumber) {
      CallBournModal.open(
        {
          scope: {
            markData: { comment: "" },
            phonenumber: phonenumber,
            comments: JSON.parse(phonenumber.comment) || []
          },
          templateUrl: "/app/modals/campaign-statistics/mark-unmark.html"
        },
        function(scope) {

          scope.close = function() {
            CallBournModal.close();
          };
          scope.save = function(comment) {
            scope.comments.push(comment);
            var postData = {
              comments: scope.comments,
              phonenumberId: scope.phonenumber._id
            }
            scope.phonenumber.marked = !scope.phonenumber.marked;
            Restangular.all('phonenumbers/add-comment')
            .post(postData)
            .then(function(data) {
              scope.markData.comment = '';
              scope.comments = data.resource.comment;
              scope.phonenumber.comment = scope.comments;
              $scope.filterChanged();
              scope.close();
            })
          };
        }
      );
    };

    $scope.MarkOrUnmarkPhonenumber = function(id) {

    }

    $scope.showGroupNames = function(groups) {
      var dataToShow = "";
      groups.forEach(function(item) {
        dataToShow += item.name + "<br>";
      });
      return $sce.trustAsHtml(dataToShow);
    };

    $scope.clockHover = function(data, pastDate) {
      var dateData = [];
      var dataToShow = "";
      data.forEach(function(item) {
        // var weekDay = moment(item.scheduled_date)
        //   .tz($rootScope.currentUser.timezone)
        //   .format('dddd');
        var date = moment(item.scheduled_date)
          .tz($rootScope.currentUser.timezone)
          .format("MMMM Do YYYY, HH:mm");
        if (
          !moment()
            .tz($rootScope.currentUser.timezone)
            .isBefore(date)
        ) {
          var past = true;
        }
        dateData.push({ date: date, recipients: item.recipients, past: past });
      });
      dateData.forEach(function(data, index) {
        if ((pastDate && data.past) || (!pastDate && !data.past)) {
          dataToShow +=
            data.date +
            " - " +
            data.recipients +
            " " +
            $rootScope.trans("compose_step_3_text_recipients") +
            ";" +
            "<br>";
        }
      });
      return $sce.trustAsHtml(dataToShow);
    };

    $scope.clockHoverPast = function(data) {
      var dateData = [];
      var dataToShow = "";
      data.forEach(function(item) {
        // var weekDay = moment(item.scheduled_date)
        //   .tz($rootScope.currentUser.timezone)
        //   .format('dddd');
        var date = moment(item.scheduled_date)
          .tz($rootScope.currentUser.timezone)
          .format("MMMM Do YYYY, HH:mm");
        if (
          !moment()
            .tz($rootScope.currentUser.timezone)
            .isBefore(date)
        ) {
          var past = true;
        }
        dateData.push({ date: date, recipients: item.recipients, past: past });
      });
      dateData.forEach(function(data, index) {
        if (data.past) {
          dataToShow +=
            data.date +
            " - " +
            data.recipients +
            " " +
            $rootScope.trans("compose_step_3_text_recipients") +
            ";" +
            "<br>";
        }
      });
      return $sce.trustAsHtml(dataToShow);
    };

    $scope.getDeliveredHour = function(data) {
      if (data) {
        var hour = moment(data).format("HH:mm:ss");
        return hour;
      }
    };
    $scope.getDeliveredDate = function(data) {
      if (data) {
        var date = moment(data).format("YYYY-MM-DD");
        return date;
      }
    };

    $scope.getUpdatedAt = function(date, type) {
      var serverTimezoneDate = moment.tz(
        date,
        "YYYY-MM-DD HH:mm:ss",
        window.SERVER_TIMEZONE
      );
      if (type === "updated") {
        return moment(serverTimezoneDate).fromNow();
      }
      var updatedAt = serverTimezoneDate
        .clone()
        .tz($rootScope.currentUser.timezone)
        .format("YYYY-MM-DD HH:mm:ss");

      return $filter("localDate")(updatedAt);
    };

    $scope.getSuccessSmsVoiceOfCampaign = function(campaign) {
      $scope.smsCount = campaign.total_phonenumbers[0].count && (
        (campaign.is_archived && (campaign.archived_sms_count[0] && campaign.archived_sms_count[0].count) || 0) ||
        (!campaign.is_archived && (campaign.sms_count[0] && campaign.sms_count[0].count) || 0)
      ) || 0;
      $scope.voiceCount = campaign.total_phonenumbers[0].count && (
        (campaign.is_archived && (campaign.success_phonenumbers[0] && (campaign.success_phonenumbers[0].count) - ((campaign.archived_sms_count[0] && campaign.archived_sms_count[0].count) || 0)) || 0) ||
        (!campaign.is_archived && (campaign.success_phonenumbers[0] && (campaign.success_phonenumbers[0].count) - ((campaign.sms_count[0] && campaign.sms_count[0].count) || 0)) || 0)
      )

      return (
        $scope.voiceCount +
        " " +
        $rootScope.trans("dashboard_welcome_voice_messages") +
        " & " +
        $scope.smsCount +
        " SMS"
      );
    };

    $scope.calcSmsText = function(sms_text) {
      var txt = sms_text.length;
      var num = 0;
      if (txt >= 0 && txt <= 160) {
        num = 1;
        return (
          " " +
          $rootScope.trans("compose_step_1_method_1_characters_count") +
          ": " +
          txt +
          " - " +
          num +
          " SMS"
        );
      } else if (txt >= 161 && txt <= 320) {
        num = 2;
        return (
          " " +
          $rootScope.trans("compose_step_1_method_1_characters_count") +
          ": " +
          txt +
          " - " +
          num +
          " SMS"
        );
      } else if (txt >= 321 && txt <= 480) {
        num = 3;
        return (
          " " +
          $rootScope.trans("compose_step_1_method_1_characters_count") +
          ": " +
          txt +
          " - " +
          num +
          " SMS"
        );
      } else if (txt >= 481 && txt <= 640) {
        num = 4;
        return (
          " " +
          $rootScope.trans("compose_step_1_method_1_characters_count") +
          ": " +
          txt +
          " - " +
          num +
          " SMS"
        );
      } else if (txt >= 641 && txt <= 800) {
        num = 5;
        return (
          " " +
          $rootScope.trans("compose_step_1_method_1_characters_count") +
          ": " +
          txt +
          " - " +
          num +
          " SMS"
        );
      } else if (txt >= 801 && txt <= 960) {
        num = 6;
        return (
          " " +
          $rootScope.trans("compose_step_1_method_1_characters_count") +
          ": " +
          txt +
          " - " +
          num +
          " SMS"
        );
      } else {
        return;
      }
    };
    $scope.calcSmsTextSmsCount = function(sms_text) {
      var txt = sms_text.length;
      var num = 0;
      if (txt >= 0 && txt <= 160) {
        num = 1;
        return "X" + num;
      } else if (txt >= 161 && txt <= 320) {
        num = 2;
        return "X" + num;
      } else if (txt >= 321 && txt <= 480) {
        num = 3;
        return "X" + num;
      } else if (txt >= 481 && txt <= 640) {
        num = 4;
        return "X" + num;
      } else if (txt >= 641 && txt <= 800) {
        num = 5;
        return "X" + num;
      } else if (txt >= 801 && txt <= 960) {
        num = 6;
        return "X" + num;
      } else {
        return;
      }
    };
  }
]);
