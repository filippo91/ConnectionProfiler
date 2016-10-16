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

    	$rootScope.enableChangeView = true;
    	
        $scope.trigger = {arrived:false, count: 0, newSpeedDataUser : undefined, newSpeedDataPublic : undefined, nData : 1};

        function updateRootScopeCallback(data, t){
            if(t) {
                $scope.userDownloadList = downloadManager.splitByAsname(data);
            }else {
                $scope.publicDownloadList = downloadManager.splitByAsname(data);
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
                serverURI_public = "http://localhost:8080/connectionProfiler/publics/speedGraph/:year/:month/:day/:view";
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
                        width = 960 - margin.left - margin.right,
                        height = 500 - margin.top - margin.bottom;

                    var x = d3.time.scale().range([0, width]),
                        y = d3.scale.linear().range([height, 0]);

                    var formatTime = d3.time.format("%e/%m/%Y"),
                        speedFormat = d3.format(".2s");

                    var xAxis = d3.svg.axis().scale(x).orient("bottom"),
                        yAxis = d3.svg.axis().scale(y).orient("left").tickFormat(speedFormat);

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

                    //tooltip
                    var div = d3.select(element[0]).append("div")
                        .attr("class", "tooltip")
                        .style("opacity", 0);


                    function drawGraph(userDownloadList, publicDownloadList){
                        asnameList = publicDownloadList.map(function(d){return d.asname;});

                        console.log("ASNUM LIST " + JSON.stringify(asnameList));
                        asnameList.forEach(function (asn, i) {
                            $('#general-graph-button-' + asn).css('color', colors(i));
                            $('#user-graph-button-' + asn).css('color', colors(i));
                        });


                        console.log("user: " + JSON.stringify(userDownloadList));
                        console.log("public: " + JSON.stringify(publicDownloadList));

                        var valueList_x = [], maxList_y = [];

                        publicDownloadList.forEach(function (d, i) {
                            maxList_y[i] = d3.max(d.downloads.map(function (d) {return d.speed;}));
                            console.log(d3.extent(d.downloads.map(function(v){return v.timestamp;})));
                            valueList_x = valueList_x.concat(d3.extent(d.downloads.map(function(v){return v.timestamp;})));
                        });

                        console.log("x extend: " + valueList_x + " " +d3.extent(valueList_x));
                        console.log("y max: " + d3.max(maxList_y));

                        x.domain(d3.extent(valueList_x));
                        y.domain([0, d3.max(maxList_y) * 1.3]);

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

                        if($rootScope.authenticated) {
                            /**
                             * Disegno grafico user
                             * */
                            userDownloadList.forEach(function (e) {
                                e.downloads.forEach(function (ee) {
                                    ee.timestamp = new Date(ee.timestamp);
                                    focus.append("circle").datum(ee)
                                        .attr("class", "point user-graph user-graph-" + e.asname)
                                        .attr("isvisible", "true")
                                        .attr("cx", function (d) {
                                            return x(d.timestamp)
                                        })
                                        .attr("cy", function (d) {
                                            return y(d.speed)
                                        })
                                        .attr("clip-path", "url(#clip)")
                                        .attr("ds", function (d) {
                                            return d.speed;
                                        })
                                        .attr("ts", function (d) {
                                            return formatTime(d.timestamp);
                                        })
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
                        }

                        updateTooltipListener();

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
                                scope.publicDownloadList
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
