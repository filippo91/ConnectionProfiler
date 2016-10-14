'use strict';

angular.module('myApp.userProfile', ['ngRoute', 'ngResource'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/userProfile', {
    templateUrl: 'partials/restricted/userProfile.html',
    controller: 'userProfile',
    controllerAs: 'controller'
  });
}])

.controller('userProfile', ['quotesFactory', function(quotesFactory){
	console.info("loading controller user profile");
	var self = this;
	self.test = "hi there!";
	self.qod = quotesFactory.getQoq();
	self.user = {};
	
}])

.factory('quotesFactory', ['$resource', function($resource) {
	var factory = {};
	
	factory.getQoq = function(){
		return "'The best preparation for tomorrow is doing your best today.', H. Jackson Brown, Jr.";
	}
	
	/* we need to subscribe
	var qodUrl = 'http://quotes.rest/qod.json';
	
	
	var QodResource =  $resource(qodUrl);
	var Qod = undefined;
	
	factory.getQoq = function(){
		 
		if(Qod === undefined){
			Qod = QodResource.get();
		}
		return Qod;
	};
	*/
	return factory;
}])

.factory('userFactory', ['$resource', function($resource) {
	var userUrl = "http://localhost:8080/connectionProfiler/user";
	var factory = {};
	
	var userResource =  $resource(userUrl);
	var User = undefined;
	
	factory.getUser = function(){
		if(User === undefined){
			User = userResource.get();
		}
		return User;
	};
	
	return factory;
}]);