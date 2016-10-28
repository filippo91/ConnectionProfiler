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
	
	$scope.downloadList = downloadManager.getDownloads($routeParams.page, $routeParams.size);
	
	$scope.totalItems = $rootScope.tableListSize;
	$scope.currentPage = parseInt($routeParams.page) + 1;
	$scope.maxSize = 3;
	$scope.setPage = function (pageNo) {
	$scope.currentPage = pageNo;
		console.log("ciaone");
	};
	
	$scope.pageChanged = function() {
		console.log('Page changed to: ' + $scope.currentPage);
		$route.updateParams({page: $scope.currentPage-1, size: $routeParams.size});
	};
	
    
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
        	console.log(download);
        	//update current view
        	if($scope.currentPage == 1){
        		$scope.$apply(function(){
        			$scope.downloadList.download.unshift(download);	
            		$scope.downloadList.download.pop();
        		});
        	}
        	//update saved downloads
        	downloadManager.updateDownloads(download);
        };
}])
.factory('speedTable_downloadManager', ['$resource', 'REST_API_URLs', '$rootScope', function($resource, api, $rootScope) {
        var serverURI = api.speedTable;
        var factory = {};
        var self = this;
        self.downloadsList = [];
        self.pages = [];
     
        $rootScope.tableListSize = 0;
        
        factory.updateDownloads = function(download){
        	self.downloadsList.unshift(download);
        	$rootScope.tableListSize += 1;
        }
        
        factory.getDownloads = function (page,size) {   
        	size = parseInt(size);
        	if(self.pages.indexOf(page) > 0){
        		var indexStart = page * size;
	        	var indexEnd = indexStart + size;
	        	var data = [];
	        	self.downloadsList.slice(indexStart, indexEnd).forEach( 
						function(item){
							console.log(item);
							data.push(item);
						}); 
	        	self.pages.push(page);
	        	return data;
        	}
        	
        	return $resource(serverURI, null, 
        			{
        				'query':{
        					method: 'GET',
        					isArray: false
        				}
        			}
        				).query({page: page, size: size}, function (list) {

				list.download.forEach( 
    					function(item, idx){
    						self.downloadsList[page*size + idx] = item;
    					});
				$rootScope.tableListSize = list.totalElements;
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