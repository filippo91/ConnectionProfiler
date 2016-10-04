'use strict';

angular.module('myApp.domainsBySize', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/domainsBySize/:year/:month/:day/:view', {
    templateUrl: 'partials/restricted/domainsBySize.html',
    controller: 'domainsBySize'
  });
}])

.controller('domainsBySize', ['$route', '$routeParams', '$scope', 'domainsDownloadFactory',function($route, $routeParams, $scope, domainsDownloadFactory) {
        $("#timeManager").show();
        $("#" + $routeParams.view + "Btn").addClass("active");

        $scope.trigger = {arrived:false};
        setTimeout(myf, 2000);
        function myf() {
            $scope.domainSizeList = domainsDownloadFactory.getDomainsSizeData($routeParams.year, $routeParams.month, $routeParams.day, $routeParams.view, $scope.trigger);
            console.log($scope.domainSizeList);
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
        }
        */
}])

    .directive('usagePie',function(d3Service){
        return {
            restrict: 'E',
            link: function(scope,element){
                d3Service.d3().then(function(d3){

                    var width = 960,
                        height = 500,
                        radius = Math.min(width, height) / 2;

                    var color = d3.scale.category20();
                    //.range(["#98abc5","#ff8c00"]);

                    var arc = d3.svg.arc()
                        .outerRadius(radius - 10)
                        .innerRadius(0);

                    var labelArc = d3.svg.arc()
                        .outerRadius(radius * 0.7)
                        .innerRadius(radius * 0.7);

                    var pie = d3.layout.pie()
                        .sort(null)
                        .value(function(d) { return d.size; });

                    //console.log(pie);

                    var svg = d3.select(element[0]).append("svg")
                        .attr("width", width)
                        .attr("height", height)
                        .append("g")
                        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

                    // Define the div for the tooltip
                    var div = d3.select(element[0]).append("div")
                        .attr("class", "tooltip")
                        .style("opacity", 0);

                    //loading icon
                    svg.append("image")
                        .attr("class", "loading")
                        .attr("xlink:href", "img/Preloader_1.gif")
                        .attr("x", -32)
                        .attr("y", -32)
                        .attr("width", 64)
                        .attr("height", 64);

                    var drawPie = function(){

                        var data =  scope.domainSizeList;
                        if(data === undefined || data.length === 0){
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

                        svg.selectAll(".arc").remove();
                        svg.selectAll(".noData").remove();
                        svg.selectAll(".loading").remove();
                        svg.selectAll("text").remove();
                        svg.selectAll("path").remove();

                        var g = svg.selectAll(".arc")
                            .data(pie(data))
                            .enter().append("g")
                            .attr("class", "arc");

                        var path  = g.append("path")
                            .attr("d", arc)
                            .style("fill", function(d) { return color(d.data.server_domain); })
                            .transition()
                            .duration(750)
                            .attrTween("d", tweenPie);

                        g.append("text")
                            .attr("transform", function(d) {return "translate(" + labelArc.centroid(d) + ")"; })
                            .attr("dy", ".35em")
                            .style("font-family", "sans-serif")
                            .style("font-size", "12px")
                            //.style("fill", "white")
                            .text(function(d) { return d.data.server_domain; });

                        //Tooltip
                        var pane = $('.arc');
                        var offset = pane.offset();
                        pane.mousemove(function(e){
                            var x = e.pageX - parseInt(offset.left), y = e.pageY - parseInt(offset.top);
                            pane.css('cursor', 'pointer');
                            div.transition()
                                .duration(200)
                                .style("opacity", .9);
                            div.html("<i>Size</i><br/><b>" + d3.select(this).data()[0].value + "</b>")
                                .style("left", (x) + "px")
                                .style("top", (y - 28)  + "px");
                        });
                        pane.mouseleave(function(){
                            div.transition()
                                .duration(500)
                                .style("opacity", 0);});
                    };
                    //Animation
                    function tweenPie(finish) {
                        var start = {
                            startAngle: 0,
                            endAngle: 0
                        };
                        var interpolator = d3.interpolate(start, finish);
                        return function(d) { return arc(interpolator(d)); };
                    }

                    scope.$watch('trigger.arrived', function (newVal) {
                        if(newVal === true) {
                            console.log("Change");
                            drawPie();
                        }
                    });
                    scope.$watch('newUserAsnumDailyAVG_trigger',function(asnum){
                        if(asnum !== undefined) {
                            console.log("disegno pie!");
                            drawPie();
                        }
                    });

                });
            }
        }
    });