'use strict';

angular.module('myApp.view2', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/start', {
            templateUrl: 'view2/view2.html',
            controller: 'View2Ctrl'
        });
    }])

    .controller('View2Ctrl', ['$scope', function ($scope) {

        $scope.isVisible = false;
        $scope.text = "Mein Text";
        $scope.games = [];

        $scope.results = {
            val: {},
            teil: {},
            ver: {},
            gew: {},
            ges: {},
            verGegen: {},
            gewGegen: {},
            gesGegen: {},
            ratioGegen: {},
            ratioAllein: {},
            ronaldFaktor: {},
            ratioPPT: {},
            ronaldGedeckelt: {},
            ronaldPunkte: {},
            turnierPunkte: {},
            turnierRonaldPunkte: {},
            turnierPPT: {}
        };

        $scope.arrays = {
            ronaldPunkte: []
        };

        $scope.nameOfStatId = [];
        $scope.render = render;

        var x = $scope.results;
        var y = $scope.arrays;

        activate();

        function activate() {
            var myFirebaseRef = new Firebase("https://luminous-inferno-9676.firebaseio.com/season_22");
            myFirebaseRef.child("/").on("value", function (snapshot) {
                $scope.games = snapshot.val();
                calculateResults();
                $scope.$apply();
            });
        }

        function calculateResults() {
            // Akkumuliere einzelne Spiele
            traverse($scope.games, process);

            // Auswertung der akkumulierten Spieldaten
            $scope.results.refGames = max($scope.results.teil);
            for (var el in x.teil) {
                x.ratioGegen[el] = x.gewGegen[el] / x.gesGegen[el];
                x.ratioAllein[el] = x.gew[el] / x.ges[el];
                x.ronaldFaktor[el] = x.refGames / x.teil[el];
                x.ronaldGedeckelt[el] = x.ronaldFaktor[el] > 3 ? 3 : x.ronaldFaktor[el];
                x.ronaldPunkte[el] = x.ronaldGedeckelt[el] * x.val[el];
                x.verGegen[el] = x.gesGegen[el] - x.gewGegen[el];
                x.ver[el] = x.ges[el] - x.gew[el];
                x.turnierPunkte[el] = x.val[el] + 50 * (x.gew[el] - x.ver[el]) + 40 * x.gewGegen[el];
                x.turnierRonaldPunkte[el] = x.turnierPunkte[el] * x.ronaldGedeckelt[el];
                x.turnierPPT[el] = x.turnierPunkte[el] / x.teil[el];
                x.ratioPPT[el] = x.val[el] / x.teil[el];
            }

            // Umwandlung in Datenstruktur für Darstellung in D3 und Angular
            for (var attr in x) {
                y[attr] = json2array(x[attr]);
            }
            console.log(y);

            $scope.nameOfStatId = [
                {name: "ratioGegen", key: "ratioGegen", prec: 2},
                {name: "ratioAllein", key: "ratioAllein", prec: 2},
                {name: "ronaldFaktor", key: "ronaldFaktor", prec: 2},
                {name: "ronaldGedeckelt", key: "ronaldGedeckelt", prec: 2},
                {name: "ronaldPunkte", key: "ronaldPunkte", prec: 0},
                {name: "verGegen", key: "verGegen", prec: 2},
                {name: "ver", key: "ver", prec: 2},
                {name: "turnierPunkte", key: "turnierPunkte", prec: 0},
                {name: "turnierRonaldPunkte", key: "turnierRonaldPunkte", prec: 0},
                {name: "turnierPPT", key: "turnierPPT", prec: 2},
                {name: "ratioPPT", key: "ratioPPT", prec: 2}
            ];
        }

        function acc(key, attr, value) {
            if (key[attr]) {
                key[attr] += value;
            } else {
                key[attr] = value;
            }
        }

        function max(path) {
            var max = 0;
            for (var key in path) {
                if (path[key] > max) {
                    max = path[key];
                }
            }
            return max;
        }

        function json2array(collection) {
            var array = [];
            for (var attr in collection) {
                array.push({
                    name: attr,
                    value: collection[attr]
                });
            }
            return array;
        }

        function traverse(o, func) {
            for (var i in o) {
                func.apply(this, [i, o[i]]);
                if (o[i] !== null && typeof (o[i]) == "object") {
                    //going on step down in the object tree!!
                    traverse(o[i], func);
                }
            }
        }

        function process(key, value) {
            var substr = key.substring(0, 4);
            if (substr === 'game') {

                var threeplayers = value.activeThree.split(" ");
                var points = parseInt(value.points);

                // Punkte zusammenzählen
                acc($scope.results.val, value.declarer, points);

                // Teilgenommene Spiele
                acc($scope.results.teil, threeplayers[0], 1);
                acc($scope.results.teil, threeplayers[1], 1);
                acc($scope.results.teil, threeplayers[2], 1);

                // Spiele insgesamt in Skatrunde
                acc($scope.results, "nrGames", 1);

                // Gewonnen und gespielt als Alleinspieler
                if (value.points > 0) {
                    acc($scope.results.gew, value.declarer, 1);
                }
                acc($scope.results.ges, value.declarer, 1);

                // Gewonnen und gespielt als Gegenspieler
                threeplayers.forEach(function (el) {
                    if (el != value.declarer) {
                        acc($scope.results.gesGegen, el, 1);
                        if (points < 0) {
                            acc($scope.results.gewGegen, el, 1);
                        }
                    }
                });
            }
        }

        // ---- D3 rendering

        function render(yQuantity, prec) {

            var w = 600;
            var h = 300;

            var dataset = y[yQuantity];

            var colors = d3.scale.category10().
                domain(['A', 'F', 'R', 'P', 'S', 'Ro', 'Od', 'T']);

            var yScale = d3.scale.ordinal()
                .domain(d3.range(dataset.length))
                .rangeRoundBands([0, h], 0.15);

            var xScale = d3.scale.linear()
                .domain([0, d3.max(dataset, function (d) {
                    return d.value;
                })])
                .range([0, w - 10]);

            var key = function (d) {
                return d.name;
            };

            // Remove SVG Element
            var svgElement = d3.select("svg");
            svgElement.remove();

            //Create SVG element
            var svg = d3.select("renderZone")
                .append("svg")
                .attr("width", w)
                .attr("height", h)
                .style("background-color", "rgb(187, 170, 170)");

            // Sort stuff
            var sortItems = function (a, b) {
                return b.value - a.value;
            };

            //Create bars
            svg.selectAll("rect")
                .data(dataset, key)
                .enter()
                .append("rect")
                .attr("y", function (d, i) {
                    return yScale(i);
                })
                .attr("x", 0)
                .attr("width", function (d) {
                    return xScale(d.value);
                })
                .attr("height", yScale.rangeBand())
                .attr("fill", function (d, i) {
                    return colors(d.name);
                });

            //Create labels: number of points
            svg.selectAll("text.one")
                .data(dataset, key)
                .enter()
                .append("text")
                .text(function (d) {
                    return d3.round(d.value,prec);
                })
                .attr("class", "one")
                .attr("text-anchor", "end")
                .attr("x", function (d, i) {
                    return xScale(d.value) - 2;
                })
                .attr("y", function (d, i) {
                    return yScale(i) + yScale.rangeBand() * 5 / 6;
                })
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("fill", "white");

            // Create labels: player names
            svg.selectAll("text.two")
                .data(dataset, key)
                .enter()
                .append("text")
                .text(function (d) {
                    return d.name;
                })
                .attr("class", "two")
                .attr("text-anchor", "start")
                .attr("x", 2)
                .attr("y", function (d, i) {
                    return yScale(i) + yScale.rangeBand() * 5 / 6;
                })
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("fill", "white");

            // d3-sort the array
            svg.selectAll("rect")
                .sort(sortItems)
                .attr("y", function (d, i) {
                    return yScale(i);
                });

            // d3-sort array 2
            svg.selectAll("text.one")
                .sort(sortItems)
                .attr("y", function (d, i) {
                    return yScale(i) + yScale.rangeBand() * 5 / 6;
                });

            // d3-sort array 3
            svg.selectAll("text.two")
                .sort(sortItems)
                .attr("y", function (d, i) {
                    return yScale(i) + yScale.rangeBand() * 5 / 6;
                });

        }
    }]);