'use strict';

angular.module('myApp.view2', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/start', {
            templateUrl: 'view2/view2.html',
            controller: 'View2Ctrl'
        });
    }])

    .controller('View2Ctrl', ['$scope', function ($scope) {

        var url = "https://luminous-inferno-9676.firebaseio.com";
        var myFirebaseRef = new Firebase(url);

        $scope.isVisible = false;
        $scope.text = "Mein Text";
        $scope.games = [];
        $scope.initSeason = initSeason;

        $scope.nameOfStatId = [
            {name: "GS: Gewonnen pro Spiel", key: "ratioGegen", prec: 1, suffix: " %"},
            {name: "Gewonnen pro Spiel", key: "ratioAllein", prec: 1, suffix: " %"},
            {name: "Spiele pro Teilgenommen", key: "ratioGespielt", prec: 1, suffix: " %"},
            {name: "Ronald-Faktor", key: "ronaldFaktor", prec: 2},
            {name: "Deckel-Faktor", key: "ronaldGedeckelt", prec: 2},
            {name: "Punkte", key: "ronaldPunkte", prec: 0},
            {name: "GS: Verloren", key: "verGegen", prec: 0},
            {name: "Verloren", key: "ver", prec: 0},
            {name: "GS: Gewonnen", key: "gewGegen", prec: 0},
            {name: "Gewonnen", key: "gew", prec: 0},
            {name: "GS: Teilgenommen", key: "gesGegen", prec: 0},
            {name: "Teilgenommen", key: "ges", prec: 0},
            {name: "Echte Punkte", key: "val", prec: 0},
            {name: "Echte Turnier-Punkte", key: "turnierPunkte", prec: 0},
            {name: "Turnierpunkte", key: "turnierRonaldPunkte", prec: 0},
            {name: "Turnierpunkte pro Spiel", key: "turnierPPT", prec: 1},
            {name: "Punkte pro Spiel", key: "ratioPPT", prec: 1},
            {name: "Teilgenommen", key: "teil", prec: 0}
        ];

        $scope.nameOfSeasons = [
            {key: 22, name: "Saison 22", info: ""},
            {key: 21, name: "Saison 21", info: ""},
            {key: 20, name: "Saison 20", info: ""},
            {key: 19, name: "Saison 19", info: ""},
            {key: 18, name: "Saison 18", info: ""},
            {key: 17, name: "Saison 17", info: ""},
            {key: 16, name: "Saison 16", info: ""},
            {key: 15, name: "Saison 15", info: ""},
            {key: 14, name: "Saison 14", info: ""},
            {key: 13, name: "Saison 13", info: ""},
            {key: 12, name: "Saison 12", info: ""},
            {key: 11, name: "Saison 11", info: ""},
            {key: 10, name: "Saison 10", info: ""}
        ];

        $scope.arrays = {
            ronaldPunkte: []
        };

        $scope.render = render;
        $scope.renderFollowUp = renderFollowUp;

        activate();

        function activate() {
            initSeason("22","initFirstTime");
        }

        function initSeason(season,mode) {
            myFirebaseRef.child("season_"+season).on("value", function (snapshot) {

                $scope.games = snapshot.val();

                calculateResults();

                render("ronaldPunkte", 0);

                $scope.$apply();
                myFirebaseRef.child("season_"+season).off("value");
            });
        }

        function calculateResults() {

            $scope.results = results();
            var x = $scope.results;
            var y = $scope.arrays;

            // Akkumuliere einzelne Spiele
            traverse($scope.games, process);

            // Auswertung der akkumulierten Spieldaten
            $scope.results.refGames = max($scope.results.teil);
            for (var el in x.teil) {
                x.ratioGegen[el] = x.gewGegen[el] / x.gesGegen[el] * 100.;
                x.ratioAllein[el] = x.gew[el] / x.ges[el] * 100.;
                x.ratioGespielt[el] = x.ges[el] / x.teil[el] * 100.;
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

        function results() {
            return {
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
                ratioGespielt: {},
                ronaldFaktor: {},
                ratioPPT: {},
                ronaldGedeckelt: {},
                ronaldPunkte: {},
                turnierPunkte: {},
                turnierRonaldPunkte: {},
                turnierPPT: {}
            };
        }

        // ---- D3 rendering

        function render(yQuantity, prec, suffix) {

            var w = 600;
            var h = 500;

            var dataset = $scope.arrays[yQuantity];

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
            if (svgElement) {
                svgElement.remove();
            }

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
                    var ret = d3.round(d.value, prec);
                    if (suffix) {
                        ret = ret + suffix;
                    }
                    return ret;
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

        function renderFollowUp(yQuantity, prec, suffix) {

            var w = 600;
            var h = 500;

            var dataset = $scope.arrays[yQuantity];

            var svg = d3.select("renderZone");

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

            var sortItems = function (a, b) {
                return b.value - a.value;
            };

            var key = function (d) {
                return d.name;
            };

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
                .attr("x", function (d, i) {
                    return xScale(d.value) - 2;
                })
                .attr("y", function (d, i) {
                    return yScale(i) + yScale.rangeBand() * 5 / 6;
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
                    return yScale(i) + yScale.rangeBand() * 5 / 6;
                });
        }
    }]);