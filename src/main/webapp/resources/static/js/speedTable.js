'use strict';

angular.module('myApp.speedTable', ['ngRoute', 'ngResource'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/speedTable/:page/:size', {
    templateUrl: 'partials/restricted/speedTable.html',
    controller: 'speedTable',
      controllerAs: 'controller'
  });
}])

.controller('speedTable', ['$route', '$routeParams', 'speedTable_downloadManager', function($route, $routeParams, downloadManager) {
        $("#timeManager").hide();
        this.downloadList = downloadManager.getDownloads($routeParams.page,$routeParams.size);
        this.succDownload = function() {
            $route.updateParams({page: parseInt($routeParams.page) + 1, size: $routeParams.size});
        };
        this.prevDownload = function() {
            if(parseInt($routeParams.page) > 0)
                $route.updateParams({page: parseInt($routeParams.page) - 1, size: $routeParams.size});
        };
}])
.factory('speedTable_downloadManager', ['$resource', function($resource) {
        var serverURI = "http://169.254.84.99:8080/speedTable/:page/:size/";
        var factory = {};
        factory.getDownloads = function (page,size) {
            return $resource(serverURI).query({page: page, size: size}, function (downloadList) {
                //console.log("arrivate:"+ JSON.stringify(downloadList));
                downloadList.sort(function (a, b) {return a.timestamp - b.timestamp;});
            });
        };
        return factory;
}])
.filter('speedFormat',function(){
        return function(d){
            if (parseInt(d) > 1000 * 1000 * 1000) return "" + parseInt(parseInt(d) / (1000 * 1000 * 1000)) + " Gbps";
            if (parseInt(d) > 1000 * 1000) return "" + parseInt(parseInt(d) / (1000 * 1000)) + " Mbps";
            if (parseInt(d) > 1000) return "" + parseInt(parseInt(d) / 1000) + " Kbps";
            return "" + d;
        };
});