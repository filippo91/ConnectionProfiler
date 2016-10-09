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
        $("#timeManager").hide();

        $scope.downloadList = downloadManager.getDownloads($routeParams.page,$routeParams.size);
        $scope.nRecords = $routeParams.page * $routeParams.size;
        $scope.succDownload = function() {
            $route.updateParams({page: parseInt($routeParams.page) + 1, size: $routeParams.size});
        };
        $scope.prevDownload = function() {
            if(parseInt($routeParams.page) > 0)
                $route.updateParams({page: parseInt($routeParams.page) - 1, size: $routeParams.size});
        };

        var privateSubscription = null;
        var socket = null;

        $scope.connectPrivate = function () {
            socket = new SockJS('http://localhost:8080/connectionProfiler/connection-profiler-websocket');
            var stompClient = Stomp.over(socket);
            stompClient.connect({}, function (frame) {
                console.log('Connected: ' + frame);
                privateSubscription = stompClient.subscribe('/user/' + $rootScope.user.name + '/downloads', function (packet) {
                    var download =JSON.parse(packet.body).payload;
                    $scope.downloadList.push(download);//{timestamp : download.timestamp, download_speed : download.download_speed});
                    console.log("pushato");
                    $scope.downloadList.sort(function (a, b) {return a.timestamp - b.timestamp;});
                    $scope.$apply();
                });
            });
        };

        $scope.disconnectPrivate = function(){
            if(privateSubscription != null){
                privateSubscription.unsubscribe();
                privateSubscription = null;
            }
        };
        $scope.$on('$destroy',function(){
            console.log(privateSubscription);
            if (privateSubscription != null) {
                privateSubscription.unsubscribe();
            }
        });

        function websocketCallback(scope){
            var download;
            scope.downloadList.push({timestamp : download.timestamp, download_speed : download.download_speed});
            downloadList.sort(function (a, b) {return a.timestamp - b.timestamp;});
        }
        /*
        console.log($rootScope.stompClient);
        this.connect = function connect() {
            $rootScope.stompClient.connect($rootScope.socket, function (frame) {
                console.log('Connected: ' + frame);
                $rootScope.stompClient.subscribe('/topic/downloads', function (download) {
                   console.log(download.body);
                });
            });
        }*/
}])
.factory('speedTable_downloadManager', ['$resource', function($resource) {
        var serverURI = "http://localhost:8080/connectionProfiler/speedTable/:page/:size";
        var factory = {};
        factory.getDownloads = function (page,size) {
            return $resource(serverURI).query({page: page, size: size}, function (downloadList) {
                //console.log("arrivate:"+ JSON.stringify(downloadList));
                downloadList.sort(function (a, b) {return a.timestamp - b.timestamp;});
                console.log(JSON.stringify(downloadList));
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