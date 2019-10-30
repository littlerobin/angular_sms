angular.module('callburnApp').controller('AffiliateController',
                 ['$scope', '$rootScope', '$state', 'Restangular', '$stateParams', 'growl', 'countries',
        function ($scope, $rootScope, $state, Restangular, $stateParams, growl, countries) {

        $rootScope.currentActiveUrl = $state.current.name;
        $rootScope.currentActiveRoute = 'affiliate';
        $scope.showNewTracker = false;
        $scope.selectedNav = 'trackers';
        $scope.payoutData = {};
        $scope.countries = countries.resource.countries;

        $scope.methods = {
            1: {
                value: 'paypal',
                text: 'Paypal'
            },
            2: {
                value: 'bankTransfer',
                text: $rootScope.trans('bank_transfer')
            },
            3: {
                value: 'bitcoin',
                text: 'Bitcoin'
            },
            4: {
                value: 'xrp',
                text: 'XRP'
            }
        };

        $scope.trackers = [
        	{
        		id: 1, 
        		name: 'Twitter', 
        		link: 'https://callburn.com/?ta=432fewEFWDSA', 
        		count: 2, 
        		earned: 0, 
        		showInfo: false,
        		users: [
        			{
        				email: 'andrea.lazzari@gmail.com',
        				vmCost: 0,
        				smsCost: 0
        			},
        			{
        				email: 'hakob.sharab@gmail.com',
        				vmCost: 0,
        				smsCost: 0
        			}
        		]
        	},
            {
                id: 2, 
                name: 'Facebook', 
                link: 'https://callburn.com/?ta=412fezEAFSSA', 
                count: 2, 
                earned: 0, 
                showInfo: false,
                users: [
                    {
                        email: 'AA.lazzari@gmail.com',
                        vmCost: 2,
                        smsCost: 3
                    },
                    {
                        email: 'BB.sharab@gmail.com',
                        vmCost: 5,
                        smsCost: 0
                    }
                ]
            }
        ]

        $scope.goToNewTracker = function() {
            $scope.showNewTracker = true;
        }

        $scope.createNewTracker = function(name) {
        	// POST request
        }

        $scope.showTrackerInfo = function(id) {
        	$scope.trackers.forEach(function(tracker) {
        		if (tracker.id === id) {
                    if (tracker.showInfo) {
                        tracker.showInfo = false;
                    } else {
                        tracker.showInfo = true;
                    }
                }
        	})
        }

        $scope.selectNav = function(part) {
            $scope.selectedNav = part;
        }

        $scope.setInputFocusCountry = function () {
            $scope.countryShow = true;
        };

}]);