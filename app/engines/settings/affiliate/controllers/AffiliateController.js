angular.module("callburnApp").controller("AffiliateController",["$scope","$rootScope","$state","$stateParams",function($scope,$rootScope,$state,$stateParams){$rootScope.currentActiveRoute="affiliate",$scope.trackers=[],$scope.firstTracker=!1,$scope.createFirstTracker=function(){$scope.firstTracker=!0}}]);