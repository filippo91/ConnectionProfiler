'use strict';

angular.module('myApp.speedHistogram', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/speedHistogram/:year/:month/:day/:view/:bin_width', {
    templateUrl: 'partials/restricted/speedHistogram.html',
    controller: 'speedHistogram'
  });
}])

.controller('speedHistogram',['$route', '$routeParams', 'speedFactory', '$scope', function($route, $routeParams, speedFactory, $scope) {
        $scope.trigger = {arrived: false, count : 0};
        $("#" + $routeParams.view + "Btn").addClass("active");
        $("#timeManager").show();


        $scope.speedDataUser = speedFactory.getSpeedDataUser($routeParams.year, $routeParams.month, $routeParams.day, $routeParams.view, $routeParams.bin_width, $scope.trigger);
        $scope.speedDataPublic = speedFactory.getSpeedDataPublic($routeParams.year, $routeParams.month, $routeParams.day, $routeParams.view, $routeParams.bin_width, $scope.trigger);

    /*
        setTimeout(myf, 2000);
        function myf() {

            $scope.speedDataUserSplitted = speedFactory.splitByAsnum(speedDataUser);
            var speedDataPublic = speedFactory.getSpeedDataPublic($routeParams.year, $routeParams.month, $routeParams.day, $routeParams.view, $routeParams.bin_width);
            $scope.speedDataPublicSplitted = speedFactory.splitByAsnum(speedDataPublic);
            $scope.$apply(function(){$scope.trigger.arrived = true;});
        }
        $scope.changeView = function(ele){
            var currentParam = $routeParams;
            switch(ele) {
                case 'weekBtn': currentParam.view = "week";  break;
                case 'monthBtn': currentParam.view = "month";    break;
                case 'monthsBtn': currentParam.view = "months";    break;
            }
            $route.updateParams(currentParam);

        };
        $scope.forward = function(){
            var curDate = moment().year($routeParams.year).month($routeParams.month).date($routeParams.day);
            console.log(curDate.format("YYYY MM DD"));
            switch($routeParams.view){
                case "week":   curDate.add(7,"days");  break;
                case "month":   curDate.add(1,"months"); break;
                case "months": curDate.add(3, "months"); break;
            }
            $route.updateParams({year : curDate.year(), month : curDate.month(), day : curDate.date(), view : $routeParams.view});
        };
        $scope.back = function(){
            var curDate = moment().year($routeParams.year).month($routeParams.month).date($routeParams.day);
            console.log(curDate.format("YYYY MM DD"));
            switch($routeParams.view){
                case "week":   curDate.subtract(7,"days");  break;
                case "month":   curDate.subtract(1,"months"); break;
                case "months": curDate.subtract(3, "months"); break;
            }
            $route.updateParams({year : curDate.year(), month : curDate.month(), day : curDate.date(), view : $routeParams.view});
        };

         */
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
}])
    .factory('speedFactory',['$resource', function($resource){
        var userUri = "http://localhost:8080/connectionProfiler/speedHistogram/:year/:month/:day/:view/:bin_width";
        var publicUri = "http://localhost:8080/connectionProfiler/publicSpeedHistogram/:year/:month/:day/:view/:bin_width";
        var factory = {};
        factory.getSpeedDataUser = function(year, month, day, view, bin_width, trigger){
         var data =  $resource(userUri).query({year : year, month : month, day : day, view : view, bin_width : bin_width},function (domainList) {
             console.log("speedHistogram: " + JSON.stringify(domainList));
             trigger.count ++;
             if(trigger.count == 2) trigger.arrived = true;

         });
         return data;
         };
        factory.getSpeedDataPublic = function(year, month, day, view, bin_width, trigger){
            var data =  $resource(publicUri).query({year : year, month : month, day : day, view : view, bin_width : bin_width},function (domainList) {
                console.log("publicSpeedHistogram: " + JSON.stringify(domainList));
                trigger.count ++;
                if(trigger.count == 2) trigger.arrived = true;
            });
            return data;
        };
        /*
        factory.getSpeedDataUser = function(){
            return [{asnum: "alice", bin : 0, nRecords : 1 },
                {asnum: "alice", bin : 1, nRecords : 11 },
                {asnum: "alice", bin : 2, nRecords : 12 },
                {asnum: "alice", bin : 3, nRecords : 14 },
                {asnum: "alice", bin : 4, nRecords : 15 },
                {asnum: "alice", bin : 5, nRecords : 16 },
                {asnum: "alice", bin : 7, nRecords : 14 },
                {asnum: "alice", bin : 8, nRecords : 13 },
                {asnum: "alice", bin : 9, nRecords : 12 },
                {asnum: "fastweb", bin : 0, nRecords : 4 },
                {asnum: "fastweb", bin : 1, nRecords : 3 },
                {asnum: "fastweb", bin : 2, nRecords : 14 },
                {asnum: "fastweb", bin : 3, nRecords : 1 },
                {asnum: "fastweb", bin : 4, nRecords : 24 },
                {asnum: "fastweb", bin : 5, nRecords : 17 },
                {asnum: "fastweb", bin : 7, nRecords : 11 },
                {asnum: "fastweb", bin : 8, nRecords : 1 },
                {asnum: "fastweb", bin : 9, nRecords : 2 },
                {asnum: "megaWeb", bin : 0, nRecords : 6 },
                {asnum: "megaWeb", bin : 2, nRecords : 4 },
                {asnum: "megaWeb", bin : 3, nRecords : 10 },
                {asnum: "megaWeb", bin : 4, nRecords : 5 },
                {asnum: "megaWeb", bin : 5, nRecords : 7 },
                {asnum: "megaWeb", bin : 6, nRecords : 8 },
                {asnum: "megaWeb", bin : 8, nRecords : 1 },
                {asnum: "megaWeb", bin : 9, nRecords : 1 }
            ];
        };
        factory.getSpeedDataPublic = function(){
            return [{asnum: "alice", bin : 0, nRecords : 1 },
                {asnum: "alice", bin : 1, nRecords : 11 },
                {asnum: "alice", bin : 2, nRecords : 12 },
                {asnum: "alice", bin : 3, nRecords : 14 },
                {asnum: "alice", bin : 4, nRecords : 15 },
                {asnum: "alice", bin : 5, nRecords : 16 },
                {asnum: "alice", bin : 7, nRecords : 14 },
                {asnum: "alice", bin : 8, nRecords : 13 },
                {asnum: "alice", bin : 9, nRecords : 12 },
                {asnum: "fastweb", bin : 0, nRecords : 4 },
                {asnum: "fastweb", bin : 1, nRecords : 3 },
                {asnum: "fastweb", bin : 2, nRecords : 14 },
                {asnum: "fastweb", bin : 3, nRecords : 1 },
                {asnum: "fastweb", bin : 4, nRecords : 24 },
                {asnum: "fastweb", bin : 5, nRecords : 17 },
                {asnum: "fastweb", bin : 7, nRecords : 11 },
                {asnum: "fastweb", bin : 8, nRecords : 1 },
                {asnum: "fastweb", bin : 9, nRecords : 2 },
                {asnum: "megaWeb", bin : 0, nRecords : 6 },
                {asnum: "megaWeb", bin : 2, nRecords : 4 },
                {asnum: "megaWeb", bin : 3, nRecords : 10 },
                {asnum: "megaWeb", bin : 4, nRecords : 5 },
                {asnum: "megaWeb", bin : 5, nRecords : 7 },
                {asnum: "megaWeb", bin : 6, nRecords : 8 },
                {asnum: "megaWeb", bin : 8, nRecords : 1 },
                {asnum: "megaWeb", bin : 9, nRecords : 1 }
            ];
        }; */
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

                    var drawHistogram = function(){

                        svg.selectAll(".loading").remove();
                        //var values = scope.speedData;
                        console.log("ci passo");
                        var valuesUser = speedFactory.splitByAsnum(scope.speedDataUser);
                        var valuesPublic = speedFactory.splitByAsnum(scope.speedDataPublic);
                        console.log("ci finisco");

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

                            bar[ele.asnum].append("rect")
                                .attr("x", 1)
                                .attr("width", x($routeParams.bin_width) - 2)
                                .attr("height", 0)
                                .attr("y", function(d){ return height - y(d.nRecords);})
                                .attr("fill", color(i%10))
                                .attr("opacity", function(){ var ret =0.9 - (dim) / 10; if(ret < 0.4) return 0.4; return ret;})
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
                            drawHistogram();
                            $(".bar-public").hide();
                        }
                    });

                    scope.$watch('newUserAsnumDailyAVG_trigger',function(asnum){
                        if(asnum !== undefined) {
                            drawHistogram();
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