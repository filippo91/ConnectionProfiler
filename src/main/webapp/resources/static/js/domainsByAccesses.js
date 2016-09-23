'use strict';

angular.module('myApp.domainsByAccesses', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/domainsByAccesses/:year/:month/:day', {
    templateUrl: 'partials/restricted/domainsByAccesses.html',
    controller: 'domainsByAccesses'
  });
}])

.controller('domainsByAccesses', [function() {

}]);