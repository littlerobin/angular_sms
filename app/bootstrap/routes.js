module.exports = function ($stateProvider, $urlRouterProvider) {

    if (window.optimizeLazyLoader) {

        console.warn('optimal');
        require("../engines-origin/starter/routes-optimal")($stateProvider);
        require("../engines-origin/account/routes-optimal")($stateProvider);
        require("../engines-origin/addressbook/routes-optimal")($stateProvider);
        require("../engines-origin/snippet/routes-optimal")($stateProvider);
        require("../engines-origin/api/routes-optimal")($stateProvider);
        require("../engines-origin/campaign/routes-optimal")($stateProvider);
        require("../engines-origin/support/routes-optimal")($stateProvider);
        // require("../engines-origin/conference/routes-optimal")($stateProvider);

    } else {

        console.warn('not optimal');
        require("../engines-origin/starter/routes")($stateProvider);
        require("../engines-origin/account/routes")($stateProvider);
        require("../engines-origin/addressbook/routes")($stateProvider);
        require("../engines-origin/snippet/routes")($stateProvider);
        require("../engines-origin/api/routes")($stateProvider);
        require("../engines-origin/campaign/routes")($stateProvider);
        require("../engines-origin/support/routes")($stateProvider);
        // require("../engines-origin/conference/routes")($stateProvider);

    }

    $urlRouterProvider.otherwise('/campaign/overview/');
};
