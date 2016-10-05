'use strict';

angular.module('myApp.speedGraph', ['ngRoute'])
    .config(['$routeProvider', function($routeProvider) {
      $routeProvider.when('/speedGraph/:year/:month/:day/:view', {
        templateUrl: 'partials/restricted/speedGraph.html',
        controller: 'speedGraph',
        controllerAs: 'controller'
      });
    }])
    .controller('speedGraph', ['$route', '$routeParams', '$scope', 'speedGraph_downloadManager', '$rootScope', function($route, $routeParams, $scope, downloadManager,$rootScope) {

        $scope.trigger = {arrived:false, count: 0, newSpeedDataUser : undefined, newSpeedDataPublic : undefined};
        $("#timeManager").show();

        function updateRootScopeCallback(data, t){
            if(t) {
                $rootScope.rowUserDownloadList = $rootScope.rowUserDownloadList.concat(data);
                $scope.userDownloadList = downloadManager.splitByAsnum( $rootScope.rowUserDownloadList);
            }else {
                $rootScope.rowPublicDownloadList = $rootScope.rowPublicDownloadList.concat(data);
                $scope.publicDownloadList = downloadManager.splitByAsnum($rootScope.rowPublicDownloadList);
            }
        }
        downloadManager.getUserDownloads($routeParams.year, $routeParams.month, $routeParams.day, $routeParams.view, $scope.trigger, updateRootScopeCallback);
        downloadManager.getPublicDownloads($routeParams.year, $routeParams.month, $routeParams.day, $routeParams.view, $scope.trigger, updateRootScopeCallback);
/*
        setTimeout(function(){
            //$scope.userDownloadList = downloadManager.splitByAsnum(downloadManager.getUserDownloads($routeParams.year, $routeParams.month, $routeParams.day, $routeParams.view, $routeParams.bin_width));
            $rootScope.rowUserDownloadList = $rootScope.rowUserDownloadList.concat(
                downloadManager.getUserDownloads(
                    $routeParams.year, $routeParams.month, $routeParams.day, $routeParams.view, $routeParams.bin_width
                )
            );
            $scope.userDownloadList = downloadManager.splitByAsnum($rootScope.rowUserDownloadList);
            console.log("Arrivati user Donloads");
            console.log(JSON.stringify($scope.userDownloadList));
            $scope.$apply(function(){$scope.trigger.userDataArrived = true;});
        }, 300);
        setTimeout(function(){
            //$scope.publicDownloadList = downloadManager.splitByAsnum(downloadManager.getPublicDownloads($routeParams.year, $routeParams.month, $routeParams.day, $routeParams.view, $routeParams.bin_width));
            //$scope.rowDownloadList = downloadManager.getPublicDownloads($routeParams.year, $routeParams.month, $routeParams.day, $routeParams.view, $routeParams.bin_width);
            $rootScope.rowPublicDownloadList = $rootScope.rowPublicDownloadList.concat(downloadManager.getPublicDownloads($routeParams.year, $routeParams.month, $routeParams.day, $routeParams.view, $routeParams.bin_width));
            console.log("Arrivati public Downloads");
            $scope.publicDownloadList = downloadManager.splitByAsnum($rootScope.rowPublicDownloadList);
            console.log(JSON.stringify($scope.publicDownloadList));
            $scope.$apply(function(){$scope.trigger.publicDataArrived = true;});
        },350); */

        function websocketCallbackPublic(){
            var download;
            downloadManager.updateDownloads($rootScope.rowPublicDownloadList, download);
            $scope.publicDownloadList = downloadManager.splitByAsnum($rootScope.rowPublicDownloadList);
            $scope.trigger.newSpeedDataPublic = true;
        }

        function websocketCallbackUser(){
            var download;
            downloadManager.updateDownloads($rootScope.rowUserDownloadList, download);
            $scope.userDownloadList = downloadManager.splitByAsnum($rootScope.rowUserDownloadList);
            $scope.trigger.newSpeedDataUser = true;
        }

        $scope.showAllAsnum = function(aType){
            var ele = $('#'+aType+'-showAll');
            if(ele.hasClass('active')){
                $("."+aType+"-asnumButton").removeClass("active");
                $("." + aType + "-graph").fadeTo(200, 0);
                ele.removeClass("active");
                ele.text("Show All")
            }else {
                $("."+aType+"-asnumButton").addClass("active");
                $("." + aType + "-graph").fadeTo(200, 1);
                ele.addClass("active");
                ele.text("Hide All");
            }
        };
        $scope.showAsnum = function(asnum,aType){
            var ele = $("#"+aType+"-button-"+asnum);
            if(ele.hasClass("active")){ //hide
                ele.removeClass("active");
                $("." + aType + "-graph-" + asnum).fadeTo(200, 0);
            }else{ //show
                ele.addClass("active");
                $("." + aType + "-graph-" + asnum).fadeTo(200, 1);
            }
        };

    }])

    .factory('speedGraph_downloadManager', ['$resource', function($resource) {
            var serverURI_user = "http://localhost:8080/connectionProfiler/speedGraph/:year/:month/:day/:view",
                serverURI_public = "http://localhost:8080/connectionProfiler/publicSpeedGraph/:year/:month/:day/:view";
            var factory = {};

            factory.splitByAsnum = function(downloadList){
                var asnumList = [];
                for(var i=0;i<downloadList.length;i++){
                    for(var j=0;j<asnumList.length;j++){
                        if(downloadList[i].asnum === asnumList[j].asnum){
                            asnumList[j].downloads.push({count : downloadList[i].count, speed : downloadList[i].speed, timestamp : downloadList[i].timestamp});
                            break;
                        }
                    }
                    if(j===asnumList.length)
                        asnumList.push({"asnum":downloadList[i].asnum,"downloads": [{count : downloadList[i].count, speed : downloadList[i].speed, timestamp : downloadList[i].timestamp}]});
                }
                asnumList.forEach(function(ele){ele.downloads.sort(function(a,b){return a.timestamp - b.timestamp;});});
                console.log("SORTED");
                console.log(JSON.stringify(asnumList));
                return asnumList;
            };

        factory.getUserDownloads = function (year,month,day,view,trigger, callback){
           return $resource(serverURI_user).query({year: year, month : month, day : day, view : view}, function (downloadList) {
                downloadList.sort(function (a, b) {return a.timestamp - b.timestamp;});
                callback(downloadList,true);
                trigger.arrived = ++trigger.count === 2;
            });
        };
        factory.getPublicDownloads = function (year,month,day,view,trigger, callback){
            return $resource(serverURI_public).query({year: year, month : month, day : day, view : view}, function (downloadList) {
                downloadList.sort(function (a, b) {return a.timestamp - b.timestamp;});
                callback(downloadList,false);
                trigger.arrived = ++trigger.count === 2;
            });
        };
        factory.updateDownloads = function(downloadList, download){
            var i;
            for(i = 0; i< downloadList.length; i++){
                if(downloadList[i].asnum === download.asnum && downloadList[i].timestamp === download.timestamp){
                    download[i].speed = (downloadList[i].count * downloadList[i].speed + download.speed) / (downloadList[i] + 1);
                    break;
                }
            }
            if(i === downloadList.length)
                downloadList.push({asnum : download.asnum, count : 1,speed : download.speed, timestamp : download.timestamp})
        };
        /*
            factory.getUserDownloads = function (year,month,day,view,trigger, callback) {
                var date = moment().year(year).month(month).date(day);
                return [{
                    "asnum": 0,
                    "speed": 1450,
                    "timestamp": date.valueOf(),
                    "count" : 1
                },{
                    "asnum": 0,
                    "speed": 1050,
                    "timestamp": date.subtract(1,'days').valueOf(),
                    "count" : 1
                },{
                    "asnum": 0,
                    "speed": 1900,
                    "timestamp": date.subtract(2,'days').valueOf(),
                    "count" : 1
                },{
                    "asnum": 1,
                    "speed": 1450,
                    "timestamp": date.subtract(3,'days').valueOf(),
                    "count" : 1
                },{
                    "asnum": 1,
                    "speed": 1050,
                    "timestamp": date.subtract(4,'days').valueOf(),
                    "count" : 1
                },{
                    "asnum": 1,
                    "speed": 1900,
                    "timestamp": date.subtract(5,'days').valueOf(),
                    "count" : 1
                }];
         };
                $resource(serverURI_user).query({year: year, month : month, day : day, view : view}, function (downloadList) {
                    downloadList.sort(function (a, b) {return a.timestamp - b.timestamp;});
                    callback(downloadList);
                    trigger.startDataArrived = ++trigger.count === 2;
                });


            factory.getPublicDownloads = function (year,month,day,view,trigger, callback) {
                var date = moment().year(year).month(month).date(day);
                return [{
                    "asnum": 0,
                    "speed": 1050,
                    "timestamp": date.valueOf(),
                    "count" : 1
                },{
                    "asnum": 0,
                    "speed": 1111,
                    "timestamp": date.subtract(1,'days').valueOf(),
                    "count" : 1
                },{
                    "asnum": 0,
                    "speed": 131,
                    "timestamp": date.subtract(2,'days').valueOf(),
                    "count" : 1
                },{
                    "asnum": 1,
                    "speed": 2222,
                    "timestamp": date.subtract(3,'days').valueOf(),
                    "count" : 1
                },{
                    "asnum": 1,
                    "speed": 3331,
                    "timestamp": date.subtract(4,'days').valueOf(),
                    "count" : 1
                },{
                    "asnum": 1,
                    "speed": 1050,
                    "timestamp": date.subtract(5,'days').valueOf(),
                    "count" : 1
                }];
                $resource(serverURI_public).query({year: year, month : month, day : day, view : view}, function (downloadList) {
                    downloadList.sort(function (a, b) {return a.timestamp - b.timestamp;});
                    callback(downloadList);
                    trigger.startDataArrived = ++trigger.count === 2;
                });
            };*/
            return factory;
        }])
    .factory('d3Service', ['$document', '$q', '$rootScope',
        function($document, $q, $rootScope) {
            var d = $q.defer();
            function onScriptLoad() {
                // Load client in the browser
                $rootScope.$apply(function() { d.resolve(window.d3); });
            }
            // Create a script tag with d3 as the source
            // and call our onScriptLoad callback when it
            // has been loaded
            var scriptTag = $document[0].createElement('script');
            scriptTag.type = 'text/javascript';
            scriptTag.async = true;
            scriptTag.src = 'http://d3js.org/d3.v3.min.js';
            scriptTag.onreadystatechange = function () {
                if (this.readyState == 'complete') onScriptLoad();
            };
            scriptTag.onload = onScriptLoad;

            var s = $document[0].getElementsByTagName('body')[0];
            s.appendChild(scriptTag);

            return {
                d3: function() { return d.promise; }
            };
        }])
    .directive('downloadSpeedTemporalGraph',function($route, $routeParams,d3Service, $rootScope, speedGraph_downloadManager){
        return{
            restrict: 'E',
            link: function(scope, element, attrs){
                d3Service.d3().then(function (d3) {
                    var circleSize = 5;
                    var asnumList;
                    var colors = d3.scale.category20();

                    var margin = {top: 10, right: 10, bottom: 100, left: 50},
                        margin2 = {top: 430, right: 10, bottom: 20, left: 0},
                        width = 960 - margin.left - margin.right,
                        height = 500 - margin.top - margin.bottom,
                        height2 = 500 - margin2.top - margin2.bottom;

                    var x = d3.time.scale().range([0, width]),
                        x2 = d3.time.scale().range([0, width]),
                        y = d3.scale.linear().range([height, 0]),
                        y2 = d3.scale.linear().range([height2, 0]);

                    var speedFormat = function (d) {
                        if (parseInt(d) > 1024 * 1024 * 1024) return "" + parseInt(parseInt(d) / (1024 * 1024 * 1024)) + "\nGbps";
                        if (parseInt(d) > 1024 * 1024) return "" + parseInt(parseInt(d) / (1024 * 1024)) + "\nMbps";
                        if (parseInt(d) > 1024) return "" + parseInt(parseInt(d) / 1024) + "\nKbps";
                        return "" + d;
                    };

                    var xAxis = d3.svg.axis().scale(x).orient("bottom"),
                        xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
                        yAxis = d3.svg.axis().scale(y).orient("left").tickFormat(speedFormat);

                    var brush = d3.svg.brush().x(x2).on("brush", brushed);

                    //user data
                    var area = d3.svg.area()
                        .interpolate("monotone")
                        //.interpolate("linear ")
                        .x(function (d) {return x(d.timestamp);})
                        .y0(height)
                        .y1(function (d) {return y(d.speed);});

                    var area2 = d3.svg.area()
                        .interpolate("monotone")
                        //.interpolate("linear ")
                        .x(function (d) {return x2(d.timestamp);})
                        .y0(height2)
                        .y1(function (d) {return y2(d.speed);});

                    var line = d3.svg.line()
                        .x(function (d) {return x(d.timestamp);})
                        .y(function (d) {return y(d.speed);})
                        .interpolate("monotone");

                    var svg = d3.select(element[0]).append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom);

                    svg.append("defs").append("clipPath")
                        .attr("id", "clip")
                        .append("rect")
                        .attr("width", width)
                        .attr("height", height);

                    var focus = svg.append("g")
                        .attr("class", "focus")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    var context = svg.append("g")
                        .attr("class", "context")
                        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

                    var zoom = d3.behavior.zoom()
                        .on("zoom", draw);

                    var rect = svg.append("svg:rect")
                        .attr("class", "pane")
                        .attr("width", width)
                        .attr("height", height)
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                        //.on('mouseover',rectMouseOver)
                        .call(zoom);


                    var div = d3.select(element[0]).append("div")
                        .attr("class", "tooltip")
                        .style("opacity", 0);

                    var formatTime = d3.time.format("%e/%m/%Y");
/*
                    function brushed() {
                        if (brush.empty()) {
                            x.domain(x2.domain());
                        } else {
                            var extent = brush.extent();
                            var width = extent[1] - extent[0];
                            if (width < 86400000 * 7) {
                                var padding = (86400000 * 7 - width) / 2;
                                extent[0].setTime(parseInt(extent[0].getTime()) - padding);
                                extent[1].setTime(parseInt(extent[1].getTime()) + padding);
                                brush.extent(extent);
                                svg.select(".brush").call(brush);
                            }
                            x.domain(extent);
                        }
                        focus.selectAll(".area").attr("d", area);
                        focus.selectAll(".line").attr("d", line);
                        focus.selectAll('.point')
                            .attr("cx", function (d) {return x(d.timestamp)})
                            .attr("cy", function (d) {return y(d.speed)});
                        focus.select(".x.axis").call(xAxis);
                        zoom.x(x);
                    }
*/
                    function brushed() {
                        x.domain(brush.empty() ? x2.domain() : brush.extent());
                        focus.select(".area").attr("d", area);
                        focus.select(".x.axis").call(xAxis);
                        focus.selectAll(".line").attr("d", line);
                        focus.selectAll('.point')
                            .attr("cx", function (d) {return x(d.timestamp)})
                            .attr("cy", function (d) {return y(d.speed)});
                        focus.select(".x.axis").call(xAxis);
                        // Reset zoom scale's domain
                        zoom.x(x);
                    }
                    function draw() {
                        focus.selectAll(".area").attr("d", area);
                        focus.selectAll(".line").attr("d", line);
                        focus.selectAll('.point')
                            .attr("cx", function (d) {return x(d.timestamp)})
                            .attr("cy", function (d) {return y(d.speed)});
                        focus.select(".x.axis").call(xAxis);
                        // Force changing brush range
                        brush.extent(x.domain());
                        svg.select(".brush").call(brush);
                    }

                    //drawGraph([],[],[]);

                    function drawGraph(userDownloadList, publicDownloadList, rowDownloadList){
                        asnumList = publicDownloadList.map(function(d){return d.asnum;});

                        asnumList.forEach(function (asn, i) {
                            $('#general-graph-button-' + asn).css('color', colors(i));
                            $('#user-graph-button-' + asn).css('color', colors(i));
                        });

                        //var userDownloadList = scope.userDownloadList;
                        //var publicDownloadList = scope.publicDownloadList;

                        console.log("user: " + JSON.stringify(userDownloadList));
                        console.log("public: " + JSON.stringify(publicDownloadList));

                        //max user
                        var maxList_y_user = [], maxList_y_pub = [], valueList_x_user = [], valueList_x_pub = [];
                        publicDownloadList.forEach(function (d, i) {
                            maxList_y_user[i] = d3.max(d.downloads.map(function (d) {return d.speed;}));
                            valueList_x_user = d.downloads.map(function (d) {return d.timestamp;});
                        });
                        userDownloadList.forEach(function (d, i) {
                            maxList_y_pub[i] = d3.max(d.downloads.map(function (d) {return d.speed;}));
                            valueList_x_pub = d.downloads.map(function (d) {return d.timestamp;});
                        });
                        var valueList_x = valueList_x_pub.concat(valueList_x_user), maxList_y = maxList_y_pub.concat(maxList_y_user);

                        console.log("x extend: " + d3.extent(valueList_x));
                        console.log("y max: " + d3.max(maxList_y));
                        x.domain(d3.extent(valueList_x));
                        y.domain([0, d3.max(maxList_y) * 1.3]);
                        x2.domain(x.domain());
                        y2.domain(y.domain());

                        // Set up zoom behavior
                        zoom.x(x);

                        /**
                         * Disegno grafico publico
                         * */
                        publicDownloadList.forEach(function (asnum) {
                            var data = asnum.downloads;
                            console.log(JSON.stringify(asnum.downloads));
                            data.forEach(function (dd) {
                                dd.timestamp = new Date(dd.timestamp);
                                focus.append("circle").datum(dd)
                                    .attr("class", "point public-graph public-graph-" + asnum.asnum)
                                    .attr("cx", function (d) {return x(d.timestamp)})
                                    .attr("cy", function (d) {return y(d.speed)})
                                    .attr("clip-path", "url(#clip)")
                                    .attr("r", circleSize)
                                    .attr("isvisible", "false")
                                    .attr("ds", function (d) {return d.speed;})
                                    .attr("ts", function (d) {return formatTime(d.timestamp);})
                                    .attr("fill", colors(asnumList.indexOf(asnum.asnum)));
                            });

                            focus.append("path")
                                .datum(data)
                                .attr("class", "line public-graph public-graph-" + asnum.asnum)
                                .attr("d", line)
                                .attr("clip-path", "url(#clip)")
                                .attr("fill", "none")//,function(){return colors(i);})
                                .attr("stroke", colors(asnumList.indexOf(asnum.asnum)))
                                .style("stroke-dasharray", ("3, 3"));
                        });

                        /**
                         * Disegno grafico user
                         * */
                        userDownloadList.forEach(function (e) {
                            e.downloads.forEach(function (ee) {
                                ee.timestamp = new Date(ee.timestamp);
                                focus.append("circle").datum(ee)
                                    .attr("class", "point user-graph user-graph-" + e.asnum)
                                    .attr("cx", function (d) {return x(d.timestamp)})
                                    .attr("cy", function (d) {return y(d.speed)})
                                    .attr("clip-path", "url(#clip)")
                                    .attr("isvisible", "true")
                                    .attr("ds", function (d) {return d.speed;})
                                    .attr("ts", function (d) {return formatTime(d.timestamp);})
                                    .attr("r", circleSize)
                                    .attr("fill", colors(asnumList.indexOf(e.asnum)));
                            });
                            focus.append("path")
                                .datum(e.downloads)
                                .attr("class", "line user-graph user-graph-" + e.asnum)
                                .attr("d", line)
                                .attr("clip-path", "url(#clip)")
                                .attr("fill", "none")
                                .attr("stroke", colors(asnumList.indexOf(e.asnum)));

                        });

                        focus.append("g")
                            .attr("class", "x axis")
                            .attr("transform", "translate(0," + height + ")")
                            .call(xAxis);

                        focus.append("g")
                            .attr("class", "y axis")
                            .call(yAxis);

                        context.append("path")
                            .datum(rowDownloadList)
                            .attr("class", "area")
                            .attr("d", area2);

                        context.append("g")
                            .attr("class", "x axis")
                            .attr("transform", "translate(0," + height2 + ")")
                            .call(xAxis2);

                        context.append("g")
                            .attr("class", "x brush")
                            .call(brush)
                            .selectAll("rect")
                            .attr("y", -6)
                            .attr("height", height2 + 7);

                        brush.extent([new Date(d3.min(valueList_x)), new Date(d3.max(valueList_x))]);
                        d3.selectAll("path.domain").style("shape-rendering", "geometricPrecision");

                        $('.public-graph').hide();

                        $('.pane').mousemove(function (e) {
                            var pane = $('.pane');
                            //var offset = pane.offset();
                            var offset = $(this).parent().offset();
                            var x = e.pageX - parseInt(offset.left) - margin.left, y = e.pageY - parseInt(offset.top) - margin.top;//e.pageX, y = e.pageY;//parseInt(offset.left), y = parseInt(offset.top);//e.pageX - parseInt(offset.left), y = e.pageY - parseInt(offset.top);

                            console.log("x: " + x + ", y: " + y);
                            var elements = $('.point').filter("[isvisible='true']").map(function () {
                                var $this = $(this);
                                var cx = parseInt($this.attr("cx"));
                                var cy = parseInt($this.attr("cy"));
                                var r = parseInt($this.attr("r"));

                                if ((y <= cy + r && y >= cy - r) && (x <= cx + r && x >= cx - r)) {
                                    return $this;
                                }
                                return null;
                            });
                            if (elements.length === 0) {
                                pane.css('cursor', 'default');
                                div.transition()
                                    .duration(200)
                                    .style("opacity", 0);
                                return;
                            }
                            var ds = elements[0].attr('ds');
                            var ts = elements[0].attr('ts');
                            pane.css('cursor', 'pointer');
                            div.transition()
                                .duration(200)
                                .style("opacity", .9);
                            div.html(speedFormat(ds) + "<br/><i>" + ts + "</i>")
                                .style("left", (x) + "px")
                                .style("top", (y - 28) + "px");
                        });
                    }
                    scope.$watch('trigger.arrived', function (newVal) {
                        if (newVal === true) {
                            console.log("disegno");
                            drawGraph(
                                scope.userDownloadList,
                                scope.publicDownloadList,
                                $rootScope.rowPublicDownloadList
                            );
                        }
                    });
                });
            }
        }
    });
