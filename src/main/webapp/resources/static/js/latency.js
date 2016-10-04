'use strict';

angular.module('myApp.latency', ['ngRoute', 'ngResource'])

    .config(['$routeProvider', function($routeProvider) {
      $routeProvider.when('/latency/:year/:month/:day/:view/:bin_width', {
        templateUrl: 'partials/restricted/latency.html',
        controller: 'latency'
      });
    }])

    .controller('latency', ['$route', '$routeParams', 'latencyFactory', '$scope', function($route, $routeParams, latencyFactory, $scope) {
        $("#timeManager").show();

        $scope.trigger = {arrived: false};
        $scope.latencyData = [];
        $("#" + $routeParams.view + "BtnDBA").addClass("active");
        //$scope.latencyData = latencyFactory.getLatencyData($routeParams.year, $routeParams.month, $routeParams.day, $routeParams.view, $routeParams.bin_width);
        setTimeout(myf, 2000);
        function myf() {
            $scope.latencyData = latencyFactory.getLatencyData($routeParams.year, $routeParams.month, $routeParams.day, $routeParams.view, $routeParams.bin_width);
            $scope.latencyDataSplitted = latencyFactory.splitByAsnum($scope.latencyData);
            $scope.$apply(function(){$scope.trigger.arrived = true;});
        }
        /*
        $scope.changeView = function(ele){
            var currentParam = $routeParams;
            switch(ele) {
                case 'weekBtnDBS': currentParam.view = "week";  break;
                case 'monthBtnDBS': currentParam.view = "month";    break;
                case 'monthsBtnDBS': currentParam.view = "months";    break;
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
    }])

    .factory('latencyFactory',['$resource', function($resource){
        var requestURL = "latencyHistogram/:year/:month/:day/:view/:bin_width";
        var factory = {};
        /*factory.getLatencyData = function(year, month, day, view, bin_width, trigger){
            var data =  $resource(requestURL).query({year : year, month : month, day : day, view : view, bin_width : bin_width});
            trigger.arrived = true;
            return data;
        };*/
        factory.getLatencyData = function(){
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
              {asnum: "fastweb", bin : 9, nRecords : 2 }
          ];
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
            console.log(JSON.stringify(ret));
            return ret;
        };
        return factory;
    }])

.directive('latencyHistogram',function($route, $routeParams,d3Service){
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
                    var values = scope.latencyData;
                    var values_arr = scope.latencyDataSplitted;
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

                        bar[ele.asnum].append("rect")
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

                scope.$watch('newUserAsnumDailyAVG_trigger',function(asnum){
                    if(asnum !== undefined) {
                        console.log("disegno lat histo!");
                        drawHistogram();
                    }
                });
            });
        }
    }
});