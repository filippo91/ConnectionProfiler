
'use strict';

// Declare app level module which depends on views, and components

angular.module('myApp', [
  'ngRoute',
  'myApp.speedGraph',
  'myApp.speedTable',
  'myApp.speedHistogram',
  'myApp.latency',
  'myApp.domainsByAccesses',
  'myApp.domainsBySize'
])

.constant("PUBLIC_PAGES", ['', 'login', 'register', 'confirmRegistration', 'speedGraph', 'speedHistogram'])

.config(['$locationProvider', '$routeProvider', '$httpProvider', function($locationProvider, $routeProvider, $httpProvider) {
  $locationProvider.hashPrefix('!');
/*
 * $routeProvider.when('/', { templateUrl : 'index.html', controller : 'home',
 * controllerAs: 'controller' });
 */
  $routeProvider.
  when('/login', {
    templateUrl : 'partials/public/login.html',
    controller : 'navigation',
    controllerAs: 'controller'
  }).
  when('/', {
    templateUrl : 'partials/public/home.html',
    controller : 'home',
    controllerAs: 'controller'
  }).
  when('/register', {
	    templateUrl : 'partials/public/register.html',
	    controller : 'register',
	    controllerAs: 'controller'
	  }).
	  when('/confirmRegistration', {
		    templateUrl : 'partials/public/confirmRegistration.html',
		    controller : 'confirmRegistration',
		    controllerAs: 'controller'
		  }).
  otherwise('/');

  $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
}])

.controller('home', function($rootScope, $http) {

        $("#timeManager").css("visibility","hidden");
        $("#realtimediv").css("visibility","hidden");
	
})

