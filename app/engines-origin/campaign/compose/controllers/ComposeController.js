angular.module("callburnApp").controller("ComposeController", [
  "$scope",
  "$rootScope",
  "$state",
  "Restangular",
  "$stateParams",
  "ttsLanguages",
  "notify",
  "$sce",
  "$timeout",
  "audioFiles",
  "smsFiles",
  "editingCampaign",
  "reusingCampaign",
  "CampaignComposeService",
  "CallBournScrollTop",
  "$location",
  function(
    $scope,
    $rootScope,
    $state,
    Restangular,
    $stateParams,
    ttsLanguages,
    notify,
    $sce,
    $timeout,
    audioFiles,
    smsFiles,
    editingCampaign,
    reusingCampaign,
    CampaignComposeService,
    CallBournScrollTop,
    $location
  ) {
    $rootScope.fileIdErr = false;
    $rootScope.smsTextErr = false;
    $rootScope.recipientsErr = false;
    $rootScope.hideAllArrows = false;
    // ***** Scrollable form
    $rootScope.$watch("currentLanguage", function() {
      $scope.formUrl =
        "/assets/scrollableForm" + $rootScope.currentLanguage + ".html";
    });
    var windowVar = setInterval(function() {
      if (window.goToCompose) {
        window.goToCompose = false;
        // window.parent.$crisp.push([
        //   "do",
        //   "message:show",
        //   ["text", "Roberto put your data here"]
        // ]);
        // window.parent.$crisp.push([
        //   "do",
        //   "message:send",
        //   ["text", window.formData]
        // ]);
        $state.go("campaign.compose", { hideScrollableForm: true });
        clearInterval(windowVar);
      }
    }, 400);
    var windowApi = setInterval(function() {
      if (window.goToApi) {
        window.goToApi = false;
        $state.go("api.settings");
        // window.$crisp.push([
        //   "do",
        //   "message:show",
        //   ["text", "Roberto put your data here"]
        // ]);
        // window.$crisp.push(["do", "message:send", ["text", window.formData]]);
        clearInterval(windowApi);
      }
    }, 400);
    var windowForm = setInterval(function() {
      if (window.formFinish) {
        window.formFinish = false;
        window.$crisp.push([
          "do",
          "message:show",
          ["text", "Roberto put your data here"]
        ]);
        window.$crisp.push(["do", "message:send", ["text", window.formData]]);
        clearInterval(windowForm);
      }
    }, 400);
    if (
      !$stateParams.hideScrollableForm &&
      !editingCampaign &&
      !reusingCampaign
    ) {
      $scope.showScrollableForm = true;
    }
    // *****
    if ($stateParams.hide_all_arrows === true) {
      $rootScope.hideAllArrows = true;
    }

    $scope.html = "";

    if (
      editingCampaign &&
      editingCampaign.resource.error &&
      editingCampaign.resource.error.no !== 0
    ) {
      $state.go("campaign.overview");
    }

    localStorage.removeItem("isplaybackConfirmed");
    $rootScope.tutorialSidePopup = false;

    $rootScope.arrowHelper = true;
    $rootScope.nextArrowHelper = false;
    $rootScope.step1Arrow = false;
    $rootScope.step2Arrow = false;
    $scope.hideArrowHelper = function() {
      $rootScope.arrowHelper = false;
      $rootScope.nextArrowHelper = false;
    };
    $rootScope.nextArrow = function() {
      $rootScope.nextArrowHelper = true;
      $rootScope.step1Arrow = false;
    };

    $rootScope.currentActiveRoute = "campaign";
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

    CampaignComposeService.clearComposeData();

    $scope.tabs = [{ active: false }, { active: false }, { active: false }];

    $scope.paginationMaxSize = 5;
    CampaignComposeService.canGoToStep2 = false;
    var copyOfCampaignService = {};
    angular.copy(CampaignComposeService, copyOfCampaignService);

    $scope.$on("$destroy", function() {
      angular.copy(copyOfCampaignService, CampaignComposeService);
    });
    CampaignComposeService.audioTemplates = audioFiles.resource;
    CampaignComposeService.smsTemplates = smsFiles.resource;

    $scope.CampaignComposeService = CampaignComposeService;
    $scope.CampaignComposeService.ttsLanguages =
      ttsLanguages.resource.languages;
    $scope.CampaignComposeService.audioTemplates = audioFiles.resource;
    $scope.CampaignComposeService.smsTemplates = smsFiles.resource;

    var addPhonenumbersToFinalStep = function(campaign) {
      var campaignNumbers = campaign.phonenumbers;
      for (index in campaignNumbers) {
        CampaignComposeService.campaignData.phonenumbers.push(
          campaignNumbers[index].phone_no
        );
        CampaignComposeService.step2Phonenumbers.push({
          number: campaignNumbers[index].phone_no,
          status: "success",
          tariff: campaignNumbers[index].tariff
        });
      }
      CampaignComposeService.step2PhonenumbersPagesCount = Math.ceil(
        campaignNumbers.length / 7
      );
    };

    if (reusingCampaign) {
      CampaignComposeService.reusingCampaign =
        reusingCampaign.resource.campaign;
      CampaignComposeService.isEdit = true;
      CampaignComposeService.campaignData.remaining_repeats = 0;
      CampaignComposeService.campaignData.repeat_days_interval = 7;

      $scope.getPlaybackCount = function(count) {
        return CampaignComposeService.campaignData.playback_count == count;
      };

      reusingCampaign = reusingCampaign.resource.campaign;
      if ($rootScope.currentUser.numbers[0]) {
        CampaignComposeService.campaignData = {
          caller_id: reusingCampaign.caller_id,
          get_email_notifications: true,
          phonenumbers: []
        };
      }

      var reusingSource = ($scope.reusingSource = $stateParams.reusing_source);
      if (reusingSource == "message") {
        $stateParams.tab = 3;
        CampaignComposeService.finalStepData.voiceFile =
          reusingCampaign.voice_file;
        CampaignComposeService.campaignData.voice_file =
          reusingCampaign.voice_file;
        CampaignComposeService.campaignData.campaign_voice_file_id =
          reusingCampaign.voice_file._id;
        CampaignComposeService.campaignData.campaign_name = "";
        CampaignComposeService.composeStep1 = true;
        CampaignComposeService.composeStep2 = true;
      }
      if (reusingSource == "receipents") {
        $stateParams.tab = 1;
        CampaignComposeService.finalStepData.numbersCount =
          reusingCampaign.phonenumbers.length;
        CampaignComposeService.finalStepData.maxCost =
          reusingCampaign.retained_balance +
          reusingCampaign.retained_gift_balance;
        CampaignComposeService.finalStepData.maxCostWithSms =
          reusingCampaign.max_cost_with_sms;
        CampaignComposeService.campaignData.campaign_name = "";
        CampaignComposeService.composeStep1 = true;
        addPhonenumbersToFinalStep(reusingCampaign);
      }
      if (reusingSource == "both") {
        $stateParams.tab = 3;
        CampaignComposeService.finalStepData.voiceFile =
          reusingCampaign.voice_file;
        CampaignComposeService.campaignData.voice_file =
          reusingCampaign.voice_file;
        CampaignComposeService.campaignData.campaign_name = "";
        CampaignComposeService.campaignData.selected_groups =
          reusingCampaign.groups;
        if (reusingCampaign.voice_file) {
          CampaignComposeService.campaignData.campaign_voice_file_id =
            reusingCampaign.voice_file._id;
        }

        CampaignComposeService.campaignData = {
          campaign_id: reusingCampaign._id,
          callback_digit: reusingCampaign.callback_digit,
          callback_voice_file_id: reusingCampaign.callback_digit_file_id,
          callback_file: reusingCampaign.callback_file,
          caller_id: reusingCampaign.caller_id,
          campaign_name: reusingCampaign.campaign_name,
          campaign_voice_file_id: reusingCampaign.campaign_voice_file_id,
          do_not_call_digit: reusingCampaign.do_not_call_digit,
          do_not_call_voice_file_id: reusingCampaign.do_not_call_digit_file_id,
          get_email_notifications: reusingCampaign.get_email_notifications,
          replay_digit: reusingCampaign.replay_digit,
          timezone: reusingCampaign.timezone,
          live_transfer_limit: reusingCampaign.live_transfer_limit,
          transfer_digit: reusingCampaign.transfer_digit,
          transfer_options: reusingCampaign.transfer_options,
          user_id: reusingCampaign.user_id,
          voice_file: reusingCampaign.voice_file,
          schedulations: null,
          playback_count: reusingCampaign.playback_count,
          live_answer_only: Boolean(reusingCampaign.live_answer_only),
          sending_time: reusingCampaign.delivery_speed,
          remaining_repeats: reusingCampaign.remaining_repeats,
          repeat_days_interval: reusingCampaign.repeat_days_interval,
          max_cost: reusingCampaign.retained_balance,
          maxCostWithSms: reusingCampaign.max_cost_with_sms,
          max_gift_cost: reusingCampaign.retained_gift_balance,
          phonenumbers: [],
          previews: reusingCampaign.previews,
          schedulation_original_data: null,
          uploadetAudioFile: reusingCampaign.audio_amazon_s3,
          sender_name: reusingCampaign.sender_name,
          should_shuffle: reusingCampaign.should_shuffle,
          type: reusingCampaign.type,
          sms_text: reusingCampaign.sms_text,
          same_sms_text: reusingCampaign.same_sms_text
        };

        if (reusingSource)
          CampaignComposeService.campaignData.campaign_name = "";

        CampaignComposeService.chosedInteractions = [
          reusingCampaign.replay_digit,
          reusingCampaign.transfer_digit,
          reusingCampaign.callback_digit,
          reusingCampaign.do_not_call_digit
        ];
        CampaignComposeService.replayDigit.onOff =
          reusingCampaign.replay_digit != null ? true : false;
        CampaignComposeService.transferDigit.onOff =
          reusingCampaign.transfer_digit != null ? true : false;
        CampaignComposeService.callbackDigit.onOff =
          reusingCampaign.callback_digit != null ? true : false;
        CampaignComposeService.doNotCallDigit.onOff =
          reusingCampaign.do_not_call_digit != null ? true : false;

        CampaignComposeService.finalStepData.numbersCount =
          reusingCampaign.phonenumbers.length;
        CampaignComposeService.finalStepData.maxCost =
          reusingCampaign.retained_balance +
          reusingCampaign.retained_gift_balance;
        CampaignComposeService.composeStep1 = true;
        CampaignComposeService.composeStep2 = true;
        CampaignComposeService.composeStep3 = true;
        if ($stateParams.without_recipients) {
          CampaignComposeService.campaignData.selected_groups = [];
          CampaignComposeService.campaignData.phonenumbers = [];
          CampaignComposeService.reusingCampaign.groups = [];
          CampaignComposeService.reusingCampaign.phonenumbers = [];
        } else {
          addPhonenumbersToFinalStep(reusingCampaign);
        }
      }
    } else if (editingCampaign) {
      if ($stateParams.disableArrowHelper) {
        $scope.arrowHelper = false;
        $scope.nextArrowHelper = false;
      }
      CampaignComposeService.isEdit = true;
      var editingCampaign = editingCampaign.resource.campaign;
      // if (editingCampaign.status !== 'saved') {
      // CampaignComposeService.shouldHidePhonenumbers = true;
      // }

      if (
        editingCampaign &&
        editingCampaign.groups &&
        editingCampaign.groups.length
      ) {
        CampaignComposeService.tableData = {
          resource: {
            groups: editingCampaign.groups,
            allContactsCount: editingCampaign.groups.length,
            count: editingCampaign.groups.length,
            allGroupsCount: editingCampaign.groups.length,
            lastAddedContactDate: {
              _id: 1
            },
            error: {
              no: 0,
              text: ""
            }
          }
        };
      }
      // else {
      //   $state.go('campaign.overview');
      // }

      CampaignComposeService.editingCampaign = editingCampaign;
      if (editingCampaign && editingCampaign.groups) {
        CampaignComposeService.campaignData.selected_groups = editingCampaign.groups;
      }

      CampaignComposeService.campaignData = {
        campaign_id: editingCampaign._id,
        callback_digit: editingCampaign.callback_digit,
        callback_voice_file_id: editingCampaign.callback_digit_file_id,
        callback_file: editingCampaign.callback_file,
        caller_id: editingCampaign.caller_id,
        campaign_name: editingCampaign.campaign_name,
        campaign_voice_file_id: editingCampaign.campaign_voice_file_id,
        do_not_call_digit: editingCampaign.do_not_call_digit,
        do_not_call_voice_file_id: editingCampaign.do_not_call_digit_file_id,
        get_email_notifications: editingCampaign.get_email_notifications,
        replay_digit: editingCampaign.replay_digit,
        timezone: editingCampaign.timezone,
        live_transfer_limit: editingCampaign.live_transfer_limit,
        transfer_digit: editingCampaign.transfer_digit,
        transfer_options: editingCampaign.transfer_options,
        user_id: editingCampaign.user_id,
        voice_file: editingCampaign.voice_file,
        schedulations: editingCampaign.schedulations,
        playback_count: editingCampaign.playback_count,
        live_answer_only: Boolean(editingCampaign.live_answer_only),
        sending_time: editingCampaign.delivery_speed,
        remaining_repeats: editingCampaign.remaining_repeats,
        repeat_days_interval: editingCampaign.repeat_days_interval,
        max_cost: editingCampaign.retained_balance,
        maxCostWithSms: editingCampaign.max_cost_with_sms,
        max_gift_cost: editingCampaign.retained_gift_balance,
        phonenumbers: [],
        previews: editingCampaign.previews,
        schedulation_original_data: editingCampaign.schedulation_original_data,
        uploadetAudioFile: editingCampaign.audio_amazon_s3,
        sender_name: editingCampaign.sender_name,
        should_shuffle: editingCampaign.should_shuffle,
        type: editingCampaign.type,
        sms_text: editingCampaign.sms_text,
        same_sms_text: editingCampaign.same_sms_text
      };

      window.first_advisable_caller_id =
        CampaignComposeService.campaignData.caller_id;

      if (editingCampaign.voice_file) {
        CampaignComposeService.campaignData.uploadetAudioFile = {
          _id: editingCampaign.voice_file._id
        };
      }

      CampaignComposeService.chosedInteractions = [
        editingCampaign.replay_digit,
        editingCampaign.transfer_digit,
        editingCampaign.callback_digit,
        editingCampaign.do_not_call_digit
      ];

      $scope.getPlaybackCount = function(count) {
        return CampaignComposeService.campaignData.playback_count == count;
      };

      CampaignComposeService.replayDigit.onOff =
        editingCampaign.replay_digit != null ? true : false;
      CampaignComposeService.transferDigit.onOff =
        editingCampaign.transfer_digit != null ? true : false;
      CampaignComposeService.callbackDigit.onOff =
        editingCampaign.callback_digit != null ? true : false;
      CampaignComposeService.doNotCallDigit.onOff =
        editingCampaign.do_not_call_digit != null ? true : false;

      CampaignComposeService.finalStepData = {
        voiceFile: editingCampaign.voice_file,
        numbersCount: editingCampaign.phonenumbers.length,
        maxCost:
          editingCampaign.retained_balance +
          editingCampaign.retained_gift_balance,
        maxCostWithSms: editingCampaign.max_cost_with_sms
      };

      addPhonenumbersToFinalStep(editingCampaign);
      CampaignComposeService.composeStep2 = true;
      CampaignComposeService.composeStep3 = true;
      $stateParams.tab = 3;
    } else {
      if (
        $rootScope.currentUser.numbers &&
        $rootScope.currentUser.numbers.length > 0
      ) {
        var numbersLength = $rootScope.currentUser.numbers.length;
        CampaignComposeService.campaignData = {
          caller_id:
            $rootScope.currentUser.numbers[numbersLength - 1].phone_number,
          get_email_notifications: true
        };
      }

      if ($stateParams.audioFile) {
        CampaignComposeService.composeStep2 = true;
        var audioData = {
          source: $sce.trustAsResourceUrl($stateParams.audioFile.amazon_s3_url),
          file: $stateParams.audioFile
        };
        CampaignComposeService.finalStepData.voiceFile = $stateParams.audioFile;
        CampaignComposeService.campaignData.campaign_voice_file_id =
          $stateParams.audioFile._id;
      }
      CampaignComposeService.campaignData.remaining_repeats = 0;
      CampaignComposeService.campaignData.repeat_days_interval = 7;
    }

    if ($stateParams.tab != undefined) {
      if (
        CampaignComposeService.campaignData.voice_file &&
        !CampaignComposeService.campaignData.voice_file.is_template
      ) {
        $scope.audioActiveTab = 1;
      } else {
        $scope.audioActiveTab = $stateParams.tab - 1;
      }
    }

    if ($stateParams.file_id) {
      CampaignComposeService.audioTemplates.files.forEach(function(file) {
        if ($stateParams.file_id === file._id) {
          CampaignComposeService.campaignData.uploadetAudioFile = {
            _id: $stateParams.file_id
          };
          CampaignComposeService.campaignData.campaign_voice_file_id =
            $stateParams.file_id;
        }
      });
    }

    // CampaignComposeService.audioTemplates.files.forEach(function (file) {
    //          	$rootScope.getAmazonUrlOfAudio(file._id).then(function(url){
    //          		file.auido_url = url;
    //          	})
    //          })

    $scope.trustSrc = function(src) {
      return $sce.trustAsResourceUrl(src);
    };
    var playPauseAudio = function(audioTemplate) {
      // audioTemplate.isRecordedFilePlaying = false;
      var audio = document.getElementById(
        "composeTemplateFile" + audioTemplate._id
      );

      audio.setAttribute("src", audioTemplate.amazon_s3_url);
      if (audioTemplate.isRecordedFilePlaying) {
        console.log("Paused");
        audio.pause();
        audio.currentTime = 0;
        audioTemplate.playButtonClass = "fa-play-circle";
      } else {
        audio.play();

        startedPlying("composeTemplateFile" + audioTemplate._id).then(
          function() {
            console.log("Playing");
            audioTemplate.playButtonClass = "black black fa-stop-circle";
            audioTemplate.showAudioSpinner = false;
          }
        );

        audio.addEventListener(
          "ended",
          function() {
            console.log("Ended");
            audioTemplate.isRecordedFilePlaying = false;
            audioTemplate.playButtonClass = "fa-play-circle";
            // if (!$scope.$$phase) $scope.$apply();
          },
          false
        );
      }

      audioTemplate.isRecordedFilePlaying = !audioTemplate.isRecordedFilePlaying;
    };
    $scope.playAudio = function() {
      var a = document.getElementById("aaa");
      a.muted = true;
      a.play();
    };
    $scope.playPauseRecordedAudio = function(audioTemplate) {
      if (!audioTemplate.amazon_s3_url) {
        audioTemplate.showAudioSpinner = true;
        $rootScope.getAmazonUrlOfAudio(audioTemplate._id).then(function(url) {
          audioTemplate.amazon_s3_url = url;
          playPauseAudio(audioTemplate);
        });
      } else {
        audioTemplate.showAudioSpinner = false;
        playPauseAudio(audioTemplate);
      }
    };

    $scope.checkSelectedItem = function() {
      if (
        CampaignComposeService.campaignData &&
        CampaignComposeService.campaignData.campaign_voice_file_id &&
        CampaignComposeService.audioTemplates &&
        CampaignComposeService.audioTemplates.files.length
      ) {
        CampaignComposeService.audioTemplates.files.forEach(function(item) {
          if (
            item._id ===
            CampaignComposeService.campaignData.campaign_voice_file_id
          ) {
            var index = CampaignComposeService.audioTemplates.files.indexOf(
              item
            );
            var new_item = item;
            CampaignComposeService.audioTemplates.files.splice(index, 1);
            CampaignComposeService.audioTemplates.files.unshift(new_item);
          }
        });
      }
    };

    if (CampaignComposeService.editingCampaign) {
      $scope.checkSelectedItem();
    }
  }
]);
