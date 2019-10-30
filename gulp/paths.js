module.exports = {
  bower: {
    backend: [
      "bower_components/jquery/dist/jquery.min.js",
      "bower_components/jquery-ui/jquery-ui.min.js",
      "bower_components/lodash/lodash.min.js",
      "bower_components/moment/min/moment-with-locales.min.js",
      "bower_components/moment-timezone/builds/moment-timezone-with-data.min.js",
      "bower_components/chosen/chosen.jquery.min.js",
      "bower_components/bootstrap/dist/js/bootstrap.min.js",
      "bower_components/angular/angular.js",
      "bower_components/angular-tooltips/dist/angular-tooltips.min.js",
      "bower_components/angular-animate/angular-animate.min.js",
      "bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js",
      "bower_components/restangular/dist/restangular.js",
      "bower_components/angular-ui-router/release/angular-ui-router.min.js",
      "bower_components/angular-file-upload/dist/angular-file-upload.min.js",
      "bower_components/oclazyload/dist/ocLazyLoad.min.js",
      "bower_components/angular-sanitize/angular-sanitize.min.js",
      "bower_components/angular-datepicker/dist/angular-datepicker.js",
      "bower_components/angular-rangeslider/angular.rangeSlider.js",
      "bower_components/moment-strftime/build/moment-strftime.min.js",
      "bower_components/angular-toArrayFilter/toArrayFilter.js",
      "bower_components/angular-ui-select/dist/select.js",
      "bower_components/angular-selectize.js/angular-selectize.js",
      "bower_components/angular-notify/dist/angular-notify.min.js",
      "bower_components/angular-modal-service/dst/angular-modal-service.min.js",
      "bower_components/angular-growl-v2/build/angular-growl.js",
      "bower_components/marked/lib/marked.js",
      "bower_components/angular-filter/dist/angular-filter.min.js",
      "bower_components/angular-marked/dist/angular-marked.js",
      "bower_components/angular-resource/angular-resource.js",
      "bower_components/angular-translate/angular-translate.js",
      "bower_components/angularjs-slider/dist/rzslider.min.js",
      "bower_components/fullcalendar/dist/fullcalendar.min.js",
      "bower_components/fullcalendar/dist/locale-all.js",
      "bower_components/angular-dragdrop/src/angular-dragdrop.js",
      "bower_components/angular-ui-calendar/src/calendar.js",
      "bower_components/angular-bootstrap-datetimepicker/src/js/datetimepicker.js",
      "bower_components/bootstrap-carousel-swipe/carousel-swipe.js",
      "bower_components/flickity/dist/flickity.pkgd.js",
      "bower_components/angular-flickity/dist/angular-flickity.js",
      "bower_components/angular-trix/dist/angular-trix.min.js",
      "bower_components/clipboard/dist/clipboard.min.js",
      "bower_components/ngclipboard/dist/ngclipboard.min.js",
      "bower_components/angular-jwt/dist/angular-jwt.min.js",
      "bower_components/ladda/dist/spin.min.js",
      "bower_components/ladda/dist/ladda.min.js",
      "bower_components/angular-ladda/dist/angular-ladda.min.js",
      "bower_components/ng-tags-input/ng-tags-input.min.js",
      "bower_components/angular-timezone-selector/dist/angular-timezone-selector.js",
      "bower_components/angularjs-datepicker/src/js/angular-datepicker.js",
      "libs/angularjs-dropdown-multiselect/src/angularjs-dropdown-multiselect.js",
      "bower_components/angular-bootstrap-toggle/dist/angular-bootstrap-toggle.js",
      "libs/intl-tel-input/build/js/intlTelInput.js",
      "bower_components/intl-tel-input/examples/js/defaultCountryIp.js",
      "bower_components/intl-tel-input/examples/js/isValidNumber.js",
      "bower_components/intl-tel-input/build/js/utils.js",
      "bower_components/humanize-duration/humanize-duration.js",
      "bower_components/slick-carousel/slick/slick.min.js",
      "bower_components/angular-slick-carousel/dist/angular-slick.min.js",
      "bower_components/card/dist/card.js",
      "bower_components/ng-droplet/dist/ng-droplet.min.js",
      "bower_components/jstimezonedetect/jstz.js",
      "node_modules/socket.io-client/dist/socket.io.js",
      "bower_components/chartist/dist/chartist.min.js",
      "bower_components/angular-loading-bar/build/loading-bar.min.js",

      "assets/callburn/*.js",
      "!assets/callburn/records/*.js",
      "app/directives/flex-calendar.js"
    ]
  },
  scss: {
    backend: [
      "assets/callburn/style/scss/app.scss",
      "bower_components/angular-bootstrap-datetimepicker/src/css/datetimepicker.css"
    ]
  },
  css: {
    backend: [
      "bower_components/ng-tags-input/ng-tags-input.min.css",
      "bower_components/chosen/chosen.min.css",
      "bower_components/angular-timezone-selector/dist/angular-timezone-selector.css",
      "bower_components/angularjs-datepicker/src/css/angular-datepicker.css",
      "bower_components/animate.css/animate.min.css",
      "bower_components/angular-bootstrap-toggle/dist/angular-bootstrap-toggle.css",
      "bower_components/intl-tel-input/build/css/intlTelInput.css",
      "bower_components/slick-carousel/slick/slick.css",
      "bower_components/slick-carousel/slick/slick-theme.css",
      "bower_components/chartist/dist/chartist.min.css",
      "bower_components/angular-tooltips/dist/angular-tooltips.min.css",
      "bower_components/angular-loading-bar/build/loading-bar.min.css",
    ]
  },
  fonts: {
    backend: {
      bootstrap: ["bower_components/bootstrap-sass/assets/fonts/bootstrap/*.*"],
      other: ["assets/callburn/fonts/*.*"]
    }
  },
  js: ["app/**/*.js", "app/*.js", "!app/app.js"],
  obfuscate: "assets/clickToCall/",
  browserify: {
    app: "app/app.js",
    env: "app/env.js"
  },
  /**
   * Lazy loader.
   */
  lazyLoader: {
    engines: [
      // account/controllers
      "app/engines-origin/account/checkout/controllers/CheckoutsController.js",
      "app/engines-origin/account/financials/controllers/FinancialsController.js",
      "app/engines-origin/account/invoices/controllers/InvoicesController.js",
      "app/engines-origin/account/settings/controllers/SettingsController.js",
      "app/engines-origin/account/success-payment/controllers/SuccessPaymentsController.js",
      "/app/engines-origin/account/affiliate/controllers/AffiliateController.js",
      // account/services
      "app/engines-origin/account/settings/services/SettingsService.js",
      /*===============================================================================================*/
      // addressbook/controllers
      "app/engines-origin/addressbook/contacts/controllers/ContactsController.js",
      "app/engines-origin/addressbook/export/controllers/ContactsExportController.js",
      "app/engines-origin/addressbook/groups/controllers/GroupsController.js",
      "app/engines-origin/addressbook/import/controllers/ContactsImportController.js",
      "app/engines-origin/addressbook/blacklist/controllers/BlacklistController.js",
      // addressbook/services
      "app/engines-origin/addressbook/contacts/services/ContactsService.js",
      "app/engines-origin/addressbook/groups/services/GroupsService.js",
      /*===============================================================================================*/
      // api/controllers
      "app/engines-origin/addressbook/api/settings/controllers/ApiSettingsController.js",
      /*===============================================================================================*/
      // campaign/controllers
      "app/engines-origin/campaign/add-template/controllers/AddAudioTemplateController.js",
      "app/engines-origin/campaign/batch/controllers/BatchesController.js",
      "app/engines-origin/campaign/batch/controllers/old_BatchesController.js",
      "app/engines-origin/campaign/compose/controllers/ComposeController.js",
      "app/engines-origin/campaign/compose/controllers/ComposeStep1Controller.js",
      "app/engines-origin/campaign/compose/controllers/ComposeStep2Controller.js",
      "app/engines-origin/campaign/compose/controllers/ComposeStep3Controller.js",
      "app/engines-origin/campaign/overview/controllers/MessagesOverviewController.js",
      "app/engines-origin/campaign/statistics/controllers/MessagesStatisticsController.js",
      "app/engines-origin/campaign/template/controllers/TemplatesController.js",
      // campaign/services
      "app/engines-origin/campaign/batch/services/BatchesService.js",
      "app/engines-origin/campaign/compose/services/CampaignComposeService.js",
      "app/engines-origin/campaign/compose/services/CampingService.js",
      "app/engines-origin/campaign/template/services/TemplateService.js",
      /*===============================================================================================*/
      // dashboard/controllers
      "app/engines-origin/dashboard/dashboard/controllers/DashboardController.js",
      "app/engines-origin/dashboard/tutorial/controllers/TutorialController.js",
      "app/engines-origin/dashboard/welcome/controllers/WelcomeController.js",
      /*===============================================================================================*/
      // snippet/controllers
      "app/engines-origin/snippet/crud/controllers/SnippetCRUDController.js",
      "app/engines-origin/snippet/overview/controllers/OverviewController.js",
      "app/engines-origin/snippet/statistics/controllers/StatisticsController.js",
      // snippet/services
      "app/engines-origin/snippet/services/SnippetCrudDataService.js",
      "app/engines-origin/snippet/services/SnippetServices.js",
      /*===============================================================================================*/
      // support/controllers
      "app/engines-origin/support/documentation/controllers/DocumentationController.js",
      "app/engines-origin/support/tickets/controllers/TicketsController.js",
      "app/engines-origin/support/videoTutorial/controllers/VideoTutorialController.js",
      /*===============================================================================================*/
      // user/controllers
      "app/engines-origin/user/controllers/AuthController.js",
      "app/engines-origin/user/controllers/UsersController.js",
      /*===============================================================================================*/
      // starter/controllers
      "app/engines-origin/starter/controllers/StarterController.js",
      /*===============================================================================================*/
      // conference/controllers
      "app/engines-origin/conference/create-conference-call/controllers/CreateConferenceController.js",
      "app/engines-origin/conference/overview/controllers/ConferenceOverviewController.js",
      // conference/services
      "app/engines-origin/conference/services/ConferenceServices.js"
    ]
  },
  lazyLoaderHtml: {
    engines: [
      // account
      "app/engines-origin/account/checkout/views/index.html",
      "app/engines-origin/account/financials/views/index.html",
      "app/engines-origin/account/settings/views/index.html",
      "app/engines-origin/account/success-payment/views/index.html",
      "app/engines-origin/account/invoices/views/index.html",
      "app/engines-origin/account/main.html",
      "/app/engines-origin/account/affiliate/views/index.html",
      /*===============================================================================================*/
      // addressbook
      "app/engines-origin/addressbook/contacts/views/index.html",
      "app/engines-origin/addressbook/contacts/views/includes/contacts.html",
      "app/engines-origin/addressbook/export/views/includes/export-contacts.html",
      "app/engines-origin/addressbook/groups/views/index.html",
      "app/engines-origin/addressbook/groups/views/includes/groups.html",
      "app/engines-origin/addressbook/import/views/import-contact.html",
      "app/engines-origin/addressbook/main.html",
      "app/engines-origin/addressbook/manu.html",
      "app/engines-origin/addressbook/blacklist/views/index.html",
      /*===============================================================================================*/
      // api
      "app/engines-origin/api/settings/views/index.html",
      "app/engines-origin/api/main.html",
      /*===============================================================================================*/
      // campaign
      "app/engines-origin/campaign/add-template/views/index.html",
      "app/engines-origin/campaign/batch/views/batch-step-1.html",
      "app/engines-origin/campaign/batch/views/batch-step-2.html",
      "app/engines-origin/campaign/batch/views/batch-step-3.html",
      "app/engines-origin/campaign/batch/views/index-optimal.html",
      "app/engines-origin/campaign/batch/modals/batch-send-screen",
      "app/engines-origin/campaign/compose/views/compose-step-1.html",
      "app/engines-origin/campaign/compose/views/compose-step-2.html",
      "app/engines-origin/campaign/compose/views/compose-step-3.html",
      "app/engines-origin/campaign/compose/views/index-optimal.html",
      "app/engines-origin/campaign/overview/views/index.html",
      "app/engines-origin/campaign/statistics/views/index.html",
      "app/engines-origin/campaign/template/views/index.html",
      "app/engines-origin/campaign/includes/iframe-tutorial.html",
      "app/engines-origin/campaign/includes/menu.html",
      "app/engines-origin/campaign/main.html",
      /*===============================================================================================*/
      // dashboard
      "app/engines-origin/dashboard/dashboard/views/index.html",
      "app/engines-origin/dashboard/tutorial/views/index.html",
      "app/engines-origin/dashboard/welcome/views/welcome.html",
      "app/engines-origin/dashboard/main.html",
      /*===============================================================================================*/
      // snippet
      "app/engines-origin/snippet/crud/views/index.html",
      "app/engines-origin/snippet/overview/views/index.html",
      "app/engines-origin/snippet/statistics/views/index.html",
      "app/engines-origin/snippet/includes/iframe-tutorial.html",
      "app/engines-origin/snippet/includes/menu.html",
      "app/engines-origin/snippet/main.html",
      /*===============================================================================================*/
      // support
      "app/engines-origin/support/documentation/views/index.html",
      "app/engines-origin/support/tickets/views/index.html",
      "app/engines-origin/support/videoTutorial/views/index.html",
      "app/engines-origin/support/main.html",
      "app/engines-origin/support/menu.html",
      /*===============================================================================================*/
      // user
      "app/engines-origin/user/views/edit-account.html",
      "app/engines-origin/user/views/login.html",
      "app/engines-origin/user/views/registration.html",
      /*===============================================================================================*/
      // starter
      "app/engines-origin/starter/views/index.html",
      /*===============================================================================================*/
      // conference/views
      "app/engines-origin/conference/create-conference-call/views/index.html",
      "app/engines-origin/conference/overview/views/index.html"
    ]
  },
  modals: [
    "app/modals-origin/main/primarily-modal.html",
    "app/modals-origin/access/user-deactivated.html",
    "app/modals-origin/addressbook_modal/add-group.html",
    "app/modals-origin/addressbook_modal/add-modal.html",
    "app/modals-origin/addressbook_modal/addGroup.html",
    "app/modals-origin/addressbook_modal/frineds-modal.html",
    "app/modals-origin/addressbook_modal/qr-import.html",
    "app/modals-origin/api/api-modal.html",
    "app/modals-origin/api/show-key.html",
    "app/modals-origin/billings/billing-modal.html",
    "app/modals-origin/campaign-statistics/show-attemps-modal.html",
    "app/modals-origin/campaign-statistics/confirm.html",
    "app/modals-origin/campaign-statistics/mark-unmark.html",
    "app/modals-origin/campaign-overview/reuse-campaign-modal.html",
    "app/modals-origin/camping-batch/activate-callback.html",
    "app/modals-origin/camping-batch/activate-callback-template.html",
    "app/modals-origin/camping-batch/activate-do-not-call-template.html",
    "app/modals-origin/camping-batch/activate-replay.html",
    "app/modals-origin/camping-batch/activate-replay-template.html",
    "app/modals-origin/camping-batch/activate-transfer.html",
    "app/modals-origin/camping-batch/activate-transfer-template.html",
    "app/modals-origin/camping-batch/add-schedule.html",
    "app/modals-origin/camping-batch/change-caller-id.html",
    "app/modals-origin/camping-batch/change-message-delivery-speed.html",
    "app/modals-origin/camping-batch/change-repeat-count.html",
    "app/modals-origin/camping-batch/chnage-caller-id.html",
    "app/modals-origin/camping-batch/confirm-interactions.html",
    "app/modals-origin/camping-batch/confirm-tts.html",
    "app/modals-origin/camping-batch/dijit-choosen.html",
    "app/modals-origin/camping-batch/manage-phonenumbers-edit.html",
    "app/modals-origin/camping-batch/schedulation-modal.html",
    "app/modals-origin/camping-batch/schedulation-modal-old2.html",
    "app/modals-origin/camping-batch/schedule-notification.html",
    "app/modals-origin/camping-batch/send-preview.html",
    "app/modals-origin/camping-batch/show-repiteation-count-confirm.html",
    "app/modals-origin/camping-batch/show-shcdulation-confirm.html",
    "app/modals-origin/camping-batch/show-shcdulation-confirm-with-out-repitation.html",
    "app/modals-origin/camping-batch/show-shcdulation-confirm-with-repitation.html",
    "app/modals-origin/camping-batch/voice-message-save.html",
    "app/modals-origin/camping-batch/voice-message-sent.html",
    "app/modals-origin/camping-batch/retry-undelivered.html",
    "app/modals-origin/clickToCall/confirm_snippet_creation_1.html",
    "app/modals-origin/clickToCall/confirm_snippet_creation_2.html",
    "app/modals-origin/clickToCall/holiday_mode.html",
    "app/modals-origin/clickToCall/low-balance.html",
    "app/modals-origin/clickToCall/show-all-attemps-modal.html",
    "app/modals-origin/confirm/confirm-delete.html",
    "app/modals-origin/confirm/confirm-unsaved.html",
    "app/modals-origin/confirm/confirm-save-snippet.html",
    "app/modals-origin/confirm/delete-account.html",
    "app/modals-origin/create-campaign/callback.html",
    "app/modals-origin/create-campaign/contacts.html",
    "app/modals-origin/create-campaign/do-not-call.html",
    "app/modals-origin/create-campaign/send-later.html",
    "app/modals-origin/create-campaign/transfer.html",
    "app/modals-origin/edit-account/edit-email.html",
    "app/modals-origin/edit-account/edit-password.html",
    "app/modals-origin/edit-account/make-payment.html",
    "app/modals-origin/edit-account/remove-number-confirmation.html",
    "app/modals-origin/financials/add-new-card.html",
    "app/modals-origin/financials/add-new-card-delete.html",
    "app/modals-origin/financials/success-payment-modal.html",
    "app/modals-origin/financials/pending-order-sucess.html",
    "app/modals-origin/financials/delete-pending-order.html",
    "app/modals-origin/front-modal/login-modal.html",
    "app/modals-origin/front-modal/pravicy-modal.html",
    "app/modals-origin/front-modal/recovery-modal.html",
    "app/modals-origin/front-modal/registration-modal.html",
    "app/modals-origin/front-modal/terms-modal.html",
    "app/modals-origin/settings/edit-profile-modal.html",
    "app/modals-origin/settings/settings-modal.html",
    "app/modals-origin/templates/templates.html",
    "app/modals-origin/video/video.html",
    "app/modals-origin/camping-batch/confirm-playback.html",
    "app/modals-origin/campaign-export/campaign-export.html",
    "app/modals-origin/addressbook_modal/add-blacklist.html"
  ]
};
