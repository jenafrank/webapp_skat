'use strict';

angular.module('myApp.view2')
    .factory('Render', ['Const', function (Const) {

        var h = Const.svg_height;
        var w = Const.svg_width;
        var colors = Const.player_colors;

        return {
            barchart: barchart,
            barchart_animate: barchart_animate,
            performance: performance
        }

        function barchart(dataset, prec, suffix) {

            // var dataset = $scope.arrays[yQuantity];

            var yScale = d3.scale.ordinal()
                .domain(d3.range(dataset.length))
                .rangeRoundBands([0, h], 0.15);

            var xScale = d3.scale.linear()
                .domain([0, d3.max(dataset, function (d) {
                    return d.value;
                })])
                .range([0, w - 10]);

            // Remove SVG Element
            var svgElement = d3.select("svg");
            if (svgElement) {
                svgElement.remove();
            }

            //Create SVG element
            var svg = d3.select("renderZone")
                .append("svg")
                .attr("width", w)
                .attr("height", h)
                .style("background-color", "transparent");

            //Create bars
            svg.selectAll("rect")
                .data(dataset, key)
                .enter()
                .append("rect")
                .sort(sortItems)
                .attr("y", function (d, i) {
                    return yScale(i);
                })
                .attr("x", 0)
                .attr("width", function (d) {
                    return xScale(d.value);
                })
                .attr("height", yScale.rangeBand())
                .attr("fill", function (d) {
                    return colors(d.name);
                });

            //Create labels: number of points
            svg.selectAll("text.one")
                .data(dataset, key)
                .enter()
                .append("text")
                .sort(sortItems)
                .text(function (d) {
                    var ret = d3.round(d.value, prec);
                    if (suffix) {
                        ret = ret + suffix;
                    }
                    return ret;
                })
                .attr("class", "one")
                .attr("dominant-baseline", "central")
                .attr("text-anchor", "end")
                .attr("x", function (d) {
                    return d3.max([100, xScale(d.value) - 6]);
                })
                .attr("y", function (d, i) {
                    return yScale(i) + yScale.rangeBand() / 2;
                })
                .attr("font-family", "sans-serif")
                .attr("font-size", "24px")
                .attr("fill", "white");

            // Create labels: player names
            svg.selectAll("text.two")
                .data(dataset, key)
                .enter()
                .append("text")
                .sort(sortItems)
                .text(function (d) {
                    return d.name;
                })
                .attr("class", "two")
                .attr("text-anchor", "start")
                .attr("dominant-baseline", "central")
                .attr("x", 2)
                .attr("y", function (d, i) {
                    return yScale(i) + yScale.rangeBand() / 2;
                })
                .attr("font-family", "sans-serif")
                .attr("font-size", "24px")
                .attr("fill", "white");
        }

        function barchart_animate(dataset, prec, suffix) {

            // var dataset = $scope.arrays[yQuantity];

            var svg = d3.select("renderZone");

            var yScale = d3.scale.ordinal()
                .domain(d3.range(dataset.length))
                .rangeRoundBands([0, h], 0.15);

            var xScale = d3.scale.linear()
                .domain([0, d3.max(dataset, function (d) {
                    return d.value;
                })])
                .range([0, w - 10]);

            // d3-sort the array
            svg.selectAll("rect")
                .data(dataset, key)
                .sort(sortItems)
                .transition()
                .attr("x", 0)
                .attr("width", function (d) {
                    return xScale(d.value);
                })
                .attr("height", yScale.rangeBand())
                .attr("y", function (d, i) {
                    return yScale(i);
                });

            // d3-sort array 2
            svg.selectAll("text.one")
                .data(dataset, key)
                .sort(sortItems)
                .transition()
                .text(function (d) {
                    var ret = d3.round(d.value, prec);
                    if (suffix) {
                        ret = ret + suffix;
                    }
                    return ret;
                })
                .attr("x", function (d) {
                    return d3.max([100, xScale(d.value) - 6]);
                })
                .attr("y", function (d, i) {
                    return yScale(i) + yScale.rangeBand() / 2;
                });

            // d3-sort array 3
            svg.selectAll("text.two")
                .data(dataset, key)
                .sort(sortItems)
                .transition()
                .text(function (d) {
                    return d.name;
                })
                .attr("x", 2)
                .attr("y", function (d, i) {
                    return yScale(i) + yScale.rangeBand() / 2;
                });
        }

        function performance(ratioAllein, ratioGespielt) {
            var data = angular.copy(ratioAllein);
            var ydata = ratioGespielt;

            // expand data with ydata
            ydata.forEach(function (yel) {
                var foundxel = null;
                data.forEach(function (xel) {
                    if (xel.name === yel.name) {
                        foundxel = xel;
                    }
                });
                foundxel.valuey = yel.value;
            });

            var offsetX = 40;
            var offsetY = 40;
            var minorX = 20;
            var minorY = 20;

            var yScale = d3.scale.linear()
                .domain([10, 60])
                .range([h - offsetY, minorY]);

            var xScale = d3.scale.linear()
                .domain([50, 100])
                .range([offsetX, w - minorX]);

            var xAxis = d3.svg.axis()
                .scale(xScale)
                .orient("bottom")
                .innerTickSize(-h + minorY + offsetY)
                .tickPadding(10);

            var yAxis = d3.svg.axis()
                .scale(yScale)
                .orient("left")
                .innerTickSize(-w + minorX + offsetX)
                .tickPadding(10);

            // Remove SVG Element
            var svgElement = d3.select("svg");
            if (svgElement) {
                svgElement.remove();
            }

            //Create SVG element
            var svg = d3.select("renderZone")
                .append("svg")
                .attr("width", w)
                .attr("height", h)
                .style("background-color", "transparent");

            //Create bars
            svg.selectAll("circle")
                .data(data, key)
                .enter()
                .append("circle")
                .attr("cy", function (d) {
                    return yScale(d.valuey);
                })
                .attr("cx", function (d) {
                    return xScale(d.value);
                })
                .attr("r", 10)
                .attr("fill", function (d) {
                    return colors(d.name);
                })
                .attr("stroke", "white")
                .attr("stroke-width", "1");

            svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0," + (h - offsetY) + ")")
                .call(xAxis);

            svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" + offsetX + ",0)")
                .call(yAxis);

            // grid lines
            svg.append("line")
                .attr("x1", offsetX)
                .attr("y1", yScale(33.33))
                .attr("x2", w - minorX)
                .attr("y2", yScale(33.33))
                .attr("fill", "transparent")
                .attr("stroke", "white")
                .attr("stroke-width", "5")
                .attr("opacity", "0.2");

            svg.append("line")
                .attr("x1", xScale(100. * 5. / 6.))
                .attr("y1", h - offsetY)
                .attr("x2", xScale(100. * 5. / 6.))
                .attr("y2", offsetY - minorY)
                .attr("fill", "transparent")
                .attr("stroke", "white")
                .attr("stroke-width", "5")
                .attr("opacity", "0.2");
        }

        // helper functions

        function sortItems(a, b) {
            return b.value - a.value;
        };

        function key(d) {
            return d.name;
        };
    }]);