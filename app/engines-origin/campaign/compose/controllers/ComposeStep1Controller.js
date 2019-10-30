angular.module("callburnApp").controller("ComposeStep1Controller", [
  "$scope",
  "$rootScope",
  "Restangular",
  "notify",
  "FileUploader",
  "$sce",
  "$timeout",
  "CampaignComposeService",
  "growl",
  "$stateParams",
  function(
    $scope,
    $rootScope,
    Restangular,
    notify,
    FileUploader,
    $sce,
    $timeout,
    CampaignComposeService,
    growl
  ) {
    "use strict";

    $rootScope.tutorialSidePopup = false;

    var sortTtsLanguages = function(languages) {
      var currentLanguages = [];
      var anotherLanguages = [];
      languages.forEach(function(item) {
        if (item.languageCode === $rootScope.currentLanguage) {
          currentLanguages.push(item);
        } else {
          anotherLanguages.push(item);
        }
      });

      return currentLanguages.concat(anotherLanguages);
    };

    $scope.selectedTab = function() {
      // $scope.editing = false;
      // $scope.editingTemplate = '';
      // CampaignComposeService.campaignData.campaign_voice_file_id = null;
      clearInterval($scope.navInterval);
    };
    $scope.selectTabFromText = function() {
      $scope.navInterval = setInterval(function() {
        angular.element(".uib-tab > .nav-link")[0].click();
      }, 10);
    };

    $scope.editAudioTemplate = function(audio) {
      $scope.audioFiles.push(audio);
      $scope.lastFileIsUploaded = true;
      $scope.selectTabFromText();
      $scope.slsectAudio(audio);
    };
    $scope.CampaignComposeService = CampaignComposeService;

    if (CampaignComposeService.campaignData.same_sms_text == undefined) {
      CampaignComposeService.campaignData.same_sms_text = true;
    }

    CampaignComposeService.ttsLanguages = sortTtsLanguages(
      CampaignComposeService.ttsLanguages
    );
    CampaignComposeService.ttsLanguages.forEach(function(item) {
      item.selectView = item.languageName + "-" + item.ttsEngine;
    });
    $rootScope.$watch("currentLanguage", function(newVal) {
      Restangular.one("data/tts-languages")
        .get()
        .then(function(res) {
          CampaignComposeService.ttsLanguages = sortTtsLanguages(
            res.resource.languages
          );
          CampaignComposeService.ttsLanguages.forEach(function(item) {
            item.selectView = item.languageName + "-" + item.ttsEngine;
          });
        });
    });

    $scope.audioTemplates = CampaignComposeService.audioTemplates.files;
    $scope.totalTemplatesCount =
      CampaignComposeService.audioTemplates.total_templates_count;
    $scope.audioTemplatesCount = CampaignComposeService.audioTemplates.count;
    $scope.audioTemplatesPagesCount = Math.ceil(
      CampaignComposeService.audioTemplates.count / 30
    );
    $scope.smsTemplates = CampaignComposeService.smsTemplates.files;
    $scope.images = ["/assets/callburn/images/manually-or-file-icon.png"];
    $scope.ttsData = {
      language: "",
      text: ""
    };

    var applyTranslations = function() {
      $scope.isLoaded = false;
      setTimeout(function() {
        $scope.isLoaded = true;
      }, 100);
      var ttsEnginesNames = { en: "Kate", it: "Alice-ML", es: "Monica" };

      $scope.ttsEngineIndicated = ttsEnginesNames[$rootScope.currentLanguage];

      $scope.ttsData.language = $scope.ttsEngineIndicated;
    };

    $rootScope.$watch("currentLanguage", applyTranslations);
    $rootScope.$watch("isLangLoaded", applyTranslations);

    ///////////////////////////////////////////////////////////////MESSAGE TO AUDIO ////////////////////////////////////////////////////
    /*
     * Send request to server to create audio file.
     */

    $scope.lastFileIsUploaded = false;
    $scope.audioFiles = [];
    $scope.sameText = false;
    $scope.checkText = function() {
      $scope.audioFiles.some(function(item) {
        if ($scope.ttsData.text === item.tts_text) {
          return ($scope.sameText = true);
        } else {
          $scope.sameText = false;
        }
      });
    };
    $scope.createAudioFromTextForVoice = function(type) {
      $rootScope.disableButton();
      $rootScope.startModalLoader();
      $scope.checkText();
      if ($scope.sameText) {
        $rootScope.enabledButton();
        $rootScope.stopModalLoader();
        return;
      }
      $scope.ttsData.saved_from = "COMPOSE";
      Restangular.all("campaigns/create-audio-from-text")
        .post($scope.ttsData)
        .then(function(data) {
          $rootScope.enabledButton();
          $rootScope.stopModalLoader();
          if (data.resource.error.no === 0) {
            if (type !== "editing") {
              if ($scope.sameText) {
                return;
              } else if ($scope.audioFiles.length < 6 && !$scope.sameText) {
                CampaignComposeService.campaignData.campaign_voice_file_id =
                  data.resource.file._id;
                $scope.audioFiles.push(data.resource.file);
                CampaignComposeService.finalStepData.voiceFile =
                  data.resource.file;
              } else if (!$scope.sameText) {
                $scope.audioFiles.splice($scope.audioFiles.length - 1, 1);
                $scope.audioFiles.push(data.resource.file);
              }
            }
            if (type === "editing") {
              // $scope.editingTemplate = data.resource.file;
              if ($scope.ttsData.text && $scope.ttsData.language) {
                $scope.editingTemplate.amazon_s3_url =
                  data.resource.file.amazon_s3_url;
                $scope.editingTemplate.length = data.resource.file.length;
                $scope.editingTemplate.tts_text = $scope.ttsData.text;
                $scope.editingTemplate.tts_language = $scope.ttsData.language;
              }
            }
            // $scope.ttsData = {language: ''};
            $scope.lastFileIsUploaded = true;
            growl.success($rootScope.trans(data.resource.error.message));
          } else {
            growl.error($rootScope.trans(data.resource.error.text));
          }
        });
      $rootScope.blinkSaveButton = true;
    };

    ///////////////////////////////////////////////////////////////MESSAGE TO AUDIO ////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////FILE UPLOAD //////////////////////////////////////////////

    /*
     * Make uploader instance to upload audio files.
     */
    var campaignVoiceMessageUpload = ($scope.campaignVoiceMessageUpload = new FileUploader(
      {
        url: "/campaigns/upload-audio-file",
        headers: {
          JWTAuthorization: "Bearer " + localStorage.getItem("jwtToken"),
          savedFrom: "COMPOSE"
        },
        alias: "file",
        autoUpload: true
      }
    ));

    /**
     * after file upload
     * @param item
     */

    campaignVoiceMessageUpload.onAfterAddingFile = function(item) {
      $rootScope.disableButton();
      $scope.uploadingAudioName = item.file.name;
    };

    /**
     * on file upload success
     * @param item
     * @param response
     * @param status
     * @param headers
     */
    campaignVoiceMessageUpload.onSuccessItem = function(
      item,
      response,
      status,
      headers
    ) {
      $rootScope.enabledButton();
      $rootScope.stopModalLoader();
      if (response.resource.error.no == 0) {
        CampaignComposeService.finalStepData.voiceFile = response.resource.file;
        CampaignComposeService.campaignData.uploadetAudioFile =
          response.resource.file;
        CampaignComposeService.campaignData.campaign_voice_file_id =
          response.resource.file._id;

        growl.success($rootScope.trans(response.resource.error.message));
        if (!$rootScope.step2Arrow) {
          $rootScope.step2Arrow = true;
          $rootScope.arrowHelper = true;
          if ($rootScope.step1Arrow && $rootScope.step2Arrow) {
            $rootScope.nextArrowHelper = true;
            $rootScope.step1Arrow = false;
            $rootScope.arrowHelper = false;
            $rootScope.nextArrow();
          }
        }
      } else {
        growl.error($rootScope.trans(response.resource.error.text));
      }
    };

    /**
     * on file upload error
     * @param item
     * @param response
     * @param status
     * @param headers
     */
    campaignVoiceMessageUpload.onErrorItem = function(
      item,
      response,
      status,
      headers
    ) {
      $scope.errors = response;
      $rootScope.enabledButton();
      $rootScope.stopModalLoader();
    };

    /**
     * before file upload
     */
    campaignVoiceMessageUpload.onBeforeUploadItem = function() {
      $rootScope.disableButton();
      $rootScope.startModalLoader();
    };

    /////////////////////////////////////////////////////////////////FILE UPLOAD //////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////FUNCTIONS//////////////////////////////////////////////////

    /**
     * get tts demo url
     * @returns {*}
     */
    $scope.getTTSUrl = function() {
      return $sce.trustAsResourceUrl(
        "/assets/callburn/tts/" + $scope.ttsData.language + ".wav"
      );
    };

    /**
     * play tts demo audio
     */
    $scope.playTTSDemo = function() {
      document.getElementById("ttsDemoAudio").play();
    };
    /**
     * diable compose button
     * @returns {boolean}
     */
    $scope.disabelCompose = function() {
      return !!($scope.ttsData.language == "" || $scope.ttsData.text == "");
    };
    /**
     * change step
     * @param step
     */
    // $scope.changeStep = function(step) {
    //   CampaignComposeService.composeStep2 = true;
    // };
    /**
     * chnage page
     * @param page
     */
    $scope.paginateAudio = function(page) {
      if (page < 0 || page > $scope.audioTemplatesPagesCount) {
        return;
      }
      var postData = {};
      postData.page = page;
      Restangular.one("audio-files/audio-templates")
        .get(postData)
        .then(function(data) {
          $scope.totalTemplatesCount = data.resource.total_templates_count;

          $scope.audioTemplates = data.resource.files;
        });
    };

    /**
     * play tts demo audio
     */
    $scope.playTTSDemo = function() {
      var audio = document.getElementById("ttsDemoAudio");
      var audioPlayElem = angular.element("#audioFilePlay");
      if ($scope.isRecordedFilePlaying) {
        audio.pause();
        audioPlayElem.addClass("fa-play-circle");
        audioPlayElem.removeClass("fa-stop-circle");
      } else {
        audio.play();
        audio.currentTime = 0;
        audioPlayElem.removeClass("fa-stop-circle");
        audioPlayElem.addClass("fa-stop-circle");
        audio.addEventListener(
          "ended",
          function() {
            $scope.isRecordedFilePlaying = false;
            audioPlayElem.removeClass("fa-stop-circle");
            audioPlayElem.addClass("fa-play-circle");
            // if (!$scope.$$phase) $scope.$apply();
          },
          false
        );
      }
      $scope.isRecordedFilePlaying = !$scope.isRecordedFilePlaying;
    };

    /**
     * select audio by template
     * @param template
     */
    CampaignComposeService.calculateCostForPreListening();
    $scope.editing = false;
    $scope.editingTemplate = false;
    $scope.slsectAudio = function(template) {
      $scope.disableSmsText = false;
      if (!template.tts_text.length) {
        $scope.disableSmsText = true;
        CampaignComposeService.campaignData.same_sms_text = false;
      }
      $rootScope.blinkSaveButton = true;
      if ($scope.editingTemplate === template) {
        $scope.editing = false;
        $scope.editingTemplate = "";
        CampaignComposeService.campaignData.campaign_voice_file_id =
          template.null;
      } else {
        $scope.editing = true;
        $scope.editingTemplate = template;
        CampaignComposeService.campaignData.campaign_voice_file_id =
          template._id;
      }
      if (CampaignComposeService.checkIfAlreadyStarted()) {
        return;
      }
      CampaignComposeService.finalStepData.voiceFile = template;
      if (!$rootScope.step2Arrow) {
        $rootScope.step2Arrow = true;
        $rootScope.arrowHelper = true;
        // angular.element('html, body').animate({
        //     scrollTop: angular.element(document.getElementById('paginationStep1')).offset().top - 100 }, 800, function(){
        // })
        if ($rootScope.step1Arrow && $rootScope.step2Arrow) {
          $rootScope.nextArrowHelper = true;
          $rootScope.arrowHelper = false;
          $rootScope.nextArrow();
        }
      }
      if (CampaignComposeService.campaignData.same_sms_text) {
        CampaignComposeService.campaignData.sms_text = template.tts_text;
      }
      $scope.ttsData.text = template.tts_text;
      $scope.ttsData.language = template.tts_language;
    };
    /**
     * go to step
     * @param step
     */
    CampaignComposeService.goToStep = function(step) {
      // $scope.changeStep(step);
    };

    /**
     * delete audio file
     * @param file
     **/
    $scope.deleteAudio = function(file) {
      var index = $scope.audioFiles.indexOf(file);
      $scope.audioFiles.splice(index, 1);
    };

    /**
     * edit audio file
     * @param file
     **/
    $scope.editAudio = function(file) {
      $scope.createAudioFromTextForVoice("editing");

      $scope.editingTemplate.tts_text = $scope.ttsData.text;
      $scope.editingTemplate.tts_language = $scope.ttsData.language;
    };

    ////////////////////////////////////////////////////////////////FUNCTIONS//////////////////////////////////////////////////

    switch (CampaignComposeService.campaignData.type) {
      case "VOICE_MESSAGE":
        $rootScope.selectedType = "vm";
        break;
      case "VOICE_WITH_SMS":
        $rootScope.selectedType = "vmSms";
        break;
      case "SMS":
        $rootScope.selectedType = "sms";
        break;
      default:
        $rootScope.selectedType = "vm";
        CampaignComposeService.campaignData.type = "VOICE_MESSAGE";
        break;
    }
    $scope.selectType = function(type) {
      switch (type) {
        case "vm":
          Restangular.one("audio-files/audio-templates")
            .get({ saved_from: "CALL_MESSAGE" })
            .then(function(data) {
              $scope.audioTemplates = data.resource.files;
              $scope.totalTemplatesCount = data.resource.total_templates_count;
            });
          $rootScope.selectedType = "vm";
          CampaignComposeService.campaignData.type = "VOICE_MESSAGE";
          break;
        case "vmSms":
          Restangular.one("audio-files/audio-templates")
            .get({ saved_from: "NOT_SPECIFIED" })
            .then(function(data) {
              $scope.audioTemplates = data.resource.files;
              $scope.totalTemplatesCount = data.resource.total_templates_count;
            });
          $rootScope.selectedType = "vmSms";
          CampaignComposeService.campaignData.type = "VOICE_WITH_SMS";
          break;
        case "sms":
          Restangular.one("audio-files/audio-templates")
            .get({ saved_from: "SMS" })
            .then(function(data) {
              $scope.audioTemplates = data.resource.files;
              $scope.totalTemplatesCount = data.resource.total_templates_count;
            });
          $rootScope.selectedType = "sms";
          CampaignComposeService.campaignData.type = "SMS";
          break;
        default:
          $scope.selectedType = "vm";
          CampaignComposeService.campaignData.type = "VOICE_MESSAGE";
          break;
      }
    };

    // CampaignComposeService.campaignData.sms_text = null;
    // CampaignComposeService.campaignData.same_sms_text = true;
    $scope.toggleSameAs = function() {
      if (CampaignComposeService.campaignData.same_sms_text) {
        CampaignComposeService.campaignData.same_sms_text = false;
      } else {
        CampaignComposeService.campaignData.same_sms_text = true;
        
        CampaignComposeService.campaignData.sms_text = $scope.ttsData.text;
      }
    };

    $scope.calcSmsText = function() {
      var txt = CampaignComposeService.campaignData.sms_text.length;
      // if (txt) $rootScope.blinkSaveButton = true;
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

    $scope.selectSmsTemplate = function(text) {
      $scope.selectedSmsText = text;
      CampaignComposeService.campaignData.sms_text = text;
    };
  }
]);
