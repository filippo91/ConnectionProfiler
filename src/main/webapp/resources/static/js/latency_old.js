'use strict';

angular.module('myApp.latency', ['ngRoute', 'ngResource'])

    .config(['$routeProvider', function($routeProvider) {
      $routeProvider.when('/latency/:year/:month/:day/:view/:bin_width', {
        templateUrl: 'partials/restricted/latency.html',
        controller: 'latency'
      });
    }])

    .controller('latency', ['$route', '$routeParams', 'latencyFactory', '$scope', '$rootScope', function($route, $routeParams, latencyFactory, $scope, $rootScope) {
        $("#timeManager").show();

        $scope.trigger = {arrived: false, newData : undefined};
        $scope.latencyData = [];
        $("#" + $routeParams.view + "BtnDBA").addClass("active");
        $scope.latencyData = latencyFactory.getLatencyData($routeParams.year, $routeParams.month, $routeParams.day, $routeParams.view, $routeParams.bin_width, $scope.trigger);

        $scope.showAllAsnum = function(){
            var ele = $('#showAll');
            if(ele.hasClass('active')){
                $(".asnumButton").removeClass("active");
                $(".bar").fadeTo(500, 0);
                ele.removeClass("active");
                ele.text("Show All")
            }else {
                $(".asnumButton").addClass("active");
                $(".bar").fadeTo(500, 1);
                ele.addClass("active");
                ele.text("Hide All");
            }
        };
        $scope.showAsnum = function(asnum){
            var ele = $("#button-"+asnum);
            if(ele.hasClass("active")){ //hide
                ele.removeClass("active");
                $(".bar-" + asnum).fadeTo(500, 0);
            }else{ //show
                ele.addClass("active");
                $(".bar-" + asnum).fadeTo(500, 1);
            }
        };

        /**
         * Web Socket
         */
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
    }])

    .factory('latencyFactory',['$resource', function($resource){
        var requestURL = "http://localhost:8080/connectionProfiler/latencyHistogram/:year/:month/:day/:view/:bin_width";
        var factory = {};
        factory.getLatencyData = function(year, month, day, view, bin_width, trigger){
            var data =  $resource(requestURL).query({year : year, month : month, day : day, view : view, bin_width : bin_width}, function(latencyData){
            	trigger.arrived = true;
            });
            return data;
        };
        factory.splitByAsnum = function(values){
            var ret = [];
            for(var i = 0;i<values.length; i++){
                for(var j = 0; j < ret.length; j++){
                    if(values[i].asnum === ret[j].asnum){
                        ret[j].values.push({bin : values[i].bin, nRecords : values[i].nRecords}); break;
                    }
                }
                if(j === ret.length)
                    ret.push({asnum : values[i].asnum, values : [{bin : values[i].bin, nRecords : values[i].nRecords}]});
            }
            return ret;
        };
        factory.updateLatencyData = function(latencyData,download, bin_width){
            var index = parseInt(download.connect_time / bin_width);
            var i;
            for(i = 0; i < latencyData.length; i++){
                if(latencyData[i].asnum === download.asnum && latencyData[i].bin === index){
                    latencyData[i].nRecords++; console.log("ciaone!!!");break;
                }
            }
            if(i === latencyData.length)
                latencyData.push({asnum : download.asnum, bin : index, nRecords : 1});
        };
        return factory;
    }])

.directive('latencyHistogram',function($route, $routeParams,d3Service,latencyFactory){
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
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
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


                var drawHistogram = function(){

                    $(element[0]).empty();

                    svg = d3.select(element[0]).append("svg")
                        .attr("width", real_width)
                        .attr("height", real_height)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    // Define the div for the tooltip
                    var div = d3.select(element[0]).append("div")
                        .attr("class", "tooltip tooltip-large")
                        .style("opacity", 0);



                    svg.selectAll(".loading").remove();

                    var values = scope.latencyData;
                    var values_arr = latencyFactory.splitByAsnum(values);
                    if(values === undefined || values.length === 0){
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
                    var maxBin = d3.max(values,function(e){return e.bin;}), maxValueX = (maxBin + 1) * $routeParams.bin_width, maxValueY = d3.max(values, function(e){ return e.nRecords});

                    console.log("max x : " + maxValueX);

                    var x = d3.scale.linear().domain([0, maxValueX]).range([0, width]);
                    var y = d3.scale.linear().domain([0, maxValueY]).range([height, 0]);

                    var ris = [];for(var i = 0; i <= maxBin; ris.push(i++ * $routeParams.bin_width)); ris.push(maxValueX);
                    console.log(ris);
                    var xAxis = d3.svg.axis().scale(x).orient("bottom").tickValues(ris);
                    var yAxis = d3.svg.axis().scale(y).orient("left");

                    var bar = [];
                    values_arr.forEach(function(ele, i){
                        console.log("ora disegno : " + ele.asnum);
                        bar[ele.asnum]  = svg.selectAll(".bar-"+ele.asnum)
                            .data(ele.values)
                            .enter().append("g")
                            .attr("class", "bar bar-"+ele.asnum)
                            .attr("transform", function(d) { return "translate(" + parseInt(x(d.bin * $routeParams.bin_width)+1) + "," + y(d.nRecords) + ")"; });



                        var rect = bar[ele.asnum].append("rect")
                            .attr("x", 1)
                            .attr("width", x($routeParams.bin_width) - 2)
                            .attr("height", 0)
                            .attr("y", function(d){ return height - y(d.nRecords);})
                            .attr("fill", color(i%10))
                            .attr("opacity", function(){ var ret =0.9 - (values_arr.length) / 10; if(ret < 0.4) return 0.4; return ret;})
                            .transition()
                            .duration(500)
                            .attr("height", function(d) { return height - y(d.nRecords); })
                            .attr("y", 0);

                        bar[ele.asnum].append("text")
                            .attr("dy", ".75em")
                            .attr("y", function(d){ if(d.nRecords===0) return -15; else return 6;})
                            .attr("x", x($routeParams.bin_width) / 2 - 1)
                            .attr("text-anchor", "middle")
                            .style("fill","white")
                            .text(function(d) { return d.nRecords; });
                        var tmp = $(".bar-"+ele.asnum);
                        var offset = tmp.offset();
                        tmp.mousemove(function(e){
                            console.log(JSON.stringify( d3.select(this).data()[0]));
                            var x = e.pageX - parseInt(offset.left), y = e.pageY - parseInt(offset.top);
                            tmp.css('cursor', 'pointer');
                            div.transition()
                                .duration(200)
                                .style("opacity", .9);
                            div.html("<i>Asnum: </i><b>" + ele.asnum + "</b><br><i>Latency: </i><b>" + d3.select(this).data()[0].bin * $routeParams.bin_width + " ms</b>")
                                .style("left", (x) + "px")
                                .style("top", (y - 28)  + "px");
                        })
                            .mouseleave(function(){
                                div.transition()
                                    .duration(500)
                                    .style("opacity", 0);
                            });
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
                        drawHistogram();
                    }
                });

                scope.$watch('trigger.newData',function(asnum){
                    if(asnum !== undefined) {
                        console.log("disegno lat histo!");
                        drawHistogram();
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