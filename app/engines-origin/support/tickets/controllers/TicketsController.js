angular.module('callburnApp').controller('TicketsController',
    ['$scope', '$rootScope', '$state', "$stateParams", 'Restangular', 'growl',
        function ($scope, $rootScope, $state, $stateParams, Restangular, growl) {
            $rootScope.currentActiveRoute = 'tickets';
            $rootScope.currentActiveUrl = 'tickets';
            $rootScope.showWhiteMenu = false;
            $rootScope.showFooter = false;
            $rootScope.showRegistration = false;
            $scope.createTicket = {};
            $scope.showSendForm = $stateParams.showSendForm;
            $scope.filterData={};
            $scope.replayMessage = {};


            /**
             * get tickets
             */
            $scope.index = function (params) {

                Restangular.one('tickets/tickets').get(params).then(function (data) {

                    $scope.selectedTicket = $scope. selectedTicket> 0 ? $scope.selectedTicket : 0;
                    $scope.tickets = data.resource.tickets;
                    $scope.currentTicket = $scope.tickets[$scope.selectedTicket];
                    // console.log(' $scope.tickets', data.resource.tickets);
                    $scope.replies = $scope.tickets[$scope.selectedTicket].replies;
                    $scope.page = $scope.page >= 0 ? $scope.page : 0;
                    $scope.maxPage = Math.ceil(data.resource.count / 5);
                    $scope.personalName = $rootScope.currentUser.personal_name;

                    console.log(' $scope.replies', $scope.replies);



                });
            };

            $scope.index({});



            /**
             * create new ticket
             */
            $scope.createNewTicket = function () {
                Restangular.all('tickets/create-ticket').post($scope.createTicket).then(function (data) {
                    $scope.createTicket = {};
                    growl.success(trans(data.resource.error.text));
                    $scope.index({});
                })
            }
            $scope.showSelectedTicket = function (id) {
                $scope.selectedTicket = id;
                $scope.currentTicket = $scope.tickets[id];
                $scope.replies = $scope.tickets[id].replies;
                $scope.showSendForm = false;
            }
            $scope.replayTicket = function (message) {

                var obj = {
                    ticket_id: $scope.currentTicket._id,
                    message: message
                };
                Restangular.all('tickets/reply-to-ticket').post(obj).then(function (data) {

                    $scope.index({});
                    $scope.replayMessage.text = null;
                });



            }
            $scope.closeTicket = function () {
                var obj = {
                    ticket_id: $scope.currentTicket._id
                };
                Restangular.all('tickets/close-ticket').post(obj).then(function (data) {
                    $scope.index({});
                    $scope.replayMessage.text = null;
                });

            }
            $scope.reopenTicket = function () {
                var obj = {
                    ticket_id: $scope.currentTicket._id
                };
                Restangular.all('tickets/reopen-ticket').post(obj).then(function (data) {
                    $scope.index({});
                    $scope.replayMessage.text = null;
                });

            }
            $scope.changePage = function (page) {
                if (page <= 0 || page >= $scope.maxPage) {
                    $scope.page = 0;
                } else {
                    $scope.page = page;
                }

                $scope.index({page:$scope.page});
            }
            $scope.filteredData=function () {
                $scope.index($scope.filterData);
            }
            $scope.filterTickets = function (status, checkbox) {
                if ("ALL" === status) {
                    $scope.filterData.status = "";
                    $scope.filterData.open = checkbox;
                    $scope.filterData.close = checkbox;
                }
                else if ("OPEN" === status) {
                    if (checkbox == true) {
                        $scope.filterData.status = status;
                        $scope.filterData.close = false;
                    } else {
                        $scope.filterData.status = "";
                    }
                }

                else if ("CLOSED" === status) {
                    if (checkbox == true) {
                        $scope.filterData.status = status;
                        $scope.filterData.open = false;
                    } else {
                        $scope.filterData.status = "";
                    }
                }
                else {
                    $scope.filterData.status = "";
                }
                $scope.index( $scope.filterData);

                if( !($scope.filterData.open == true &&  $scope.filterData.close == true)) {
                    $scope.filterData.all = false;
                }
            }

            $scope.checkSuportAnswer = function(index,userId,replies) {
                if(index == 0) {
                    return (replies[index].user_id != userId)? true : false;
                }

               return (replies[index].user_id != replies[index-1].user_id)? true : false;
            }



        }]);