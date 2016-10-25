'use strict';

angular.module('myApp.domainsBySize', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/domainsBySize/:year/:month/:day/:view', {
    templateUrl: 'partials/restricted/domainsBySize.html',
    controller: 'domainsBySize'
  });
}])

.controller('domainsBySize', ['$route', '$routeParams', '$scope', 'domainsDownloadFactory', '$rootScope', function($route, $routeParams, $scope, domainsDownloadFactory, $rootScope ) {
	
	$rootScope.enableChangeView = true;
	
        $scope.trigger = {arrived:false, newData: undefined};
        
        $scope.domainSizeList = domainsDownloadFactory.getDomainsSizeData($routeParams.year, $routeParams.month, $routeParams.day, $routeParams.view, $scope.trigger);

        /**
         * Web Socket callbacks
         */
        $rootScope.websocketCallbackUser = function (download) {
            if($rootScope.isRelevant(download)) {
                domainsDownloadFactory.updateDomainSizeList($scope.domainSizeList, download);
                console.log("domainList: " + JSON.stringify($scope.domainSizeList));
                $scope.$apply(function () {
                    $scope.trigger.newData = $scope.trigger.newData != true;
                });
            }
        };
        $rootScope.websocketCallbackPublic = function(download){};
}])

    .directive('usagePie',function(d3Service){
        return {
            restrict: 'E',
            link: function(scope,element){
                d3Service.d3().then(function(d3){

                    var width = 700,
                        height = 500,
                        radius = Math.min(width, height) / 2;

                    var color = d3.scale.category20();

                    var f =  d3.format(".2s");
                    var arc = d3.svg.arc()
                        .outerRadius(radius - 10)
                        .innerRadius(120);

                    var pie = d3.layout.pie()
                        .sort(null)
                        .value(function(d) { return d.size; });

                    var svg_content = d3.select(element[0]).append("svg")
                        .attr("width", width)
                        .attr("height", height);

                    var svg = svg_content.append("g")
                        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

                    // Define the div for the tooltip
                    var div = d3.select(element[0]).append("div")
                        .attr("class", "tooltip tooltip-large")
                        .style("opacity", 0);

                    //loading icon
                    svg.append("image")
                        .attr("class", "loading")
                        .attr("xlink:href", "img/Preloader_1.gif")
                        .attr("x", -32)
                        .attr("y", -32)
                        .attr("width", 64)
                        .attr("height", 64);

                    var drawPie = function(animation){
                        svg.selectAll(".arc").remove();
                        svg.selectAll(".noData").remove();
                        svg.selectAll(".loading").remove();
                        svg.selectAll("text").remove();
                        svg.selectAll("path").remove();
                        
                        var data =  scope.domainSizeList;

                        var tot = d3.sum(data, function(d){return d.size;});
                        //no data found icon
                        if(data == undefined || data.length == 0){
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

                        var g = svg.selectAll(".arc")
                            .data(pie(data))
                            .enter().append("g")
                            .attr("class", "arc");

                        var path  = g.append("path")
                            .attr("d", arc)
                            .style("fill", function(d) { return color(d.data.server_domain); })
                            .attr("opacity",.7);

                        if(animation) {
                            path.transition()
                                .duration(750)
                                .attrTween("d", tweenPie);
                        }

                        var legend = svg_content.selectAll(".legend")
                            .data(data.map(function(d){return d.server_domain;}).reverse())
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

                        //Tooltip
                        var pane = $('.arc');
                        var offset = pane.parent().parent().offset();
                        pane.mousemove(function(e){
                            var x = e.pageX - parseInt(offset.left), y = e.pageY - parseInt(offset.top);

                            pane.css('cursor', 'pointer');
                            div.transition()
                                .duration(200)
                                .style("opacity", .9);
                            div.html("<b>" + d3.select(this).data()[0].data.server_domain + "</b><br><i>Size: </i><b>" + f(d3.select(this).data()[0].value) +
                                        " bit ("+ Number(((d3.select(this).data()[0].value / tot) * 100).toFixed(1)) + "%)</b>")
                                .style("left", (x) + "px")
                                .style("top", (y - 28)  + "px");
                        });
                        pane.mouseleave(function(){
                            div.transition()
                                .duration(500)
                                .style("opacity", 0);});
                    };

                    //Animation: growing circles
                    function tweenPie(finish) {
                        var start = {
                            startAngle: 0,
                            endAngle: 0
                        };
                        var interpolator = d3.interpolate(start, finish);
                        return function(d) { return arc(interpolator(d)); };
                    }

                    scope.$watch('trigger.arrived', function (newVal) {
                        if(newVal == true) {
                            console.log("Change");
                            drawPie(true);
                        }
                    });
                    scope.$watch('trigger.newData',function(newVal){
                        if(newVal != undefined) {
                            console.log("disegno pie!");
                            drawPie(false);
                        }
                    });

                });
            }
        }
    })
    .controller('plotInfoController', ['plotsInfoService', function(plotsInfoService){
    	var self = this;
    	
    	self.plotInfo = plotsInfoService.getInfo('domainsBySize');
    }]);