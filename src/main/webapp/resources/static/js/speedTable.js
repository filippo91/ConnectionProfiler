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
.factory('speedTable_downloadManager', ['$resource', 'REST_API_URLs', function($resource, api) {
        var serverURI = api.speedTable;
        
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
/*
 * Filter to get the resource name off a URL.
 */
.filter('resource',function(){
        return function(url){
        	var urlSplitted = url.split('/');
        	var resourceName;
        	if(urlSplitted.length > 0){
        		//get the last element of the array
        		resourceName = urlSplitted.pop();
        	}else{
        		//split unsuccessful, return the whole string
        		resourceName = urlSplitted;
        	}
        	
           return resourceName;
        };
})

.controller('speedTablePlotInfoController', ['plotsInfoService', function(plotsInfoService){
	var self = this;
	
	self.plotInfo = plotsInfoService.getInfo('speedTable');
}]);