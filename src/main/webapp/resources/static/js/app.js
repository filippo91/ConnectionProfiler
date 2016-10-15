
'use strict';

// Declare app level module which depends on views, and components

angular.module('myApp', [
  'ngRoute',
  'myApp.speedGraph',
  'myApp.speedTable',
  'myApp.speedHistogram',
  'myApp.latency',
  'myApp.domainsByAccesses',
  'myApp.domainsBySize',
  'myApp.userProfile'
])

.constant("PUBLIC_PAGES", ['', 'login', 'register', 'confirmRegistration', 'speedGraph', 'speedHistogram'])

.config(['$locationProvider', '$routeProvider', '$httpProvider', function($locationProvider, $routeProvider, $httpProvider) {
  $locationProvider.hashPrefix('!');
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
	$rootScope.enableChangeView = false;
	
})

.controller('navigation',  function($rootScope, $http, $location, $route, $routeParams, PUBLIC_PAGES, $scope) {
		/* 
		 * Global variable used to show/hide the time navigation bar.
		 * Set it to true in your controller, if you want show that bar in your view. 
		 * */
		$rootScope.enableChangeView = false;
		
		/* Global variable holding user details */ 
		$rootScope.user = {};
	
		/* Instance variables */
		
		var self = this;
		
		/*
		 * They hold the start and end date of the timespan to show
		 */
		self.startDate = moment().startOf('week');
		/* compute and set end date */
        self.endDate = computeEndDate(self.startDate.clone(), 'week');
        
		/*
		 * Holds the current view type: {'week', 'month', 'year'} 
		 * initialize it using route params
		 */
		self.activeView = {};
		self.activeView.view = 'week';
		setActiveViewDate(self.startDate, self.endDate);		
		
		/* URL speedTable View Params */
        self.speedTableParams = {};
        self.speedTableParams.page = 0;
        self.speedTableParams.pageSize = 10;
		
        /* Bin Width Params */
        self.BIN_SELECTOR_PAGES = ['speedHistogram', 'latency'];
        //holds the current bin selector, either latency or speedHistogram
        self.binSelector = null; 
        
        self.latencyBin = {};
        self.latencyBin.MIN_WIDTH = 20;
        self.latencyBin.MAX_WIDTH = 400;
        self.latencyBin.STEP = 20;
        self.latencyBin.width = 200;
        
        self.speedHistogramBin = {};
        self.speedHistogramBin.MIN_WIDTH = 20;
        self.speedHistogramBin.MAX_WIDTH = 400;
        self.speedHistogramBin.STEP = 20;
        self.speedHistogramBin.width = 200;
        
        /* Time Manager Visualization logic */
        self.TIME_MANAGER_PAGES = ['speedGraph', 'pieAccesses', 'domainsBySize', 'speedHistogram', 'latency'];
        self.timeManager = false;
        
        /* public methods */
        
        /*
         * update (start, end dates) and route parameters
         * in order to change the view
         * view : (week, month, months)
         */
	    self.changeActiveView = function(view){
			self.activeView.view = view;
			// update end date according with the new view type
			self.endDate = computeEndDate(self.startDate.clone(), view);
			setActiveViewDate(self.startDate, self.endDate);

	    	var currentParam = $routeParams;
	    	if(self.binWidthSelector == null){
	    		$route.updateParams({year : self.activeView.year, month : self.activeView.month, day : self.activeView.day, view : view});
	    	}else{
	    		$route.updateParams({year : self.activeView.year, month : self.activeView.month, day : self.activeView.day, view : view, bin_width : self.binSelector.width});
	    		console.info($routeParams);
	    	}  
        };        
        
    	/* 
    	 * move timespan back and forward according 
    	 * with the direction input parameter 
    	 * direction : (backward, forwars, today) 
    	 * 
    	*/
        self.move = function(direction){
	        var view = self.activeView.view;
	        if(direction == 'today'){
	        	self.startDate = moment().startOf('week');
	        }else{
	        	self.startDate = computeStartDate(self.startDate.clone(), view, direction); 
	        }
	    	self.endDate = computeEndDate(self.startDate.clone(), view);
	    	setActiveViewDate(self.startDate, self.endDate);
	    	
	    	var currentParam = $routeParams;
	    	if(self.binWidthSelector == null){
	    		$route.updateParams({year : self.activeView.year, month : self.activeView.month, day : self.activeView.day, view : view});
	    	}else{
	    		$route.updateParams({year : self.activeView.year, month : self.activeView.month, day : self.activeView.day, view : view, bin_width : self.binWidthSelector});
	    		console.info($routeParams);
	    	}
        };
        
        /*
         * event handler to change the bin size where it's possible.
         * Trigger update parameters.
         */
        self.changeBinSize = function($event){  
        	var btn = $event.currentTarget.id === 'btn-bin-plus' ? 1 : -1;
        
        	if(btn < 0 && self.binSelector.width <= self.binSelector.MIN_WIDTH){
        		return;
        	}
        	if(btn > 0 && self.binSelector.width >= self.binSelector.MAX_WIDTH){
        		return;
        	}
        	
        	self.binSelector.width += (self.binSelector.STEP * btn); 
        	
        	$route.updateParams({year : self.activeView.year, month : self.activeView.month, day : self.activeView.day, view : self.activeView.view, bin_width : self.binSelector.width});
        };
        
        /*
         * Basic navigation logic to enable part of the logic or the access to 
         * 'private' pages.
         * 
         * PUBLIC_PAGES list is a predefined application constant that 
         * holds the name of the pages that are meant to be publicly available.
         * 
         * BIN_SELECTOR_PAGES contains the pages that needs a bin selector
         * input field.
         * 
         * TIME_MANAGER_PAGES lists the pages that needs a time manager 
         * bar to navigate the plots.
         * 
         */
        $rootScope.$on('$routeChangeStart', function (event, next, prev) {
      	  var pagePrefix = null;
      	  var thisPageUrl = $location.url();
      	  var thisPageUrlSplitted = thisPageUrl.split('/');
      	  
      	  if(thisPageUrlSplitted.length > 1){
      		  pagePrefix = thisPageUrlSplitted[1];
      	  }else{
      		  pagePrefix = thisPageUrlSplitted[0];
      	  }
      	  
      	  	console.info(pagePrefix, PUBLIC_PAGES);
      	  	
      	    if (!$rootScope.authenticated && PUBLIC_PAGES.indexOf(pagePrefix) < 0) {
      	    	event.preventDefault();
      	        $rootScope.$evalAsync(function() {
      	        	$location.path("/login");
      	        });
      	    }
      	    if(self.BIN_SELECTOR_PAGES.indexOf(pagePrefix) < 0){
      	    	self.binSelector = null;
      	    }else{
      	    	if(pagePrefix === 'latency'){
      	    		self.binSelector = self.latencyBin;
      	    	}else{
      	    		self.binSelector = self.speedHistogramBin;
      	    	}
      	    }
      	    
      	  if(self.TIME_MANAGER_PAGES.indexOf(pagePrefix) < 0){
      		self.timeManager = false;
      	  }else{
      		self.timeManager = true;
      	  }

      	});
        
        /* private methods */
        
        function computeStartDate(date, view, direction){
        	/*
			 * direction == 'forward': add 
			 * 
			 * direction == 'backward': subtract = call same moment method (add)
			 * with negative quantities
			 */	
        	var directionSign = direction == 'forward' ? 1 : -1;
        	switch(view){
	        	case "week":
	        		date.startOf('week');
	            	date.add(7*directionSign, "days");
	            	break;
	            case "month": 
	            	date.startOf('month');
	            	date.add(1*directionSign, "months"); 
	            	break;
	            case "months": 
	            	date.startOf('month');
	            	date.add(3*directionSign, "months"); 
	            	break;
        	}
        	console.info(date.format('YYYY MM DD'));
        	return date;
        }
        
        function computeEndDate(date, view){
        	console.info(date.format('YYYY MM DD'), view)
        	switch(view){
            case "week":   
            	date.endOf("week");
	          	break;
            case "month":
            	date.endOf("month");
	          	break;
            case "months": 
            	date.add(2, "months"); 
          	  	break;
        	}
        	console.info(date.format('YYYY MM DD'));
        	return date;
        }

        /*
         * put (day, month, year) in the scope for the view
         * put also start and end milliseconds
         */
        function setActiveViewDate(start, end){
        	self.activeView.startDate = start.valueOf();
        	self.activeView.endDate = end.valueOf();
			self.activeView.day = start.date();
			self.activeView.month = start.month();
			self.activeView.year = start.year();
		}
          // ///////////////
          
          $rootScope.rowUserDownloadList =[];
          $rootScope.rowPublicDownloadList =[];
          

          
          
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
      

          // //////////////
      $rootScope.socketConnected = false;
      //connect();
      $rootScope.realtime = function(){
          $rootScope.socketConnected ? disconnect() : connect();
          console.log( "is conn: "+$rootScope.socketConnected );
      };
      function connect(){
          var socket = new SockJS('http://localhost:8080/connectionProfiler/connection-profiler-websocket');
          var stompClient = Stomp.over(socket);
          stompClient.connect({}, function (frame) {
              $rootScope.$apply(function(){$rootScope.socketConnected = true;});

              if($rootScope.authenticated) {
                  $rootScope.privateSubscription = stompClient.subscribe('/user/' + $rootScope.user.name + '/downloads', function (packet) {
                      var download = JSON.parse(packet.body).payload;
                      if ($rootScope.websocketCallbackUser !== undefined) {
                          console.log("CHIAMO CALLBACK USER");
                          $rootScope.websocketCallbackUser(download);
                      }
                  });
              }
              $rootScope.publicSubscription = stompClient.subscribe('/topic/downloads', function (packet) {
                  var download =JSON.parse(packet.body).payload;
                  if($rootScope.websocketCallbackPublic !== undefined){
                      console.log("CHIAMO CALLBACK PUBLIC");
                      $rootScope.websocketCallbackPublic(download);
                  }
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

      // //////////////////////
          
          var authenticate = function(credentials, callback) {

            var headers = credentials ? {authorization : "Basic "
            + btoa(credentials.username + ":" + credentials.password)
            } : {};

            console.log(headers);

            $http.get('http://localhost:8080/connectionProfiler/user', {headers : headers}).then(function(response) {
              if (response.data.name) {
                $rootScope.authenticated = true;
                $rootScope.user = {};
                $rootScope.user.name = response.data.name;
              } else {
                $rootScope.authenticated = false;
                $rootScope.user = {};
              }
              callback && callback();
            }, function() {
              $rootScope.authenticated = false;
              $rootScope.user = {};
              callback && callback();
            });

          };

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
          };
          
          // ////////////////////////


        })

.controller('register',
		function($rootScope, $http, $location) {
	$rootScope.enableChangeView = false;
	
		        var self = this;
		self.user = {};
		self.user.username = "";
		self.user.password = "";
		var createUser = function(user) { 
			console.log(self.user);
			$http.post('http://localhost:8080/connectionProfiler/publics/user', user).then(function () {
				                        $location.path('/login');
				                    }, function(){
					$location.path('/');
				                        self.dataLoading = false;
				                    }
				                );
		};
		
		self.register = function() {
		       self.dataLoading = true;
				createUser(self.user);
		                
		        };
		    }
)
.controller('confirmRegistration',
		function($rootScope, $http, $location) {
	$rootScope.enableChangeView = false;
		var self = this;
		self.token = "";
		var sendToken = function(token) { 
			$http.post('http://localhost:8080/connectionProfiler/publics/user/confirmRegistration', token).then(function () {
				                        $location.path('/login');
				                    }, function(){
					$location.path('/');
				                        self.dataLoading = false;
				                    }
				                );
		};
		
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
    });
