'use strict';

angular.module('myApp.domainsByAccesses', ['ngRoute', 'ngResource'])

    .config(['$routeProvider', function($routeProvider) {
      $routeProvider.when('/pieAccesses/:year/:month/:day/:view', {
        templateUrl: 'partials/restricted/domainsByAccesses.html',
        controller: 'domainsByAccesses'
      });
    }])

    .controller('domainsByAccesses', ['$route', '$routeParams', '$scope', 'domainsDownloadFactory', '$rootScope', function($route, $routeParams, $scope, domainsDownloadFactory, $rootScope) {

    	
    	$rootScope.enableChangeView = true;
    	
        $scope.trigger = {arrived:false};
        $scope.domainList = domainsDownloadFactory.getDomainsAccessData($routeParams.year, $routeParams.month, $routeParams.day, $routeParams.view, $scope.trigger);


        /**
         * Web Socket callbacks
         */
        $rootScope.websocketCallbackUser = function (download) {
            if($rootScope.isRelevant(download)) {
                domainsDownloadFactory.updateDomainAccessList($scope.domainList, download);
                console.log("domainList: " + JSON.stringify($scope.domainList));
                $scope.$apply(function () {
                    $scope.trigger.newAccess = $scope.trigger.newAccess != true;
                });
            }
        };
        $rootScope.websocketCallbackPublic = function(){};

    }])

    .factory('domainsDownloadFactory',['$resource', 'REST_API_URLs', function($resource, api){
        var pieAccessUri = api.pieAccess;
        var pieSizeUri = api.pieSize;
        	
        var factory = {};

        factory.getDomainsAccessData = function(year, month, day, view, trigger){
            return $resource(pieAccessUri).query({year : year, month : month, day : day, view : view}, function (domainList) {
                console.log("getDomainsAccessData: " + JSON.stringify(domainList));
                trigger.arrived = true;
            });
        };
        factory.getDomainsSizeData = function(year, month, day, view, trigger){
            return $resource(pieSizeUri).query({year : year, month : month, day : day, view : view}, function (domainList) {
                console.log("getDomainsSizeData: " + JSON.stringify(domainList));
                trigger.arrived = true;
            });
        };
        factory.updateDomainAccessList = function(domainList,download){
            var i;
            for(i=0;i<domainList.length;i++){
                if(domainList[i].server_domain.localeCompare(download.server_domain) == 0){
                    domainList[i].nRecords++;break;
                }
            }
            if(i == domainList.length)
                domainList.push({server_domain: download.server_domain, nRecords: 1});
            console.log("domainList: " + JSON.stringify(domainList));
        };
        factory.updateDomainSizeList = function(domainSizeList,download){

            var i;
            for(i=0;i<domainSizeList.length;i++){
                if(domainSizeList[i].server_domain.localeCompare(download.server_domain)  == 0){
                    domainSizeList[i].size += download.size; break;
                }
            }
            if(i == domainSizeList.length)
                domainSizeList.push({server_domain: download.server_domain, size: download.size});
            console.log("updateDomainSizeList: " + JSON.stringify(domainSizeList));
        };
        return factory;
    }])

    .directive('accessPie',function(d3Service, legendShorterFilter){
        return {
            restrict: 'E',
            link: function(scope,element){
                d3Service.d3().then(function(d3){

                    var width = 760,
                        height = 400,
                        pieCenter = 300,
                        radius = Math.min(width, height) / 2;

                    var color = d3.scale.category20();

                    var arc = d3.svg.arc()
                        .outerRadius(radius - 10)
                        .innerRadius(0);

                    var pie = d3.layout.pie()
                        .sort(null)
                        .value(function(d) { return d.nRecords; });

                    var svg_content = d3.select(element[0]).append("svg")
                        .attr("width", width)
                        .attr("height", height);

                    var svg = svg_content.append("g")
                        .attr("transform", "translate(" + pieCenter + "," + height / 2 + ")");

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
                        svg.selectAll(".legend").remove();
                        svg.selectAll("text").remove();
                        svg.selectAll("path").remove();
                        
                        var data =  scope.domainList;
                        console.log("DATA: " + JSON.stringify(data));
                        var tot = d3.sum(data,function(d){return d.nRecords;});

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

                        var myddata= data.map(function(d){return d.server_domain;});//.reverse();
                        console.log(myddata);
                        var legend = svg_content.selectAll(".legend")
                            .data(myddata)
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
                            .text(function(d) { console.info(d); return legendShorterFilter(d); });

                        legend.append("svg:title").text(function(d){ return d;});

                        //Tooltip
                        var pane = $('.arc');
                        var offset = pane.parent().parent().offset();
                        pane.mousemove(function(e){
                            var x = e.pageX - parseInt(offset.left), y = e.pageY - parseInt(offset.top);
                            pane.css('cursor', 'pointer');
                            div.transition()
                                .duration(200)
                                .style("opacity", .9);
                            div.html("<b>" + legendShorterFilter(d3.select(this).data()[0].data.server_domain) + "</b><br>" +
                                "<i>Accesses: </i><b>" + d3.select(this).data()[0].value +
                                " ("+ Number(((d3.select(this).data()[0].value / tot) * 100).toFixed(1)) + "%)</b>")
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
                    scope.$watch('trigger.newAccess', function(newVal){
                        if(newVal != undefined) {
                            console.log("aggiorno pie!");
                            drawPie(false);
                        }
                    });

                });
            }
        }
})
.controller('accessPlotInfoController', ['plotsInfoService', function(plotsInfoService){
	var self = this;
	
	self.plotInfo = plotsInfoService.getInfo('domainsByAccess');
}]);