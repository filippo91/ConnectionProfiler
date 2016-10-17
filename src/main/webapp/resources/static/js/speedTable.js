'use strict';

angular.module('myApp.speedTable', ['ngRoute', 'ngResource'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/speedTable/:page/:size', {
    templateUrl: 'partials/restricted/speedTable.html',
    controller: 'speedTable',
      controllerAs: 'controller'
  });
}])

.controller('speedTable', ['$route', '$routeParams', 'speedTable_downloadManager', '$rootScope', '$scope', function($route, $routeParams, downloadManager, $rootScope, $scope) {

	$rootScope.enableChangeView = false;
	
        $scope.downloadList = downloadManager.getDownloads($routeParams.page,$routeParams.size);
        $scope.nRecords = $routeParams.page * $routeParams.size;
        $scope.succDownload = function() {
            $route.updateParams({page: parseInt($routeParams.page) + 1, size: $routeParams.size});
        };
        $scope.prevDownload = function() {
            if(parseInt($routeParams.page) > 0)
                $route.updateParams({page: parseInt($routeParams.page) - 1, size: $routeParams.size});
        };
        /**
         * Web Socket callbacks
         */
        $rootScope.websocketCallbackUser = function (download) {
            $scope.downloadList.unshift(download);
            $scope.$apply();
        };
        $rootScope.websocketCallbackPublic = function(download){};
}])
.factory('speedTable_downloadManager', ['$resource', function($resource) {
        var serverURI = "http://localhost:8080/connectionProfiler/speedTable/:page/:size";
        var factory = {};
        factory.getDownloads = function (page,size) {
            return $resource(serverURI).query({page: page, size: size}, function (downloadList) {
                //console.log("arrivate:"+ JSON.stringify(downloadList));
                //downloadList.sort(function (a, b) {return a.timestamp - b.timestamp;});
                console.log(JSON.stringify(downloadList));
            });
        };
        return factory;
}])
.filter('speedFormat',function(){
        return function(d){
            if (parseInt(d) > 1000 * 1000 * 1000) return "" + parseFloat(parseInt(d) / (1000 * 1000 * 1000)).toFixed(2) + " Gbps";
            if (parseInt(d) > 1000 * 1000) return "" + parseFloat(parseInt(d) / (1000 * 1000)).toFixed(2) + " Mbps";
            if (parseInt(d) > 1000) return "" + parseFloat(parseInt(d) / 1000).toFixed(2) + " Kbps";
            return "" + d;
        };
})
.controller('speedTablePlotInfoController', ['plotsInfoService', function(plotsInfoService){
	var self = this;
	
	self.plotInfo = plotsInfoService.getInfo('speedTable');
}]);