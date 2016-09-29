'use strict';

// Declare app level module which depends on views, and components

angular.module('myApp', [
  'ngRoute',
  'myApp.domainsByAccesses',
  'myApp.domainsBySize',
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
  otherwise('/');

  $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
}])

.controller('home', function($http) {
  var self = this;
  
})

.controller('navigation',
  function($rootScope, $http, $location) {

          var self = this;

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
);