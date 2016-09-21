'use strict';

angular.module('myApp.domainsBySize', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/domainsBySize/:year/:month/:day', {
    templateUrl: 'partials/public/domainsBySize.html',
    controller: 'domainsBySize'
  });
}])

.controller('domainsBySize', [function() {

}]);