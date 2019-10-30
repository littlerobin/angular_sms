angular.module('callburnApp').controller('FinancialsController', [
  '$scope',
  '$rootScope',
  '$filter',
  '$document',
  '$state',
  'Restangular',
  '$stateParams',
  '$q',
  'callRoutes',
  'taxData',
  'growl',
  /*'oldData',*/ 'orders',
  'invoices',
  'billings',
  '$httpParamSerializer',
  'CallBournModal',
  '$window',
  'SettingsService',
  'currentUser',
  '$interval',
  function(
    $scope,
    $rootScope,
    $filter,
    $document,
    $state,
    Restangular,
    $stateParams,
    $q,
    callRoutes,
    taxData,
    growl,
    /*oldData,*/ orders,
    invoices,
    billings,
    $httpParamSerializer,
    CallBournModal,
    $window,
    SettingsService,
    currentUser,
    $interval
  ) {
    $rootScope.tutorialSidePopup = false;
    $scope.showApplePay = false;
    $scope.showVatError = false;
    $scope.showVatSuccess = false;
    Stripe.setPublishableKey('pk_live_1Rg4cK1P1r7NJJHycyVaduuc');

    $scope.backgroundProcess = false;

    $scope.startApplePayment = function() {
      var totalAmount = $scope.paymentData.total_amount;
      var paymentRequest = {
        countryCode: 'ES',
        currencyCode: 'EUR',
        total: {
          label: 'Callburn',
          amount: totalAmount
        }
      };
      // /console.log('starting to init sessions');
      var session = Stripe.applePay.buildSession(
        paymentRequest,
        function(result, completion) {
          var tempObject = {};
          angular.copy($scope.paymentData, tempObject);
          tempObject.is_apple_pay = true;
          tempObject.card_id = result.token.id;
          //console.log(result.token.id)
          $scope.disablePayButton = true;
          Restangular.all('stripe/make-payment')
            .post(tempObject)
            .then(function(data) {
              if (data.resource.error.no == 0) {
                growl.success(trans('payment_done_successfully'));
                $scope.disablePayButton = false;
                completion(true);
                $scope.openSuccessPaymentModal();
              } else {
                growl.error(trans(data.resource.error.text));
                $scope.disablePayButton = false;
                completion(false);
              }
            });
        },
        function(data) {
          //console.log('config wrong');
          //console.log(data)
          completion(false);
        }
      );

      session.oncancel = function() {
        // console.log("User hit the cancel button in the payment window");
        $scope.disablePayButton = false;
      };

      session.begin();
    };

    window.document.title =
      $scope.notSeenNotificationsCount === 0
        ? 'Financials - ' + 'Callburn'
        : '(' + $scope.notSeenNotificationsCount + ') ' + 'Financials - ' + 'Callburn';

    $scope.checkedDiscountCode = true;
    $scope.checkboxDiscountCode = 0;
    $scope.checkedVAT = $rootScope.currentUser.vat ? true : false;
    $scope.checkboxVAT = $rootScope.currentUser.vat ? 1 : 0;

    $scope.goToNotification = $rootScope.goToNotification;
    $scope.enableToPayOrder = function() {
      $scope.toPayOrder = true;
      $scope.disableCreditActions = true;
      $scope.paymentMethod = 'paypal';
    };
    var checkOrdersData = function(fromRoute) {
      var orderDataMainFunc = function() {
        if ($scope.ordersData) {
          $scope.paymentData = {};
          $scope.paymentData.amount = $scope.ordersData.purchased_amount;
          $scope.paymentData.vat_id = $scope.ordersData.vat_id;
          $scope.paymentData.vat_amount = $scope.ordersData.vat_amount;
          $scope.paymentData.discount_code = $scope.ordersData.coupon_code;
          if ($scope.paymentData.discount_code) {
            $scope.checkboxDiscountCode = 1;
            $scope.checkedDiscountCode = false;
          }
          if ($scope.paymentData.vat_id) {
            $scope.checkboxVAT = 1;
            $scope.checkedVAT = true;
          }
          setTimeout(function() {
            window.scrollTo(0, document.body.scrollHeight);
          }, 1000);
          //$scope.pymentMethod = 1;
          $scope.disableBankTransfer = true;

          $scope.toPayOrder = $stateParams.invoice_id ? true : false;
        } else {
          $scope.paymentData = { amount: (10).toFixed(2), vat_amount: 0, vat_id: $rootScope.currentUser.vat };
          $scope.disableBankTransfer = false;
          $scope.disablePayByBank = false;
          // $scope.toPayOrder = true;
        }
      };

      if (fromRoute) {
        $scope.ordersData = orders.resource.invoices[0];

        orderDataMainFunc();
      } else {
        Restangular.one('billings/orders')
          .get()
          .then(function(data) {
            $scope.ordersData = data.resource.invoices[0];
            $scope.toPayOrder = false;
            orderDataMainFunc();
          });
      }

      Stripe.applePay.checkAvailability(function(available) {
        if (available) {
          $scope.showApplePay = true;
          $scope.paymentMethod = 'apple';
        } else if ($scope.ordersData || ($scope.disableBankTransfer || $scope.disablePayByBank)) {
          $scope.paymentMethod = 'bank';
        } else {
          $scope.paymentMethod = 'credit';
        }
      });
    };
    checkOrdersData(1);

    $scope.openDeletePendingOrder = function(id) {
      $scope.ordersData = {};
      $scope.toPayOrder = false;
      CallBournModal.open(
        {
          scope: {
            id: id
          },
          templateUrl: '/app/modals-origin/financials/delete-pending-order.html'
        },
        function(scope) {
          scope.deleteOrder = function(id) {
            Restangular.one('billings/remove-order', id)
              .remove()
              .then(function(data) {
                if (data.resource.error.no == 0) {
                  CallBournModal.close();
                  checkOrdersData(0);
                  growl.success($rootScope.trans('pending_order_deleted'));
                } else {
                  growl.error($rootScope.trans(data.resource.error.text));
                }
              });
          };
        }
      );
    };

    $rootScope.currentActiveRoute = 'account';

    $rootScope.currentPage = 'dashboard';

    $scope.taxData = taxData.resource.taxData;
    var callRoutes = callRoutes.resource.routes;
    $scope.callRoutes = [];
    $scope.flagImages = [];
    for (index in callRoutes) {
      var newRouteObject = {
        callRoute: callRoutes[index],
        viewText: callRoutes[index].name + ' (+' + callRoutes[index].phonenumber_prefix + ')'
      };
      $scope.flagImages.push('/assets/callburn/images/flags/' + callRoutes[index].code + '.svg');
      $scope.callRoutes.push(newRouteObject);
    }

    $scope.$watch('taxData', function(newVal, oldVal) {}, 1);

    $scope.financialsStep = 1;
    var financialCalculator = ($scope.financialCalculator = { step: 5 });

    $scope.discountData = {};
    var notChangedStandardRate = taxData.resource.taxData.standard_rate;
    var lastCheckedVatId = null;
    var lastCheckedCoupon = null;

    var updateVat = function(newVal) {
      $scope.paymentData.vat_amount = newVal ? (newVal * $scope.taxData.standard_rate) / 100 : 0;
      $scope.paymentData.total_amount = Number($scope.paymentData.vat_amount) + Number($scope.paymentData.amount);
    };

    $scope.$watch('paymentData.amount', function(newVal) {
      if ($scope.paymentData.amount < $scope.minAmount) {
        $scope.hideBonus = true;
        $scope.getDiscountAmount('noValue');
      } else {
        $scope.hideBonus = false;
      }
      updateVat(newVal);
    });

    $scope.amountBlured = function() {
      if (isNaN($scope.paymentData.amount) || $scope.paymentData.amount < 10) {
        $scope.paymentData.amount = 10;
      }
      $scope.paymentData.amount = parseFloat($scope.paymentData.amount).toFixed(2);
    };
    $scope.getMaxCostForAllMessages = function() {
      if (!financialCalculator.callRoute) {
        return 0;
      }
      var length = financialCalculator.length;
      if (length < 20) {
        length = 20;
      }
      var quantity = financialCalculator.quantity;
      var finalPrice = (length * quantity * financialCalculator.callRoute.customer_price) / 60;

      if ($scope.activeTabForCost == 2) {
        $scope.paymentData.amount = finalPrice.toFixed(2);
      }
      return finalPrice ? finalPrice.toFixed(2) : 0;
    };

    $scope.getDiscountAmount = function(type) {
      if (type == 'noValue' || $scope.hideBonus) {
        return 0;
      }
      if (!$scope.discountData) {
        return 0;
      }
      var discountAmount = ($scope.paymentData.amount * $scope.discountData.discount_percentage) / 100;
      return discountAmount ? discountAmount : 0;
    };

    $scope.getTotalRecharge = function() {
      var totalRecharge = parseFloat($scope.paymentData.amount);
      if ($scope.discountData && !$scope.hideBonus) {
        totalRecharge += parseFloat(($scope.paymentData.amount * $scope.discountData.discount_percentage) / 100);
      }
      return totalRecharge ? totalRecharge : 0;
    };

    $scope.checkCouponCode = function() {
      //$rootScope.startLoader();
      Restangular.all('billings/check-coupon-code')
        .post($scope.paymentData)
        .then(function(data) {
          //$rootScope.stopLoader();
          if (data.resource.error.no == 0) {
            lastCheckedCoupon = data.resource.coupon;
            $scope.discountData = data.resource.coupon;
            $scope.minAmount = data.resource.coupon.minimum_amount;
            if ($scope.paymentData.amount < $scope.minAmount) {
              $scope.hideBonus = true;
              $scope.getDiscountAmount('noValue');
            } else {
              $scope.hideBonus = false;
            }
          } else {
            growl.error(trans(data.resource.error.text));
          }
        });
    };

    $scope.currentUser = currentUser.resource.user_data;

    $scope.userEditableData = {
      company_name: $scope.currentUser.company_name,
      address: $scope.currentUser.address,
      birthday: $scope.currentUser.birthday,
      postal_code: $scope.currentUser.postal_code,
      // city_id: $scope.currentUser.city_id ? $scope.currentUser.city_id : null,
      city: $scope.currentUser.city,
      vat: $scope.paymentData.vat_id
    };

    /*$scope.getCities = function (countryCode) {
                SettingsService.getCites({country_code: countryCode}).then(function (data) {
                    $scope.cities = data.resource.cities;
                    // for (var i = 0; i < $scope.cities.length; i++) {
                    //     if ($scope.cities[i]._id === $scope.userEditableData.city_id) {
                    //         $scope.userCityName.name = $scope.cities[i].city
                    //     }
                    // }
                   $scope.cityNameToId();
                })
            };
            if ($scope.currentUser.country_code) {
                $scope.getCities($scope.currentUser.country_code);

            }*/

    $scope.countryChanged = function() {
      if (scope.userEditableData.country_code) {
        scope.userEditableData.city_id = 0;
        $rootScope.currentUser.country_code = scope.userEditableData.country_code;
        scope.getCities(scope.userEditableData.country_code);
      }
    };

    $scope.countryShow = false;
    $scope.cityShow = false;

    $scope.setInputFocusCountry = function() {
      $scope.countryShow = true;
    };

    $scope.setInputFocusCity = function() {
      $scope.cityShow = true;
    };

    $scope.open1 = function() {
      $scope.popup1.opened = true;
    };

    $scope.popup1 = {
      opened: false
    };

    $scope.vatUpdateChecker = true;

    $scope.$watch('paymentData.vat_id', function(newVal) {
      $scope.errClass = '';
      $scope.toggleVatId = '';
      $scope.showLine = false;
    });

    $scope.errCityClass = '';

    $document.on('click', function() {
      /*$scope.cityNameToId();*/
      if (
        $scope.userEditableData.company_name != $scope.currentUser.company_name ||
        $scope.userEditableData.address != $scope.currentUser.address ||
        $scope.userEditableData.postal_code != $scope.currentUser.postal_code ||
        $scope.userEditableData.city != $scope.currentUser.city ||
        // || $scope.userEditableData.city_id != $scope.currentUser.city_id
        $scope.userEditableData.vat != $scope.paymentData.vat_id
      ) {
        checkVat();
        $scope.updateUserData = function(data) {
          $scope.userEditableData.first_name = $scope.currentUser.first_name;
          $scope.userEditableData.address = $scope.currentUser.address;
          $scope.userEditableData.postal_code = $scope.currentUser.postal_code;
          $scope.userEditableData.city = $scope.currentUser.city;
          // $scope.userEditableData.city_id = $scope.currentUser.city_id
          $scope.userEditableData.vat = $scope.paymentData.vat_id;
        };
      }
    });

    var reloadUsersData = function() {
      Restangular.one('users/show-user')
        .get()
        .then(function(data) {
          if (data.resource.user_data) {
            $rootScope.currentUser = data.resource.user_data;
            $scope.currentUser = data.resource.user_data;
            // $scope.updateUserData(data.resource.user_data);
            //$rootScope.currentUser.send_low_balance_notifications= $rootScope.currentUser.send_low_balance_notifications != 0;
          }
        });
    };

    /*$scope.userCityName = {name: ""}
            $scope.firstTime = true;

            $scope.cityNameToId = function() {
                $scope.errCityClass = "input-error"
                console.log('$scope.cities.length', $scope.cities.length)
                for (var i = 0; i < $scope.cities.length; i++) {
                    if ($scope.userCityName.name === "" && $scope.userEditableData.city_id && $scope.firstTime) {
                        if ($scope.cities[i]._id === $scope.userEditableData.city_id) {
                            $scope.userCityName.name = $scope.cities[i].city
                            $scope.firstTime = false;

                            return;
                        }
                    } else if ($scope.cities[i].city === $scope.userCityName.name) {
                        $scope.userEditableData.city_id = $scope.cities[i]._id;
                        $scope.userCityName.name = $scope.cities[i].city;
                        $scope.errCityClass = "input-success"
                        // $scope.currentUser.city_id = $scope.cities[i]._id;
                        console.log('$scope.userCityName.name', $scope.userCityName.name)
                        return ;
                    }
                    //reloadUsersData()
                }
            }*/

    /*$scope.$watch('userCityName.name', function() {
                // console.log('watch')
                $scope.cityNameToId()
            })*/

    var checkVat = ($scope.checkVat = function() {
      $scope.backgroundProcess = true;
      //$rootScope.startLoader();
      Restangular.all('billings/check-vat-id')
        .post($scope.paymentData)
        .then(function(data) {
          //$rootScope.stopLoader();

          if (data.resource.error.no === 0) {
            $scope.showVatError = false;
            $scope.showVatSuccess = true;
            $scope.taxData.standard_rate = 0;
            lastCheckedVatId = $scope.paymentData.vat_id;
            updateVat($scope.paymentData.amount);
            $scope.backgroundProcess = false;
            console.log('success');
            $scope.errClass = 'input-success';
            $scope.toggleVatId = $rootScope.trans('modals_settings_edit_profile_modal_vat_id_green');
            $scope.showLine = true;
          } else {
            $scope.showVatError = true;
            $scope.showVatSuccess = false;
            //growl.error(data.resource.error.text)
            $scope.backgroundProcess = false;
            $scope.errClass = 'input-warning';
            $scope.toggleVatId = $rootScope.trans('modals_settings_edit_profile_modal_vat_id_yellow');
            $scope.showLine = true;
          }
        });
      $scope.userEditableData.vat = $scope.paymentData.vat_id;
      // $scope.userEditableData.city_id = $scope.paymentData.vat_id
      /*$scope.userEditableData = {
                    first_name: $scope.currentUser.first_name,
                    address: $scope.currentUser.address,
                    birthday: $scope.currentUser.birthday,
                    postal_code: $scope.currentUser.postal_code,
                    city_id: $scope.currentUser.city_id ? $scope.currentUser.city_id : null,
                    vat: $scope.paymentData.vat_id
                }*/
      SettingsService.updateMainData($scope.userEditableData).then(function(data) {
        if (data.resource.error.no == 0) {
          if ($scope.vatUpdateChecker) {
            $scope.backgroundProcess = false;
            //growl.success(data.resource.error.text)
          }
          reloadUsersData();
          //$scope.updateUserData();
          $scope.vatUpdateChecker = true;
        } else {
          $scope.backgroundProcess = false;
          growl.error(trans(data.resource.error.text));
        }
      });
    });

    if ($scope.paymentData.vat_id) {
      $scope.vatUpdateChecker = false;
      checkVat();
    }

    $scope.$watch('paymentData.vat_id', function(newVal) {
      if (newVal !== lastCheckedVatId) {
        $scope.taxData.standard_rate = notChangedStandardRate;
      } else {
        $scope.taxData.standard_rate = taxData.resource.taxData.standard_rate;
      }
      updateVat($scope.paymentData.amount);
    });

    $scope.$watch('paymentData.discount_code', function(newVal) {
      if (lastCheckedCoupon && newVal !== lastCheckedCoupon.code) {
        $scope.discountData = {};
      } else {
        $scope.discountData = lastCheckedCoupon;
      }
    });

    $scope.disablePayButton = false;

    $scope.payByPaypal = function() {
      //$rootScope.startLoader();
      $scope.disablePayButton = true;
      $scope.paymentData.discount_code = $scope.checkboxDiscountCode == 1 ? $scope.paymentData.discount_code : null;
      $scope.paymentData.vat_id = $scope.checkboxVAT == 1 ? $scope.paymentData.vat_id : null;
      var postData = $scope.paymentData;
      if ($scope.oldData) {
        postData.order_id = $scope.oldData._id;
      }
      Restangular.all('billings/pay-by-paypal')
        .post(postData)
        .then(function(data) {
          //$rootScope.stopLoader();
          if (data.resource.error.no == 0) {
            window.location = data.resource.redirect_url;
            $scope.disablePayButton = false;
          } else {
            growl.error(trans(data.resource.error.text));
            $scope.disablePayButton = false;
          }
        });
    };

    $scope.openOrderSuccessModal = function(order) {
      CallBournModal.open(
        {
          scope: {
            order: order
          },
          templateUrl: '/app/modals/financials/pending-order-sucess.html'
        },
        function(scope) {
          scope.close = function() {
            CallBournModal.close();
          };
        }
      );
    };

    $scope.payByBank = function() {
      //$rootScope.startLoader();
      $scope.disablePayByBank = true;
      $scope.paymentData.discount_code = $scope.checkboxDiscountCode == 1 ? $scope.paymentData.discount_code : null;
      $scope.paymentData.vat_id = $scope.checkboxVAT == 1 ? $scope.paymentData.vat_id : null;
      Restangular.all('billings/create-bank-order')
        .post($scope.paymentData)
        .then(function(data) {
          //$rootScope.stopLoader();
          if (data.resource.error.no == 0) {
            growl.success($rootScope.trans('Your_order_was_successfully_created'));
            //$scope.disablePayButton = false;
            // ga('send', 'event', 'Payment', 'ORDER', '', $scope.paymentData.amount, {
            //     hitCallback: function() {
            //         console.log($scope.paymentData);
            //     }
            // });
            dataLayer.push({
              purchased_amount: $scope.paymentData.amount,
              event: 'order_created'
            });
            reloadUsersData();
            checkOrdersData(0);
            var orderData = data.resource.invoice;
            $rootScope.orderData = data.resource.invoice;
            $scope.openOrderSuccessModal(orderData);
            //$state.go('account.success-payment', {invoice_id: data.resource.invoice._id})
          } else {
            growl.error(trans(ata.resource.error.text));
            $scope.disablePayButton = false;
          }
        });
    };

    /**** STRIPE ***/

    $scope.months = [
      { selectView: $rootScope.trans('month_January'), selectValue: 1 },
      { selectView: $rootScope.trans('month_February'), selectValue: 2 },
      { selectView: $rootScope.trans('month_March'), selectValue: 3 },
      { selectView: $rootScope.trans('month_April'), selectValue: 4 },
      { selectView: $rootScope.trans('month_May'), selectValue: 5 },
      { selectView: $rootScope.trans('month_June'), selectValue: 6 },
      { selectView: $rootScope.trans('month_July'), selectValue: 7 },
      { selectView: $rootScope.trans('month_August'), selectValue: 8 },
      { selectView: $rootScope.trans('month_September'), selectValue: 9 },
      { selectView: $rootScope.trans('month_October'), selectValue: 10 },
      { selectView: $rootScope.trans('month_November'), selectValue: 11 },
      { selectView: $rootScope.trans('month_December'), selectValue: 12 }
    ];

    $scope.years = [];
    var thisYear = parseInt(moment().format('YYYY'));
    for (var i = thisYear; i < 2030; i++) {
      var year = { selectView: i, selectValue: i };
      $scope.years.push(year);
    }

    $scope.stripeData = {};

    $scope.updateStripeCardsDate = function() {
      Restangular.one('stripe/cards')
        .get()
        .then(function(data) {
          $scope.stripeCards = data.resource.cards ? data.resource.cards : [];
          // console.log(data.resource.cards);
          for (var index = 0; index < $scope.stripeCards.length; index++) {
            if ($scope.stripeCards[index].is_default) {
              $scope.paymentData.card_id = $scope.stripeCards[index].stripe_id;
            }
          }
        });
    };
    $scope.updateStripeCardsDate();

    $scope.selectCard = function(id) {
      if ($scope.paymentData.card_id == id) {
        return;
      }
      $scope.paymentData.card_id = id;
      Restangular.all('stripe/make-card-default')
        .post({ card_id: id })
        .then(function(data) {
          if (data.resource.error.no == 0) {
            // console.log('Default card changed');
          } else {
            // console.log('Failed to change default card');
          }
        });
    };

    $scope.payByCard = function payByCard() {
      $scope.disablePayButton = true;
      Restangular.all('stripe/make-payment')
        .post($scope.paymentData)
        .then(function(data) {
          if (data.resource.error.no == 0) {
            growl.success(trans('payment_done_successfully'));
            $scope.openSuccessPaymentModal();
            dataLayer.push({
              purchased_amount: $scope.paymentData.amount,
              event: 'order_created'
            });
            $scope.disablePayButton = false;
          } else {
            growl.error(trans(data.resource.error.text));
            $scope.disablePayButton = false;
          }
        });
    };

    /************************* ADDING NEW CARD MODAL ************************/

    $scope.openAddNewCardModal = function() {
      CallBournModal.open(
        {
          scope: {
            stripeData: $scope.stripeData,
            months: $scope.months,
            years: $scope.years,
            expInput: {}
          },
          templateUrl: '/app/modals/financials/add-new-card.html'
        },
        function(scope) {
          scope.splitBySlash = function() {
            // console.log(scope.expInput.slashExpDate)
            var slashExpDate = scope.expInput.slashExpDate;
            if (slashExpDate.length >= 4) {
              var splitedDates = slashExpDate.split('/');
              var month = splitedDates[0];
              var year = splitedDates[1];
              scope.stripeData.exp_month = parseInt(month);
              scope.stripeData.exp_year = parseInt(year);
            }
          };
          scope.addNewCard = function() {
            scope.disableAddNewCardButton = true;
            Restangular.all('stripe/create-card')
              .post(scope.stripeData)
              .then(function(data) {
                if (data.resource.error.no === 0) {
                  CallBournModal.close();
                  reloadUsersData();
                  $scope.stripeData = {};
                  $scope.updateStripeCardsDate();
                  growl.success(trans('new_card_successfully_added'));
                } else if (data.resource.error.no === -1) {
                  growl.error(trans('please_fill_required_fields'));
                } else if (data.resource.error.no === -2) {
                  growl.error(trans('card_details_are_wrong'));
                }
                scope.disableAddNewCardButton = false;
              });
          };
        }
      );
    };

    $scope.openDeleteStripeCard = function(id) {
      CallBournModal.open(
        {
          scope: {
            id: id
          },
          templateUrl: '/app/modals/financials/add-new-card-delete.html'
        },
        function(scope) {
          scope.deleteCard = function(id) {
            Restangular.one('stripe/remove-card', id)
              .remove()
              .then(function(data) {
                CallBournModal.close();
                reloadUsersData();
                $scope.updateStripeCardsDate();
                growl.success(trans('new_card_successfully_deleted'));
              });
          };
        }
      );
    };

    /**** STRIPE ***/

    /**** SUCCESS MODAL ****/
    $scope.openSuccessPaymentModal = function() {
      CallBournModal.open(
        {
          scope: {},
          templateUrl: '/app/modals/financials/success-payment-modal.html'
        },
        function(scope) {
          scope.goToinvoceCancel = function() {
            CallBournModal.close();
          };
        }
      );
    };
    /**** SUCCESS MODAL ****/

    /************************ AUTORECHARGE FEATURES *************************/
    $scope.autoRechargeLoading = false;
    $scope.autoRecharge = {};
    $scope.switchAutorecharge = function() {
      // if ($scope.stripeCards !== undefined) {
      if ($scope.stripeCards.length > 0) {
        if ($rootScope.currentUser.is_autobilling_active === 1) {
          $scope.autoRecharge.status = 1;
          $scope.updateAutorechargeAmount();
        } else if ($rootScope.currentUser.is_autobilling_active === 0) {
          $scope.autoRecharge.status = 0;
        }
        Restangular.all('autobillings/switch-automatic-billing')
          .post($scope.autoRecharge)
          .then(function(data) {
            reloadUsersData();
          });
      } else {
        $rootScope.currentUser.is_autobilling_active = 0;
        $scope.autoRecharge.is_autobilling_active = 0;
        Restangular.all('autobillings/switch-automatic-billing')
          .post($scope.autoRecharge)
          .then(function(data) {
            reloadUsersData();
          });
        $scope.openAddNewCardModal();
      }
      // }
    };

    $scope.autoRechargeAmount = { autobilling_amount: 25 };

    $scope.updateAutorechargeAmount = function() {
      $scope.autoRechargeLoading = true;
      if ($rootScope.currentUser.is_autobilling_active === 1) {
        Restangular.all('autobillings/update-automatic-billing-amount')
          .post($scope.autoRechargeAmount)
          .then(function(data) {
            $scope.autoRechargeLoading = false;
            reloadUsersData();
          });
      }
    };

    var AutorechargeText = $rootScope.trans('engaines_account_financials_autorecharge_with');

    $scope.autorechargeAmounts = [
      { selectView: AutorechargeText + ' € 25', showView: 25 },
      { selectView: AutorechargeText + ' € 50', showView: 50 },
      { selectView: AutorechargeText + ' € 100', showView: 100 }
    ];

    $scope.autorechargeAmountChanged = function(autorechargeWith) {
      //$rootScope.startLoader();
      Restangular.all('autobillings/set-auto-recharge-amount')
        .post({ autorecharge_with: autorechargeWith })
        .then(function(data) {
          //$rootScope.stopLoader();
          if (data.resource.error.no == 0) {
            reloadUsersData();
          }
        });
    };

    /*
            $scope.autobillingSettingChanged = function (status) {
                //console.log(status);
                if (status) {
                    //enableAutoRecharge();
                } else {
                    disableAutoRecharge();
                }
            }
            //console.log($rootScope.currentUser);
            $scope.autoRecharge = {autobilling_amount: 25};
            $scope.enableAutoRecharge = function () {
                //$rootScope.startLoader();
                Restangular.all('autobillings/activate-automatic-billing').post($scope.autoRecharge).then(function (data) {
                    //$rootScope.stopLoader();
                    if (data.resource.error.no == 0) {
                        window.location = data.resource.redirect_url;
                    }
                })
            }

            var disableAutoRecharge = function () {
                //$rootScope.startLoader();
                Restangular.all('autobillings/cancel-automatic-billing').post().then(function (data) {
                    //$rootScope.stopLoader();
                    if (data.resource.error.no == 0) {
                        reloadUsersData()
                    }
                })
            }
            */

    /*$scope.notifyWhenBalanceIsLow = {};
             $scope.lowBalanceChecked = false;
             $rootScope.$watch('currentUser', function(newVal){
             $scope.notifyWhenBalanceIsLow.send_low_balance_notifications = newVal.send_low_balance_notifications;
             $scope.lowBalanceChecked = newVal.send_low_balance_notifications;
             });

             $scope.notifyWhenBalanceIsLow = {
             notify_when_balance_is_low: $rootScope.currentUser.notify_when_balance_is_low ? $rootScope.currentUser.notify_when_balance_is_low: 5
         }*/

    // console.log(44444444444,$rootScope.trans('account_financials_notify_me_when_balance_is_below'))

    $rootScope.$watch(
      'currentUser',
      function(newVal) {
        // console.log(newVal)
      },
      1
    );

    var applyTranslations = function() {
      $scope.isLoaded = false;
      setTimeout(function() {
        $scope.isLoaded = true;
      }, 100);
      setTimeout(function() {
        $scope.notifySettings = [
          { selectView: $rootScope.trans('account_financials_notify_me_when_balance_is_below') + ' € 5', showView: 5 },
          {
            selectView: $rootScope.trans('account_financials_notify_me_when_balance_is_below') + ' € 25',
            showView: 25
          },
          { selectView: $rootScope.trans('account_financials_notify_me_when_balance_is_below') + ' € 50', showView: 50 }
        ];
      }, 500);
    };

    $rootScope.$watch('currentLanguage', applyTranslations);
    $rootScope.$watch('isLangLoaded', applyTranslations);

    $scope.send_low_balance_notifications = $rootScope.currentUser.send_low_balance_notifications;
    $scope.lowBalanceLoading = false;

    $scope.notifySettingsChanged = function(model, checkbox) {
      $scope.lowBalanceLoading = true;

      if (model && checkbox) {
        $rootScope.currentUser.notify_when_balance_is_low = 25;
        $rootScope.currentUser.send_low_balance_notifications = 1;
      } else if (model === 0 && checkbox) {
        $rootScope.currentUser.notify_when_balance_is_low = 0;
        $rootScope.currentUser.send_low_balance_notifications = 0;
      } else if (model && checkbox === false) {
        $rootScope.currentUser.notify_when_balance_is_low = model;
        $rootScope.currentUser.send_low_balance_notifications = 1;
      }

      console.log($rootScope.currentUser);
      Restangular.all('users/enable-disable-low-balance-alerts')
        .post($rootScope.currentUser)
        .then(function(data) {
          if (data.resource.error.no == 0) {
            $scope.lowBalanceLoading = false;
          }
        });
    };

    $scope.enableDiscountCode = function() {
      // if ($scope.checkboxDiscountCode == 0) {
      //     $scope.paymentData.discount_code = $scope.oldData ? $scope.oldData.coupon_code : undefined;
      // }
      // console.log('$scope.checkedDiscountCode', $scope.checkedDiscountCode);
      // console.log('checkboxDiscountCode', $scope.checkboxDiscountCode);
      $scope.checkedDiscountCode = !$scope.checkedDiscountCode;
      if ($scope.checkedDiscountCode) {
        $scope.hideBonus = true;
        $scope.getDiscountAmount('noValue');
      }
    };

    $scope.enableVAT = function() {
      // if ($scope.checkboxVAT == 0) {
      //     $scope.paymentData.vat_id = $scope.oldData ? $scope.oldData.vat_id : undefined;
      // }
      $scope.checkedVAT = !$scope.checkedVAT;
    };
    if ($scope.currentUser.country_code && $scope.paymentData.vat_id) {
      $scope.paymentData.vat_id = $scope.paymentData.vat_id.replace($scope.currentUser.country_code.toUpperCase(), '');
    } else {
      $scope.paymentData.vat_id = null;
    }

    $scope.selectedFinance = $stateParams.fromInvoices ? 'invoices' : 'methods';
    $scope.selectSection = function(section) {
      $scope.selectedFinance = section;
    };

    // INVOICES CONTROLLER

    $rootScope.tutorialSidePopup = false;
    $scope.goToNotification = $rootScope.goToNotification;

    $rootScope.currentPage = 'dashboard';
    $rootScope.currentActiveRoute = 'account';
    $scope.filterData = {};

    $scope.billingData = billings.resource;
    if ($stateParams.payment_amount) {
      dataLayer.push({
        purchased_amount: $stateParams.payment_amount,
        event: 'order_created'
      });
    }
    // console.log(billings);

    window.document.title =
      $scope.notSeenNotificationsCount === 0
        ? 'Invoices - ' + 'Callburn'
        : '(' + $scope.notSeenNotificationsCount + ') ' + 'Invoices - ' + 'Callburn';

    var applyTranslations = function() {
      $scope.isLoaded = false;
      setTimeout(function() {
        $scope.isLoaded = true;
      }, 100);
      $scope.getAppropriateStatus = function(type, billingObj) {
        if (type === 'BILLING') {
          return trans('account_invocies_billings_billed');
        } else if (type === 'GIFT') {
          return trans('account_invocies_billings_gifted_2');
        } else if (type === 'TRANSACTION') {
          return trans('account_invocies_billings_purchased');
        } else if (type === 'REFUND') {
          return trans('account_invocies_billings_refund');
        } else if (type === 'MANUAL_SERVICE') {
          return billingObj.billingDescription;
        }
      };

      $scope.invoiceGiftSum = 0;
      $scope.getAppropriateAmount = function(type, billingObj) {
        billingObj.paidFromGift = false;
        billingObj.giftSumText = null;
        if (type === 'BILLING') {
          if (billingObj.giftSum) {
            billingObj.paidFromGift = true;
            var giftSum = $rootScope.trans('account_invocies_billings_gift') + ': (€ ' + $filter('number')(billingObj.giftSum, 2) + ')';
            billingObj.giftSumText = giftSum;
            var final_amount = billingObj.purchasedSum + billingObj.giftSum;
            return $filter('number')(final_amount, 2);
          }
          return $filter('number')(billingObj.purchasedSum, 2);
        } else if (type === 'GIFT') {
          return billingObj.giftSum ? $filter('number')(billingObj.giftSum, 2) : '0.00';
        } else if (type === 'TRANSACTION') {
          var taxAmount =
            billingObj.taxAmount && parseInt(billingObj.taxAmount) > 0
              ? trans('account_invocies_billings_tax_amount') + ': (€ ' + $filter('number')(billingObj.taxAmount, 2) + ')'
              : '';
          $scope.invoiceGiftSum = taxAmount;
          return $filter('number')(billingObj.purchasedSum, 2);
        } else if (type === 'REFUND') {
          if (billingObj.giftSum) {
            var giftSum = trans('account_invocies_billings_gift') + ': (€ ' + $filter('number')(billingObj.giftSum, 2) + ')';
            $scope.invoiceGiftSum = giftSum;
            var final_amount = Math.abs(billingObj.purchasedSum + billingObj.giftSum);
            return '- ' + $filter('number')(final_amount, 2);
          }
          return '- ' + $filter('number')(Math.abs(billingObj.purchasedSum), 2);
        } else if (type === 'MANUAL_SERVICE') {
          return $filter('number')(billingObj.purchasedSum, 2);
        }
      };
    };

    $scope.getBalanceAfterBilling = function(billing) {
      var balanceAfterBilling = $filter('number')(billing.current_balance_after_billing, 2);
      return balanceAfterBilling;
    };

    $rootScope.$watch('currentLanguage', applyTranslations);
    $rootScope.$watch('isLangLoaded', applyTranslations);

    $scope.getDateDifference = function(created_at) {
      moment.locale($rootScope.currentLanguage);
      createdAt = moment(created_at);
      $scope.createdAtFormated = $filter('localDate')(moment(created_at));

      return createdAt.fromNow();
    };

    $scope.getBillingDetails = function(billingObj) {
      Restangular.one('billings/billing-details')
        .get({ date: billingObj.date })
        .then(function(data) {
          // console.log(data.resource.billings);

          var messages = data.resource.billings.messages;
          var snippets = data.resource.billings.snippets;

          console.log('messages :', messages);
          console.log('snippets :', snippets);

          CallBournModal.open(
            {
              scope: {
                messages: messages,
                snippets: snippets
              },
              templateUrl: '/app/modals/billings/billing-modal.html'
            },
            function(scope) {
              scope.close = function() {
                $state.go('snippet.overview');
                CallBournModal.close();
              };
            }
          );
        });
    };

    var updateBilings = function(billings) {
      $scope.billings = billings.resource.billings;
      $scope.billingsLength = billings.resource.count;
      $scope.billingsPage = billings.resource.page;
      $scope.billingsPagesCount = Math.ceil(billings.resource.count / 10);
      $scope.billingsPerPage = 10;
    };

    $scope.changeBillingsPage = function(page) {
      if (page < 0 || page > $scope.billingsPagesCount) {
        return;
      }
      var postData = $scope.filterData;
      postData.page = page - 1;
      Restangular.one('billings/billings')
        .get(postData)
        .then(function(data) {
          updateBilings(data);
          // console.log(data)
        });
    };

    updateBilings(billings);

    if ($rootScope.currentUser.is_autobilling_active) {
      var firstText = 'Autorecharge on Low Balance is enabled';
      var secondText = 'You will be always on!';
    } else {
      var firstText = 'Autorecharge on Low Balance is disabled';
      var secondText = 'Enable it to stay always on!';
    }

    var updateInvoices = function(invoicesToUpdate) {
      $scope.invoices = invoicesToUpdate.resource.invoices;
      $scope.invoicesLength = invoicesToUpdate.resource.count;
      $scope.invoicesPage = invoicesToUpdate.resource.page;
      $scope.invoicesPagesCount = Math.ceil(invoicesToUpdate.resource.count / 5);
      $scope.invoicesPerPage = 5;
    };

    var updateOrders = function(orders) {
      $scope.orders = orders.resource.invoices;
      $scope.ordersLength = orders.resource.count;
      $scope.ordersPage = orders.resource.page;
      $scope.ordersPagesCount = Math.ceil(orders.resource.count / 5);
      $scope.ordersPerPage = 5;
    };

    updateInvoices(invoices);
    updateOrders(orders);

    $scope.changeInvoicesPage = function(page) {
      if (page < 0 || page > $scope.invoicesPagesCount) {
        return;
      }
      var postData = $scope.filterData;
      postData.invoices_page = page - 1;
      Restangular.one('billings/invoices')
        .get(postData)
        .then(function(data) {
          updateInvoices(data);
        });
    };

    $scope.changeOrdersPage = function(page) {
      if (page < 0 || page > $scope.ordersPagesCount || page == $scope.ordersPage - 1) {
        return;
      }
      var postData = $scope.filterData;
      postData.orders_page = page - 1;
      Restangular.one('billings/orders')
        .get(postData)
        .then(function(data) {
          updateOrders(data);
        });
    };

    $scope.downloadInvoice = function(id) {
      Restangular.one('data/download-token')
        .get()
        .then(function(data) {
          var params = {
            token: data.resource.token,
            id: id
          };

          window.location.href = '/billings/download-invoice?' + $httpParamSerializer(params);
        });
    };

    $scope.selectpaymentMethod = function(type) {
      $scope.paymentMethod = type;
    };
  }
]);
