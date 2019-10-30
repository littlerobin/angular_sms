angular.module('callburnApp').controller('SettingsController', [
  '$scope',
  '$rootScope',
  '$state',
  'Restangular',
  '$stateParams',
  'timezones',
  'countries',
  'SettingsService',
  'CountriesDataService',
  'growl',
  'CallBournModal',
  '$location',
  '$interval',
  '$window',
  '$q',
  '$document',
  '$filter',
  function(
    $scope,
    $rootScope,
    $state,
    Restangular,
    $stateParams,
    timezones,
    countries,
    SettingsService,
    CountriesDataService,
    growl,
    CallBournModal,
    $location,
    $interval,
    $window,
    $q,
    $document,
    $filter
  ) {
    $scope.openDropdown = $stateParams.openDropdown;
    $scope.goToNotification = $rootScope.goToNotification;
    $rootScope.currentPage = 'dashboard';
    $rootScope.currentActiveRoute = 'account';
    $rootScope.tutorialSidePopup = false;
    $scope.showCallerIdInput = [];
    $scope.editAccountMainSuccessMessage = false;
    $scope.editAccountMainErrorMessage = false;
    $scope.timezone = timezones.resource.timezones;
    $scope.timezoneObj = [];
    $scope.callRoutes = [];
    $scope.flagImages = [];
    $scope.selectData = [];
    $scope.CurrentLanguageIndex = -1;
    $scope.selectedCallRoute = {};
    $scope.borderStyle = {};
    $scope.startTimer = false;
    $scope.defaultClass = 'default-image-step-1';
    $scope.timezone.forEach(function(item, index) {
      $scope.timezoneObj[index] = {};
      $scope.timezoneObj[index]['value'] = item;
    });
    $rootScope.showNavbar = true;
    $scope.notifyMessage = $location.search();
    if ($scope.notifyMessage) {
      if ($scope.notifyMessage.email) {
        growl.success($rootScope.trans('Your_email_address_has_been_updated'), { ttl: -1 });
      }
    }

    window.document.title =
      $scope.notSeenNotificationsCount === 0
        ? 'Settings - ' + 'Callburn'
        : '(' + $scope.notSeenNotificationsCount + ') ' + 'Settings - ' + 'Callburn';

    $scope.allCountries = CountriesDataService;

    $scope.moment = moment;

    setTimeout(function() {
      if ($scope.openDropdown) {
        angular.element(document).ready(function() {
          angular.element('.chosen-container').mousedown();
        });
        angular
          .element('div.chosen-container-single')
          .addClass('chosen-container chosen-container-single chosen-container-active chosen-with-drop');
      }
    }, 200);

    Restangular.one('data/current-country')
      .get()
      .then(function(data) {
        $scope.CurrentCountry = data.resource.countryCode;
      });

    Restangular.one('data/call-routes')
      .get()
      .then(function(data) {
        $scope.callRoutes = data.resource.routes;
        for (index in $scope.callRoutes) {
          var newRouteObject = {
            keepAttr: $scope.callRoutes[index],
            viewText: $scope.callRoutes[index].original_name + '+' + $scope.callRoutes[index].phonenumber_prefix
          };
          $scope.selectData.push(newRouteObject);
          $scope.flagImages.push('/assets/callburn/images/flags/' + $scope.callRoutes[index].code + '.svg');

          if ($scope.CurrentCountry == localStorage.getItem('CurrentUserLanguageCode')) {
            $scope.CurrentLanguageIndex = index;
          }
        }
        if ($scope.CurrentLanguageIndex != -1) {
          $scope.defaultClass = '';
        }
        $scope.selectedCallRoute.route = $scope.callRoutes[$scope.CurrentLanguageIndex];
      });

    /*
         |---------------------------------------------------------
         | Edit users email.
         |---------------------------------------------------------
         | Open/close email update modal .
         | Submit for changing email
         |
         */
    $scope.showChangeEmailModal = false;
    $scope.updateEmailErrorMessage = false;
    $scope.editEmailData = {};

    $scope.editEmail = function() {
      $rootScope.startLoader();
      SettingsService.updateEmail($scope.editEmailData).then(function(data) {
        $rootScope.stopLoader();
        if (data.resource.error.no == 0) {
          $scope.showChangeEmailModal = false;
          $scope.editAccountMainSuccessMessage = 'Email has been successfully changed';
          $scope.editEmailData = {};
        } else {
          $scope.updateEmailErrorMessage = data.resource.error.text;
        }
      });
    };

    /*
         |---------------------------------------------------------
         | Edit users password.
         |---------------------------------------------------------
         | Open/close password update modal .
         | Submit for changing password
         |
         */
    $scope.updatePasswordErrorMessage = false;
    $scope.showEditPasswordModal = false;
    $scope.editPasswordData = {};
    $scope.editPassword = function() {
      $rootScope.startLoader();
      SettingsService.updatePassword($scope.editPasswordData).then(function(data) {
        $rootScope.stopLoader();
        if (data.resource.error.no == 0) {
          $scope.showEditPasswordModal = false;
          $scope.editAccountMainSuccessMessage = 'Password has been successfully changed';
          $scope.editPasswordData = {};
        } else {
          $scope.updatePasswordErrorMessage = data.resource.error.text;
        }
      });
    };

    /*
         |---------------------------------------------------------
         | Manage caller ids
         |---------------------------------------------------------
         | Add/remove caller ids .
         |
         */
    $scope.verificationCall = {};
    $scope.verified = false;

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

    $scope.AddCallerIdModal = function() {
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
            defaultClass: 'default-image-step-1 default-size',
            validVerificationCallData: true,
            userCountry: ['am', 'es', 'it'].includes($rootScope.currentUser.country_code) ? $rootScope.currentUser.country_code : ''
          },
          templateUrl: '/app/modals/settings/settings-modal.html'
        },
        function(scope) {
          scope.addPrefix = function() {
            var elem = angular.element('#phone')[0];
            elem.value[0] === '+' || elem.value === '' ? null : (elem.value = '+ ' + sessionStorage.getItem('dial') + ' ' + elem.value);
          };

          checkHtmlElement('#phone').then(function(element) {
            element.on('countrychange', function(e, countryData) {
              element.value = sessionStorage.getItem('dial');
            });

            var countryData = angular.element('#phone').intlTelInput('getSelectedCountryData');

            scope.validator = function() {
              if (angular.element('#phone').intlTelInput('isValidNumber')) {
                scope.isValidNumberClass = 'input-success';
                scope.validVerificationCallData = false;
              } else {
                scope.isValidNumberClass = 'input-error';
                scope.validVerificationCallData = true;
                if (scope.addContactData.phonenumber === '') {
                  scope.isValidNumberClass = 'inp-placeholder';
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
                image: 'country-icon@2x',
                text: $rootScope.trans('modals_settings_edit_profile_modal_country')
              };
            }
            scope.defaultClass = '';
            return {
              image: scope.callRoutes[index].code,
              text: '+' + scope.callRoutes[index].phonenumber_prefix
            };
          };

          scope.selectedNumber = function() {
            scope.defaultClass = '';
            scope.phonenumberExample = scope.selectedCallRoute.route.phonenumber_example;
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
            if (typeof scope.selectedCallRoute.route == 'undefined') {
              addContactData.phonenumber = scope.addContactData.phonenumber;
            } else {
              addContactData.phonenumber = scope.addContactData.name;
            }
            scope.loading = true;
            SettingsService.sendVerificationCode(addContactData).then(function(data) {
              scope.showCodeInput = true;
              $rootScope.socket.on('update-verification-message', function(data) {
                if (!scope.phonenumber_id || scope.phonenumber_id == data.message.phonenumber_id) {
                  scope.phonenumber_id = data.message.phonenumber_id;
                  scope.verification_status = data.message.status;
                  if (scope.verification_status == 'FAILED' || scope.verification_status == 'SUCCEED') {
                    // scope.timer(20).then(function() {
                    // scope.showTimer = false;
                    // });
                  }
                }
              });
              // scope.showTimer = true;
              $rootScope.stopModalLoader();
              $rootScope.enabledButton();
              scope.loading = false;
              if (data.resource.error.no == 0) {
                // scope.showCodeInput = true;
                // scope.timer(20).then(function() {
                //   scope.showTimer = false;
                // });
                finalPhonenumber = data.resource.phonenumber;
                scope.showCallCodeField = true;
                // growl.success(data.resource.error.text);
                scope.verified = true;
                scope.callMade = true;
              } else {
                growl.error(data.resource.error.text);
              }
            });
          };

          scope.finishCallerId = function(name) {
            SettingsService.updateCallerId({ id: $scope.lastAddedId, name: name }).then(function(data) {
              $scope.reloadUsersData();
            });
            CallBournModal.close();
          };
        }
      );
    };

    if ($stateParams.openCallerIdModal) {
      $scope.AddCallerIdModal();
    }

    $scope.removeNumber = function(id) {
      ConfirmDeleteModal().then(function() {
        $rootScope.startModalLoader();
        $rootScope.disableButton();
        SettingsService.removeNumber({ id: id }).then(function(data) {
          $rootScope.stopModalLoader();
          $rootScope.enabledButton();
          if (data.resource.error.no == 0) {
            $scope.reloadUsersData();
            growl.success(data.resource.error.text);
          } else {
            growl.error(data.resource.error.text);
          }
        });
      });
    };

    /*
         |---------------------------------------------------------
         | MAIN DATA
         |---------------------------------------------------------
         | Manage users main data.
         | Manage users data for invoice
         |
         */

    $scope.timezones = timezones.resource.timezones;
    $scope.countries = countries.resource.countries;

    var hasOwnProperty = Object.prototype.hasOwnProperty;

    function isEmpty(obj) {
      // null and undefined are "empty"
      if (obj == null) return true;

      // Assume if it has a length property with a non-zero value
      // that that property is correct.
      if (obj.length > 0) return false;
      if (obj.length === 0) return true;

      // Otherwise, does it have any properties of its own?
      // Note that this doesn't handle
      // toString and valueOf enumeration bugs in IE < 9
      for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
      }

      return true;
    }

    $scope.editTimezone = function() {
      var timezone = $rootScope.currentUser.timezone;
      SettingsService.updateMainData({ timezone: timezone }).then(function(data) {
        if (data.resource.error.no == 0) {
          Restangular.one('users/show-user')
            .get()
            .then(function(data) {
              if (!isEmpty(data.resource.user_data)) {
                $rootScope.currentUser.timezone = timezone;
                $rootScope.currentUser = data.resource.user_data;
              } else {
                growl.error(data.resource.error.text);
              }
            });

          Restangular.one('users/users-time')
            .get()
            .then(function(timeData) {
              $rootScope.currentTime = timeData.resource.time;
              $rootScope.currentFullTime = timeData.resource.time;
            });
        }
      });
    };

    $scope.editMainDetailsModal = function() {
      CallBournModal.open(
        {
          scope: {
            userEditableData: {
              company_name: $rootScope.currentUser.company_name,
              email: $rootScope.currentUser.email,
              vat: $rootScope.currentUser.vat,
              address: $rootScope.currentUser.address,
              timezone: $rootScope.currentUser.timezone,
              language_id: $rootScope.currentUser.language_id,
              country_code: $rootScope.currentUser.country_code,
              postal_code: $rootScope.currentUser.postal_code,
              city: $rootScope.currentUser.city,
              city_id: $rootScope.currentUser.city_id ? $rootScope.currentUser.city_id : null,
              // birthday: $rootScope.currentUser.birthday == '0000-00-00' ?  '' : new Date(moment($rootScope.currentUser.birthday, "YYYY-MM-DD")),
              birthday: $rootScope.currentUser.birthday,
              personal_name: $rootScope.currentUser.personal_name,
              email_confirmation: null,
              new_password_confirmation: null,
              country: [],
              facebook_email: $rootScope.currentUser.facebook_email,
              gmail_email: $rootScope.currentUser.gmail_email,
              github_email: $rootScope.currentUser.github_email,
              newsletter_email: $rootScope.currentUser.newsletter_email
            },
            countries: $scope.allCountries,
            cities: [],
            backgroundProcess: false,
            errorClass: 'input-error',
            passErrClass: 'input-error',
            passEditCollapse: true,
            newsletter_email: $rootScope.currentUser.newsletter_email,
            social_mails: $rootScope.currentUser.social_mails,
            socialAccaunt: $rootScope.currentUser.social,
            userCityName: {
              name: ''
            }
          },
          templateUrl: '/app/modals/settings/edit-profile-modal.html'
        },
        function(scope) {
          scope.checkTitle = function(lettersTyped) {
            if (lettersTyped.length >= 2) {
              scope.limitTitleSearch = 50;
            } else {
              scope.limitTitleSearch = 0;
            }
          };

          scope.citySearchChecker = function(input) {
            if (angular.isUnDefined(input) || input == null) return [];
            if (input.length < 2) return [];
          };

          scope.passEditCollapseDisable = function() {
            if (scope.socialAccaunt) {
              return;
            } else {
              scope.passEditCollapse = !scope.passEditCollapse;
            }
          };

          scope.userEditableData.birthday = scope.userEditableData.birthday ? new Date(new Date(scope.userEditableData.birthday)) : null;
          scope.maxInputDate = moment().format('YYYY-MM-DD');

          scope.socialConnectionEmails = [];

          var socialEmails = scope.social_mails;
          socialEmails.forEach(function(email) {
            scope.socialConnectionEmails.push({ selectView: email, showView: email });
          });

          scope.changeNewslatterEmail = function(email) {
            scope.userEditableData.newsletter_email = email;
          };

          scope.editMainDetails = function() {
            scope.backgroundProcess = true;

            if (!scope.userEditableData.birthday) {
              scope.userEditableData.birthday = null;
            }

            SettingsService.updateMainData(scope.userEditableData).then(function(data) {
              if (data.resource.error.no == 0) {
                if (
                  scope.userEditableData.email == scope.userEditableData.email_confirmation &&
                  scope.userEditableData.email_confirmation != ''
                ) {
                  growl.success($rootScope.trans('A_change_email_address_confirmation_was_sent'), { ttl: -1 });
                }
                $rootScope.languages.forEach(function(lang) {
                  if (lang._id == scope.userEditableData.language_id) {
                    $rootScope.currentLanguage = lang.code;
                    $rootScope.currentLanguageName = lang.name;
                  }
                });
                Restangular.one('users/show-user')
                  .get()
                  .then(function(data) {
                    if (data.resource.user_data) {
                      growl.success(data.resource.error.text);
                      scope.backgroundProcess = false;
                      CallBournModal.close();
                    } else {
                      scope.backgroundProcess = false;
                      growl.error(data.resource.error.text);
                    }
                  });
              } else {
                scope.backgroundProcess = false;
                growl.error(data.resource.error.text);
                $scope.editAccountMainErrorMessage = data.resource.error.text;
              }
              $scope.reloadUsersData();
            });
          };

          var liveDate;

          scope.$watch('userEditableData.birthday', function(value) {
            try {
              liveDate = new Date(value);
            } catch (e) {
              console.log(e);
            }

            if (isNaN(liveDate)) {
              scope.dateError = true;
              scope.dateErrClass = 'edit-date-error';
            } else {
              scope.dateError = false;
              scope.dateErrClass = '';
            }
          });

          scope.emailConfirmationChecker = function() {
            if (scope.userEditableData.email == scope.userEditableData.email_confirmation) {
              scope.errorClass = 'input-success';
              scope.emailErrMessage = $rootScope.trans('confirm_email_is_correct');
            } else {
              scope.errorClass = 'input-error';
              if (!scope.userEditableData.email_confirmation) {
                scope.emailErrMessage = $rootScope.trans('confirm_email_could_not_be_blank');
                console.log('should not be blank');
              } else {
                scope.emailErrMessage = $rootScope.trans('confirm_emails_are_not_match');
                console.log('not match');
              }
            }
          };

          scope.passwordConfirmationChecker = function() {
            if (scope.userEditableData.new_password == scope.userEditableData.new_password_confirmation) {
              scope.passErrClass = 'input-success';
              scope.passErrMessage = $rootScope.trans('confirm_password_is_correct');
            } else {
              scope.passErrClass = 'input-error';
              if (!scope.userEditableData.new_password_confirmation) {
                scope.passErrMessage = $rootScope.trans('confirm_password_could_not_be_blank');
                console.log('should not be blank');
              } else {
                scope.passErrMessage = $rootScope.trans('confirm_password_are_not_match');
                console.log('not match');
              }
            }
          };

          scope.countryChanged = function(country) {
            scope.userEditableData.country_code = country[1];
            $rootScope.currentUser.country_code = country[1];
            scope.userEditableData.country = country;
            $rootScope.currentUser.country = country;
          };

          scope.countryShow = false;

          scope.setInputFocusCountry = function() {
            scope.countryShow = true;
          };

          scope.open1 = function() {
            scope.popup1.opened = true;
          };

          scope.popup1 = {
            opened: false
          };

          $(document).on('click', function(e) {
            if (
              $(e.target).is('.one-span-is-blue .ui-select-container') === false &&
              $(e.target).is('.ui-select-container .ui-select-match') === false &&
              $(e.target).is('.ui-select-container input') === false &&
              $(e.target).is('.ui-select-container span') === false
            ) {
              if (scope.countryShow == true) {
                scope.countryShow = false;
              }
              if (scope.cityShow == true) {
                scope.cityShow = false;
              }
            }
          });
        }
      );
    };

    $scope.updateNewsletterSubscription = function(newsLeter) {
      var postData = {};

      postData.send_newsletter = newsLeter ? '1' : '0';
      SettingsService.updateMainData(postData).then(function(data) {
        if (data.resource.error.no == 0) {
          $scope.reloadUsersData();
          if (!newsLeter) {
            growl.success(trans("you're_unsubscribed"));
          } else {
            growl.success(data.resource.error.text);
          }
        } else {
          growl.error(data.resource.error.text);
        }
      });
    };

    $scope.reloadUsersData = function() {
      SettingsService.getShowUser().then(function(data) {
        if (data.resource.user_data) {
          $rootScope.currentUser = data.resource.user_data;
        }
      });
    };

    $scope.removeToken = function(id) {
      ConfirmDeleteModal().then(function() {
        SettingsService.removeById(id).then(function(data) {
          $scope.reloadUsersData();
        });
      });
    };

    $scope.showEditNameInput = function(callerId) {
      callerId.editNameInput = !callerId.editNameInput;
      setTimeout(function() {
        angular.element('#change-callerId-name').select();
      }, 100);
    };

    $scope.callerIdNameValidator = function(callerId) {
      $scope.$watch('', function() {
        if (!callerId.name) {
          $scope.errClass = 'input-error animated swing';
        } else {
          $scope.errClass = '';
        }
      });
    };

    $scope.changeCallerIdName = function(callerId) {
      if (callerId.name != '') {
        SettingsService.updateCallerId({ id: callerId._id, name: callerId.name }).then(function(data) {
          if (data.resource.error.no === 0) {
            for (index in $scope.currentUser.numbers) {
              if ($scope.currentUser.numbers[index]._id === callerId._id) {
                $scope.currentUser.numbers[index].name = callerId.name;
                $scope.showCallerIdInput[callerId._id] = false;
                break;
              }
            }
          }
          callerId.editNameInput = false;
        });
      }
    };

    /*
         * Manage Social account access a
         */
    $scope.connectFacebook = function() {
      var url = window.location.origin + '/social/facebook-login?connect=1&jwtToken=' + localStorage.jwtToken;

      var width = 800;
      var height = 800;
      var left = screen.width / 2 - width / 2;
      var top = screen.height / 2 - height / 2;
      var facebookWindow = window.open(
        url,
        'Connect facebook account',
        'height=' + height + ',width=' + width + ',top=' + top + ',left=' + left
      );
      var interval = setInterval(function() {
        try {
          if (facebookWindow.success == 'success') {
            clearInterval(interval);
            if (facebookWindow.is_registration) {
              if (typeof ga === 'function') {
                ga('send', 'event', 'User', 'SIGNUP', {
                  hitCallback: function() {}
                });
              } else {
              }
            } else {
            }
          } else if (facebookWindow.success == 'deactivated') {
            $scope.accountDeactivated = true;
            $scope.showInvalidLogin = true;
            // $scope.$apply();
          } else if (facebookWindow.success == 'error') {
            $scope.errors = [['Validator failed . Please contact support.']];
          }
        } catch (err) {
          console.log(err);
        }
      }, 1000);
    };

    $scope.connectGoogle = function() {
      var url = window.location.origin + '/social/google-login?connect=1&jwtToken=' + localStorage.jwtToken;

      var width = 800;
      var height = 800;
      var left = screen.width / 2 - width / 2;
      var top = screen.height / 2 - height / 2;
      var googleWindow = window.open(
        url,
        'Connect google account',
        'height=' + height + ',width=' + width + ',top=' + top + ',left=' + left
      );
      var interval = setInterval(function() {
        try {
          if (googleWindow.success == 'success') {
            clearInterval(interval);
            if (googleWindow.is_registration) {
              if (typeof ga === 'function') {
                ga('send', 'event', 'User', 'SIGNUP', {
                  hitCallback: function() {}
                });
              } else {
              }
            } else {
            }
          } else if (googleWindow.success == 'deactivated') {
            $scope.accountDeactivated = true;
            $scope.showInvalidLogin = true;
            // $scope.$apply();
          } else if (googleWindow.success == 'error') {
            $scope.errors = [['Validator failed . Please contact support.']];
          }
        } catch (err) {}
      }, 1000);
    };

    $scope.connectGitHub = function() {
      var url = window.location.origin + '/social/github-login?connect=1&jwtToken=' + localStorage.jwtToken;

      var width = 800;
      var height = 800;
      var left = screen.width / 2 - width / 2;
      var top = screen.height / 2 - height / 2;
      var githubLogin = window.open(
        url,
        'Connect google account',
        'height=' + height + ',width=' + width + ',top=' + top + ',left=' + left
      );
      var interval = setInterval(function() {
        try {
          if (githubLogin.success == 'success') {
            clearInterval(interval);
            if (githubLogin.is_registration) {
              if (typeof ga === 'function') {
                ga('send', 'event', 'User', 'SIGNUP', {
                  hitCallback: function() {}
                });
              } else {
              }
            } else {
            }
          } else if (githubLogin.success == 'deactivated') {
            $scope.accountDeactivated = true;
            $scope.showInvalidLogin = true;
            // $scope.$apply();
          } else if (githubLogin.success == 'error') {
            $scope.errors = [['Validator failed . Please contact support.']];
          }
        } catch (err) {}
      }, 1000);
    };

    $scope.deleteAccount = function() {
      CallBournModal.open(
        {
          scope: {},
          templateUrl: '/app/modals/confirm/delete-account.html'
        },
        function(scope) {
          scope.deleteData = {
            user_id: $rootScope.currentUser._id,
            currentPassword: ''
          };
          scope.deleteConfirmation = function() {
            Restangular.all('users/delete-account')
              .post(scope.deleteData)
              .then(function(data) {
                if (data.resource.code == 1) {
                  $rootScope.logOut();
                } else if (data.resource.status != 1) {
                  growl.error(data.resource.error);
                }
              });
          };
        }
      );
    };
  }
]);
