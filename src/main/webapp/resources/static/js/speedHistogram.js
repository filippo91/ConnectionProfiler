'use strict';

angular.module('myApp.speedHistogram', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/speedHistogram/:year/:month/:day/:view/:bin_width', {
    templateUrl: 'partials/restricted/speedHistogram.html',
    controller: 'speedHistogram'
  });
}])

.controller('speedHistogram',['$route', '$routeParams', 'speedFactory', '$scope', '$rootScope', function($route, $routeParams, speedFactory, $scope, $rootScope) {

        $scope.trigger = {arrived: false, count : 0, newSpeedDataUser : undefined, newSpeedDataPublic : undefined};

        $("#" + $routeParams.view + "Btn").addClass("active");
        $("#timeManager").show();

        $scope.speedDataUser = speedFactory.getSpeedDataUser($routeParams.year, $routeParams.month, $routeParams.day, $routeParams.view, $routeParams.bin_width, $scope.trigger);
        $scope.speedDataPublic = speedFactory.getSpeedDataPublic($routeParams.year, $routeParams.month, $routeParams.day, $routeParams.view, $routeParams.bin_width, $scope.trigger);

        $scope.showAllAsnum = function(aType){
            var ele = $('#'+aType+'-showAll');
            if(ele.hasClass('active')){
                $("."+aType+"-asnumButton").removeClass("active");
                $(".bar-" + aType).fadeTo(500, 0);
                ele.removeClass("active");
                ele.text("Show All")
            }else {
                $("."+aType+"-asnumButton").addClass("active");
                $(".bar-" + aType).fadeTo(500, 1);
                ele.addClass("active");
                ele.text("Hide All");
            }
        };
        $scope.showAsnum = function(asnum,aType){
            var ele = $("#"+aType+"-button-"+asnum);
            if(ele.hasClass("active")){ //hide
                ele.removeClass("active");
                $(".bar-" + aType + "-" + asnum).fadeTo(500, 0);
            }else{ //show
                ele.addClass("active");
                $(".bar-" + aType + "-" + asnum).fadeTo(500, 1);
            }
        };


        /**
         * Web Socket, 2 topics public and private
         */
        var privateSubscription = null;
        var publicSubscription = null;
        var socket = null;
        $scope.connect = function () {
            socket = new SockJS('http://localhost:8080/connectionProfiler/connection-profiler-websocket');
            var stompClient = Stomp.over(socket);
            stompClient.connect({}, function (frame) {
                console.log('Connected: ' + frame);
                privateSubscription = stompClient.subscribe('/user/' + $rootScope.user.name + '/downloads', function (packet) {
                    var download =JSON.parse(packet.body).payload;
                    if($rootScope.isRelevant(download)) {
                        speedFactory.updateSpeedData($scope.speedDataUser,download, $routeParams.bin_width);
                        $scope.$apply(function () {
                            $scope.trigger.newSpeedDataUser = $scope.trigger.newSpeedDataUser !== true;
                        });
                    }
                });
                publicSubscription = stompClient.subscribe('/topic/downloads', function (packet) {
                    var download =JSON.parse(packet.body).payload;
                    if($rootScope.isRelevant(download)) {
                        speedFactory.updateSpeedData($scope.speedDataPublic,download, $routeParams.bin_width);
                        $scope.$apply(function () {
                            $scope.trigger.newSpeedDataPublic = $scope.trigger.newSpeedDataPublic !== true;
                        });
                    }
                });
            });
        };
        $scope.disconnect = function(){
            if(privateSubscription != null){
                privateSubscription.unsubscribe();
                privateSubscription = null;
            }
            if(publicSubscription != null){
                publicSubscription.unsubscribe();
                publicSubscription = null;
            }
        };
        $scope.$on('$destroy', $scope.disconnect);
}])
    .factory('speedFactory',['$resource', function($resource){
        var userUri = "http://localhost:8080/connectionProfiler/speedHistogram/:year/:month/:day/:view/:bin_width";
        var publicUri = "http://localhost:8080/connectionProfiler/publicSpeedHistogram/:year/:month/:day/:view/:bin_width";
        var factory = {};
        factory.getSpeedDataUser = function(year, month, day, view, bin_width, trigger){
              return $resource(userUri).query({year : year, month : month, day : day, view : view, bin_width : bin_width},function (domainList) {
                             console.log("speedHistogram: " + JSON.stringify(domainList));
                             trigger.count ++;
                             if(trigger.count == 2) trigger.arrived = true;
             });
         };
        factory.getSpeedDataPublic = function(year, month, day, view, bin_width, trigger){
           return  $resource(publicUri).query({year : year, month : month, day : day, view : view, bin_width : bin_width},function (domainList) {
                console.log("publicSpeedHistogram: " + JSON.stringify(domainList));
                trigger.count ++;
                if(trigger.count == 2) trigger.arrived = true;
            });
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
        factory.updateSpeedData = function(speedList, download, bin_width){
            var index = parseInt(download.download_speed / (bin_width * 1000000));
            var i;
            for( i = 0; i<speedList.length; i++){
                if(speedList[i].asnum === download.asnum && speedList[i].bin === index){
                    speedList[i].nRecords++; break;
                }
            }
            if(i === speedList.length)
                speedList.push({asnum : download.asnum, bin : index, nRecords : 1});
            console.log("userSpeedData: " + JSON.stringify(speedList));

        };
        return factory;
    }])
.directive('speedHistogram',function($route, $routeParams,d3Service,speedFactory){
        return {
            restrict: 'E',
            link: function(scope,element){
                d3Service.d3().then(function(d3){

                    var margin = {top: 10, right: 30, bottom: 30, left: 30},
                        width = 960 - margin.left - margin.right,
                        height = 500 - margin.top - margin.bottom;

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

                    var drawHistogram = function(animation){

                        $(element[0]).empty();

                        svg = d3.select(element[0]).append("svg")
                            .attr("width", width + margin.left + margin.right)
                            .attr("height", height + margin.top + margin.bottom)
                            .append("g")
                            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                        svg.selectAll(".loading").remove();

                        var valuesUser = speedFactory.splitByAsnum(scope.speedDataUser);
                        var valuesPublic = speedFactory.splitByAsnum(scope.speedDataPublic);

                        var maxBin = d3.max(valuesUser.concat(valuesPublic),function(e){return d3.max(e.values,function(ee){return ee.bin;});}),
                            maxValueX = (maxBin + 1) * $routeParams.bin_width,
                            maxValueY = d3.max(valuesUser.concat(valuesPublic),function(e){return d3.max(e.values,function(ee){return ee.nRecords;});});

                        console.log(maxValueX);
                        console.log(maxValueY);
                        var x = d3.scale.linear().domain([0, maxValueX]).range([0, width]);
                        var y = d3.scale.linear().domain([0, maxValueY]).range([height, 0]);

                        var ris = [];for(var i = 0; i <= maxBin; ris.push(i++ * $routeParams.bin_width)); ris.push(maxValueX);
                        var xAxis = d3.svg.axis().scale(x).orient("bottom").tickValues(ris);
                        var yAxis = d3.svg.axis().scale(y).orient("left");

                        var dim = valuesUser.length;
                        var userBar = [], publicBar = [];

                        function drawBar(bar,ele,i, classType){
                            bar[ele.asnum]  = svg.selectAll(".bar-"+classType+"-"+ele.asnum)
                                .data(ele.values)
                                .enter().append("g")
                                .attr("class", "bar bar-"+classType+" bar-"+classType+"-"+ele.asnum)
                                .attr("transform", function(d) { return "translate(" + parseInt(x(d.bin * $routeParams.bin_width)+1) + "," + y(d.nRecords) + ")"; });

                            if(animation) {
                                bar[ele.asnum].append("rect")
                                    .attr("x", 1)
                                    .attr("width", x($routeParams.bin_width) - 2)
                                    .attr("height", 0)
                                    .attr("y", function (d) {return height - y(d.nRecords);})
                                    .attr("fill", color(i % 10))
                                    .attr("opacity", function () {var ret = 0.9 - (dim) / 10;if (ret < 0.4) return 0.4;return ret;})
                                    .transition()
                                    .duration(500)
                                    .attr("height", function (d) {return height - y(d.nRecords);})
                                    .attr("y", 0);
                            }else{
                                bar[ele.asnum].append("rect")
                                    .attr("x", 1)
                                    .attr("width", x($routeParams.bin_width) - 2)
                                    .attr("fill", color(i % 10))
                                    .attr("opacity", function () {var ret = 0.9 - (dim) / 10;if (ret < 0.4) return 0.4;return ret;})
                                    .attr("height", function (d) {return height - y(d.nRecords);})
                                    .attr("y", 0);
                            }

                            bar[ele.asnum].append("text")
                                .attr("dy", ".75em")
                                .attr("y", function(d){ if(d.nRecords===0) return -15; else return 6;})
                                .attr("x", x($routeParams.bin_width) / 2 - 1)
                                .attr("text-anchor", "middle")
                                .style("fill","white")
                                .text(function(d) { return d.nRecords; });
                        }

                        valuesUser.forEach(function(d,i){ drawBar(userBar,d,i,"user")});
                        valuesPublic.forEach(function(d,i){ drawBar(publicBar,d,i,"public")});

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
                            console.log("disegno");
                            drawHistogram(true);
                            $(".bar-public").hide();
                        }
                    });

                    scope.$watch('trigger.newSpeedDataUser',function(asnum){
                        if(asnum !== undefined) {
                            drawHistogram(false);
                            $('.user-asnumButton').each(function(){
                                var ele = $(this);
                                var isactive = ele.hasClass("active");
                                var asnum =  $("#" + ele.attr("id")).text();
                                if(!isactive){
                                    $(".bar-user-" + asnum).hide();
                                }
                            });

                            $('.public-asnumButton').each(function(){
                                var ele = $(this);
                                var isactive = ele.hasClass("active");
                                var asnum =  $("#" + ele.attr("id")).text();
                                if(!isactive) {
                                    console.log("nascondo asnum fsda" + asnum);
                                    $(".bar-public-" + asnum).hide();
                                }
                            });
                        }
                    });
                    scope.$watch('trigger.newSpeedDataPublic',function(asnum){
                        if(asnum !== undefined) {
                            drawHistogram(false);
                            $('.user-asnumButton').each(function(){
                                var ele = $(this);
                                var isactive = ele.hasClass("active");
                                var asnum =  $("#" + ele.attr("id")).text();
                                if(!isactive){
                                    $(".bar-user-" + asnum).hide();
                                }
                            });
                            $('.public-asnumButton').each(function(){
                                var ele = $(this);
                                var isactive = ele.hasClass("active");
                                var asnum =  $("#" + ele.attr("id")).text();
                                if(!isactive) {
                                    console.log("nascondo asnum fsda" + asnum);
                                    $(".bar-public-" + asnum).hide();
                                }
                            });
                        }
                    });
                });
            }
        }
    })

    .filter('getAsnumList',function(){
        return function(input){
            var  ret = [];
            if(input.length === 0) return ret;
            input.forEach(function(download){
                if(ret.indexOf(download.asnum) === -1)
                    ret[ret.length] = (download.asnum);
            });
            return ret.sort(function(a,b){ return parseInt(a) > parseInt(b);});
        };
    });