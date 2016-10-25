'use strict';

angular.module('myApp.speedHistogram', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/speedHistogram/:year/:month/:day/:view/:bin_width', {
    templateUrl: 'partials/public/speedHistogram.html',
    controller: 'speedHistogram'
  });
}])

.controller('speedHistogram',['$route', '$routeParams', 'speedFactory', '$scope', '$rootScope', function($route, $routeParams, speedFactory, $scope, $rootScope) {

	$rootScope.enableChangeView = true;
	
        $scope.trigger = {arrived: false, count : 0, nData : 1, newDataPublic : undefined, newDataUser : undefined};

        console.log(" AUTH: " + $rootScope.authenticated);
        if($rootScope.authenticated) {
            $scope.trigger.nData ++;
            $scope.speedDataUser = speedFactory.getSpeedDataUser($routeParams.year, $routeParams.month, $routeParams.day, $routeParams.view, $routeParams.bin_width, $scope.trigger);
        }
        $scope.speedDataPublic = speedFactory.getSpeedDataPublic($routeParams.year, $routeParams.month, $routeParams.day, $routeParams.view, $routeParams.bin_width, $scope.trigger);


        $scope.switchView = function(type){
            var btn = $('#button-view-' + type), elements = $('.bin-' + type);
            if(btn.hasClass("active")){// is visible
                btn.removeClass("active");
                elements.fadeOut();
            }else{
                btn.addClass("active");
                elements.fadeIn();
            }
        };
        /**
         * Web Socket callbacks
         */
        $rootScope.websocketCallbackUser = function (download) {
            if($rootScope.isRelevant(download)) {
                console.log("entro e aggiorno")
                speedFactory.updateSpeedData($scope.speedDataUser,download, $routeParams.bin_width);
                $scope.$apply(function () {
                    console.log("trigger new data user: " +  $scope.trigger.newDataUser);
                    $scope.trigger.newDataUser = $scope.trigger.newDataUser != true;
                });
                $scope.$apply();
            }
        };
        $rootScope.websocketCallbackPublic = function(download){
            if($rootScope.isRelevant(download)) {
                console.log("entro e aggiorno")
                speedFactory.updateSpeedData($scope.speedDataPublic,download, $routeParams.bin_width);
                $scope.$apply(function () {
                    console.log("trigger new data public: " +  $scope.trigger.newDataPublic);
                    $scope.trigger.newDataPublic = $scope.trigger.newDataPublic != true;
                });
                $scope.$apply();
            }
        };
}])
    .factory('speedFactory',['$resource', 'REST_API_URLs', function($resource, api){
        var userUri = api.speedHistogramUser;
        var publicUri = api.speedHistogramPublic;
        
        var factory = {};
        factory.getSpeedDataUser = function(year, month, day, view, bin_width, trigger){
              return $resource(userUri).query({year : year, month : month, day : day, view : view, bin_width : bin_width},function (domainList) {
                             console.log("speedHistogram: " + JSON.stringify(domainList));
                             trigger.count ++;
                             if(trigger.count == trigger.nData) trigger.arrived = true;
             });
         };
        factory.getSpeedDataPublic = function(year, month, day, view, bin_width, trigger){
           return  $resource(publicUri).query({year : year, month : month, day : day, view : view, bin_width : bin_width},function (domainList) {
                console.log("publicSpeedHistogram: " + JSON.stringify(domainList));
                trigger.count ++;
                if(trigger.count == trigger.nData) trigger.arrived = true;
            });
        };
        factory.splitByAsname = function(values){
            var ret = [];
            for(var i = 0;i<values.length; i++){
                for(var j = 0; j < ret.length; j++){
                    if(values[i].asname.localeCompare(ret[j].asname) == 0){
                        ret[j].values.push({bin : values[i].bin, nRecords : values[i].nRecords}); break;
                    }
                }
                if(j == ret.length)
                    ret.push({asname : values[i].asname, values : [{bin : values[i].bin, nRecords : values[i].nRecords}]});
            }
            return ret;
        };
        factory.splitByBin = function(values){
            var ret = [];
            console.log("splitByBin: " + JSON.stringify(values));
            for(var i = 0;i<values.length; i++){
                for(var j = 0; j < ret.length; j++){
                    if(values[i].bin == ret[j].bin){
                        ret[j].values.push({nRecords : values[i].nRecords, asname : values[i].asname}); break;
                    }
                }
                if(j == ret.length)
                    ret.push({bin : values[i].bin, values : [{nRecords : values[i].nRecords, asname : values[i].asname}]});
            }
            console.log(JSON.stringify(ret));
            return ret;
        };
        factory.updateSpeedData = function(speedList, download, bin_width){
            console.log("userSpeedData: " + JSON.stringify(speedList));
            var index = parseInt(download.download_speed / (bin_width * 1000000));
            var i;
            for( i = 0; i<speedList.length; i++){
                if(speedList[i].asname.localeCompare(download.asname) == 0 && speedList[i].bin == index){
                    speedList[i].nRecords++; break;
                }
            }
            if(i == speedList.length)
                speedList.push({asname : download.asname, bin : index, nRecords : 1});
            console.log("userSpeedData: " + JSON.stringify(speedList));

        };
        return factory;
    }])

