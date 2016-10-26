'use strict';

// Declare app level module which depends on views, and components

angular.module('myApp', [
    'ui.bootstrap',
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
    
    .config(['$locationProvider', '$routeProvider', '$httpProvider', function ($locationProvider, $routeProvider, $httpProvider) {
        $locationProvider.hashPrefix('!');
        $routeProvider.
            when('/login', {
                templateUrl: 'partials/public/login.html',
                controller: 'navigation',
                controllerAs: 'controller'
            }).
            when('/', {
                templateUrl: 'partials/public/home.html',
                controller: 'home',
                controllerAs: 'controller'
            }).
            when('/register', {
                templateUrl: 'partials/public/register.html',
                controller: 'register',
                controllerAs: 'controller'
            }).
            when('/confirmRegistration', {
                templateUrl: 'partials/public/confirmRegistration.html',
                controller: 'confirmRegistration',
                controllerAs: 'controller'
            }).
            otherwise('/');

        $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
    }])

    .factory('appURLs', [function(){
    	var urls = {};
    	
    	var pathArray = location.href.split( '/' );
    	var protocol = pathArray[0];
    	var host = pathArray[2];
    	
    	var root = protocol + '//' + host + '/connectionProfiler';
    	
    	console.info('root application url: ' + root);
    	
    	urls.root = root;
    	urls.authenticate = '/user';
    	urls.userDetails = '/user';
    	urls.login = '/login';
    	urls.logout = '/logout';
    	urls.createUser = '/public/user';
    	urls.confirmRegistration = '/public/user/confirm';
    	urls.websocket = '/connection-profiler-websocket';
    	
    	return urls;
    }])
    
    .factory('REST_API_URLs', [function(){
    	var restAPI = {};
    	
    	var pathArray = location.href.split( '/' );
    	var protocol = pathArray[0];
    	var host = pathArray[2];
    	
    	var root = protocol + '//' + host + '/connectionProfiler';
    	
    	console.info('root REST API url: ' + root);
    	
    	restAPI.pieAccess = root + '/pieAccesses/:year/:month/:day/:view';
    	restAPI.pieSize = root + '/pieSize/:year/:month/:day/:view';
    	restAPI.latency = root + '/latencyHistogram/:year/:month/:day/:view/:bin_width';
    	restAPI.speedTable = root + '/speedTable/:page/:size';
    	restAPI.speedGraphPublic = root + '/public/speedGraph/:year/:month/:day/:view';
    	restAPI.speedGraphUser = root + '/speedGraph/:year/:month/:day/:view';    	
        restAPI.speedHistogramPublic = root + '/public/speedHistogram/:year/:month/:day/:view/:bin_width';
        restAPI.speedHistogramUser = root + '/speedHistogram/:year/:month/:day/:view/:bin_width';
        
        restAPI.subscriptions = root + '/subscriptions/:asnum';
        restAPI.subscriptionsSummary = root + '/subscriptions/summary/:asnum';
        
    	return restAPI;
    }])
    
    .controller('home', function ($rootScope, $http) {
        $rootScope.enableChangeView = false;

    })

    .controller('navigation', function ($rootScope, $http, $location, $route, $routeParams, PUBLIC_PAGES, $scope, appURLs) {
        /*
		 * Global variable used to show/hide the time navigation bar. Set it to
		 * true in your controller, if you want show that bar in your view.
		 */
        $rootScope.enableChangeView = false;

        /* Global variable holding user details */
        $rootScope.user = {};

        /* Global variable to redirect the user after authentication */
        if ($rootScope.previousLocation == undefined) {
            $rootScope.previousLocation = '/';
        }

        /* Instance variables */

        var self = this;        

        /* Time Manager Visualization logic */
        self.TIME_MANAGER_PAGES = ['speedGraph', 'pieAccesses', 'domainsBySize', 'speedHistogram', 'latency'];
        self.REAL_TIME_PAGES = ['speedGraph', 'pieAccesses', 'domainsBySize', 'speedHistogram', 'latency', 'speedTable'];
        /* Bin Width Params */
        self.BIN_SELECTOR_PAGES = ['speedHistogram', 'latency'];
        
        self.timeManager = false;
        self.enableRealTime = false;
        
        /* public methods */

        /*
		 * update (start, end dates) and route parameters in order to change the
		 * view view : (week, month, months)
		 */
        self.changeActiveView = function (view) {
            self.activeView.view = view;
            // update end date according with the new view type
            self.endDate = computeEndDate(self.startDate.clone(), view);
            setActiveViewDate(self.startDate, self.endDate);

            var currentParam = $routeParams;
            if (self.binWidthSelector == null) {
                $route.updateParams({
                    year: self.activeView.year,
                    month: self.activeView.month,
                    day: self.activeView.day,
                    view: self.activeView.view
                });
            } else {
                $route.updateParams({
                    year: self.activeView.year,
                    month: self.activeView.month,
                    day: self.activeView.day,
                    view: self.activeView.view,
                    bin_width: self.binSelector.width
                });
                
            }
        };

        /*
		 * move timespan back and forward according with the direction input
		 * parameter direction : (backward, forwars, today)
		 * 
		 */
        self.move = function (direction) {
            var view = self.activeView.view;
            if (direction == 'today') {
                self.startDate = moment().startOf('isoWeek');
            } else {
                self.startDate = computeStartDate(self.startDate.clone(), view, direction);
            }

            // / TODO
            $rootScope.lastExtent = [self.activeView.startDate,self.activeView.endDate];

            self.endDate = computeEndDate(self.startDate.clone(), view);
            setActiveViewDate(self.startDate, self.endDate);



            var currentParam = $routeParams;
            if (self.binWidthSelector == null) {
                $route.updateParams({
                    year: self.activeView.year,
                    month: self.activeView.month,
                    day: self.activeView.day,
                    view: self.activeView.view
                });
            } else {
                $route.updateParams({
                    year: self.activeView.year,
                    month: self.activeView.month,
                    day: self.activeView.day,
                    view: self.activeView.view,
                    bin_width: self.binWidthSelector
                });
                
            }
        };

        /*
		 * event handler to change the bin size where it's possible. Trigger
		 * update parameters.
		 */
        self.changeBinSize = function ($event) {
            var btn = $event.currentTarget.id.localeCompare('btn-bin-plus') == 0 ? 1 : -1;

            if (btn < 0 && self.binSelector.width <= self.binSelector.MIN_WIDTH) {
                return;
            }
            if (btn > 0 && self.binSelector.width >= self.binSelector.MAX_WIDTH) {
                return;
            }

            self.binSelector.width += (self.binSelector.STEP * btn);

            $route.updateParams({
                bin_width: self.binSelector.width
            });
        };
        
        var offInitializeTimeManagement = $scope.$on('$routeChangeSuccess', function() {
       		initializeTimeManagement();
       		console.info("kamikaze");
       		offInitializeTimeManagement();
        });
        
        
        /*
		 * Basic navigation logic to enable part of the logic or the access to
		 * 'private' pages.
		 * 
		 * PUBLIC_PAGES list is a predefined application constant that holds the
		 * name of the pages that are meant to be publicly available.
		 * 
		 * BIN_SELECTOR_PAGES contains the pages that needs a bin selector input
		 * field.
		 * 
		 * TIME_MANAGER_PAGES lists the pages that needs a time manager bar to
		 * navigate the plots.
		 * 
		 */
        $rootScope.$on('$routeChangeStart', function (event, next, prev) {
            var pagePrefix = null;
            var thisPageUrl = $location.url();
            var thisPageUrlSplitted = thisPageUrl.split('/');

            if (thisPageUrlSplitted.length > 1) {
                pagePrefix = thisPageUrlSplitted[1];
            } else {
                pagePrefix = thisPageUrlSplitted[0];
            }

            if (!$rootScope.authenticated && PUBLIC_PAGES.indexOf(pagePrefix) < 0) {
                event.preventDefault();
                self.timeManager = self.enableRealTime = false;
                $rootScope.previousLocation = $location.path();
                $rootScope.$evalAsync(function () {
                    $location.path(appURLs.login);
                });
            }else{            
	            if (self.BIN_SELECTOR_PAGES.indexOf(pagePrefix) < 0) {
	                self.binSelector = null;
	            } else {
	                if (pagePrefix.localeCompare('latency') == 0) {
	                    self.binSelector = self.latencyBin;
	                } else {
	                    self.binSelector = self.speedHistogramBin;
	                }
	            }
	
	            if (self.TIME_MANAGER_PAGES.indexOf(pagePrefix) < 0) {
	                self.timeManager = false;
	            } else {
	                self.timeManager = true;
	            }
	            
	            if (self.REAL_TIME_PAGES.indexOf(pagePrefix) < 0) {
	                self.enableRealTime = false;
	            } else {
	                self.enableRealTime = true;
	            }
            }    

        });

        function initializeTimeManagement(){
            /*
    		 * Holds the current view type: {'week', 'month', 'year'} initialize it
    		 * using route params
    		 */
            self.activeView = {};
            self.activeView.view = 'week';
            
            /* URL speedTable View Params */
            self.speedTableParams = {};
            self.speedTableParams.page = 0;
            self.speedTableParams.pageSize = 10;

            
            // holds the current bin selector, either latency or speedHistogram
            self.binSelector = null;

            self.latencyBin = {};
            self.latencyBin.MIN_WIDTH = 5;
            self.latencyBin.MAX_WIDTH = 100;
            self.latencyBin.STEP = 20;
            self.latencyBin.width = 20;

            self.speedHistogramBin = {};
            self.speedHistogramBin.MIN_WIDTH = 1;
            self.speedHistogramBin.MAX_WIDTH = 200;
            self.speedHistogramBin.STEP = 1;
            self.speedHistogramBin.width = 4;
            
            var date = moment().startOf('isoWeek');
            
        	if($routeParams.year != undefined 
        			&& $routeParams.month != undefined 
        			&& $routeParams.day != undefined
        			&& $routeParams.view != undefined){
        		date.set('year', $routeParams.year);
        		date.set('month', $routeParams.month);
        		date.set('date', $routeParams.day);
        		self.activeView.view = $routeParams.view;
        	}
        	
        	if($routeParams.bin_width != undefined){
        		self.latencyBin.width = $routeParams.bin_width;
        	}        	
        	
        	/*
    		 * They hold the start and end date of the timespan to show
    		 */
            self.startDate = date;
            /* compute and set end date */
            self.endDate = computeEndDate(self.startDate.clone(), self.activeView.view);
            setActiveViewDate(self.startDate, self.endDate);
        }
        
        /* private methods */

        function computeStartDate(date, view, direction) {
            /*
			 * direction == 'forward': add
			 * 
			 * direction == 'backward': subtract = call same moment method (add)
			 * with negative quantities
			 */
            var directionSign = direction == 'forward' ? 1 : -1;
            switch (view) {
                case "week":
                    date.startOf('isoWeek');
                    date.add(7 * directionSign, "days");
                    break;
                case "month":
                    date.startOf('month');
                    date.add(1 * directionSign, "months");
                    break;
                case "months":
                    date.startOf('month');
                    date.add(3 * directionSign, "months");
                    break;
            }
            
            return date;
        }

        function computeEndDate(date, view) {
            
            switch (view) {
                case "week":
                    date.endOf("isoWeek");
                    break;
                case "month":
                    date.endOf("month");
                    break;
                case "months":
                    date.add(2, "months");
                    date.endOf('month');
                    break;
            }
            
            return date;
        }

        /*
		 * put (day, month, year) in the scope for the view put also start and
		 * end milliseconds
		 */
        function setActiveViewDate(start, end) {
            self.activeView.startDate = start.valueOf();
            self.activeView.endDate = end.valueOf();
            $rootScope.startDate = self.activeView.startDate;
            $rootScope.endDate = self.activeView.endDate;
            self.activeView.day = start.date();
            self.activeView.month = start.month();
            self.activeView.year = start.year();
        }

        $rootScope.userSpeedData = [];
        $rootScope.publicSpeedData = [];
        $rootScope.maxViewValue = undefined;
        $rootScope.minViewValue = undefined;
        $rootScope.lastExtent = undefined;
        $rootScope.userTimeList = [];
        $rootScope.publicTimeList = [];
        $rootScope.enableChangeView = false;

        $rootScope.currentDate = moment();

        $rootScope.isRelevant = function (download) {
            var time = moment(download.timestamp);
            //var extent = $rootScope.getCurrentExtentDate();
            var curDate_end =  moment(self.activeView.endDate);//extent[1];
            var curDate_start = moment(self.activeView.startDate); //extent[0];
            console.log(time.format('YYYY MM DD') + " è prima di " + curDate_end.format('YYYY MM DD') + " dopo " + curDate_start.format('YYYY MM DD'));
            var ret = (time.isBefore(curDate_end) && curDate_start.isBefore(time));
            console.log(ret);
            return ret;
        };


        // //////////////
        $rootScope.socketConnected = false;
        // connect();
        $rootScope.realtime = function () {
            $rootScope.socketConnected ? disconnect() : connect();
            console.log("is conn: " + $rootScope.socketConnected);
        };
        function connect() {
        	var websocket_url = appURLs.root + appURLs.websocket;
            var socket = new SockJS(websocket_url);
            var stompClient = Stomp.over(socket);
            stompClient.connect({}, function (frame) {
                $rootScope.$apply(function () {
                    $rootScope.socketConnected = true;
                });

                if ($rootScope.authenticated) {
                    $rootScope.privateSubscription = stompClient.subscribe('/user/' + $rootScope.user.name + '/downloads', function (packet) {
                        var downloads = JSON.parse(packet.body).payload;
                        if ($rootScope.websocketCallbackUser != undefined) {
                            console.log("CHIAMO CALLBACK USER");
                            downloads.forEach($rootScope.websocketCallbackUser);
                            //$rootScope.websocketCallbackUser(download);
                        }
                    });
                }
                $rootScope.publicSubscription = stompClient.subscribe('/topic/downloads', function (packet) {
                    var downloads = JSON.parse(packet.body).payload;
                    if ($rootScope.websocketCallbackPublic != undefined) {
                        console.log("CHIAMO CALLBACK PUBLIC");
                        downloads.forEach($rootScope.websocketCallbackPublic);
                        //$rootScope.websocketCallbackPublic(download);
                    }
                });
            });
        }

        function disconnect() {
            if ($rootScope.privateSubscription != null) {
                $rootScope.privateSubscription.unsubscribe();
                $rootScope.privateSubscription = null;
            }
            if ($rootScope.publicSubscription != null) {
                $rootScope.publicSubscription.unsubscribe();
                $rootScope.publicSubscription = null;
            }
            $rootScope.socketConnected = false;
        }

        // //////////////////////

        var authenticate = function (credentials, callback) {

            var headers = credentials ? {
                authorization: "Basic "
                + btoa(credentials.username + ":" + credentials.password)
            } : {};

            var auth_url = appURLs.root + appURLs.authenticate; 
            
            $http.get(auth_url, {headers: headers}).then(function (response) {
                if (response.data.name) {
                    $rootScope.authenticated = true;
                    $rootScope.user = {};
                    $rootScope.user.name = response.data.name;
                } else {
                    $rootScope.authenticated = false;
                    $rootScope.user = {};
                }
                callback && callback();
            }, function () {
                $rootScope.authenticated = false;
                $rootScope.user = {};
                callback && callback();
            });

        };

        authenticate();
        self.credentials = {};
        self.login = function () {
            self.dataLoading = true;
            authenticate(self.credentials, function () {
                
                if ($rootScope.authenticated) {
                    $location.path($rootScope.previousLocation);
                    $rootScope.previousLocation = '/';
                    self.error = false;
                } else {
                    self.error = true;
                    self.dataLoading = false;
                }
                
            });
        };
        self.logout = function () {
        	var logout_url = appURLs.root + appURLs.logout;
            $http.post(logout_url, {}).finally(function () {
                $rootScope.authenticated = false;
                disconnect();
                $location.path("/");
            });
        };

        // ////////////////////////


    })

    .controller('register',
    function ($rootScope, $http, $location, appURLs) {
        $rootScope.enableChangeView = false;

        var self = this;
        self.user = {};
        
        var createUser = function (user) {
            var createUser_url = appURLs.root + appURLs.createUser;
            $http.post(createUser_url, user).then(function () {
            		$location.path(appURLs.confirmRegistration);
                }, function () {
                	self.error = true;
                	self.dataLoading = false;
                }
            );
        };

        self.register = function (form) {
        	var user = {username: form.username, password: form.password, email: form.email};
            self.dataLoading = true;
            createUser(user);
        };
    }
)
    .controller('confirmRegistration',
    function ($rootScope, $http, $location, appURLs) {
        $rootScope.enableChangeView = false;
        var self = this;
        self.token = "";
        var sendToken = function (token) {
        	var sendToken_url = appURLs.root + appURLs.confirmRegistration;
            $http.post(sendToken_url, token).then(function () {
                    $location.path(appURLs.login);
                }, function () {
                    $location.path('/');
                    self.dataLoading = false;
                }
            );
        };

        self.confirmRegistration = function () {
            self.dataLoading = true;
            sendToken(self.token);

        };
    }
)
    .filter('getAsnameList', function () {
        return function (input) {
            var ret = [];
            if (input.length == 0) return ret;
            input.forEach(function (download) {
                if (ret.indexOf(download.asname) == -1)
                    ret[ret.length] = (download.asname);
            });
            return ret.sort(function (a, b) {
                return parseInt(a) > parseInt(b);
            });
        };
    })

    .directive('plotInfo', function () {
        return {
            restrict: 'E',
            templateUrl: 'partials/public/plotInfo/plotInfo.html',
            scope: {
                plot: '='
            }
        }
    })
    .factory('plotsInfoService', function () {
        var plotsInfo = {};
        var db = {
            domainsBySize: {
                name: "domainsBySize Pie Chart",
                description: "Nam quis erat eget quam consectetur dictum non in mi. " +
                "In porttitor purus luctus pretium dapibus. Sed scelerisque et lorem at interdum. " +
                "Sed ut ultricies purus. ",
                hint: "Nam quis erat eget quam consectetur dictum non in mi. " +
                "In porttitor purus luctus pretium dapibus. Sed scelerisque et lorem at interdum. " +
                "Sed ut ultricies purus. "
            },
            domainsByAccess: {
                name: "domainsByAccess",
                description: "Nam quis erat eget quam consectetur dictum non in mi. " +
                "In porttitor purus luctus pretium dapibus. Sed scelerisque et lorem at interdum. " +
                "Sed ut ultricies purus. ",
                hint: "Nam quis erat eget quam consectetur dictum non in mi. " +
                "In porttitor purus luctus pretium dapibus. Sed scelerisque et lorem at interdum. " +
                "Sed ut ultricies purus. "
            },
            speedGraph: {
                name: "speedGraph",
                description: "Nam quis erat eget quam consectetur dictum non in mi. " +
                "In porttitor purus luctus pretium dapibus. Sed scelerisque et lorem at interdum. " +
                "Sed ut ultricies purus. ",
                hint: "Nam quis erat eget quam consectetur dictum non in mi. " +
                "In porttitor purus luctus pretium dapibus. Sed scelerisque et lorem at interdum. " +
                "Sed ut ultricies purus. "
            },
            speedTable: {
                name: "speedTable",
                description: "Nam quis erat eget quam consectetur dictum non in mi. " +
                "In porttitor purus luctus pretium dapibus. Sed scelerisque et lorem at interdum. " +
                "Sed ut ultricies purus. ",
                hint: "Nam quis erat eget quam consectetur dictum non in mi. " +
                "In porttitor purus luctus pretium dapibus. Sed scelerisque et lorem at interdum. " +
                "Sed ut ultricies purus. "
            },
            speedHistogram: {
                name: "speedHistogram",
                description: "Nam quis erat eget quam consectetur dictum non in mi. " +
                "In porttitor purus luctus pretium dapibus. Sed scelerisque et lorem at interdum. " +
                "Sed ut ultricies purus. ",
                hint: "Nam quis erat eget quam consectetur dictum non in mi. " +
                "In porttitor purus luctus pretium dapibus. Sed scelerisque et lorem at interdum. " +
                "Sed ut ultricies purus. "
            },
            latency: {
                name: "latency",
                description: "Nam quis erat eget quam consectetur dictum non in mi. " +
                "In porttitor purus luctus pretium dapibus. Sed scelerisque et lorem at interdum. " +
                "Sed ut ultricies purus. ",
                hint: "Nam quis erat eget quam consectetur dictum non in mi. " +
                "In porttitor purus luctus pretium dapibus. Sed scelerisque et lorem at interdum. " +
                "Sed ut ultricies purus. "
            }
        };

        plotsInfo.getInfo = function (plotName) {
            return db[plotName];
        };

        return plotsInfo;
    })
    .filter('speedFormat',function(){
        return function(d){
            if (parseInt(d) > 1000 * 1000 * 1000) return "" + parseFloat(parseInt(d) / (1000 * 1000 * 1000)).toFixed(2) + " Gbps";
            if (parseInt(d) > 1000 * 1000) return "" + parseFloat(parseInt(d) / (1000 * 1000)).toFixed(2) + " Mbps";
            if (parseInt(d) > 1000) return "" + parseFloat(parseInt(d) / 1000).toFixed(2) + " Kbps";
            return "" + d;
        };
    })
    .filter('legendShorter', function(){
        return function(d){
            if(d.length > 20){
                return d.substring(0,16) + "...";
            }
            return d;
        };
    });