.controller('navigation',  function($rootScope, $http, $location, $route, $routeParams, PUBLIC_PAGES, $scope) {


        $("#timeManager").css("visibility","hidden");
        $("#realtimediv").css("visibility","hidden");

          var self = this;
          $rootScope.user = {};
          self.speedTableParams = {};
          self.speedTableParams.page = 0;
          self.speedTableParams.pageSize = 10;
          
          /////////////////
          
          $rootScope.rowUserDownloadList =[];
          $rootScope.rowPublicDownloadList =[];
          $rootScope.enableChangeView = false;
          
          $rootScope.currentDate = moment();
          
          /**
           * Functions for controlling time
           */
          $rootScope.changeView = function(ele){
              $(".view").removeClass("active");
              var currentParam = $routeParams;
              switch(ele) {
                  case 'weekBtn': currentParam.view = "week";  break;
                  case 'monthBtn': currentParam.view = "month";    break;
                  case 'monthsBtn': currentParam.view = "months";    break;
              }
              $route.updateParams(currentParam);
              $("#" + $routeParams.view + "Btn").addClass("active");

          };
          $rootScope.forward = function(){
        	  $rootScope.currentDate = moment().year($routeParams.year).month($routeParams.month).date($routeParams.day);
              switch($routeParams.view){
                  case "week":   $rootScope.currentDate.add(7,"days");  break;
                  case "month":   $rootScope.currentDate.add(1,"months"); break;
                  case "months": $rootScope.currentDate.add(3, "months"); break;
              }
              $route.updateParams({year : $rootScope.currentDate.year(), month : $rootScope.currentDate.month(), day : $rootScope.currentDate.date(), view : $routeParams.view});
          };
          $rootScope.back = function(){
        	  $rootScope.currentDate = moment().year($routeParams.year).month($routeParams.month).date($routeParams.day);
              switch($routeParams.view){
                  case "week":   $rootScope.currentDate.subtract(7,"days");  break;
                  case "month":   $rootScope.currentDate.subtract(1,"months"); break;
                  case "months": $rootScope.currentDate.subtract(3, "months"); break;
              }
              $route.updateParams({year : $rootScope.currentDate.year(), month : $rootScope.currentDate.month(), day : $rootScope.currentDate.date(), view : $routeParams.view});
          };
          $rootScope.today = function(){
        	  $rootScope.currentDate = moment();
              console.log($rootScope.currentDate.format("YYYY MM DD"));
              $route.updateParams({year : $rootScope.currentDate.year(), month : $rootScope.currentDate.month(), day : $rootScope.currentDate.date(), view : $routeParams.view});
          };
      $rootScope.isRelevant = function (download) {
          var time = moment(download.timestamp);
          var curDate_end = moment().year($routeParams.year).month($routeParams.month).date($routeParams.day);

          var curDate_start = moment(curDate_end);

          switch ($routeParams.view) {
              case "week":
                  curDate_start.subtract(7, "days");
                  break;
              case "month":
                  curDate_start.subtract(1, "months");
                  break;
              case "months":
                  curDate_start.subtract(3, "months");
                  break;
          }
          console.log(time.format('YYYY MM DD') +  " è prima di " + curDate_end.format('YYYY MM DD') + " dopo " + curDate_start.format('YYYY MM DD'));
          var ret = (time.isBefore(curDate_end) && curDate_start.isBefore(time));
          console.log(ret);
          return ret;
      };
      

          ////////////////
      $rootScope.socketConnected = true;
      connect();
      $rootScope.realtime = function(){
          console.log("ascasfdsadfsdafsdaf");
          $rootScope.socketConnected ? disconnect() : connect();
          console.log( "is conn: "+$rootScope.socketConnected );
      };
      function connect(){
          var socket = new SockJS('http://localhost:8080/connectionProfiler/connection-profiler-websocket');
          var stompClient = Stomp.over(socket);
          stompClient.connect({}, function (frame) {
              $rootScope.$apply(function(){$rootScope.socketConnected = true;});
              //
              if($rootScope.user.authenticated) {
                  $rootScope.privateSubscription = stompClient.subscribe('/user/' + $rootScope.user.name + '/downloads', function (packet) {
                      var download = JSON.parse(packet.body).payload;
                      if ($rootScope.websocketCallbackUser !== undefined) $rootScope.websocketCallbackUser(download);
                  });
              }
              $rootScope.publicSubscription = stompClient.subscribe('/topic/downloads', function (packet) {
                  var download =JSON.parse(packet.body).payload;
                  console.log("CHIAMO CALLBACK PUBLIC");
                  if($rootScope.websocketCallbackPublic !== undefined) $rootScope.websocketCallbackPublic(download);
              });
          });
      }
      function disconnect(){
          if($rootScope.privateSubscription != null){
              $rootScope.privateSubscription.unsubscribe();
              $rootScope.privateSubscription = null;
          }
          if($rootScope.publicSubscription != null){
              $rootScope.publicSubscription.unsubscribe();
              $rootScope.publicSubscription = null;
          }
          $rootScope.socketConnected = false;
      }

      ////////////////////////
          
          var authenticate = function(credentials, callback) {

            var headers = credentials ? {authorization : "Basic "
            + btoa(credentials.username + ":" + credentials.password)
            } : {};

            console.log(headers);

            $http.get('http://localhost:8080/connectionProfiler/user', {headers : headers}).then(function(response) {
              if (response.data.name) {
                $rootScope.authenticated = true;
                $rootScope.user.name = response.data.name;
              } else {
                $rootScope.authenticated = false;
                $rootScope.user.name = "";
              }
              callback && callback();
            }, function() {
              $rootScope.authenticated = false;
              $rootScope.user.name = "";
              callback && callback();
            });

          }

          authenticate();
          self.credentials = {};
          self.login = function() {
        	  console.log(self.credentials);
            authenticate(self.credentials, function() {
              if ($rootScope.authenticated) {
                $location.path("/");

                self.error = false;
              } else {
                $location.path("/login");
                self.error = true;
              }
            });
          };
          self.logout = function() {
            $http.post('http://localhost:8080/connectionProfiler/logout', {}).finally(function() {
              $rootScope.authenticated = false;
                disconnect();
              $location.path("/");
            });
          }
          
          //////////////////////////
          $rootScope.$on('$routeChangeStart', function (event, next, prev) {
        	  	console.info($location.path(), PUBLIC_PAGES);
              var thisPage = $location.path().split('/')[1];
              console.info(thisPage);
        	  	if(PUBLIC_PAGES.indexOf(thisPage) >= 0){
        	  		$rootScope.enableChangeView = false;
        	  	}else{
        	  		$rootScope.enableChangeView = true;
        	  	}
        	    if (!$rootScope.authenticated && PUBLIC_PAGES.indexOf(thisPage) < 0) {
        	    	event.preventDefault();
        	        $rootScope.$evalAsync(function() {
        	        	$location.path("/login");
        	        	$rootScope.enableChangeView = false;
        	        });
        	    	
        	    }

        	});

        })

.controller('register',
		function($rootScope, $http, $location) {
		        var self = this;
		self.user = {};
		self.user.username = "pippo";
		self.user.password = "";
		var createUser = function(user) { 
			console.log(self.user);
			$http.post('http://localhost:8080/connectionProfiler/newUser', user).then(function () {
				                        $location.path('/login');
				                    }, function(){
					$location.path('/');
				                        self.dataLoading = false;
				                    }
				                );
		}
		
		self.register = function() {
		       self.dataLoading = true;
				createUser(self.user);
		                
		        };
		    }
)
.controller('confirmRegistration',
		function($rootScope, $http, $location) {
		var self = this;
		self.token = "";
		var sendToken = function(token) { 
			$http.post('http://localhost:8080/connectionProfiler/newUser/confirmRegistration', token).then(function () {
				                        $location.path('/login');
				                    }, function(){
					$location.path('/');
				                        self.dataLoading = false;
				                    }
				                );
		}
		
		self.confirmRegistration = function() {
		       self.dataLoading = true;
				sendToken(self.token);
		                
		        };
		    }
)
    .filter('getAsnameList',function(){
        return function(input){
            var  ret = [];
            if(input.length === 0) return ret;
            input.forEach(function(download){
                if(ret.indexOf(download.asname) === -1)
                    ret[ret.length] = (download.asname);
            });
            return ret.sort(function(a,b){ return parseInt(a) > parseInt(b);});
        };
    });;