.directive('speedHistogram',function($route, $routeParams,d3Service,speedFactory,getAsnameListFilter, $rootScope){
        return {
            restrict: 'E',
            link: function(scope,element){
                d3Service.d3().then(function(d3){

                    var margin = {top: 10, right: 30, bottom: 50, left: 50},
                        real_width = 700, real_height = 500,
                        width = real_width - margin.left - margin.right,
                        height = real_height - margin.top - margin.bottom,
                        radius = Math.min(width, height) / 2;

                    var color = d3.scale.category10();
                    var f = d3.format(".1f");

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

                        // Define the div for the tooltip
                        var div = d3.select(element[0]).append("div")
                            .attr("class", "tooltip tooltip-large")
                            .style("opacity", 0);


                        svg.selectAll(".loading").remove();

                        var valuesUser = undefined;
                        var totUser;
                        if($rootScope.authenticated) {
                            valuesUser = speedFactory.splitByBin(scope.speedDataUser);
                            totUser = d3.sum(scope.speedDataUser, function(d){ return d.nRecords;});
                        }
                        var valuesPublic = speedFactory.splitByBin(scope.speedDataPublic);
                        var totPublic = d3.sum(scope.speedDataPublic, function(d){ return d.nRecords;});

                        var asnameList = getAsnameListFilter(scope.speedDataPublic);

                        var binWidth = $routeParams.bin_width;

                        if(( (valuesUser == undefined || valuesUser.length == 0) ) &&
                            (valuesPublic == undefined || valuesPublic.length == 0)){
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

                            svg.append("rect")
                            .attr("x", 0)
                            .attr("y", 0)
                            .attr("width", real_width)
                            .attr("height", real_height)
                            .attr('fill', 'url(#diagonalHatch)');

                        svg.append("text")
                            .attr("x", real_width / 2)
                            .attr("y", real_height / 2)
                            .style("text-anchor", "middle")
                            .style("font-family", "sans-serif")
                            .style("font-size", "20px")
                            .text("No data to show");

                        
                            return;
                        }

                        var maxBin = d3.max(valuesPublic,function(e){return e.bin;}),
                            maxValueY = d3.max(valuesPublic,function(e){return d3.max(e.values,function(ee){return ee.nRecords;});});

                        var binList = [];
                        for(var i = 0; i <= maxBin; i++)    binList.push(i);
                        console.log("binList : " + binList);

                        var x0 = d3.scale.ordinal().domain(binList).rangeRoundBands([0, width], .2);
                        var x1 = d3.scale.ordinal().domain(asnameList).rangeRoundBands([0, x0.rangeBand()],.1);
                        var y = d3.scale.linear().domain([0, maxValueY]).range([height, 0]);

                        var xAxis = d3.svg.axis().scale(x0).orient("bottom").tickFormat(function(d){
                            return (d + 1) * binWidth + " Mbps";
                            });
                        var yAxis = d3.svg.axis().scale(y).orient("left");


                        var bins = [], bar = [], rect = [],text = [];

                        function drawBars(values, type, tot){
                            bins[type] = svg.selectAll(".bin-" + type)
                                .data(values)
                                .enter().append("g")
                                .attr("class", "bin bin-" + type)
                                .attr("transform", function(d) {return "translate(" + x0(d.bin) + ",0)"; });

                            bar[type] = bins[type].selectAll("bar-" + type)
                                .data(function(d) { return d.values; })
                                .enter().append("g")
                                .attr("class", "bar bar-" + type);

                            rect[type] = bar[type].append("rect")
                                .attr("class", "rect rect-" + type)
                                .attr("width", x1.rangeBand())
                                .attr("x", function(d) { return x1(d.asname); })
                                .style("fill", function(d) { return color(d.asname); })
                                .attr("opacity",.5);

                            if(animation){
                                rect[type].attr("height", 0)
                                    .attr("y", height)
                                    .transition()
                                    .duration(500)
                                    .attr("y", function(d) { return y(d.nRecords); })
                                    .attr("height", function(d) { return height - y(d.nRecords); });
                            }else{
                                rect[type].attr("y", function(d) { return y(d.nRecords); })
                                    .attr("height", function(d) { return height - y(d.nRecords); });
                            }

                            text[type] = bar[type].append("text")
                                .attr("dy", ".75em")
                                .attr("x", function(d) {
                                    return x1(d.asname) + x1.rangeBand() / 2;
                                })
                                .attr("text-anchor", "middle")
                                .style("fill","white")
                                .text(function(d) { return d.nRecords; });

                            if(animation){
                                text[type].attr("height", 0)
                                    .attr("y", height)
                                    .transition()
                                    .duration(500)
                                    .attr("y", function(d) { return y(d.nRecords) + 10; })
                                    .attr("height", function(d) { return height - y(d.nRecords); });
                            }else{
                                text[type].attr("y", function(d) { return y(d.nRecords) + 10; })
                                    .attr("height", function(d) { return height - y(d.nRecords); });
                            }

                            var tmp = $(".bar");
                            var offset = tmp.parent().parent().parent().offset();
                            tmp.mousemove(function(e){
                                var x = e.pageX - parseInt(offset.left), y = e.pageY - parseInt(offset.top);
                                tmp.css('cursor', 'pointer');
                                div.transition()
                                    .duration(200)
                                    .style("opacity", .9);
                                div.html(
                                    "<i>Provider: </i><b>" + d3.select(this).data()[0].asname + "</b><br>" +
                                    "<i>n: </i><b>" + d3.select(this).data()[0].nRecords + " (" +
                                    f((d3.select(this).data()[0].nRecords / tot)*100)  +"%)</b>")
                                    .style("left", (x) + "px")
                                    .style("top", (y - 8)  + "px");
                            })
                                .mouseleave(function(){
                                    div.transition()
                                        .duration(500)
                                        .style("opacity", 0);
                                });
                        }

                        if($rootScope.authenticated){
                            drawBars(valuesUser, 'user', totUser);
                        }
                        drawBars(valuesPublic, 'public', totPublic);

                        var legend = svg.selectAll(".legend")
                            .data(asnameList.slice().reverse())
                            .enter().append("g")
                            .attr("class", "legend")
                            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

                        legend.append("rect")
                            .attr("x", width - 18)
                            .attr("width", 18)
                            .attr("opacity",.5)
                            .attr("height", 18)
                            .style("fill", color);

                        legend.append("text")
                            .attr("x", width - 24)
                            .attr("y", 9)
                            .attr("dy", ".35em")
                            .style("text-anchor", "end")
                            .text(function(d) { return d; });

                        svg.append("g")
                            .attr("class", "x axis")
                            .attr("transform", "translate(0," + height + ")")
                            .call(xAxis)
                            .append("text")
                            .attr("x", width / 2)
                            .attr("y", 30)
                            .attr("dy", ".35em")
                            .style("text-anchor", "end")
                            .text("Speeds [bps]");

                        svg.append("g")
                            .attr("class", "y axis")
                            .call(yAxis)
                            .append("text")
                            .attr("dy", ".35em")
                            .style("text-anchor", "end")
                            .attr("transform", "translate(-40,"+(height/3)+")rotate(-90)")
                            .text("Numbers of occurrences");
                    };

                    scope.$watch('trigger.arrived',function(newVal){
                        if(newVal == true){
                            drawHistogram(true);
                            if($rootScope.authenticated)
                                $(".bin-public").hide();
                        }
                    });

                    scope.$watch('trigger.newDataUser',function(asname){
                        console.log("asdfsafdasdfsdfasfda\nasdfsadfsadfasdf");
                        if(asname != undefined) {
                            console.log("DISEGNO USER");
                            drawHistogram(false);

                            if(!$('#button-view-public').hasClass("active"))
                                $(".bin-public").hide();
                            if(!$('#button-view-user').hasClass("active"))
                                $(".bin-user").hide();

                        }
                    });
                    scope.$watch('trigger.newDataPublic',function(asname){
                        console.log("asdfsafdasdfsdfasfda\nasdfsadfsadfasdf");
                        if(asname != undefined) {
                            console.log("DISEGNO PUBLIC");
                            drawHistogram(false);

                            if(!$('#button-view-public').hasClass("active"))
                                $(".bin-public").hide();
                            if(!$('#button-view-user').hasClass("active"))
                                $(".bin-user").hide();
                        }
                    });
                });
            }
        }
    })
    .controller('speedHistogramPlotInfoController', ['plotsInfoService', function(plotsInfoService){
    	var self = this;

    	self.plotInfo = plotsInfoService.getInfo('speedHistogram');
    }]);