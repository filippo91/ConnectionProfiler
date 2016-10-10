'use strict';

angular.module('myApp.latency', ['ngRoute', 'ngResource'])

    .config(['$routeProvider', function($routeProvider) {
      $routeProvider.when('/latency/:year/:month/:day/:view/:bin_width', {
        templateUrl: 'partials/restricted/latency.html',
        controller: 'latency'
      });
    }])

    .controller('latency', ['$route', '$routeParams', 'latencyFactory', '$scope', '$rootScope', function($route, $routeParams, latencyFactory, $scope, $rootScope) {

        $("#timeManager").css('visibility', 'visible');
        $("#realtimediv").css('visibility', 'visible');

        $scope.trigger = {arrived: false, newData : undefined};
        $scope.latencyData = [];
        $("#" + $routeParams.view + "BtnDBA").addClass("active");
        $scope.latencyData = latencyFactory.getLatencyData($routeParams.year, $routeParams.month, $routeParams.day, $routeParams.view, $routeParams.bin_width, $scope.trigger);

        /**
         * Web Socket callbacks
         */
            /*
        var privateSubscription = null;
        var socket = null;
        $scope.connectPrivate = function () {
            socket = new SockJS('http://localhost:8080/connectionProfiler/connection-profiler-websocket');
            var stompClient = Stomp.over(socket);
            stompClient.connect({}, function (frame) {
                console.log('Connected: ' + frame);
                privateSubscription = stompClient.subscribe('/user/' + $rootScope.user.name + '/downloads', function (packet) {
                    var download =JSON.parse(packet.body).payload;
                    if($rootScope.isRelevant(download)) {
                        latencyFactory.updateLatencyData($scope.latencyData, download, $routeParams.bin_width);
                        $scope.$apply(function () {
                            $scope.trigger.newData = $scope.trigger.newData !== true;
                        });
                    }
                });
            });
        };
        $scope.disconnectPrivate = function(){
            if(privateSubscription != null){
                privateSubscription.unsubscribe();
                privateSubscription = null;
            }
        };
        $scope.$on('$destroy', function () {
            console.log(privateSubscription);
            if (privateSubscription != null) {
                privateSubscription.unsubscribe();
            }
        });
        */
        $rootScope.websocketCallbackUser = function (download) {
            if($rootScope.isRelevant(download)) {
                latencyFactory.updateLatencyData($scope.latencyData, download, $routeParams.bin_width);
                $scope.$apply(function () {
                    $scope.trigger.newData = $scope.trigger.newData !== true;
                });
             }
            console.log("CIAONEEEE latency");
        };
        $rootScope.websocketCallbackPublic = function(){};
    }])

    .factory('latencyFactory',['$resource', function($resource){
        var requestURL = "http://localhost:8080/connectionProfiler/latencyHistogram/:year/:month/:day/:view/:bin_width";
        var factory = {};
        factory.getLatencyData = function(year, month, day, view, bin_width, trigger){
            var data =  $resource(requestURL).query({year : year, month : month, day : day, view : view, bin_width : bin_width}, function(latencyData){
            	trigger.arrived = true;
                console.log(JSON.stringify(latencyData)); 
            });
            return data;
        };
        factory.splitByAsnum = function(values){
            var ret = [];
            console.log("values: " + JSON.stringify(values));
            for(var i = 0;i<values.length; i++){
                for(var j = 0; j < ret.length; j++){
                    if(values[i].asnum === ret[j].asnum){
                        ret[j].values.push({bin : values[i].bin, nRecords : values[i].nRecords, asnum : values[i].asnum}); break;
                    }
                }
                if(j === ret.length)
                    ret.push({asnum : values[i].asnum, values : [{bin : values[i].bin, nRecords : values[i].nRecords, asnum : values[i].asnum}]});
            }
            console.log(JSON.stringify(ret));
            return ret;
        };
        factory.splitByBin = function(values){
            var ret = [];
            console.log("splitByBin: " + JSON.stringify(values));
            for(var i = 0;i<values.length; i++){
                for(var j = 0; j < ret.length; j++){
                    if(values[i].bin === ret[j].bin){
                        ret[j].values.push({nRecords : values[i].nRecords, asnum : values[i].asnum}); break;
                    }
                }
                if(j === ret.length)
                    ret.push({bin : values[i].bin, values : [{nRecords : values[i].nRecords, asnum : values[i].asnum}]});
            }
            console.log(JSON.stringify(ret));
            return ret;
        };
        factory.updateLatencyData = function(latencyData,download, bin_width){

            console.log("latencyData: " + JSON.stringify(latencyData));
            var index = parseInt(download.connect_time / bin_width);
            var i;
            for(i = 0; i < latencyData.length; i++){
                if(latencyData[i].asnum === download.asnum && latencyData[i].bin === index){
                    latencyData[i].nRecords++; console.log("ciaone!!!");break;
                }
            }
            if(i === latencyData.length)
                latencyData.push({asnum : download.asnum, bin : index, nRecords : 1});
            console.log("latencyData: " + JSON.stringify(latencyData));
        };
        return factory;
    }])

