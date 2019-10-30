var dependencies = [
  "ngSanitize",
  "ui.router",
  "restangular",
  "angularFileUpload",
  "oc.lazyLoad",
  "datePicker",
  "ui-rangeSlider",
  "720kb.tooltips",
  "angular-timezone-selector",
  "ui.select",
  "ngAnimate",
  "cgNotify",
  "angularModalService",
  "ui.bootstrap",
  "angular-growl",
  "hc.marked",
  "ngResource",
  "pascalprecht.translate",
  "rzModule",
  "ngDragDrop",
  "ui.calendar",
  "ui.bootstrap.datetimepicker",
  "bc.Flickity",
  "selectize",
  "angular-toArrayFilter",
  "ngclipboard",
  "angular-jwt",
  "ui.tinymce",
  "angular-ladda",
  "ngTagsInput",
  "720kb.datepicker",
  "angularjs-dropdown-multiselect",
  "ui.toggle",
  "ngIntlTelInput",
  "slickCarousel",
  "angular-loading-bar"
];

var frontDependencies = [
  "ngSanitize",
  "ui.router",
  "restangular",
  "oc.lazyLoad",
  "ui.select",
  "ngAnimate",
  "ui.bootstrap",
  "angular-growl",
  "hc.marked",
  "ngResource",
  "cgNotify",
  "pascalprecht.translate",
  "rzModule",
  "ngDragDrop",
  "ui.calendar",
  "bc.Flickity",
  "selectize",
  "angular-toArrayFilter"
];
window.translate = {};

//config
require("./config/config.js");

//authenticated application
angular
  .module("callburnApp", dependencies)

  //filters
  .filter("removeFirstPart", require("./filters/removeFirstPart"))
  .filter("range", require("./filters/range"))
  .filter("localDate", require("./filters/localDate"))
  .filter("audioDuration", require("./filters/audioDuration"))
  .filter("callRoutesFilter", require("./filters/callRoutesFilter"))

  //directives
  .directive("callburnSelect", require("./directives/callBurnSelect"))
  .directive("callModal", require("./directives/callModal"))
  .directive("videoModal", require("./directives/videoModal"))
  .directive("noteBox", require("./directives/NoteBox"))
  .directive(
    "callerIdTimezoneChecker",
    require("./directives/callerIdTimezoneChecker")
  )
  .directive("itemCounterPerPage", require("./directives/itemCounterPerPage"))

  //factories
  .factory("CallBournModal", require("./factory/CallburnModal"))
  .factory("CallBournScrollTop", require("./factory/ScrollTo"))
  .factory("LanguageControl", require("./factory/LanguageControl"))
  .factory("IconsControl", require("./factory/IconsControl"))

  //routes
  .config(require("./bootstrap/routes"))
  //notifications
  .config(require("./config/notifications"))
  .config(require("./config/markdown"))
  .config(require("./config/flex-calendar"))
  .config(function(RestangularProvider) {
    RestangularProvider.setBaseUrl(window.baseUrl);
    RestangularProvider.setDefaultHeaders({
      JWTAuthorization: "Bearer " + localStorage.getItem("jwtToken"),
      "X-Requested-With": "XMLHttpRequest"
    });
  })

  .config([
    "tooltipsConfProvider",
    function configConf(tooltipsConfProvider) {
      tooltipsConfProvider.configure({
        smart: true,
        size: "small",
        speed: "slow",
        tooltipTemplateUrlCache: true
        //etc...
      });
    }
  ])

  .config([
    "cfpLoadingBarProvider",
    function(cfpLoadingBarProvider) {
      cfpLoadingBarProvider.includeBar = true;
    }
  ])

  .config(function(ngIntlTelInputProvider) {
    ngIntlTelInputProvider.set({
      autoPlaceholder: "aggressive",
      initialCountry: "auto",
      // onlyCountries: ['es',
      //                 'it',
      //                 'am',
      //                 'au',
      //                 'us',
      //                 'gb',
      //                 'se',
      //                 'pl',
      //                 'pt',
      //                 'ro',
      //                 'dk',
      //                 'gr',
      //                 'my',
      //                 'bg',
      //                 'lu',
      //                 'lt',
      //                 'mt',
      //                 'is',
      //                 'lv',
      //                 'ee',
      //                 'fr',
      //                 'no',
      //                 'nl',
      //                 'fi',
      //                 'de',
      //                 'hu',
      //                 'ie'],
      utilsScript: "bower_components/intl-tel-input/build/js/utils.js",
      geoIpLookup: function(callback) {
        $.get("https://ipinfo.io", function() {}, "jsonp").always(function(
          resp
        ) {
          var countryCode = resp && resp.country ? resp.country : "";
          callback(countryCode);
        });
      },
      customPlaceholder: function(
        selectedCountryPlaceholder,
        selectedCountryData
      ) {
        sessionStorage.setItem("dial", selectedCountryData.dialCode);
        return (
          "+ " +
          sessionStorage.getItem("dial") +
          " " +
          selectedCountryPlaceholder
        );
      }
    });
  })

  //run
  .run(require("./config/run"))

  .config(function(growlProvider) {
    growlProvider.globalTimeToLive(3000);
  });

require("./bootstrap/controllers");
