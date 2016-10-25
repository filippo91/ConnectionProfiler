'use strict';

angular.module('myApp.speedGraph', ['ngRoute'])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/speedGraph/:year/:month/:day/:view', {
            templateUrl: 'partials/public/speedGraph.html',
            controller: 'speedGraph',
            controllerAs: 'controller'
        });
    }])
    .controller('speedGraph', ['$route', '$routeParams', '$scope', 'downloadFactory', '$rootScope', function($route, $routeParams, $scope, downloadManager,$rootScope) {

        $rootScope.enableChangeView = true;

        $scope.trigger = {arrived:false, count: 0, newSpeedDataUser : undefined, newSpeedDataPublic : undefined, nData : 1};

        function updateRootScopeCallback(data, t){

            var i;

            if(t) {
                for(i = 0; i < data.length; i++) {
                    if ($rootScope.userTimeList[data[i].timestamp] != 1) {
                        $rootScope.userTimeList[data[i].timestamp] = 1;
                        console.log("aggiungo a user");
                        downloadManager.updateDownloads($rootScope.userSpeedData, data[i]);
                    }
                }
            }else {
                for(i = 0; i < data.length; i++) {
                    if ($rootScope.publicTimeList[data[i].timestamp] != 1) {
                        $rootScope.publicTimeList[data[i].timestamp] = 1;
                        console.log("aggiungo a public");
                        downloadManager.updateDownloads($rootScope.publicSpeedData, data[i]);
                    }
                }
            }

        }

        if ($rootScope.authenticated) {
            $scope.trigger.nData++;
            downloadManager.getUserDownloads($routeParams.year, $routeParams.month, $routeParams.day, $routeParams.view, $scope.trigger, updateRootScopeCallback);
        }
        downloadManager.getPublicDownloads($routeParams.year, $routeParams.month, $routeParams.day, $routeParams.view, $scope.trigger, updateRootScopeCallback);

        /**
         * Web Socket callbacks
         */
        $rootScope.websocketCallbackUser = function (download) {
            console.log("aggiorno user");
            download.speed = download.download_speed;
            download.timestamp = moment.utc(download.timestamp).startOf('day').valueOf();
            download.count = 1;
            downloadManager.updateDownloads($rootScope.userSpeedData, download);
            //$scope.userDownloadList = downloadManager.splitByAsname($rootScope.userSpeedData);
            $scope.$apply(function () {
                console.log("applico user");
                $scope.trigger.userAsname = download.asname;
                $scope.trigger.newSpeedDataUser = $scope.trigger.newSpeedDataUser != true;
            });
        };
        $rootScope.websocketCallbackPublic = function(download){
            console.log("aggiorno public");
            download.speed = download.download_speed;
            download.timestamp = moment.utc(download.timestamp).startOf('day').valueOf();
            download.count = 1;
            downloadManager.updateDownloads($rootScope.publicSpeedData, download);
            //$scope.publicDownloadList = downloadManager.splitByAsname($rootScope.publicSpeedData);
            $scope.$apply(function () {
                console.log("applico public");
                $scope.trigger.publicAsname = download.asname;
                $scope.trigger.newSpeedDataPublic = $scope.trigger.newSpeedDataPublic != true;
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
            var ele = $("#"+aType+"-button-"+asname), graphEle = $("." + aType + "-graph-" + asname);
            if(ele.hasClass("active")){ //hide
                ele.removeClass("active");
                graphEle.fadeTo(200, 0);
                graphEle.attr("isvisible","false");
            }else{ //show
                ele.addClass("active");
                graphEle.fadeTo(200, 1);
                graphEle.attr("isvisible","true");
            }
        };

    }])

    .factory('downloadFactory', ['$resource', 'REST_API_URLs', function($resource, api) {
        var serverURI_user = api.speedGraphUser; 
        var serverURI_public = api.speedGraphPublic;
        
        var factory = {};

        factory.splitByAsname = function(downloadList){
            var asnameList = [];
            for(var i=0;i<downloadList.length;i++){
                for(var j=0;j<asnameList.length;j++){
                    if(downloadList[i].asname.localeCompare(asnameList[j].asname) == 0){
                        asnameList[j].downloads.push({count : downloadList[i].count, speed : downloadList[i].speed, timestamp : downloadList[i].timestamp});
                        break;
                    }
                }
                if(j==asnameList.length)
                    asnameList.push({"asname":downloadList[i].asname,"downloads": [{count : downloadList[i].count, speed : downloadList[i].speed, timestamp : downloadList[i].timestamp}]});
            }
            asnameList.forEach(function(ele){ele.downloads.sort(function(a,b){return a.timestamp - b.timestamp;});});
            console.log("SORTED");
            //console.log(JSON.stringify(asnameList));
            return asnameList;
        };

        factory.getUserDownloads = function (year,month,day,view,trigger, callback){
            $resource(serverURI_user).query({year: year, month : month, day : day, view : view}, function (downloadList) {
                callback(downloadList,true);
                trigger.arrived = ++trigger.count == trigger.nData;
            });
        };
        factory.getPublicDownloads = function (year,month,day,view,trigger, callback){
            $resource(serverURI_public).query({year: year, month : month, day : day, view : view}, function (downloadList) {
                console.log("arrivati public:\n" + JSON.stringify(downloadList));
                callback(downloadList,false);
                trigger.arrived = ++trigger.count == trigger.nData;
            });
        };

        factory.updateDownloads = function(downloadList, download){
            console.log("downloadList" + JSON.stringify(downloadList));
            console.log("download" + JSON.stringify(download));
            var i, j;
            for(i = 0; i < downloadList.length; i++){
                if(downloadList[i].asname.localeCompare(download.asname) == 0){
                    for(j = 0; j < downloadList[i].downloads.length; j++){
                        if(downloadList[i].downloads[j].timestamp == download.timestamp){
                            downloadList[i].downloads[j].speed = (downloadList[i].downloads[j].count * downloadList[i].downloads[j].speed + download.speed) / (downloadList[i].downloads[j].count + 1);
                            downloadList[i].downloads[j].count++;
                            break;
                        }
                    }
                    if(j == downloadList[i].downloads.length){
                        downloadList[i].downloads.push({asname : download.asname, count : download.count,speed : download.speed, timestamp : download.timestamp})
                        downloadList[i].downloads.sort(function(a,b){return a.timestamp - b.timestamp;});
                    }
                    break;
                }
            }
            if(i == downloadList.length){
                downloadList.push({asname : download.asname, downloads : [{asname : download.asname, count : download.count,speed : download.speed, timestamp : download.timestamp}]});
            }
            console.log("downloadList" + JSON.stringify(downloadList));
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
                if (this.readyState.localeCompare('complete') == 0) onScriptLoad();
            };
            scriptTag.onload = onScriptLoad;

            var s = $document[0].getElementsByTagName('body')[0];
            s.appendChild(scriptTag);

            return {
                d3: function() { return d.promise; }
            };
        }])
    .directive('downloadSpeedTemporalGraph',function($route, $routeParams,d3Service, $rootScope, downloadFactory){
        return{
            restrict: 'E',
            link: function(scope, element, attrs){
                d3Service.d3().then(function (d3) {
                    var circleSize = 4;
                    var asnameList;
                    var colors = d3.scale.category20();
                    var legend;

                    var margin = {top: 10, right: 10, bottom: 100, left: 50},
                        margin2 = {top: 430, right: 10, bottom: 20, left: 0},
                        totalWidth = 700,
                        width = totalWidth - margin.left - margin.right,
                        height = 500 - margin.top - margin.bottom,
                        height2 = 500 - margin2.top - margin2.bottom;

                    var x = d3.time.scale().range([0, width]),
                        x2 = d3.time.scale().range([0, width]),
                        y = d3.scale.linear().range([height, 0]),
                        y2 = d3.scale.linear().range([height2, 0]);

                    var formatTime = d3.time.format("%e/%m/%Y"),
                        speedFormat = d3.format(".2s");

                    var xAxis = d3.svg.axis().scale(x).orient("bottom").innerTickSize(-height).outerTickSize(0).tickPadding(10),
                        xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
                        yAxis = d3.svg.axis().scale(y).orient("left").tickFormat(speedFormat).innerTickSize(-width).outerTickSize(0).tickPadding(10);

                    var brush = d3.svg.brush().x(x2).on("brush", brushed);

                    var area = d3.svg.area()
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

                    //tooltip
                    var div = d3.select(element[0]).append("div")
                        .attr("class", "tooltip")
                        .style("opacity", 0);



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


                    function drawGraph(userDownloadList, publicDownloadList){
                        asnameList = publicDownloadList.map(function(d){return d.asname;});

                        asnameList.forEach(function (asn) {
                            $('#public-button-' + asn).css('color', colors(asn));
                            $('#user-button-' + asn).css('color', colors(asn));
                        });

                        //
                        //console.log("user: " + JSON.stringify(userDownloadList));
                        //console.log("public: " + JSON.stringify(publicDownloadList));

                        var valueList_x = [], maxList_y = [];

                        publicDownloadList.forEach(function (d, i) {
                            maxList_y[i] = d3.max(d.downloads.map(function (d) {return d.speed;}));
                            //console.log(d3.extent(d.downloads.map(function(v){return v.timestamp;})));
                            valueList_x = valueList_x.concat(d3.extent(d.downloads.map(function(v){return v.timestamp;})));
                        });

                        //console.log("x extend: " + valueList_x + " " +d3.extent(valueList_x));
                        //console.log("y max: " + d3.max(maxList_y));

                        var extentX = d3.extent(valueList_x);
                        if(valueList_x.length == 0 || extentX[0] == extentX[1]){
                            extentX = [$rootScope.startDate, $rootScope.endDate];
                        }
                        x.domain(extentX);
                        y.domain([0, d3.max(maxList_y) * 1.3]);
                        x2.domain(x.domain());
                        y2.domain(y.domain());

                        // Set up zoom behavior
                        zoom.x(x);

                        var allDownloadList = [];
                        /**
                         * Disegno grafico publico
                         * */
                        publicDownloadList.forEach(function (asname) {
                            var data = asname.downloads;
                            allDownloadList = allDownloadList.concat(data);
                            //console.log(JSON.stringify(asname.downloads));
                            data.forEach(function (dd) {
                                //dd.timestamp = new Date(dd.timestamp);
                                focus.append("circle").datum(dd)
                                    .attr("class", "point public-graph public-graph-" + asname.asname)
                                    .attr("isvisible", function(){return $rootScope.authenticated ? "false" : "true";})
                                    .attr("cx", function (d) {return x( new Date(d.timestamp))})
                                    .attr("cy", function (d) {return y(d.speed)})
                                    .attr("clip-path", "url(#clip)")
                                    .attr("r", circleSize)
                                    .attr("ds", function (d) {return d.speed;})
                                    .attr("ts", function (d) {return formatTime(new Date(d.timestamp));})
                                    .attr("fill", colors(asname.asname));
                            });

                            focus.append("path")
                                .datum(data)
                                .attr("class", "line public-graph public-graph-" + asname.asname)
                                .attr("d", line)
                                .attr("isvisible", function(){return $rootScope.authenticated ? "false" : "true";})
                                .attr("clip-path", "url(#clip)")
                                .attr("fill", "none")//,function(){return colors(i);})
                                .attr("stroke", colors(asname.asname))
                                .style("stroke-dasharray", ("3, 3"));
                        });

                        if($rootScope.authenticated) {
                            /**
                             * Disegno grafico user
                             * */
                            userDownloadList.forEach(function (e) {
                                e.downloads.forEach(function (ee) {
                                    //ee.timestamp = new Date(ee.timestamp);
                                    focus.append("circle").datum(ee)
                                        .attr("class", "point user-graph user-graph-" + e.asname)
                                        .attr("isvisible", "true")
                                        .attr("cx", function (d) {
                                            return x(new Date(d.timestamp))
                                        })
                                        .attr("cy", function (d) {
                                            return y(d.speed)
                                        })
                                        .attr("clip-path", "url(#clip)")
                                        .attr("ds", function (d) {
                                            return d.speed;
                                        })
                                        .attr("ts", function (d) {
                                            return formatTime(new Date(d.timestamp));
                                        })
                                        .attr("r", circleSize)
                                        .attr("fill", colors(e.asname));
                                });
                                focus.append("path")
                                    .datum(e.downloads)
                                    .attr("class", "line user-graph user-graph-" + e.asname)
                                    .attr("d", line)
                                    .attr("isvisible", "true")
                                    .attr("clip-path", "url(#clip)")
                                    .attr("fill", "none")
                                    .attr("stroke", colors(e.asname));
                            });
                        }

                        updateTooltipListener();

                        context.append("path")
                            .datum(allDownloadList.sort(function(a,b){return a.timestamp - b.timestamp;}))
                            .attr("class", "area")
                            .attr("d", area);

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

                        legend = svg.selectAll(".legend")
                            .data(asnameList.slice().reverse())
                            .enter().append("g")
                            .attr("class", "legend")
                            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

                        legend.append("rect")
                            .attr("x", width - 18)
                            .attr("width", 18)
                            .attr("opacity",.5)
                            .attr("height", 18)
                            .style("fill", colors);

                        legend.append("text")
                            .attr("x", width - 24)
                            .attr("y", 9)
                            .attr("dy", ".35em")
                            .style("text-anchor", "end")
                            .text(function(d) { return d; });

                        focus.append("g")
                            .attr("class", "x axis")
                            .attr("transform", "translate(0," + height + ")")
                            .call(xAxis)
                            .append("text")
                            .attr("x", width / 2)
                            .attr("y", 30)
                            .attr("dy", ".35em")
                            .style("text-anchor", "end")
                            .text("Time");

                        focus.append("g")
                            .attr("class", "y axis")
                            .call(yAxis)
                            .append("text")
                            .attr("dy", ".35em")
                            .style("text-anchor", "end")
                            .attr("transform", "translate(-40,"+(height/3)+")rotate(-90)")
                            .text("Speed [bps]");

                        //console.log($rootScope.getCurrentExtentDate().map(function(d){return d.valueOf();}));
                        //console.log($rootScope.getCurrentExtentDate());

                        if($rootScope.lastExtent != undefined) {
                            brush.extent($rootScope.lastExtent);
                            brush(d3.select(".brush"));
                            brush.event(d3.select(".brush"));
                        }

                        brush.extent([$rootScope.startDate, $rootScope.endDate]);
                        brush(d3.select(".brush").transition().duration(2000));
                        brush.event(d3.select(".brush").transition().duration(2000));

                        d3.selectAll("path.domain").style("shape-rendering", "geometricPrecision");

                        if($rootScope.authenticated)    $('.public-graph').hide();
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
                            if (elements.length == 0) {
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
                                .style("left", x + "px")
                                .style("top", (y - 9) + "px");
                        });
                    }
                    function updateGraph(newDownloadList, type, asname){
                        if(asnameList.indexOf(asname) < 0)
                            asnameList.push(asname);
                       // console.log("ASNUM LIST " + JSON.stringify(asnameList));
                        //asnameList = scope.publicDownloadList.map(function(d){return d.asname;});
                        var isVisible = $('.point.' + type + "-graph-" + asname).attr("isvisible");
                        var tmpMax = y.domain()[1];
                        newDownloadList.forEach(function(e){if(e.speed > tmpMax) tmpMax = e.speed;});
                        if(tmpMax != y.domain()[1]){
                            y.domain([0,tmpMax * 1.3]);
                        }
                        if(isVisible == undefined) isVisible = false;

                        //console.log("isVisible " + isVisible);
                        //togliere linea dell/asname
                        var element =  focus.selectAll("." + type + "-graph-" + asname);
                        console.log(element);
                        element.remove();
                        legend.remove();

                        newDownloadList.forEach(function(e){
                            //e.timestamp = new Date(e.timestamp);
                            focus.append("circle").datum(e)
                                .attr("class", "point " + type + "-graph " + type + "-graph-" + asname)
                                .attr("cx", function (d) {return x(new Date(d.timestamp))})
                                .attr("cy", function (d) {return y(d.speed)})
                                .attr("clip-path", "url(#clip)")
                                .attr("r", circleSize)
                                .attr("isvisible", isVisible)
                                .attr("ds", function (d) {return d.speed;})
                                .attr("ts", function (d) {return formatTime(new Date(d.timestamp));})
                                .attr("fill", colors(asname));
                        });
                        var newLine = focus.append("path")
                            .datum(newDownloadList)
                            .attr("class", "line " + type + "-graph " + type + "-graph-" + asname)
                            .attr("isvisible", isVisible)
                            .attr("d", line)
                            .attr("clip-path", "url(#clip)")
                            .attr("fill", "none")
                            .attr("stroke", colors(asname));

                        if(type.localeCompare("public") == 0)
                            newLine.style("stroke-dasharray", ("3, 3"));

                        if(tmpMax != y.domain()[1]){
                            d3.select(".y.axis").call(yAxis);
                        }

                        if(isVisible == "false"){
                            $("." + type + "-graph-" + asname).hide();
                            console.log("NASCONDO");
                        }

                        legend = svg.selectAll(".legend")
                            .data(asnameList.slice().reverse())
                            .enter().append("g")
                            .attr("class", "legend")
                            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

                        legend.append("rect")
                            .attr("x", width - 18)
                            .attr("width", 18)
                            .attr("opacity",.5)
                            .attr("height", 18)
                            .style("fill", colors);

                        legend.append("text")
                            .attr("x", width - 24)
                            .attr("y", 9)
                            .attr("dy", ".35em")
                            .style("text-anchor", "end")
                            .text(function(d) { return d; });

                        updateTooltipListener();

                    }
                    scope.$watch('trigger.arrived', function (newVal) {
                        if (newVal == true) {
                            console.log("disegno");
                            drawGraph(
                                scope.userSpeedData,
                                scope.publicSpeedData
                            );
                        }
                    });
                    scope.$watch('trigger.newSpeedDataUser', function (newVal) {

                        var asname = scope.trigger.userAsname;
                        if (newVal != undefined) {
                            console.log("arrivato data su websocket user");
                            var newUserDownload = [], i;
                            for(i = 0; i<scope.userSpeedData.length; i++){
                                if(scope.userSpeedData[i].asname.localeCompare(asname) == 0){
                                    newUserDownload = scope.userSpeedData[i].downloads;
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
                        if (newVal != undefined) {
                            console.log("arrivato data su websocket public asname:" + asname);
                            var newPublicDownload = [];
                            for(var i = 0; i<scope.publicSpeedData.length; i++){
                                if(scope.publicSpeedData[i].asname.localeCompare(asname) == 0){
                                    newPublicDownload = scope.publicSpeedData[i].downloads;
                                    break;
                                }
                            }
                            console.log("newPublicDownload: " + JSON.stringify(newPublicDownload));
                            console.log("scope.publicDownloadList: " + JSON.stringify(scope.publicSpeedData));
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
    })
    .controller('speedGraphPlotInfoController', ['plotsInfoService', function(plotsInfoService){
	var self = this;
	
	self.plotInfo = plotsInfoService.getInfo('speedGraph');
}]);
