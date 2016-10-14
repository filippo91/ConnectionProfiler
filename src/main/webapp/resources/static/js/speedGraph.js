'use strict';

angular.module('myApp.speedGraph', ['ngRoute'])
    .config(['$routeProvider', function($routeProvider) {
      $routeProvider.when('/speedGraph/:year/:month/:day/:view', {
        templateUrl: 'partials/public/speedGraph.html',
        controller: 'speedGraph',
        controllerAs: 'controller'
      });
    }])
    .controller('speedGraph', ['$route', '$routeParams', '$scope', 'speedGraph_downloadManager', '$rootScope', function($route, $routeParams, $scope, downloadManager,$rootScope) {

        $scope.trigger = {arrived:false, count: 0, newSpeedDataUser : undefined, newSpeedDataPublic : undefined, nData : 1};
        $("#timeManager").css("visibility","visible");
        $("#realtimediv").css('visibility', 'visible');

        function updateRootScopeCallback(data, t){
            if(t) {
                $rootScope.rowUserDownloadList = $rootScope.rowUserDownloadList.concat(data);
                $scope.userDownloadList = downloadManager.splitByAsname( $rootScope.rowUserDownloadList);
            }else {
                $rootScope.rowPublicDownloadList = $rootScope.rowPublicDownloadList.concat(data);
                $scope.publicDownloadList = downloadManager.splitByAsname($rootScope.rowPublicDownloadList);
            }
        }
        if($rootScope.authenticated){
            $scope.trigger.nData ++;
            downloadManager.getUserDownloads($routeParams.year, $routeParams.month, $routeParams.day, $routeParams.view, $scope.trigger, updateRootScopeCallback);
        }
        downloadManager.getPublicDownloads($routeParams.year, $routeParams.month, $routeParams.day, $routeParams.view, $scope.trigger, updateRootScopeCallback);

        /**
         * Web Socket callbacks
         */
        $rootScope.websocketCallbackUser = function (download) {
            downloadManager.updateDownloads($rootScope.rowUserDownloadList, download);
            $scope.userDownloadList = downloadManager.splitByAsname($rootScope.rowUserDownloadList);
            $scope.$apply(function () {
                $scope.trigger.userAsname = download.asname;
                $scope.trigger.newSpeedDataUser = $scope.trigger.newSpeedDataUser !== true;
            });
        };
        $rootScope.websocketCallbackPublic = function(download){
            downloadManager.updateDownloads($rootScope.rowPublicDownloadList, download);
            $scope.publicDownloadList = downloadManager.splitByAsname($rootScope.rowPublicDownloadList);
            $scope.$apply(function () {
                $scope.trigger.publicAsname = download.asname;
                $scope.trigger.newSpeedDataPublic = $scope.trigger.newSpeedDataPublic !== true;
            });
        };

        $scope.showAllAsname = function(aType){
            var ele = $('#'+aType+'-showAll'), graphEle = $("." + aType + "-graph");
            if(ele.hasClass('active')){
                $("."+aType+"-asnameButton").removeClass("active");
                graphEle.fadeTo(200, 0);
                graphEle.attr("isvisible", "false");
                ele.removeClass("active");
                ele.text("Show All")
            }else {
                $("."+aType+"-asnameButton").addClass("active");
                graphEle.fadeTo(200, 1);
                graphEle.attr("isvisible", "true");
                ele.addClass("active");
                ele.text("Hide All");
            }
        };
        $scope.showAsname = function(asname,aType){
            var ele = $("#"+aType+"-button-"+asname);
            if(ele.hasClass("active")){ //hide
                ele.removeClass("active");
                $("." + aType + "-graph-" + asname).fadeTo(200, 0);
            }else{ //show
                ele.addClass("active");
                $("." + aType + "-graph-" + asname).fadeTo(200, 1);
            }
        };

    }])

    .factory('speedGraph_downloadManager', ['$resource', function($resource) {
            var serverURI_user = "http://localhost:8080/connectionProfiler/speedGraph/:year/:month/:day/:view",
                serverURI_public = "http://localhost:8080/connectionProfiler/publicSpeedGraph/:year/:month/:day/:view";
            var factory = {};

            factory.splitByAsname = function(downloadList){
                var asnameList = [];
                for(var i=0;i<downloadList.length;i++){
                    for(var j=0;j<asnameList.length;j++){
                        if(downloadList[i].asname === asnameList[j].asname){
                            asnameList[j].downloads.push({count : downloadList[i].count, speed : downloadList[i].speed, timestamp : downloadList[i].timestamp});
                            break;
                        }
                    }
                    if(j===asnameList.length)
                        asnameList.push({"asname":downloadList[i].asname,"downloads": [{count : downloadList[i].count, speed : downloadList[i].speed, timestamp : downloadList[i].timestamp}]});
                }
                asnameList.forEach(function(ele){ele.downloads.sort(function(a,b){return a.timestamp - b.timestamp;});});
                console.log("SORTED");
                console.log(JSON.stringify(asnameList));
                return asnameList;
            };

        factory.getUserDownloads = function (year,month,day,view,trigger, callback){
           return $resource(serverURI_user).query({year: year, month : month, day : day, view : view}, function (downloadList) {
                downloadList.sort(function (a, b) {return a.timestamp - b.timestamp;});
                callback(downloadList,true);
                trigger.arrived = ++trigger.count === trigger.nData;
            });
        };
        factory.getPublicDownloads = function (year,month,day,view,trigger, callback){
            return $resource(serverURI_public).query({year: year, month : month, day : day, view : view}, function (downloadList) {
                downloadList.sort(function (a, b) {return a.timestamp - b.timestamp;});
                callback(downloadList,false);
                trigger.arrived = ++trigger.count === trigger.nData;
            });
        };
        factory.updateDownloads = function(downloadList, download){
            var i;
            download.timestamp = moment(download.timestamp).millisecond(0).second(0).minute(0).hour(0).valueOf();
            console.log("downloadList" + JSON.stringify(downloadList));
            for(i = 0; i< downloadList.length; i++){
                if(downloadList[i].asname === download.asname && downloadList[i].timestamp === download.timestamp){
                    downloadList[i].speed = (downloadList[i].count * downloadList[i].speed + download.download_speed) / (downloadList[i].count + 1);
                    console.log("new speed + " + downloadList[i].speed  );
                    break;
                }
            }
            if(i === downloadList.length)
                downloadList.push({asname : download.asname, count : 1,speed : download.download_speed, timestamp : download.timestamp})
        };
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
                    var asnameList;
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

                    focus.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxis);

                    focus.append("g")
                        .attr("class", "y axis")
                        .call(yAxis);

                    //tooltip
                    var div = d3.select(element[0]).append("div")
                        .attr("class", "tooltip")
                        .style("opacity", 0);

                    var formatTime = d3.time.format("%e/%m/%Y");

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
                        asnameList = publicDownloadList.map(function(d){return d.asname;});

                        console.log("ASNUM LIST " + JSON.stringify(asnameList));
                        asnameList.forEach(function (asn, i) {
                            $('#general-graph-button-' + asn).css('color', colors(i));
                            $('#user-graph-button-' + asn).css('color', colors(i));
                        });


                        console.log("user: " + JSON.stringify(userDownloadList));
                        console.log("public: " + JSON.stringify(publicDownloadList));

                        /*
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

*/
                        var valueList_x = [], maxY;
                        
                        userDownloadList.forEach(function (d, i) {
                            maxList_y_pub[i] = d3.max(d.downloads.map(function (d) {return d.speed;}));
                            valueList_x_pub = d.downloads.map(function (d) {return d.timestamp;});
                        });

                        //console.log("x extend: " + d3.extent(valueList_x));
                        //console.log("y max: " + d3.max(maxList_y));
                        x.domain(d3.extent(valueList_x));
                        y.domain([0, d3.max(maxList_y) * 1.3]);
                        x2.domain(x.domain());
                        y2.domain(y.domain());

                        // Set up zoom behavior
                        zoom.x(x);

                        /**
                         * Disegno grafico publico
                         * */
                        publicDownloadList.forEach(function (asname) {
                            var data = asname.downloads;
                            //console.log(JSON.stringify(asname.downloads));
                            data.forEach(function (dd) {
                                dd.timestamp = new Date(dd.timestamp);
                                focus.append("circle").datum(dd)
                                    .attr("class", "point public-graph public-graph-" + asname.asname)
                                    .attr("isvisible", "false")
                                    .attr("cx", function (d) {return x(d.timestamp)})
                                    .attr("cy", function (d) {return y(d.speed)})
                                    .attr("clip-path", "url(#clip)")
                                    .attr("r", circleSize)
                                    .attr("ds", function (d) {return d.speed;})
                                    .attr("ts", function (d) {return formatTime(d.timestamp);})
                                    .attr("fill", colors(asnameList.indexOf(asname.asname)));
                            });

                            focus.append("path")
                                .datum(data)
                                .attr("class", "line public-graph public-graph-" + asname.asname)
                                .attr("d", line)
                                .attr("isvisible", "false")
                                .attr("clip-path", "url(#clip)")
                                .attr("fill", "none")//,function(){return colors(i);})
                                .attr("stroke", colors(asnameList.indexOf(asname.asname)))
                                .style("stroke-dasharray", ("3, 3"));
                        });

                        /**
                         * Disegno grafico user
                         * */
                        userDownloadList.forEach(function (e) {
                            e.downloads.forEach(function (ee) {
                                ee.timestamp = new Date(ee.timestamp);
                                focus.append("circle").datum(ee)
                                    .attr("class", "point user-graph user-graph-" + e.asname)
                                    .attr("isvisible", "true")
                                    .attr("cx", function (d) {return x(d.timestamp)})
                                    .attr("cy", function (d) {return y(d.speed)})
                                    .attr("clip-path", "url(#clip)")
                                    .attr("ds", function (d) {return d.speed;})
                                    .attr("ts", function (d) {return formatTime(d.timestamp);})
                                    .attr("r", circleSize)
                                    .attr("fill", colors(asnameList.indexOf(e.asname)));
                            });
                            focus.append("path")
                                .datum(e.downloads)
                                .attr("class", "line user-graph user-graph-" + e.asname)
                                .attr("d", line)
                                .attr("isvisible", "true")
                                .attr("clip-path", "url(#clip)")
                                .attr("fill", "none")
                                .attr("stroke", colors(asnameList.indexOf(e.asname)));
                        });

                        updateTooltipListener();

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
                    }

                    function updateTooltipListener(){
                        var pane = $('.pane');
                        pane.mousemove(function (e) {
                            //var offset = pane.offset();
                            var offset = $(this).parent().offset();
                            var x = e.pageX - parseInt(offset.left) - margin.left, y = e.pageY - parseInt(offset.top) - margin.top;//e.pageX, y = e.pageY;//parseInt(offset.left), y = parseInt(offset.top);//e.pageX - parseInt(offset.left), y = e.pageY - parseInt(offset.top);

                            //console.log("x: " + x + ", y: " + y);
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
                                .style("left", (e.pageX) + "px")
                                .style("top", (e.pageY - 28) + "px");
                        });
                    }
                    function updateGraph(newDownloadList, type, asname){
                        console.log("ASNUM LIST " + JSON.stringify(asnameList));
                        //asnameList = scope.publicDownloadList.map(function(d){return d.asname;});
                        var isVisible = $('.line.' + type + "-graph-" + asname).attr("isvisible");

                        if(isVisible === undefined) isVisible = false;

                        console.log("isVisible " + isVisible);
                        //togliere linea dell/asname
                        var element =  focus.selectAll("." + type + "-graph-" + asname);
                        console.log(element);
                        element.remove();

                        newDownloadList.forEach(function(e){
                            e.timestamp = new Date(e.timestamp);
                            focus.append("circle").datum(e)
                                .attr("class", "point " + type + "-graph " + type + "-graph-" + asname)
                                .attr("cx", function (d) {return x(d.timestamp)})
                                .attr("cy", function (d) {return y(d.speed)})
                                .attr("clip-path", "url(#clip)")
                                .attr("r", circleSize)
                                .attr("isvisible", isVisible)
                                .attr("ds", function (d) {return d.speed;})
                                .attr("ts", function (d) {return formatTime(d.timestamp);})
                                .attr("fill", colors(asnameList.indexOf(asname)));
                        });
                        var newLine = focus.append("path")
                            .datum(newDownloadList)
                            .attr("class", "line " + type + "-graph " + type + "-graph-" + asname)
                            .attr("isvisible", isVisible)
                            .attr("d", line)
                            .attr("clip-path", "url(#clip)")
                            .attr("fill", "none")
                            .attr("stroke", colors(asnameList.indexOf(asname)));

                        if(type === "public")
                            newLine.style("stroke-dasharray", ("3, 3"));

                        if(isVisible === "false"){
                            $("." + type + "-graph-" + asname).hide();
                            console.log("NASCONDO");
                        }

                        updateTooltipListener();

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
                    scope.$watch('trigger.newSpeedDataUser', function (newVal) {

                        var asname = scope.trigger.userAsname;
                        if (newVal !== undefined) {
                            console.log("arrivato data su websocket user");
                            var newUserDownload = [], i;
                            for(i = 0; i<scope.userDownloadList.length; i++){
                                if(scope.userDownloadList[i].asname === asname){
                                    newUserDownload = scope.userDownloadList[i].downloads;
                                    break;
                                }
                            }
                            if(newUserDownload.length!= 0)
                                updateGraph(
                                    newUserDownload,
                                    'user',
                                    asname
                                );
                        }
                    });
                    scope.$watch('trigger.newSpeedDataPublic', function (newVal) {
                        var asname = scope.trigger.publicAsname;
                        if (newVal !== undefined) {
                            console.log("arrivato data su websocket public asname:" + asname);
                            var newPublicDownload = [];
                            for(var i = 0; i<scope.publicDownloadList.length; i++){
                                if(scope.publicDownloadList[i].asname === asname){
                                    newPublicDownload = scope.publicDownloadList[i].downloads;
                                    break;
                                }
                            }
                            console.log("newPublicDownload: " + JSON.stringify(newPublicDownload));
                            console.log("scope.publicDownloadList: " + JSON.stringify(scope.publicDownloadList));
                            if(newPublicDownload.length!= 0)
                                updateGraph(
                                    newPublicDownload,
                                    'public',
                                    asname
                                );
                        }
                    });

                });
            }
        }
    });
