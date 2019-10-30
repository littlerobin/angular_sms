angular.module("callburnApp").controller("MainController", [
  "$scope",
  "$rootScope",
  "$state",
  "Restangular",
  "$stateParams",
  "$sce",
  "$http",
  "$timeout",
  "$interval",
  "$document",
  "$window",
  "LanguageControl",
  "CallBournModal",
  "$q",
  "filterFilter",
  "$filter",
  function(
    $scope,
    $rootScope,
    $state,
    Restangular,
    $stateParams,
    $sce,
    $http,
    $timeout,
    $interval,
    $document,
    $window,
    LanguageControl,
    CallBournModal,
    $q,
    filterFilter,
    $filter
  ) {
    window.SERVER_TIMEZONE = "Europe/Rome";
    $rootScope.currentActiveUrl = $state.current.name;
    $rootScope.showNavbar = true;
    $rootScope.apiUrl = window.apiUrl;
    $scope.scrollBar = "";
    $rootScope.currentActiveRoute = null;
    $rootScope.currentTime = "";
    $rootScope.dashboardData = {};
    $rootScope.currentUser = { numbers: [""], socialConnectionEmails: [] };
    $rootScope.otherFooterData = {};
    $rootScope.languages = {};
    $rootScope.showBlurEffect = false;
    $rootScope.requestShowLoading = false;
    $rootScope.disabledButton = false;
    $rootScope.waitLightBox = false;
    $rootScope.rootConfigs = {};
    $rootScope.rootConfigs.appUrl = window.appUrl;
    $rootScope.rootConfigs.baseUrl = window.baseUrl;
    $rootScope.tutorialSidePopup = true;

    $rootScope.previews = [];

    $rootScope.inProgressFileData = {};

    $scope.notifications = [];
    $scope.notSeenNotificationsCount = 0;

    $rootScope.isFooter1Active = false;
    $rootScope.isFooter2Active = false;
    $rootScope.isFooter3Active = false;

    $scope.notificationsDropdown = false;
    $rootScope.wizardStepCallerId = false;
    $rootScope.wizardStepTimezone = false;

    if (!$rootScope.currentUser.timezone) {
      $rootScope.wizardStepTimezone = true;
      $rootScope.currentUser.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    $scope.wizardFinish = function() {
      $rootScope.wizardStepTimezone = false;
    };

    var socketUrl =
      location.hostname == "callburn.test" ? "https://beta.callburn.com" : "";
    $rootScope.socket = io(socketUrl);
    $rootScope.socket.on("connect", function() {
      console.log($rootScope.socket.connected);
    });

    $rootScope.translate = {};

    // var primarilyMenuModal = function () {
    //     CallBournModal.open({
    //         scope: {

    //         },
    //         templateUrl: "/app/modals/main/primarily-modal.html",
    //     }, function (scope) {
    //         $rootScope.modalLg = "modal_white_space";
    //         var closePrimarilyModal = function () {
    //             CallBournModal.close();
    //             localStorage.removeItem("justLoggedIn");
    //             localStorage.setItem("justLoggedIn", 0);
    //             $rootScope.modalLg = '';
    //         }
    //         $document.on('click', function (e) {
    //             if (e.target.className === "modal is-active") {
    //                 closePrimarilyModal();
    //             }
    //             return;
    //         });

    //         scope.goToSection = function (section) {
    //             if (section === 'campaign') {
    //                 $state.go('campaign.overview')
    //             } else if (section === 'snippet') {
    //                 $state.go('snippet.overview')
    //             } else if (section === 'api') {
    //                 $state.go('api.settings')
    //             }
    //             closePrimarilyModal();
    //         }

    //         scope.goToTutorial = function(section) {
    //             var params = {showTutorial: true};
    //             if (section === 'vm') {
    //                 $state.go('campaign.overview', params);
    //             } else if (section === 'ctc') {
    //                 $state.go('snippet.overview', params);
    //             }
    //             closePrimarilyModal();
    //         }
    //     });
    // }

    // var justLoggedIn = localStorage.justLoggedIn === undefined ? 1 : localStorage.justLoggedIn;
    // if (parseInt(justLoggedIn)) {
    //     primarilyMenuModal();
    // }

    /*Refresh jwt token*/
    // window.tokenBeingUpdated = false;
    // setInterval(function () {
    //     window.tokenBeingUpdated = true;
    //     Restangular.one('auth/refresh-token').get().then(function(response){
    //             localStorage.setItem("jwtToken",response.resource.token);
    //             Restangular.setDefaultHeaders({JWTAuthorization: "Bearer " + localStorage.getItem("jwtToken")});
    //             setTimeout(function(){
    //                 window.tokenBeingUpdated = false;
    //             }, 500)
    //         });
    // },60*60*1000);

    window.showWaitLightBox = $rootScope.showWaitLightBox = function() {
      $rootScope.waitLightBox = true;
    };

    window.hideWaitLightBox = $rootScope.hideWaitLightBox = function() {
      $rootScope.waitLightBox = false;
    };

    LanguageControl.GetLanguagesList().then(function(data) {
      $rootScope.flags = [];
      $rootScope.languages = data.resource.languages;
      if (window.location.host.indexOf('beta') != -1) {
        $rootScope.languages.push({code: 'db'})
      }
      $rootScope.languages.forEach(function(language) {
        $rootScope.flags.push(
          "/assets/callburn/images/lang-flags/" + language.code + ".svg"
        );
      });
    });

    var CurrentLanguageData = LanguageControl.GetLanguage(
      "CurrentUserLanguageCode",
      $rootScope.languages
    );

    $rootScope.currentLanguage = CurrentLanguageData.code;
    $rootScope.currentLanguageName = CurrentLanguageData.name;

    moment.locale(CurrentLanguageData.code);

    $rootScope.getAmazonUrlOfAudio = function(audioId) {
      var queue = $q.defer();
      if (!audioId) {
        queue.resolve(null);
        return queue.promise;
      }

      Restangular.one("audio-files/amazon-url-of-audio/" + audioId)
        .get()
        .then(function(data) {
          queue.resolve(data.resource.amazon_s3_url);
        });

      return queue.promise;
    };

    var isPlaying = function(id) {
      var player = document.getElementById(id);
      if (player) {
        return !player.paused && !player.ended && 0 < player.currentTime;
      }
    };

    window.startedPlying = function(id) {
      var q = $q.defer();

      var interval = setInterval(function() {
        if (isPlaying(id)) {
          q.resolve();
          clearInterval(interval);
        }
      }, 100);

      return q.promise;
    };

    $scope.slickConfig = {
      draggable: true,
      autoplay: true,
      mobileFirst: true,
      pauseOnHover: true,
      autoplaySpeed: 10000,
      arrows: false,
      prevArrow: null,
      nextArrow: null,
      dots: true,
      method: {}
    };

    $scope.VMslickConfig = {
      draggable: true,
      mobileFirst: true,
      autoplay: false,
      dots: true,
      arrows: true,
      method: {},
      event: {
        init: function(event, slick) {
          var iframeSrc =
            angular.element("#vm-video-0")[0].attributes[4].value +
            "&autoplay=1";
          angular.element("#vm-video-0").attr("src", iframeSrc);
        }
      }
    };

    $scope.CTCslickConfig = {
      draggable: true,
      mobileFirst: true,
      autoplay: false,
      dots: true,
      arrows: true,
      method: {},
      event: {
        init: function(event, slick) {
          var iframeSrc =
            angular.element("#ctc-video-0")[0].attributes[4].value +
            "&autoplay=1";
          angular.element("#ctc-video-0").attr("src", iframeSrc);
        }
      }
    };

    $scope.number = [{ label: 1 }, { label: 2 }, { label: 3 }];
    $scope.numberLoaded = true;

    $scope.navCollapsed = false;
    $scope.navCollapse = function() {
      $scope.navCollapsed = !$scope.navCollapsed;
    };

    $scope.goToSettingsPage = function() {
      $state.go("account.settings", { openDropdown: true });
    };

    $scope.goToMessagesOverviewPage = function() {
      $state.go("campaign.overview", { retainedBalance: true });
    };

    angular.element(".displayNoneBody").removeClass("displayNoneBody");

    $scope.showHideSubmenuIconsGroups = false;

    $scope.$on("$stateChangeStart", function(
      event,
      toState,
      toParams,
      fromState,
      fromParams
    ) {
      if ($rootScope.blinkSaveButton) {
        // if ($rootScope.showSaveModal) {
        // $rootScope.showLoading = false;
        event.preventDefault();
        CallBournModal.open(
          {
            scope: {},
            templateUrl: "/app/modals/confirm/confirm-unsaved.html"
          },
          function(scope) {
            scope.modalCancel = function() {
              $rootScope.blinkSaveButton = false;
              CallBournModal.close();
              $state.go(toState, toParams);
            };
            scope.modalSuccess = function() {
              $rootScope.proceedToSave(
                $rootScope.editingCampaign,
                "fromConfirm"
              );
              $rootScope.blinkSaveButton = false;
              CallBournModal.close();
              $rootScope.toState = toState;
              $rootScope.toParams = toParams;
              $state.go(toState, toParams);
            };
          }
        );
      } else {
        // $rootScope.showLoading = true;
        $rootScope.showBlurEffect = true;
      }
    });

    if ($stateParams.status) {
      $scope.phonenumberMenuItem = { status: $stateParams.status };
      $scope.campaignMenuItem = { status: $stateParams.status };
    } else {
      $scope.phonenumberMenuItem = { status: "addressbook.contacts" };
      $scope.campaignMenuItem = { status: "campaign.overview" };
    }

    $scope.activePhonenumberMenu = function(status) {
      $scope.phonenumberMenuItem.status =
        status || $scope.phonenumberMenuItem.status;
    };

    $scope.activeCampaignMenu = function(status) {
      $scope.campaignMenuItem.status = status || $scope.campaignMenuItem.status;
    };

    $rootScope.startLoader = function() {
      // $rootScope.showLoading = true;
      $rootScope.showBlurEffect = true;
    };

    $rootScope.stopLoader = function() {
      $rootScope.showLoading = false;
      $rootScope.showBlurEffect = false;
    };

    $rootScope.disableButton = function() {
      $rootScope.disabledButton = true;
    };
    $rootScope.enabledButton = function() {
      $rootScope.disabledButton = false;
    };

    $rootScope.stopModalLoader = function() {
      $rootScope.showModalLoading = false;
    };
    $rootScope.startModalLoader = function() {
      $rootScope.showModalLoading = true;
    };

    $scope.showNotifications = false;
    $scope.showHideNotifications = function() {
      $scope.showNotifications = !$scope.showNotifications;
    };

    $scope.topAccountShow = false;
    $scope.topAccountShowHide = function() {
      $scope.topAccountShow = !$scope.topAccountShow;
      $scope.quickActionShow = false;
    };

    $scope.quickActionShow = false;
    $scope.quickActionShowHide = function() {
      $scope.quickActionShow = !$scope.quickActionShow;
      $scope.topAccountShow = false;
    };

    $scope.closeWindow = function() {
      $scope.quickActionShow = false;
      $scope.topAccountShow = false;
    };

    $rootScope.showFileLoader = function() {
      $scope.fileLoader = true;
    };
    $rootScope.hideFileLoader = function() {
      $scope.fileLoader = false;
    };

    $scope.$on("$stateChangeSuccess", function(
      event,
      toState,
      toParams,
      fromState,
      fromParams
    ) {
      $rootScope.showLoading = false;
      $rootScope.showBlurEffect = false;
      $rootScope.schedulationModalFlag = false;
    });

    $scope.$on("$stateChangeError", function(
      event,
      toState,
      toParams,
      fromState,
      fromParams,
      error
    ) {
      $rootScope.showLoading = false;
      $rootScope.showBlurEffect = false;
    });

    var updateTime = function() {
      Restangular.one("users/users-time")
        .get()
        .then(function(timeData) {
          // $rootScope.currentTime = timeData.resource.time;
          $rootScope.currentTime;
          $rootScope.currentFullTime = timeData.resource.time;
        });
    };
    updateTime();
    // var updateTimeInterval = $interval(updateTime, 40000);

    setInterval(function() {
      $rootScope.currentTime = moment
        .tz($rootScope.currentUser.timezone)
        .format("HH:mm");
    }, 1000);

    $rootScope.make_trusted = function(text) {
      return $sce.trustAsHtml(text);
    };

    $rootScope.openChatWindow = function() {
      $timeout(function() {
        angular.element(".nudgespot-launcher").trigger("click");
      }, 100);
    };

    $rootScope.triggerChat = function() {
      angular.element(document).ready(function() {
        $crisp.push(["do", "chat:toggle"]);
      });
    };

    $rootScope.goToNotification = function(notification) {
      if (notification.params) {
        if (notification.section === "financials") {
          $state.go("account.invoices");
        } else {
          $state.go(notification.route, JSON.parse(notification.params));
        }
      } else if (notification.route === "account.settings") {
        var notificationParametrs = {
          openCallerIdModal: true
        };
        $state.go(notification.route, notificationParametrs);
      } else {
        $state.go(notification.route);
      }
    };

    $rootScope.removeNotification = function(notification) {
      Restangular.all("notifications/remove-notification")
        .post({ notification_id: notification._id })
        .then(function(data) {
          if (data.resource.error.no == 0) {
            getUserData();
          }
        });
    };

    $scope.showDrop = false;

    function isJson(str) {
      try {
        JSON.parse(str);
      } catch (e) {
        return false;
      }
      return true;
    }

    function getTranslatedNotificationText(notification) {
      if (!notification || !notification.text_data) {
        return "";
      }

      if (!isJson(notification.text_data)) {
        return "";
      }

      var text = "";

      var notificationArray = JSON.parse(notification.text_data);

      notificationArray.forEach(function(notification) {
        var current = notification.toString().trim();

        var prefix = current.substring(0, 4);

        if (prefix === "ctn_") {
          current = current.replace("ctn_", "");
          text += $rootScope.trans(current);
        } else {
          text += current;
        }
        text += " ";
      });

      return text;
    }

    function translateNotifications(notifications) {
      for (index in notifications) {
        var notificationData = notifications[index];
        notificationData.text = getTranslatedNotificationText(
          notifications[index]
        );
        $scope.notifications.push(notificationData);
        if (!notificationData.is_seen) {
          $scope.notSeenNotificationsCount++;
        }
      }
    }

    var isFirstTime = true;
    $rootScope.carouselTexts = [];

    $scope.futureEventsLoader = false;

    $scope.haveUserData = false;
    function getUserData() {
      if ($scope.schedulations === undefined) {
        $scope.schedulations = {};
      }

      Restangular.one("users/show-user")
        .get()
        .then(function(data) {
          if (data.resource.user_data) {
            if (
              !localStorage.getItem("isAdmin")
              // window.enviroment === "live"
            ) {
              // Commented out because of wrong visualization
              //$crisp.push(["set", "user:nickname", [data.resource.user_data.email]]);
              $crisp.push([
                "set",
                "session:data",
                ["user_id", data.resource.user_data._id]
              ]);
              $crisp.push([
                "set",
                "user:email",
                [data.resource.user_data.email]
              ]);
              $crisp.push([
                "set",
                "session:data",
                ["balance", "€ " + data.resource.user_data.balance]
              ]);
              if (data.resource.user_data.vat) {
                $crisp.push([
                  "set",
                  "session:data",
                  ["vat_id", data.resource.user_data.vat]
                ]);
              }
              if (data.resource.user_data.image_name) {
                $crisp.push([
                  "set",
                  "user:avatar",
                  [data.resource.user_data.image_name]
                ]);
              }
              if (data.resource.user_data.numbers[0]) {
                $crisp.push([
                  "set",
                  "user:phone",
                  ["+" + data.resource.user_data.numbers[0].phone_number]
                ]);
              }
              if (data.resource.user_data.last_seen) {
                $crisp.push([
                  "set",
                  "session:data",
                  ["last_seen", data.resource.user_data.last_seen]
                ]);
              }
              // update the current status
              $crisp.push(["set", "session:data", ["funnel", "step2"]]);
              $crisp.push([
                "set",
                "session:data",
                ["funnel_status", "registered"]
              ]);

              // crispSetData in case of chat sent
              var crispSetData = function() {
                $crisp.push(["set", "session:data", ["has_sent_a_chat", true]]);
              };
              $crisp.push(["on", "message:sent", crispSetData]);

              // crispOnLoaded init
              var crispOnLoaded = function() {
                var crispData = $crisp.get("session:data", "has_sent_a_chat");
                crispData === null
                  ? $crisp.push([
                      "set",
                      "session:data",
                      ["has_sent_a_chat", false]
                    ])
                  : null;
              };
              $crisp.push(["on", "session:loaded", crispOnLoaded]);
            }

            if (
              !localStorage.getItem("isAdmin") &&
              // window.enviroment === "live" &&
              !$scope.haveUserData
            ) {
              CRISP_TOKEN_ID = data.resource.user_data.crisp_history_token;
              CRISP_RUNTIME_CONFIG = {
                session_merge: true
              };
              CRISP_WEBSITE_ID = "e4ef3e4c-3291-431d-bdfc-eef78a98190f";
              (function() {
                d = document;
                s = d.createElement("script");
                s.src = "//client.crisp.chat/l.js";
                s.async = 1;
                d.getElementsByTagName("head")[0].appendChild(s);
              })();
            }

            $rootScope.currentUser = data.resource.user_data;
            window.userId = $rootScope.currentUser._id;
            window.userEmail = $rootScope.currentUser.email;
            $scope.haveUserData = true;
            if (
              data.resource.user_data.numbers &&
              data.resource.user_data.numbers.length > 0
            ) {
              window.first_advisable_caller_id =
                data.resource.user_data.numbers[
                  data.resource.user_data.numbers.length - 1
                ].phone_number;
            } else {
              window.first_advisable_caller_id = null;
            }

            if (parseInt($rootScope.currentUser.can_access_beta)) {
              $rootScope.checkAccessBeta = true;
            } else {
              $rootScope.checkAccessBeta = false;
            }
            var tempSchedulations = data.resource.user_data.schedulations;

            $scope.schedulationCounter = 0;
            moment.tz.setDefault($rootScope.currentUser.timezone);
            if ($rootScope.currentUser.language) {
              $rootScope.currentLanguage = $rootScope.currentUser.language.code;
            }
            // getPlaylists($rootScope.currentLanguage);
            $scope.schedulationNotification = function() {
              $scope.schedulationCounter = 0;
              for (key in tempSchedulations) {
                var item = tempSchedulations[key];
                $scope.schedulationCounter++;

                var nextSchedule = moment
                  .tz(
                    item.scheduled_date,
                    "YYYY-MM-DD HH:mm:ss",
                    window.SERVER_TIMEZONE
                  )
                  .add(1, "minute");

                var duration = moment().diff(nextSchedule);
                var humanize = humanizeDuration(duration, {
                  units: ["d", "h", "m"],
                  round: true,
                  language: $rootScope.currentLanguage
                });
                var date = $rootScope.trans("next_run_in") + " " + humanize;

                if ($scope.schedulations.hasOwnProperty(key)) {
                  $scope.schedulations[key].eventDate = date;
                } else {
                  item.eventDate = date;
                  $scope.schedulations[key] = item;
                }
              }
            };
            if (tempSchedulations.length) {
              setInterval(function() {
                $scope.schedulationNotification();
              }, 5000);
            }

            if ($rootScope.currentUser.birthday) {
              $rootScope.localizedBirthday = $filter("localDate")(
                moment($rootScope.currentUser.birthday).format(
                  "YYYY-MM-DD HH:mm:ss"
                )
              ).split(" ")[0];
            }
            var queryString =
              "user_id=" +
              data.resource.user_data._id +
              "&api_key=" +
              data.resource.api_token;

            /******************** NOTIFICATIONS *************************/
            if (!$scope.notificationsDropdown) {
              var userNotifications = data.resource.user_data.notifications;
              $scope.notifications = [];
              $scope.seeNotifications = true;
              $scope.notSeenNotificationsCount = 0;
              translateNotifications(userNotifications);

              $scope.oneTime = true;
              $scope.$watch("notSeenNotificationsCount", function(
                newVal,
                oldVal
              ) {
                if (newVal > oldVal && $scope.oneTime) {
                  $scope.oneTime = false;
                  $scope.clearNotCounter = false;
                  var audio = new Audio("/assets/callburn/audios/alert2.mp3");
                  audio.play();
                }
              });
              $scope.moreNotifications =
                $scope.notifications.length === 10 ? true : false;

              // if (data.resource.user_data.numbers.length === 0) {
              //     var callerIdNotification = {
              //         created_at: null,
              //         text: $rootScope.trans('caller__id _is__missing_1'),
              //         route: 'account.settings',
              //         params: null,
              //         section: 'settings',
              //         is_seen: 1,
              //     }
              //     $scope.notifications.unshift(callerIdNotification);
              //     $scope.callerIdMissing = true;
              //     // $scope.notSeenNotificationsCount++;
              // }

              if (
                $scope.notSeenNotificationsCount === 0 &&
                $scope.seeNotifications &&
                $scope.notifications.length === 0
              ) {
                $scope.clearNotCounter = true;
              }

              window.document.title =
                $scope.notSeenNotificationsCount === 0
                  ? "Callburn"
                  : "(" + $scope.notSeenNotificationsCount + ") " + "Callburn";

              $scope.getHumanizedDiffTime = function(created) {
                var created = created;
                var duration = moment().diff(created);
                var humanize = humanizeDuration(duration, {
                  units: ["d", "h", "m"],
                  round: true,
                  largest: 4,
                  language: $rootScope.currentLanguage
                });
                return humanize;
              };

              if (data.resource.user_data.show_validate_now_your_phonenumber) {
                var callerIdNotification = {
                  created_at: null,
                  text: $rootScope.trans(
                    "validate_now_your_phonenumber_and_receive_a_welcome_credit"
                  ),
                  route: "account.settings",
                  params: false,
                  is_seen: false,
                  can_remove: false
                };
                $scope.notifications.unshift(callerIdNotification);
                $scope.notSeenNotificationsCount++;
              }

              if (
                data.resource.user_data.balance < 5 &&
                data.resource.user_data.invoice_transaction_count > 0
              ) {
                var lowBalanceNotification = {
                  created_at: null,
                  text: $rootScope.trans("your__balance__is_low"),
                  route: "account.financials",
                  params: false,
                  is_seen: false,
                  can_remove: false
                };
                $scope.notifications.unshift(lowBalanceNotification);
                $scope.notSeenNotificationsCount++;
              }
            }
            /******************** END NOTIFICATIONS **********************/

            $rootScope.currentUser.api_token = data.resource.api_token;
            var usersLanguage = data.resource.user_data.language
              ? data.resource.user_data.language.full_name
              : "";
            var usersLanguageCode = data.resource.user_data.language
              ? data.resource.user_data.language.code
              : "";

            if (data.resource.user_data.language) {
              $rootScope.currentLanguage =
                data.resource.user_data.language.code;
              $rootScope.currentLanguageName =
                data.resource.user_data.language.name;
              $http
                .get(
                  "/assets/translations/back_translate_" +
                    data.resource.user_data.language.code +
                    ".json"
                )
                .success(function(data) {
                  $rootScope.translate[
                    $rootScope.currentUser.language.code
                  ] = data;
                  if (isFirstTime) {
                    Restangular.one("carousel")
                      .get()
                      .then(
                        function(data) {
                          isFirstTime = false;
                          $rootScope.carouselTexts = [];
                          data.resource.carousel.forEach(function(item) {
                            var caruselText =
                              $rootScope.translate[
                                $rootScope.currentUser.language.code
                              ][item.slug];
                            if (caruselText) {
                              $rootScope.carouselTexts.push(caruselText);
                            }
                          });
                        },
                        function(error) {}
                      );
                  }
                });
            }

            if (
              !data.resource.user_data.numbers ||
              data.resource.user_data.numbers.length == 0
            ) {
              $rootScope.currentUser.numbers = [];
              $rootScope.wizardStepCallerId = true;
            }
          }

          $scope.removeDuplicates = function(arr) {
            var uniqueArray = [];
            var lookup = {};

            for (var i in arr) {
              if (arr[i]["route"] == "tickets") {
                lookup[arr[i]["text"]] = arr[i];
              } else {
                uniqueArray.push(arr[i]);
              }
            }

            for (i in lookup) {
              uniqueArray.push(lookup[i]);
            }

            return uniqueArray;
          };

          $scope.rootNotifications = $scope.notifications;
          $scope.notifications = $scope.removeDuplicates($scope.notifications);
          $scope.scrollBar =
            $scope.notifications.length > 4 ? "notificationScrollStyle" : "";

          $scope.valueCount = function(value) {
            return filterFilter($scope.rootNotifications, { text: value })
              .length;
          };
        });
    }

    $crisp = [];
    window.$crisp = $crisp;

    getUserData();
    // $rootScope.socket.on("user-data-updated", function(res) {
    //   if ($rootScope.currentUser._id == res.data.user_id) {
    //     getUserData();
    //   }
    // });

    $scope.showMoreNotifications = function() {
      var data = new Object();
      data.page = Math.floor($scope.notifications.length / 10) + 1;
      Restangular.one("notifications/notifications")
        .get(data)
        .then(function(data) {
          var newNotifications = data.resource.notifications;
          $scope.moreNotifications = data.resource.more_notifications;
          translateNotifications(newNotifications);
        });
    };

    $scope.openNotificationsDropdown = function() {
      $scope.makeNotificationsSeen();
    };

    $scope.clearNotifications = function() {
      Restangular.all("notifications/remove-notifications").post();
      $scope.notifications = [];
    };

    $scope.deleteNotification = function(id) {
      var params = { notification_id: id };
      Restangular.all("notifications/remove-notification").post(params);
      $scope.notifications = $scope.notifications.filter(function(item) {
        return item._id != id;
      });
    };

    $scope.makeNotificationsSeen = function() {
      $scope.notSeenNotificationsCount = 0;
      Restangular.all("notifications/mark-as-seen").post();
      window.document.title = "Callburn";
      $scope.clearNotCounter = true;
      $scope.seeNotifications = false;
    };

    $scope.showLanguageSelect = false;
    $scope.hideLanguage = function() {
      $scope.showLanguageSelect = false;
    };

    $scope.showHideLanguageBar = function() {
      $scope.showLanguageSelect = !$scope.showLanguageSelect;
    };

    var langRequestInProcess = false;
    window.trans = $rootScope.trans = function(str) {
      var lang = $rootScope.currentLanguage;
      window.currentLanguage = lang;
      if (!$rootScope.translate[lang]) {
        if (!langRequestInProcess) {
          langRequestInProcess = true;

          $rootScope.loadTrans(lang);
        }
      } else {
        if (lang == "db") {
          return str;
        }

        return (
          $rootScope.translate[lang][str] || $rootScope.translate["en"][str]
        );
      }
    };

    window.transQueue = $rootScope.transQueue = function(str) {
      var queue = $q.defer();

      if (trans(str)) {
        queue.resolve();
      }
      return queue.promise;
    };

    $rootScope.isLangLoaded = false;
    $rootScope.loadTrans = function(lang) {
      window.currentLanguage = lang;
      $rootScope.isLangLoaded = false;
      $http
        .get("/assets/translations/back_translate_" + lang + ".json")
        .success(function(data) {
          $rootScope.translate[lang] = data;

          langRequestInProcess = false;
          $rootScope.isLangLoaded = true;

          translateNotifications($rootScope.currentUser.notifications);
        });
    };

    $scope.youtubeVideosUploaded = false;

    // var getPlaylists = function(lang) {
    //   if (!$scope.youtubeVideosUploaded) {
    //     Restangular.one("data/youtube-playlists")
    //       .get({ lang: lang })
    //       .then(function(data) {
    //         $scope.youtubeVideosUploaded = true;
    //         $scope.CTCVideosIframe = data.resource.playlists.ctc.tutorials.concat(
    //           data.resource.playlists.ctc.promotionals
    //         );
    //         $scope.VMVideosIframe = data.resource.playlists.vm.tutorials.concat(
    //           data.resource.playlists.vm.promotionals
    //         );
    //         setTimeout(function() {
    //         });
    //       });
    //   }
    // };

    $scope.translations = {};
    $scope.translations.local = $rootScope.trans("choose_your_timezone");
    $scope.translations.primary = $rootScope.trans("choose_your_timezone");

    $scope.changeLanguage = function(lang) {
      $rootScope.languages.forEach(function(item) {
        $rootScope.flags.push(
          "/assets/callburn/images/lang-flags/" + item.code + ".svg"
        );
        if (item.code == lang) {
          Restangular.all("users/update-main-data")
            .post({ language_id: item._id })
            .then(function(data) {
              $rootScope.currentLanguage = item.code;
              $rootScope.currentLanguageName = item.name;
              window.currentLanguage = item.code;
              localStorage.removeItem("currentLanguage");
              localStorage.setItem("currentLanguage", item.code);
              $scope.youtubeVideosUploaded = false;
              // getPlaylists(item.code);
            });
        }
      });
      setTimeout($rootScope.loadTrans($rootScope.currentLanguage), 1000);
    };

    $rootScope.checkIfLogged = function(response) {
      if (response) {
        if (response.error.no == -10) {
          $state.go("login");
        } else {
          return true;
        }
      }
    };

    $rootScope.logOut = function(url) {
      if (url === undefined) {
        url = null;
      }

      Restangular.one("auth/logout")
        .get()
        .then(
          function(data) {
            localStorage.setItem("jwtToken", "");
            if (url) {
              window.location.href = url;
            } else {
              window.location.href = "/";
            }
          },
          function(response) {}
        );
    };

    $rootScope.days = [
      "00",
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
      "19",
      "20",
      "21",
      "22",
      "23",
      "24",
      "25",
      "26",
      "27",
      "28",
      "29",
      "30",
      "31"
    ];
    $rootScope.hours = [
      "00",
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
      "19",
      "20",
      "21",
      "22",
      "23"
    ];

    $rootScope.minutes = [
      "00",
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
      "19",
      "20",
      "21",
      "22",
      "23",
      "24",
      "25",
      "26",
      "27",
      "28",
      "29",
      "30",
      "31",
      "32",
      "33",
      "34",
      "35",
      "36",
      "37",
      "38",
      "39",
      "40",
      "41",
      "42",
      "43",
      "44",
      "45",
      "46",
      "47",
      "48",
      "49",
      "50",
      "51",
      "52",
      "53",
      "54",
      "55",
      "56",
      "57",
      "58",
      "59"
    ];

    $rootScope.footerDataLoaded = true;

    $rootScope.getStatusName = function(status) {
      switch (status) {
        case "1":
          return "Dialing in progress";
        case "2":
          return "live (call in progress)";
        case "3":
          return "no answer";
        case "4":
          return "busy";
        case "5":
          return "transfer";
        case "6":
          return "do not call";
        case "7":
          return "error due to channel unavailable";
        case "8":
          return "misc.";
        case "9":
          return "Machine";
        case "10":
          return "success";
        case "11":
          return "error due to congestion";
        case "12":
          return "error marked on stucked calls";
        default:
          return "Ready for be called";
      }
    };

    $scope.$watch("disabledButton", function(newVal) {
      if (newVal === true) {
        angular.element(".btn").attr("disabled", "disabled");
      } else {
        angular.element(".btn").removeAttr("disabled");
      }
    });

    $scope.hoverIn = function() {
      $scope.showBox = true;
    };

    $scope.hoverOut = function() {
      $scope.showBox = false;
    };

    $rootScope.clickedOnJobAlert = function(alert) {
      if (alert.status == "FINISHED") {
        Restangular.one("users/background-job", alert._id)
          .remove()
          .then(function() {
            $state.go("addressbook.contacts");
          });
      }
    };

    $rootScope.confirmDelete = function() {
      var q = $q.defer();
      CallBournModal.open(
        {
          scope: {},
          templateUrl: "/app/modals/confirm/confirm-delete.html"
        },
        function(scope) {
          window.checkDeleteConfirmation = false;
          scope.deleteActionSpinner = false;
          scope.disableActionButton = false;
          scope.deleteConfirmation = function() {
            q.resolve();
            scope.deleteActionSpinner = true;
            scope.disableActionButton = true;
            CallBournModal.close();
          };
        }
      );
      return q.promise;
    };

    window.ConfirmDeleteModal = $rootScope.confirmDelete;

    /*IFRAME RELATED*/

    $scope.trustURL = function(url) {
      return $sce.trustAsResourceUrl(url);
    };

    $scope.getTutorialVideos = function(video) {
      return ($scope.videoUrls = $scope.trustURL(
        "https://www.youtube.com/embed/" + video.videoId + "?rel=0"
      ));
    };

    $rootScope.getIframeUrl = function(sectionName) {
      var domain = window.location.origin;
      var lang = $rootScope.currentLanguage;
      if (sectionName === "vm") {
        var iFrameUrl =
          domain + "/" + lang + "/" + "iframe-content-voice-messages";
        return $scope.trustURL(iFrameUrl);
      } else if (sectionName === "ctc") {
        var iFrameUrl =
          domain + "/" + lang + "/" + "iframe-content-clicktocall";
        return $scope.trustURL(iFrameUrl);
      }
    };

    $rootScope.isEmptyObj = function(obj) {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) return false;
      }
      return true;
    };

    $rootScope.showRelativeTutorial = function() {
      $rootScope.showTutorial = !$rootScope.showTutorial;
      $rootScope.triggerChat();
    };

    $rootScope.scrollToBot = function() {
      var elem = angular.element("#tutor-iframe");
      angular.element("html, body").animate({
        scrollTop: elem.offset().top
      });
    };

    $scope.notificationSection = function(section) {
      switch (section) {
        case "vm":
          return "voice_message_hover.svg";
        case "phonebook":
          return "phonebook-icon-blue@2x.svg";
        case "settings":
          return "a-p-i-icon-blue@2x.svg";
        case "financials":
          return "pig-icon@3x.svg";
        case "ctc":
          return "callerid-icon-blue.svg";
        default:
          return "";
      }
    };

    $rootScope.importantShowSearch = true;
    $document.on("click", function(e) {
      if (e.target.id === "notificationsDropdownButton") {
        $scope.notificationsDropdown = !$scope.notificationsDropdown;
      } else if (e.target.id === "showMoreNotifications") {
        $scope.notificationsDropdown = true;
      } else if (e.target.id !== "notificationsDropdown") {
        $scope.notificationsDropdown = false;
      }

      if (e.target.id !== "toggleSearch") {
        $rootScope.importantShowSearch = false;
      } else {
        $rootScope.importantShowSearch = true;
      }
    });
  }
]);
