var msiofApp = angular.module('msiofApp', ['ui.bootstrap', 'angularMoment']).config(function($interpolateProvider){
		  $interpolateProvider.startSymbol('{[{').endSymbol('}]}');
});

msiofApp.controller('HomeCtrl', function ($scope) {
		  $scope.expandNavMenu = true;
});

msiofApp.directive('selectOnClick', function () {
		  return {
					 restrict: 'A',
					 link: function (scope, element, attrs) {
								element.on('click', function () {
										  this.select();
								});
					 }
		  };
});

msiofApp.controller('DashboardCtrl', function ($scope, $http, $interval) {
		  $scope.servers = {};
		  $scope.alerts = [];
		  $scope.filter = '';
		  $scope.sharedKey = '';
		  $scope.loaded = false;
		  $scope.showInstallInstructions = false;
		  $scope.sortBy = '+name';
		  $scope.expandAll = false;
		  $scope.deletedServerKeys = [];
		  $scope.expandedDisks = [];
		  $scope.expandedNets = [];

		  $scope.toggleExpandDisk = function(serverKey) {
					 if($scope.diskIsExpanded(serverKey)) {
								$scope.expandedDisks.splice(serverKey, 1);
					 } else {
								$scope.expandedDisks.push(serverKey);
					 }
		  };
		  
		  $scope.diskIsExpanded = function(serverKey) {
					 return ($scope.expandedDisks.indexOf(serverKey) !== -1);
		  };

		  $scope.toggleExpandNet = function(serverKey) {
					 if($scope.netIsExpanded(serverKey)) {
								$scope.expandedNets.splice(serverKey, 1);
					 } else {
								$scope.expandedNets.push(serverKey);
					 }
		  };
		  
		  $scope.netIsExpanded = function(serverKey) {
					 return ($scope.expandedNets.indexOf(serverKey) !== -1);
		  };

		  $scope.addAlert = function(msg, type) {
					 type = typeof type !== 'undefined' ? type : 'success';
					 $scope.alerts.push({'msg': msg, 'type': type});
		  };

		  $scope.closeAlert = function(index) {
					 $scope.alerts.splice(index, 1);
		  };

		  $scope.shareServer = function(serverKey) {
					 //@TODO: View stuff shouldn't be in JS
					 $scope.addAlert('Share this key with another MSIOF user: ' + serverKey, 'info');
		  };

		  $scope.sortOptions = [
					 { 
								'display': 'Name',
								'value': '+name'
					 },
					 { 
								'display': 'Issues',
								'value': '-hasIssues'
					 },
					 { 
								'display': 'Memory Usage',
								'value': '-mem.percentage.usage'
					 },
					 { 
								'display': 'CPU Usage',
								'value': '-cpu.percentage.usage'
					 },
					 { 
								'display': 'Disk Usage',
								'value': '-disk.percentage.usage'
					 },
					 { 
								'display': 'Network Usage',
								'value': '-network.total.totalkbps'
					 },
					 { 
								'display': 'Load Average',
								'value': '-system.loadavg'
					 },
		  ];

		  $scope.deleteServer = function(serverKey) {
					 $scope.deletedServerKeys.push(serverKey);
					 $http({
								method: 'DELETE',
								url: '/server/' + serverKey,
					 }).then(function(response) {
								if(response.success == false) {
										  $scope.addAlert('Failed to remove server', 'danger');
								} else {
										  $scope.addAlert('Successfully removed server', 'success');
										  $scope.updateServers();
								}
					 });
		  }

		  $scope.setSort = function(sortValue) {
					 $scope.sortBy = sortValue;
		  }

		  $scope.updateServers = function() {
					 $http({
								method: 'GET',
								url: '/servers/' + $scope.apiKey,
					 }).then(function(response){
								var data = response.data;
								$scope.servers = data;
								$scope.loaded = true;
					 });
		  };

		  $scope.apiKeyWatcher = $scope.$watch("apiKey", function(){
					 $scope.updateServers();
					 $interval(function() {
								$scope.updateServers();
					 }, 30000);
					 $scope.apiKeyWatcher();
		  });
});
