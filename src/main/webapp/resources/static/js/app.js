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

.controller('home', function($http) {
  var self = this;
  
})

.controller('navigation',
  function($rootScope, $http, $location, $route, $routeParams) {

          var self = this;

          /////////////////
          
          $rootScope.rowUserDownloadList =[];
          $rootScope.rowPublicDownloadList =[];

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
              var curDate = moment().year($routeParams.year).month($routeParams.month).date($routeParams.day);
              console.log(curDate.format("YYYY MM DD"));
              switch($routeParams.view){
                  case "week":   curDate.add(7,"days");  break;
                  case "month":   curDate.add(1,"months"); break;
                  case "months": curDate.add(3, "months"); break;
              }
              $route.updateParams({year : curDate.year(), month : curDate.month(), day : curDate.date(), view : $routeParams.view});
          };
          $rootScope.back = function(){
              var curDate = moment().year($routeParams.year).month($routeParams.month).date($routeParams.day);
              console.log(curDate.format("YYYY MM DD"));
              switch($routeParams.view){
                  case "week":   curDate.subtract(7,"days");  break;
                  case "month":   curDate.subtract(1,"months"); break;
                  case "months": curDate.subtract(3, "months"); break;
              }
              $route.updateParams({year : curDate.year(), month : curDate.month(), day : curDate.date(), view : $routeParams.view});
          };

              self.currentDate = moment();

          ////////////////
          
          var authenticate = function(credentials, callback) {

            var headers = credentials ? {authorization : "Basic "
            + btoa(credentials.username + ":" + credentials.password)
            } : {};

            console.log(headers);

            $http.get('http://localhost:8080/connectionProfiler/user', {headers : headers}).then(function(response) {
              if (response.data.name) {
                $rootScope.authenticated = true;
              } else {
                $rootScope.authenticated = false;
              }
              callback && callback();
            }, function() {
              $rootScope.authenticated = false;
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
              $location.path("/");
            });
          }

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
);