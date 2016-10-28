'use strict';

var myAppUserProfile = angular.module('myApp.userProfile', ['ngRoute', 'ngResource'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/userProfile', {
    templateUrl: 'partials/restricted/userProfile.html',
    controller: 'userProfile',
    controllerAs: 'controller'
  });
}]);

myAppUserProfile.controller('userProfile', ['userFactory', 'providersFactory', '$rootScope', function(userFactory, providersFactory, $rootScope){
	$rootScope.enableChangeView = false;
	console.info("loading controller user profile");
	var self = this;
	
	self.user = userFactory.getUser();
	
	self.newProvider = {};
	
	self.providers = providersFactory.getSummary();
	self.subscriptions = providersFactory.getAllSubscriptions();
	
	self.addProvider = function(){
		console.info("add new provider");
		console.info(self.newProvider);
		var p = self.newProvider;
		providersFactory.addProvider(p);
//		self.subscriptions.push(p);
		self.newProvider = {};
		console.info(self.providers);
	};
	
}]);

myAppUserProfile.factory('userFactory', ['$resource', 'appURLs', function($resource, appURLs) {
	var userUrl = appURLs.root + appURLs.userDetails;
	var factory = {};
	
	var userResource =  $resource(userUrl);
	
	var userProfile = {};
	
	factory.getUser = function(){
		userProfile = userResource.get();
		return userProfile;
	};
	
	return factory;
}]);

myAppUserProfile.factory('providersFactory', ['$resource', 'REST_API_URLs', function($resource, api) {
	var self = this;
	var factory = {};

	var subscriptionsResource =  $resource(api.subscriptions);
	var subscriptionsSummaryResource =  $resource(api.subscriptionsSummary);
	
	self.providersSummary = subscriptionsSummaryResource.query();
	self.subscriptions = subscriptionsResource.query();
	
	factory.getSummary = function(){
		return self.providersSummary;
	};
	
	factory.getAllSubscriptions = function(){
		return self.subscriptions;
	};
	
	factory.addProvider = function(p){
		subscriptionsResource.save(p, function(p){
			subscriptionsSummaryResource.get({asnum: p.asnum})
			.$promise.then(function(summary) {
			      self.providersSummary.push(summary);
			      self.subscriptions.push(summary.providerPlan);
			      console.log(summary);
		    });;
		});
	};
	
	return factory;
}]);