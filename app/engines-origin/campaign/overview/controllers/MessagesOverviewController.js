angular.module("callburnApp").controller("MessagesOverviewController", [
  "$scope",
  "$rootScope",
  "$state",
  "$filter",
  "Restangular",
  "$stateParams",
  "campaigns",
  "$timeout",
  "FileUploader",
  "$sce",
  "$interval",
  "$httpParamSerializer",
  "$q",
  "growl",
  "CallBournModal",
  function(
    $scope,
    $rootScope,
    $state,
    $filter,
    Restangular,
    $stateParams,
    campaigns,
    $timeout,
    FileUploader,
    $sce,
    $interval,
    $httpParamSerializer,
    $q,
    growl,
    CallBournModal
  ) {
    $rootScope.currentActiveUrl = "campaign.overview";
    $rootScope.tutorialSidePopup = true;
    $rootScope.showTutorial = $stateParams.showTutorial ? true : false;
    $scope.goToNotification = $rootScope.goToNotification;
    $rootScope.currentPage = "dashboard";
    $rootScope.currentActiveRoute = "campaign";
    $scope.currentOrder = "DESC";
    $scope.showArrowByField = "updated_at";
    $scope.filterData = {
      checkbox: {},
      order: "DESC",
      order_field: "updated_at"
    };
    $scope.selectedCampaign = null;
    $scope.orderField = null;
    // $scope.tableSpinnerLoading = true;
    $scope.retryUndeliverSpinner = false;
    // $scope.serverTimezone = campaigns.resource.server_timezone;
    $scope.exportCampaignLoader = false;
    $scope.campaigns = [];
    $scope.campaignsData = [];
    $scope.prevPage = 1;
    $scope.campaignsToShow = [];

    var applyTranslations = function() {
      $scope.isLoaded = false;
      setTimeout(function() {
        $scope.isLoaded = true;
      }, 100);
      $scope.days = {
        1: {
          value: 0,
          text: "--------"
        },
        2: {
          value: 1,
          text: $rootScope.trans("campaign_overview_last_day")
        },
        3: {
          value: 7,
          text: $rootScope.trans("campaign_overview_last_week")
        },
        4: {
          value: 30,
          text: $rootScope.trans("campaign_overview_last_month")
        },
        5: {
          value: 90,
          text: $rootScope.trans("campaign_overview_last_90_days")
        }
      };

      $scope.types = {
        1: {
          value: "VOICE_MESSAGE",
          text: $rootScope.trans("dashboard_welcome_voice_messages")
        },
        2: {
          value: "SMS",
          text: "SMS"
        },
        3: {
          value: "VOICE_WITH_SMS",
          text: $rootScope.trans("voice_with_sms")
        },
        4: {
          value: "all",
          text: $rootScope.trans("all")
        }
      };

      $scope.multiselectOptionsMessagesOverviewData = [
        {
          id: "dialing_completed",
          label: $rootScope.trans(
            "campaign_overview_chackbox_dialing_completed"
          )
        },
        {
          id: "start",
          label: $rootScope.trans("campaign_overview_calling_in_progress")
        },
        {
          id: "saved",
          label: $rootScope.trans("campaign_overview_chackbox_dialing_saved")
        },
        {
          id: "scheduled",
          label: $rootScope.trans(
            "campaign_overview_chackbox_dialing_scheduled"
          )
        },
        {
          id: "schedulation_idle",
          label: $rootScope.trans(
            "campaign_overview_chackbox_schedulation_idle"
          )
        },
        {
          id: "stop",
          label: $rootScope.trans("campaign_overview_chackbox_dialing_stopped")
        }
      ];

      $scope.multiselectMessageOverviewTranslationTexts = {
        dynamicButtonTextSuffix: trans("multi_checked"),
        checkAll: trans("multi_check_all"),
        uncheckAll: trans("multi_uncheck_all"),
        selectionCount: trans("multi_checked"),
        buttonDefaultText: trans("multiselect_statistics_status")
      };
    };

    $rootScope.$watch("currentLanguage", applyTranslations);
    $rootScope.$watch("isLangLoaded", applyTranslations);

    $scope.goToStatistics = function(campaign) {
      if (campaign.grouping_type == "BATCH") {
        $state.go("campaign.statistics", {
          campaign_id: campaign._id,
          is_multiple: true
        });
      } else {
        $state.go("campaign.statistics", {
          campaign_id: campaign._id,
          is_multiple: false
        });
      }
    };

    $scope.getCurrentBatchNumber = function(campaign) {
      return 1;
    };

    $scope.showInput = [];

    $rootScope.hideOverviewArrows = true;
    var getNewCampaigns = function(data, spinner, filterType) {
      if (filterType) $scope.tableSpinnerLoading = true;
      Restangular.one("campaigns/index-campaigns")
        .get(data)
        .then(function(campaigns) {
          updateCampaigns(campaigns, filterType);
        });
    };

    $scope.isCampaignsexist = campaigns.resource.total_campaigns_count > 0;
    $scope.campaignsTotalCount = campaigns.resource.total_campaigns_count;

    var getCampaignData = function(campaigns) {
      if (campaigns && campaigns.length) {
        $scope.campaignsData = [];
        campaigns.forEach(function(campaignForGettingData) {
          if (
            campaignForGettingData.status == "start" ||
            campaignForGettingData.status == "scheduled"
          ) {
            var singleCampaignData = {
              _id: campaignForGettingData._id,
              recipients:
                campaignForGettingData.total_phonenumbers.length > 0
                  ? campaignForGettingData.total_phonenumbers[0].count
                  : 0,
              eventsCount: 0
            };
            $scope.campaignsData.push(singleCampaignData);
          }
        });
      }
      return true;
    };

    var updateCampaigns = function(data, filterType) {
      var campaigns = data.resource.campaigns;
      if (filterType) {
      $scope.campaignsToShow = [];
        campaigns.forEach(function(item) {
          $scope.campaignsToShow.push(item);
        });
      } else {
        campaigns.forEach(function(item) {
          $scope.campaignsToShow.push(item);
        });
      }
      $scope.tableSpinnerLoading = false;
      $scope.showMoreLoader = false;
      // if ($scope.prevPage != $scope.currentPage) {
      //   $scope.campaigns = [];
      //   $scope.campaigns = campaigns;
      //   setTimeout(function() {
      //     $scope.tableSpinnerLoading = false;
      //   }, 350);
      //   $scope.prevPage = $scope.currentPage;
      // }
      // if (
      //   $scope.campaigns.length === 0 ||
      //   campaigns.length !== $scope.campaigns.length
      // ) {
      //   $scope.campaigns = campaigns;
      //   setTimeout(function() {
      //     $scope.tableSpinnerLoading = false;
      //   }, 350);
      // } else if (filterType) {
      //   $scope.campaigns = campaigns;
      //   setTimeout(function() {
      //     $scope.tableSpinnerLoading = false;
      //   }, 350);
      // } else {
      //   campaigns.forEach(function(campaign) {
      //     $scope.campaigns.forEach(function(oldCampaign, i) {
      //       if (
      //         campaign._id == oldCampaign._id &&
      //         (campaign.status !== $scope.campaigns[i].status ||
      //           (campaign.calls_count.length > 0 &&
      //             $scope.campaigns[i].calls_count.length > 0 &&
      //             $scope.campaigns[i].calls_count[0].count !==
      //               campaign.calls_count[0].count) ||
      //           (campaign.calls_count.length > 0 &&
      //             $scope.campaigns[i].calls_count.length == 0))
      //       ) {
      //         $scope.campaigns[i].status = campaign.status;
      //         $scope.campaigns[i].calls_count = campaign.calls_count;
      //         $scope.campaigns[i].success_phonenumbers =
      //           campaign.success_phonenumbers;
      //         $scope.campaigns[i].total_phonenumbers =
      //           campaign.total_phonenumbers;
      //       }
      //     });
      //   });
      // }

      $scope.totalCampaigns = data.resource.campaigns_count;
      $scope.isCampaignsexist = data.resource.total_campaigns_count > 0;
      $scope.phonenumbersPerPage = 7;
      $scope.totalCampaignsCount = data.resource.total_campaigns_count;
      $scope.campaignsCount = data.resource.campaigns_count;
      $scope.tableSpinnerLoading = false;
      // getCampaignData(campaigns);
    };
    updateCampaigns(campaigns);

    $scope.filterCampaigns = function(status, filter, filterType) {
      $scope.filterData.page = 0;
      $scope.page.number = 1;
      // $rootScope.hideOverviewArrows = filter === 'dateFilter' ? true : false;
      if (status == "all") {
        var allStatus = $scope.filterData.checkbox.all;
        $scope.filterData.checkbox.dialing_completed = allStatus;
        $scope.filterData.checkbox.scheduled = allStatus;
        $scope.filterData.checkbox.saved = allStatus;
      } else {
        if (
          $scope.filterData.checkbox.dialing_completed &&
          $scope.filterData.checkbox.scheduled &&
          $scope.filterData.checkbox.saved
        ) {
          $scope.filterData.checkbox.all = true;
        } else {
          $scope.filterData.checkbox.all = false;
        }
      }
      getNewCampaigns($scope.filterData, null, true);
    };

    if ($stateParams.status) {
      $scope.filterData.checkbox[$stateParams.status] = true;
    }

    if ($stateParams.orderBy) {
      $scope.filterData.order_field = $stateParams.orderBy;
      $scope.showArrowByField = $stateParams.orderBy;
    } else {
      $scope.showArrowByField = "updated_at";
    }

    $scope.page = {};

    $scope.filterData.order = "DESC";

    $scope.changeOrder = function(field) {
      $scope.showMoreLoader = true;
      $scope.showArrowByField = field;
      $scope.page.number = 1;
      $scope.filterData.page = 0;
      if (field == $scope.filterData.order_field) {
        $scope.currentOrder = $scope.currentOrder == "ASC" ? "DESC" : "ASC";
      } else {
        $scope.currentOrder = "ASC";
      }
      $scope.orderField = field;
      $scope.filterData.order_field = field;
      $scope.filterData.order = $scope.currentOrder;

      $scope.changePage($scope.page.number, true);
    };

    // Export Modal
    $scope.openExportModal = function(campaign) {
      CallBournModal.open(
        {
          scope: {
            campaign: campaign
          },
          templateUrl: "/app/modals/campaign-export/campaign-export.html"
        },
        function(scope) {
          scope.close = function() {
            CallBournModal.close();
          };
          scope.exportHandler = function(fileFormat) {
            if (scope.campaign) {
              $scope.exportCampaign(scope.campaign, fileFormat);
              CallBournModal.close();
            } else if (snippetId && filterData) {
              CallBournModal.close();
            }
          };
        }
      );
    };

    var channel = "update-message-" + $rootScope.currentUser._id;
    $rootScope.socket.on(channel, function(res) {
      if (res.data.type === "phonenumber") {
        if ($scope.campaignsData && $scope.campaignsData.length) {
          for (var i = 0; i < $scope.campaignsData.length; i++) {
            if ($scope.campaignsData[i]._id === res.data.campaign_id) {
              getNewCampaigns($scope.filterData, true);
            }
          }
        }
      }
      if (res.data.type === "status") {
        if ($scope.campaignsData && $scope.campaignsData.length) {
          for (var i = 0; i < $scope.campaignsData.length; i++) {
            if ($scope.campaignsData[i]._id === res.data.campaign_id) {
              getNewCampaigns($scope.filterData, true);
            }
          }
        }
      }
    });

    $scope.currentPage = undefined;
    $scope.changePage = function(page, filtered) {
      // $scope.tableSpinnerLoading = true;
      $scope.filterData.page = page - 1;
      $scope.currentPage = page;
      getNewCampaigns($scope.filterData, null, filtered);
    };

    $scope.removeCampaign = function(id) {
      ConfirmDeleteModal().then(function() {
        $scope.tableSpinnerLoading = true;
        Restangular.one("campaigns/remove-campaign", id)
          .remove()
          .then(function(data) {
            $scope.tableSpinnerLoading = false;
            getNewCampaigns($scope.filterData, null, true);
            var elemPos = $scope.campaignsToShow
              .map(function(item) {
                return item.id;
              })
              .indexOf(id);
            $scope.campaignsToShow.splice(elemPos, 1);
          });
      });
    };

    $scope.changeSelectedCampaign = function(id) {
      $scope.selectedCampaign = id;
    };

    $scope.exportCampaign = function(campaign, fileFormat) {
      $scope.exportCampaignLoader = true;
      var postData = { campaign_id: campaign._id, file_format: fileFormat };
      Restangular.all("phonenumbers/export-statistics")
        .post(postData)
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

    $scope.getSchedulationTooltipHtml = function(campaign) {
      var str = "";
      for (index in campaign.schedulations) {
        str +=
          campaign.schedulations[index].scheduled_date +
          " - " +
          campaign.schedulations[index].calls_limit +
          " Receipent(s) <br>";
      }
      return str;
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

    window.playPauseRecordedAudio = function(campaignId) {
      $scope.campaignsToShow.forEach(function(campaign, i, campaigns) {
        if (campaign._id === campaignId) {
          var template = campaign.voice_file;
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
                campaigns[i].voice_file.amazon_s3_url = url;
                playPauseAudio(audioId, url);
              }
            });
          } else {
            playPauseAudio(audioId);
          }
        }
      });
    };

    var convertedAudioTooltips = {};
    $scope.getAudioTooltipHtml = function(campaign) {
      if (convertedAudioTooltips.hasOwnProperty(campaign._id)) {
        return convertedAudioTooltips[campaign._id];
      }
      if (campaign.voice_file && campaign.voice_file.type === "TTS") {
        var name = $filter("limitTo")(campaign.voice_file.tts_text, 25);
      } else if (campaign.voice_file&& campaign.voice_file.type === "UPLOADED") {
        var name = campaign.voice_file.orig_filename;
      }
      var str = '<p><span class="blue-sp">Name</span>: ' + name + "</p>";
      str =
        str +
        '<p class="blue-sp">' +
        (campaign.voice_file && campaign.voice_file.type) +
        " - " +
        $filter("audioDuration")(campaign.voice_file && campaign.voice_file.length) +
        "</p>";
      str =
        str +
        '<div class="stop-play left"> <img src="/assets/callburn/images/play.svg" class="compose_method3_icons" id="audioFilePlay' +
        (campaign.voice_file && campaign.voice_file._id) +
        '"style="cursor:pointer" onclick="playPauseRecordedAudio(' +
        campaign._id +
        ')"/><span id="audioFilePlayText' +
        (campaign.voice_file && campaign.voice_file._id) +
        '">&nbsp;&nbsp;Play</span> </div>';
      str = $sce.trustAsHtml(str);
      convertedAudioTooltips[campaign._id] = str;

      return str;
    };

    window.playAudio = function(id) {
      var audio = document.getElementById("campaignAudio");
      audio.play();
    };

    window.pauseAudio = function(id) {
      var audio = document.getElementById("campaignAudio");
      audio.pause();
    };

    $scope.getInteractionsTooltipHtml = function(campaign) {
      var replay_digit = campaign.replay_digit
        ? $rootScope.trans(
            "campaign_compose_compose_step_3_replay_voice_message"
          ) +
          " " +
          "(" +
          campaign.replay_digit +
          ")"
        : "";
      transfer_digit = campaign.transfer_digit
        ? "<div></div>" +
          $rootScope.trans("campaign_compose_compose_step_3_call_live") +
          " " +
          "(" +
          campaign.transfer_digit +
          ")"
        : "";
      callback_digit = campaign.callback_digit
        ? "<div></div>" +
          $rootScope.trans("campaign_compose_compose_step_3_call_me_back") +
          " " +
          "(" +
          campaign.callback_digit +
          ")"
        : "";
      do_not_call_digit = campaign.do_not_call_digit
        ? "<div></div>" +
          $rootScope.trans("campaign_compose_compose_step_3_blacklist_me") +
          " " +
          "(" +
          campaign.do_not_call_digit +
          ")"
        : "";

      return replay_digit + transfer_digit + callback_digit + do_not_call_digit;
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

    $scope.getCampaignRecipientsText = function(campaign) {
      if (campaign.status === "scheduled" && campaign.first_scheduled_date) {
        for (var i = 0; i < campaign.schedulations.length; i++) {
          if (!campaign.schedulations[i].is_finished) {
            var recipients = campaign.schedulations[i].recipients;
            var recipientsText = recipients
              ? recipients +
                " " +
                trans("modals_campaign_schedulation_recipient") +
                " "
              : "";

            return recipientsText;
          }
        }
      }
    };

    $scope.getCampaignStatusText = function(campaign) {
      if (
        (campaign.status === "scheduled" &&
          campaign.first_scheduled_date &&
          campaign.calls_count.length &&
          campaign.total_phonenumbers[0].count >
            campaign.calls_count[0].count) ||
        !campaign.calls_count.length
      ) {
        for (var i = 0; i < campaign.schedulations.length; i++) {
          if (!campaign.schedulations[i].is_finished) {
            var nextSchedule = moment
              .tz(
                campaign.schedulations[i].scheduled_date,
                "YYYY-MM-DD HH:mm:ss",
                window.SERVER_TIMEZONE
              )
              .add(1, "minute");

            var duration = moment().diff(nextSchedule);
            var humanize = humanizeDuration(duration, {
              units: ["d", "h", "m"],
              round: true,
              largest: 4,
              language: $rootScope.currentLanguage
            });
            return trans("next_run_in") + " " + humanize;
          }
        }
      }

      var updatedAt = moment(campaign.updated_at, "YYYY-MM-DD HH:mm:ss")
        .tz(window.SERVER_TIMEZONE)
        .format("YYYY-MM-DD HH:mm:ss");
      var createdAt = moment(campaign.created_at, "YYYY-MM-DD HH:mm:ss")
        .tz(window.SERVER_TIMEZONE)
        .format("YYYY-MM-DD HH:mm:ss");

      //SENT
      if (campaign.status === "dialing_completed") {
        return trans("completed_on") + " " + $filter("localDate")(updatedAt);
      }

      //IN PROGRESS
      if (campaign.status === "start" && !campaign.schedulation_original_data) {
        return trans("started_on") + " " + $filter("localDate")(updatedAt);
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

    $scope.getStatusClass = function(campaign) {
      if ($rootScope.currentUser.balance <= 0) {
        if (
          campaign.status !== "dialing_completed" &&
          campaign.status !== "saved"
        ) {
          return "dark_orange snippet_blinking";
        }
      }
      if (campaign.status === "stop") {
        return "dark_orange";
      } else if (campaign.status === "stopped_low_balance") {
        return "dark_orange";
      } else if (campaign.status === "saved") {
        return "saved_status schedulation-in-progress-status";
      } else if (campaign.status === "dialing_completed") {
        return "sent-statistics-status";
      } else if (campaign.status === "schedulation_idle") {
        return "schedulation-idle-status";
      } else if (campaign.status === "scheduled") {
        return "schedulate-status";
      } else if (campaign.status === "start") {
        return "save-as-draft-status snippet_blinking";
      } else if (campaign.status === "schedulation_in_progress") {
        return "save-as-draft-status snippet_blinking";
      }
    };

    $scope.hideOnDisabled = false;

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
          // if ($rootScope.currentUser.balance > 0) {
          return $rootScope.trans(
            "campaign_overview_chackbox_dialing_scheduled"
          );
        // }
        // else {
        //     $scope.hideOnDisabled = true;
        //     return $rootScope.trans('low_balance_disabled')
        // }
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

    $scope.goToEdit = function(campaign_id, action) {
      $state.go("campaign.edit", { campaign_id: campaign_id, action: action });
    };

    $scope.accessForMarkAsCompleted = function(campaign) {
      if (
        campaign.status === "stop" ||
        (campaign.status === "schedulation_idle" &&
          campaign.calls_count.length) ||
        (campaign.status === "scheduled" && campaign.calls_count.length)
      ) {
        return true;
      }
      return false;
    };

    $scope.isWaitingNextBatch = function(campaign) {
      return false;
    };

    $scope.getSuccessSmsVoiceOfCampaign = function(campaign) {
        return (
          campaign.success_phonenumbers[0].count -
          ((campaign.sms_count[0] && campaign.sms_count[0].count) || 0) +
          " " +
          $rootScope.trans("dashboard_welcome_voice_messages") +
          " & " +
          ((campaign.sms_count[0] && campaign.sms_count[0].count) || 0) +
          " SMS"
        );
    };

    $scope.getSuccessOfCampaign = function(campaign) {
      // if (campaign.status === 'schedulation_in_progress') {
      //     return 0;
      // }
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

    $scope.getCostOfCampaign = function(campaign) {
      return campaign.amount_spent;
    };

    var openReusingCampaignModal = function(campaign) {
      CallBournModal.open(
        {
          scope: {
            campaign: campaign,
            phonenumbersCount: null
          },
          templateUrl: "/app/modals/campaign-overview/reuse-campaign-modal.html"
        },
        function(scope) {
          if (scope.campaign.total_phonenumbers.length) {
            scope.phonenumbersCount = 0;
            scope.campaign.total_phonenumbers.forEach(function(phonenumber) {
              scope.phonenumbersCount += phonenumber.count;
            });
          }

          scope.withSameRecipients = function() {
            $state.go("campaign.compose", {
              reusing_source: "both",
              campaign_id: campaign._id,
              hide_all_arrows: true
            });
            CallBournModal.close();
          };

          scope.withOutSameRecipients = function() {
            $state.go("campaign.compose", {
              reusing_source: "both",
              without_recipients: true,
              campaign_id: campaign._id,
              hide_all_arrows: true
            });
            CallBournModal.close();
          };

          scope.hideOverlay = function() {
            CallBournModal.close();
          };
        }
      );
    };

    $scope.reuseCampaign = function(campaign) {
      if (
        campaign.total_phonenumbers.length +
          campaign.totalRecipientsIfGroups ===
        0
      ) {
        $state.go("campaign.compose", {
          reusing_source: "both",
          without_recipients: true,
          campaign_id: campaign._id,
          hide_all_arrows: true
        });
      } else {
        openReusingCampaignModal(campaign);
      }
    };

    $scope.changeMessageStatus = function(status, campaign) {
      id = campaign._id;
      CallBournModal.open(
        {
          scope: {
            campaign: campaign
          },
          templateUrl: "/app/modals/campaign-statistics/confirm.html"
        },
        function(scope) {
          scope.close = function() {
            campaign.showStatusLoader = false;
            CallBournModal.close();
          };
          scope.acceptStopMessage = function(campaign) {
            // var status = 'stop';
            campaign.showStatusLoader = true;
            Restangular.all("campaigns/update-campaign-status")
              .post({ status: status, campaign_id: id })
              .then(function(data) {
                if (data.resource.error.no === 0) {
                  var copy = Object.assign({}, campaign);
                  campaign.showStatusLoader = false;
                  copy.status = status;
                  campaign.status = $scope.getCampaignStatus(copy);
                  getNewCampaigns($scope.filterData);
                }
                CallBournModal.close();
              });
          };
        }
      );
    };

    /*MULTISELECT STUFF*/
    $scope.multiselectOptionsMessageOverviewDataCallback = function() {
      var q = $q.defer();

      if ($scope.multiselectOptionsMessagesOverviewData) {
        return q.resolve($scope.multiselectOptionsMessagesOverviewData);
      } else {
        $interval(function() {
          if ($scope.multiselectOptionsMessagesOverviewData) {
            return q.resolve($scope.multiselectOptionsMessagesOverviewData);
          }
        }, 500);
      }

      return q.promise;
    };

    $scope.multiselectOptionsMessageOverviewDataCallback().then(function(data) {
      if ($stateParams.retainedBalance) {
        $scope.checkedOptionsModel = [
          $scope.multiselectOptionsMessagesOverviewData[1],
          $scope.multiselectOptionsMessagesOverviewData[3],
          $scope.multiselectOptionsMessagesOverviewData[4]
        ];
      } else {
        $scope.checkedOptionsModel = [];
      }
      $scope.multiSelectEvents.onSelectionChanged();
    });

    $scope.multiselectMessageOverviewSettings = {
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
        $scope.filterData.page = 0;
        $scope.page.number = 1;
        if (!$scope.firstLoadForStatuses) {
          getNewCampaigns($scope.filterData, null, true);
        }
        $scope.firstLoadForStatuses = false;
      }
    };

    $scope.allowDelete = function(campaign) {
      if (campaign.calls_count.length && campaign.status === "scheduled") {
        return false;
      }
      return campaign.status == "saved" || campaign.status === "scheduled";
    };

    $scope.allowDeleteIfNotInProgress = function(campaign) {
      if (
        campaign.status == "start" ||
        campaign.status == "schedulation_in_progress"
      ) {
        return false;
      }
      return true;
    };

    $scope.retryUndelivered = function(campaign) {
      $scope.retryUndeliverSpinner = true;
      var voice_file_id = campaign.voice_file ? campaign.voice_file._id : null;
      Restangular.one("campaigns/retry-undelivered/" + campaign._id)
        .get()
        .then(function(data) {
          var neverCalled = data.resource.neverCalled;
          var undelivered = data.resource.undelivered;
          var undeliveredAndNeverCalled =
            data.resource.undeliveredAndNeverCalled;
          if (!neverCalled && undelivered) {
            Restangular.all("campaigns/create-group-for-undelivered")
              .post({ condition: "undelivered", message_id: campaign._id })
              .then(function(data) {
                var groupObject = {};
                groupObject[data.resource.group_id] = true;
                $scope.retryUndeliverSpinner = false;
                $state.go("campaign.compose", {
                  reusing_source: "both",
                  campaign_id: campaign._id,
                  file_id: voice_file_id,
                  group_ids: groupObject,
                  hide_all_arrows: true
                });
              });
          } else if (!undelivered && neverCalled) {
            Restangular.all("campaigns/create-group-for-undelivered")
              .post({ condition: "neverCalled", message_id: campaign._id })
              .then(function(data) {
                var groupObject = {};
                groupObject[data.resource.group_id] = true;
                $scope.retryUndeliverSpinner = false;
                $state.go("campaign.compose", {
                  reusing_source: "both",
                  campaign_id: campaign._id,
                  file_id: voice_file_id,
                  group_ids: groupObject,
                  hide_all_arrows: true
                });
              });
          } else if (
            (neverCalled && undelivered) ||
            (!neverCalled && !undelivered)
          ) {
            $scope.retryUndeliverSpinner = false;
            CallBournModal.open(
              {
                scope: {
                  neverCalled: data.resource.neverCalled,
                  undelivered: data.resource.undelivered,
                  undeliveredAndNeverCalled:
                    data.resource.undeliveredAndNeverCalled
                },
                templateUrl: "app/modals/camping-batch/retry-undelivered.html"
              },
              function(scope) {
                scope.makeRetryDisable = false;
                scope.send = function(part) {
                  scope.makeRetryDisable = true;
                  scope.undeliverSpinner = false;
                  scope.neverCalledSpinner = false;
                  switch (part) {
                    case "undelivered":
                      scope.undeliverSpinner = true;
                      break;
                    case "neverCalled":
                      scope.neverCalledSpinner = true;
                      break;
                    case "undeliveredAndNeverCalled":
                      scope.undeliveredAndNeverCalledSpinner = true;
                      break;
                    default:
                      break;
                  }
                  Restangular.all("campaigns/create-group-for-undelivered")
                    .post({ condition: part, message_id: campaign._id })
                    .then(function(data) {
                      CallBournModal.close();
                      var groupObject = {};
                      groupObject[data.resource.group_id] = true;
                      $state.go("campaign.compose", {
                        reusing_source: "both",
                        campaign_id: campaign._id,
                        file_id: voice_file_id,
                        group_ids: groupObject,
                        hide_all_arrows: true
                      });
                    });
                };
                scope.close = function() {
                  CallBournModal.close();
                };
              }
            );
          } else {
            $scope.retryUndeliverSpinner = false;
          }
        });
    };

    $scope.showSearch = false;
    $scope.OverEnterPress = function(key) {
      key.which === 13 ? $scope.filterCampaigns() : null;
    };
    $scope.toggleSearch = function() {
      $scope.showSearch && $rootScope.importantShowSearch
        ? $scope.filterCampaigns()
        : ($scope.showSearch = true);
    };

    $scope.uiSref = function(campaign) {
      if (campaign.is_first_run && campaign.status !== "saved") return;
      if (campaign.status === "saved") {
        $state.go("campaign.edit", { campaign_id: campaign._id });
      } else {
        $state.go("campaign.statistics", { campaign_id: campaign._id });
      }
    };

    $scope.uiSrefToSchedule = function(campaign, action) {
      $state.go("campaign.edit", {
        campaign_id: campaign._id,
        action: action,
        openModal: true
      });
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

    $scope.calculateInteractionCost = function(
      count,
      interactionsCost,
      campaignCost
    ) {
      if (count && (interactionsCost || campaignCost)) {
        interactionsCost = interactionsCost ? interactionsCost : 0;
        campaignCost = campaignCost ? campaignCost : 0;
        return (
          Math.round(((interactionsCost + campaignCost) / count) * 100) / 100
        );
      }
      return "";
    };

    $scope.resetWindowVars = function() {
      window.goToCompose = false;
      window.goToApi = false;
      $rootScope.hideFormQuestions = false;
    };
    $scope.resetWindowVars();

    $scope.showGroupNames = function(groups) {
      var dataToShow = "";
      groups.forEach(function(item) {
        dataToShow += item.name + "<br>";
      });
      return $sce.trustAsHtml(dataToShow);
    };

    $scope.tableInit = function() {
      var elem = angular.element("#overviewTable")[0];
      elem.addEventListener("scroll", function(event) {
        if (Math.floor(elem.scrollTop) + elem.clientHeight === elem.scrollHeight) {
          if (
            $scope.campaignsToShow.length == $scope.campaignsCount ||
            $scope.campaignsToShow.length > $scope.campaignsCount ||
            $scope.showMoreLoader ||
            $scope.tableSpinnerLoading
          ) {
            return true;
          }
          if ($scope.campaignsTotalCount > $scope.phonenumbersPerPage) {
            $scope.showMoreLoader = true;
            $scope.page.number++;
            $scope.changePage($scope.page.number);
          }
        }
      });
    };

    $scope.scrollDownTable = function() {
      var elem = angular.element("#overviewTable")[0];
      angular.element("#overviewTable").animate(
        {
          scrollTop: elem.scrollHeight
        },
        800,
        function() {}
      );
    };
    $scope.calcSmsTextSmsCount = function(sms_text) {
      if (sms_text) {
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
      }
    };
    $scope.calcSmsText = function(sms_text) {
      if (sms_text) {
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
      }
    };
  }
]);