.directive('latencyHistogram',function($route, $routeParams,d3Service,latencyFactory, getAsnumListFilter){
    return {
        restrict: 'E',
        link: function(scope,element){
            d3Service.d3().then(function(d3){

                var margin = {top: 10, right: 30, bottom: 30, left: 30},
                    real_width = 960, real_height = 500,
                    width = real_width - margin.left - margin.right,
                    height = real_height - margin.top - margin.bottom,
                    radius = Math.min(width, height) / 2;

                var color = d3.scale.category10();

                var svg = d3.select(element[0]).append("svg")
                    .attr("width", real_width)
                    .attr("height", real_height)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                //loading icon
                svg.append("image")
                    .attr("class", "loading")
                    .attr("xlink:href", "img/Preloader_1.gif")
                    .attr("x", -32 + width / 2)
                    .attr("y", -32 + height / 2)
                    .attr("width", 64)
                    .attr("height", 64);


                var drawHistogram = function(animation){

                    $(element[0]).empty();

                    svg = d3.select(element[0]).append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    // Define the div for the tooltip
                    var div = d3.select(element[0]).append("div")
                        .attr("class", "tooltip tooltip-large")
                        .style("opacity", 0);

                    svg.selectAll(".loading").remove();

                    var values = scope.latencyData;
                    var values_arr = latencyFactory.splitByBin(values);
                    var asnumList = getAsnumListFilter(values);
                    var binWidth = $routeParams.bin_width;

                    console.log("asnumList: " + asnumList);
                    if(values === undefined || values.length === 0){
                        svg.attr("transform", "translate(" + real_width / 2 + "," + real_height / 2 + ")");
                        svg.append('defs')
                            .append('pattern')
                            .attr('id', 'diagonalHatch')
                            .attr('patternUnits', 'userSpaceOnUse')
                            .attr('class', 'noData')
                            .attr('width', 10)
                            .attr('height', 10)
                            .append('image')
                            .attr('xlink:href', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMCcgaGVpZ2h0PScxMCc+CiAgPHJlY3Qgd2lkdGg9JzEwJyBoZWlnaHQ9JzEwJyBmaWxsPSdibGFjaycvPgogIDxwYXRoIGQ9J00tMSwxIGwyLC0yCiAgICAgICAgICAgTTAsMTAgbDEwLC0xMAogICAgICAgICAgIE05LDExIGwyLC0yJyBzdHJva2U9J3doaXRlJyBzdHJva2Utd2lkdGg9JzInLz4KPC9zdmc+')
                            .attr('x', 0)
                            .attr('y', 0)
                            .attr('width', 10)
                            .attr('height', 10)
                            .attr('opacity', 0.1);

                        svg.append("circle")
                            .attr("r", radius)
                            .attr('fill', 'url(#diagonalHatch)');

                        svg.append("text")
                            .style("text-anchor", "middle")
                            .style("font-family", "sans-serif")
                            .style("font-size", "20px")
                            .text("No data to show");
                        return;
                    }
                    var maxBin = d3.max(values,function(e){return e.bin;}), maxValueY = d3.max(values, function(e){ return e.nRecords});

                    var binList = [];
                    for(var i = 0; i <= maxBin; i++)    binList.push(i);
                    console.log("binList : " + binList);

                    var x0 = d3.scale.ordinal().domain(binList).rangeRoundBands([0, width], .2);
                    var x1 = d3.scale.ordinal().domain(asnumList).rangeRoundBands([0, x0.rangeBand()],.1);
                    var y = d3.scale.linear().domain([0, maxValueY]).range([height, 0]);

                    values_arr.forEach(function(d){
                        console.log("X0: " + d.bin + " -> " + x0(d.bin));
                    });
                    asnumList.forEach(function(d){
                        console.log("X1: " + x0.rangeBand() + ", " + x1(d));
                    });
                    var xAxis = d3.svg.axis().scale(x0).orient("bottom").tickFormat(function(d){return (d + 1) * binWidth + "ms";});//.tickValues(ris);
                    var yAxis = d3.svg.axis().scale(y).orient("left");


                    var bins = svg.selectAll(".bin")
                        .data(values_arr)
                        .enter().append("g")
                        .attr("class", "bin")
                        .attr("transform", function(d) {return "translate(" + x0(d.bin) + ",0)"; });

                    var bar = bins.selectAll("bar")
                        .data(function(d) { return d.values; })
                        .enter().append("g")
                        .attr("class", "bar");

                    var rect = bar.append("rect")
                        .attr("class", "rect")
                        .attr("width", x1.rangeBand())
                        .attr("x", function(d) { return x1(d.asnum); })
                        .style("fill", function(d) { return color(d.asnum); })
                        .attr("opacity",.7);

                    if(animation){
                        rect.attr("height", 0)
                            .attr("y", height)
                            .transition()
                            .duration(500)
                            .attr("y", function(d) { return y(d.nRecords); })
                            .attr("height", function(d) { return height - y(d.nRecords); });
                    }else{
                        rect.attr("y", function(d) { return y(d.nRecords); })
                            .attr("height", function(d) { return height - y(d.nRecords); });
                    }

                    var text = bar.append("text")
                        .attr("dy", ".75em")
                        .attr("x", function(d) { return x1(d.asnum) + x1.rangeBand() / 2; })
                        .attr("text-anchor", "middle")
                        .style("fill","white")
                        .text(function(d) { return d.nRecords; });

                    if(animation){
                        text.attr("height", 0)
                            .attr("y", height)
                            .transition()
                            .duration(500)
                            .attr("y", function(d) { return y(d.nRecords) + 10; })
                            .attr("height", function(d) { return height - y(d.nRecords); });
                    }else{
                        text.attr("y", function(d) { return y(d.nRecords) + 10; })
                            .attr("height", function(d) { return height - y(d.nRecords); });
                    }
                    var legend = svg.selectAll(".legend")
                        .data(asnumList.slice().reverse())
                        .enter().append("g")
                        .attr("class", "legend")
                        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

                    legend.append("rect")
                        .attr("x", width - 18)
                        .attr("width", 18)
                        .attr("opacity",.7)
                        .attr("height", 18)
                        .style("fill", color);

                    legend.append("text")
                        .attr("x", width - 24)
                        .attr("y", 9)
                        .attr("dy", ".35em")
                        .style("text-anchor", "end")
                        .text(function(d) { return d; });

                    var tmp = $(".bar");
                    var offset = tmp.offset();
                    tmp.mousemove(function(e){
                        var x = e.pageX - parseInt(offset.left), y = e.pageY - parseInt(offset.top);
                        tmp.css('cursor', 'pointer');
                        div.transition()
                            .duration(200)
                            .style("opacity", .9);
                        div.html("<i>Asnum: </i><b>" + d3.select(this).data()[0].asnum + "</b><br><i>nRecords: </i><b>" + d3.select(this).data()[0].nRecords + "</b>")
                            .style("left", (x) + "px")
                            .style("top", (y - 28)  + "px");
                    })
                        .mouseleave(function(){
                            div.transition()
                                .duration(500)
                                .style("opacity", 0);
                        });

                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxis);

                    svg.append("g")
                        .attr("class", "y axis")
                        .call(yAxis);
                };

                scope.$watch('trigger.arrived',function(newVal){
                    if(newVal === true){
                        console.log("ci entro");
                        drawHistogram(true);
                    }
                });

                scope.$watch('trigger.newData',function(asnum){
                    if(asnum !== undefined) {
                        console.log("disegno lat histo!");
                        drawHistogram(false);
                    }
                });
            });
        }
    }
})
    .filter('getAsnumList',function(){
        return function(input){
            console.log("sdafdsafsdafasd");
            var  ret = [];
            if(input === undefined || input.length === 0) return ret;
            input.forEach(function(download){
                if(ret.indexOf(download.asnum) === -1)
                    ret[ret.length] = (download.asnum);
            });
            console.log("split");
            console.log(JSON.stringify(ret));
            return ret.sort(function(a,b){ return parseInt(a) > parseInt(b);});
        };
    });