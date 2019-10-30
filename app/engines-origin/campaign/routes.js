module.exports = function($stateProvider, $rootScope) {
  $stateProvider
    .state("campaign", {
      url: "/campaign",
      templateUrl: "/app/engines-origin/campaign/main.html",
      controller: function($state, $rootScope) {
        if ($state.current.name == "campaign") {
          $state.go("campaign.compose");
        }
      }
    })
    .state("campaign.compose", {
      url: "/compose",
      templateUrl: "/app/engines-origin/campaign/compose/views/index.html",
      controller: "ComposeController",
      params: {
        tab: 1,
        audioFile: null,
        reusing_source: null,
        without_recipients: false,
        contact_ids: null,
        group_ids: null,
        campaign_id: null,
        phonenumbers: null,
        file_id: null,
        hide_all_arrows: false,
        hideScrollableForm: false
      },
      resolve: {
        ttsLanguages: function(Restangular) {
          return Restangular.one("data/tts-languages").get();
        },
        audioFiles: function(Restangular) {
          return Restangular.one("audio-files/audio-templates").get({
            saved_from: "CALL_MESSAGE"
          });
        },
        smsFiles: function(Restangular) {
          return Restangular.one("audio-files/audio-templates").get({
            saved_from: "SMS"
          });
        },
        editingCampaign: function() {
          return null;
        },
        reusingCampaign: function(Restangular, $stateParams) {
          return $stateParams.campaign_id
            ? Restangular.one(
                "campaigns/show-campaign",
                $stateParams.campaign_id
              ).get()
            : null;
        },
        deps: [
          "$ocLazyLoad",
          function($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: "callburnApp",
              files: [
                "/app/engines-origin/campaign/compose/services/CampaignComposeService.js",
                "/app/engines-origin/campaign/compose/services/CampingService.js",
                "/app/engines-origin/account/settings/services/SettingsService.js",
                "/app/engines-origin/campaign/compose/controllers/ComposeController.js",
                "/app/engines-origin/campaign/compose/controllers/ComposeStep1Controller.js",
                "/app/engines-origin/campaign/compose/controllers/ComposeStep2Controller.js",
                "/app/engines-origin/campaign/compose/controllers/ComposeStep3Controller.js",
                "/app/engines-origin/addressbook/contacts/services/ContactsService.js",
                "/app/engines-origin/addressbook/groups/services/GroupsService.js",
                "/app/engines-origin/addressbook/groups/controllers/GroupsController.js"
              ]
            });
          }
        ]
      }
    })
    .state("campaign.edit", {
      url: "/edit/:campaign_id",
      templateUrl: "/app/engines-origin/campaign/compose/views/index.html",
      controller: "ComposeController",
      params: {
        tab: 3,
        disableArrowHelper: true,
        action: null,
        openModal: false,
        from: ""
      },
      resolve: {
        ttsLanguages: function(Restangular) {
          return Restangular.one("data/tts-languages").get();
        },
        audioFiles: function(Restangular) {
          return Restangular.one("audio-files/audio-templates").get();
        },
        smsFiles: function(Restangular) {
          return Restangular.one("audio-files/audio-templates").get({
            saved_from: "SMS"
          });
        },
        editingCampaign: function(Restangular, $stateParams) {
          return Restangular.one(
            "campaigns/show-campaign",
            $stateParams.campaign_id
          ).get();
        },
        reusingCampaign: function() {
          return null;
        },
        deps: [
          "$ocLazyLoad",
          function($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: "callburnApp",
              files: [
                "/app/engines-origin/campaign/compose/services/CampaignComposeService.js",
                "/app/engines-origin/campaign/compose/services/CampingService.js",
                "/app/engines-origin/account/settings/services/SettingsService.js",
                "/app/engines-origin/campaign/compose/controllers/ComposeStep1Controller.js",
                "/app/engines-origin/campaign/compose/controllers/ComposeStep2Controller.js",
                "/app/engines-origin/campaign/compose/controllers/ComposeStep3Controller.js",
                "/app/engines-origin/campaign/compose/controllers/ComposeController.js",
                "/app/engines-origin/addressbook/contacts/services/ContactsService.js",
                "/app/engines-origin/addressbook/groups/services/GroupsService.js"
              ]
            });
          }
        ]
      }
    })
    .state("campaign.overview", {
      url: "/overview/:status?/:showTutorial?/:orderBy?",
      templateUrl: "/app/engines-origin/campaign/overview/views/index.html",
      controller: "MessagesOverviewController",
      params: {
        retainedBalance: false
      },
      resolve: {
        campaigns: function(Restangular, $stateParams) {
          var data = $stateParams;
          if ($stateParams.status) {
            data = {
              checkbox: JSON.stringify([
                "dialing_completed",
                "start",
                "saved",
                "scheduled",
                "stop"
              ])
            };
          } else if ($stateParams.retainedBalance) {
            $stateParams.checkbox = JSON.stringify(["scheduled"]);
            data = {
              checkbox: JSON.stringify(["scheduled", "start", "stop"])
            };
          }
          if ($stateParams.orderBy) {
            data = {
              order_field: $stateParams.orderBy
            };
          }
          return Restangular.one("campaigns/index-campaigns").get(data);
        },
        deps: [
          "$ocLazyLoad",
          function($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: "callburnApp",
              files: [
                "/app/engines-origin/campaign/overview/controllers/MessagesOverviewController.js"
              ]
            });
          }
        ]
      }
    })
    .state("campaign.statistics", {
      url: "/statistics/:campaign_id?/:action?/:status?/:is_multiple?",
      templateUrl: "/app/engines-origin/campaign/statistics/views/index.html",
      controller: "MessagesStatisticsController",
      resolve: {
        phonenumbers: function(Restangular, $stateParams) {
          $stateParams.statuses = JSON.stringify([
            "success",
            "failed",
            "sent",
            "IN_PROGRESS"
          ]);
          return Restangular.all("phonenumbers/campaign-phonenumbers").post(
            $stateParams
          );
        },
        deps: [
          "$ocLazyLoad",
          function($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: "callburnApp",
              files: [
                "/app/engines-origin/campaign/statistics/controllers/MessagesStatisticsController.js"
              ]
            });
          }
        ]
      }
    })
    .state("campaign.templates", {
      url: "/templates",
      templateUrl: "/app/engines-origin/campaign/template/views/index.html",
      controller: "TemplatesController",
      resolve: {
        audioFiles: function(Restangular, $stateParams) {
          $stateParams.checkbox = JSON.stringify(["UPLOADED", "TTS", "SMS"]);
          $stateParams.order = "DESC";
          $stateParams.order_field = "updated_at";
          return Restangular.one("audio-files/audio-templates").get(
            $stateParams
          );
        },
        ttsLanguages: function(Restangular) {
          return Restangular.one("data/tts-languages").get();
        },
        deps: [
          "$ocLazyLoad",
          function($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: "callburnApp",
              files: [
                "/app/engines-origin/campaign/template/services/TemplateService.js",
                "/app/engines-origin/campaign/template/controllers/TemplatesController.js"
              ]
            });
          }
        ]
      }
    })
    .state("campaign.addtemplate", {
      url: "/add-templates",
      templateUrl: "/app/engines-origin/campaign/add-template/views/index.html",
      controller: "AddAudioTemplateController",
      resolve: {
        ttsLanguages: function(Restangular) {
          return Restangular.one("data/tts-languages").get();
        },
        deps: [
          "$ocLazyLoad",
          function($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: "callburnApp",
              files: [
                "/app/engines-origin/campaign/add-template/controllers/AddAudioTemplateController.js"
              ]
            });
          }
        ]
      }
    });
};
