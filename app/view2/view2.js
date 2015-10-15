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
        var w = 600;
        var h = 500;
        var colors = d3.scale.category10().
            domain(['A', 'F', 'R', 'P', 'S', 'Ro', 'Od', 'T', 'Ra', 'Pa']);
        var x, y;

        $scope.isVisible = false;
        $scope.text = "Mein Text";
        $scope.games = [];
        $scope.initSeason = initSeason;
        $scope.clickSeason = clickSeason;
        $scope.clickQuantity = clickQuantity;

        $scope.nameOfStatId = availableStats();
        $scope.nameOfSeasons = availableSeasons();
        $scope.currentSeason = $scope.nameOfSeasons[0];
        $scope.currentQuantity = $scope.nameOfStatId[0];

        $scope.arrays = {};

        $scope.render = render;
        $scope.renderFollowUp = renderFollowUp;

        activate();

        function activate() {
            clickSeason($scope.currentSeason, function () {
                clickQuantity($scope.currentQuantity);
            });
        }

        function initSeason(season, completionHandler) {
            if (season == 5.5) {
                season = '5_5';
            }
            if (season == 4.5) {
                season = '4_5';
            }

            myFirebaseRef.child("season_" + season).on("value", function (snapshot) {

                $scope.games = snapshot.val();

                calculateResults();

                render($scope.currentQuantity.key,
                    $scope.currentQuantity.prec,
                    $scope.currentQuantity.suffix);

                if (completionHandler) {
                    completionHandler();
                }

                $scope.$apply();
                myFirebaseRef.child("season_" + season).off("value");
            });
        }

        function calculateResults() {

            // Declaration of shorthands
            $scope.results = results();
            x = $scope.results;
            y = $scope.arrays;

            if (!$scope.currentSeason.old) {
                traverse($scope.games, process);
                postTraverse();
            } else {
                traverse($scope.games, processOld);
                postTraverseOld();
            }

            // Umwandlung in Datenstruktur für Darstellung in D3 und Angular
            for (var attr in x) {
                y[attr] = json2array(x[attr]);
            }
        }

        function postTraverse() {
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
        }

        function postTraverseOld() {
            // Auswertung der akkumulierten Spieldaten
            $scope.results.refGames = max($scope.results.teil);
            for (var el in x.teil) {
                x.ratioAllein[el] = x.ges[el] > 0 ? x.gew[el] / x.ges[el] * 100. : 0;
                x.ratioGespielt[el] = x.teil[el] > 0 ? x.ges[el] / x.teil[el] * 100. : 0;
                x.ronaldFaktor[el] = x.teil[el] > 0 ? x.refGames / x.teil[el] : 0;
                x.ronaldGedeckelt[el] = x.ronaldFaktor[el] > 3 ? 3 : x.ronaldFaktor[el];
                x.ronaldPunkte[el] = x.ronaldGedeckelt[el] * x.val[el];
                x.ratioPPT[el] = x.teil[el] > 0 ? x.val[el] / x.teil[el] : 0;
                x.ver[el] = x.ges[el] - x.gew[el];
            }
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

        function process(keyOfObject, object) {
            // Erstellung primärer Summen:
            // points, val, teil, gew, ges, gewGegen, gesGegen

            var substr = keyOfObject.substring(0, 4);

            // Akkumuliere alle Spiele-Objekte der Firebase-Referenz
            if (substr === 'game') {

                var threeplayers = object.activeThree.split(" ");
                var points = parseInt(object.points);

                // Punkte zusammenzählen
                if (object.declarer != 'E') {
                    acc($scope.results.val, object.declarer, points);
                }

                // Teilgenommene Spiele
                acc($scope.results.teil, threeplayers[0], 1);
                acc($scope.results.teil, threeplayers[1], 1);
                acc($scope.results.teil, threeplayers[2], 1);

                // Spiele insgesamt in Skatrunde
                acc($scope.results, "nrGames", 1);

                // Gewonnen als Alleinspieler
                if (points > 0) {
                    acc($scope.results.gew, object.declarer, 1);
                }

                // Gespielt als Alleinspieler
                if (object.declarer != 'E') {
                    acc($scope.results.ges, object.declarer, 1);
                }

                // Gewonnen und gespielt als Gegenspieler
                threeplayers.forEach(function (el) {
                    if (el != object.declarer) {
                        acc($scope.results.gesGegen, el, 1);
                        if (points < 0) {
                            acc($scope.results.gewGegen, el, 1);
                        }
                    }
                });

                // Eingemischte Spiele registrieren
                acc($scope.results, "eingemischt", 1);

                // ToDo: Kontras

                // ToDo: Spielwert-Statistik
            }

            // ToDo: Grafiken, Zeitverläufe parsen zu bestimmten Größen

            // ToDo: Spieltage einzeln akkumulieren für Spieltagsübersicht (Tabelle)
            // In Extra-Traverse
        }

        function processOld(keyOfObject, object) {
            // Erstellung primärer Summen:
            // val, teil, gew, ges

            var substr = keyOfObject.substring(0, 3);
            var ply;

            // Akkumuliere alle Spiele-Objekte der Firebase-Referenz
            if (substr === 'day') {

                // Punkte
                for (ply in object.val) {
                    acc($scope.results.val, ply, parseFloat(object.val[ply]));
                }

                // Teilgenommen
                for (ply in object.teil) {
                    acc($scope.results.teil, ply, parseInt(object.teil[ply]));
                }

                // Gespielte Spiele
                for (ply in object.ges) {
                    acc($scope.results.ges, ply, parseInt(object.ges[ply]));
                }

                // Gewonnene Spiele
                for (ply in object.gew) {
                    acc($scope.results.gew, ply, parseInt(object.gew[ply]));
                }
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

        function clickSeason(el, completionHandler) {
            initSeason(el.key, completionHandler);
            $scope.currentSeason = el;
        }

        function clickQuantity(el) {
            renderFollowUp(el.key, el.prec, el.suffix);
            $scope.currentQuantity = el;
        }

        // ---- D3 rendering

        function render(yQuantity, prec, suffix) {

            var dataset = $scope.arrays[yQuantity];

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
                .attr("fill", function (d, i) {
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

        function renderFollowUp(yQuantity, prec, suffix) {

            var dataset = $scope.arrays[yQuantity];

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
                .attr("x", function (d, i) {
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

        function sortItems(a, b) {
            return b.value - a.value;
        };

        function key(d) {
            return d.name;
        };

        function availableStats () {
            return [
                {
                    name: "Punkte",
                    key: "ronaldPunkte",
                    prec: 0,
                    old: true
                },
                {
                    name: "Punkte pro TS",
                    key: "ratioPPT",
                    prec: 1,
                    old: true
                },
                {
                    name: "Gewonnene Spiele pro Spiel",
                    key: "ratioAllein",
                    prec: 1,
                    suffix: " %",
                    old: true
                },
                {
                    name: "Spiele pro TS",
                    key: "ratioGespielt",
                    prec: 1,
                    suffix: " %",
                    old: true
                },
                {
                    name: "Teilgenommen",
                    key: "teil",
                    prec: 0,
                    old: false
                },
                {
                    name: "Ronald-Faktor",
                    key: "ronaldFaktor",
                    prec: 2,
                    old: true
                },
                {
                    name: "Deckel-Faktor",
                    key: "ronaldGedeckelt",
                    prec: 2,
                    old: true
                },
                {
                    name: "Gespielt",
                    key: "ges",
                    prec: 0,
                    old: true
                },
                {
                    name: "Gewonnen",
                    key: "gew",
                    prec: 0,
                    old: true
                },
                {
                    name: "Verloren",
                    key: "ver",
                    prec: 0,
                    old: true
                },
                {
                    category: "Turnierwertung"
                },
                {
                    name: "Turnierpunkte",
                    key: "turnierRonaldPunkte",
                    prec: 0,
                    old: false
                },
                {
                    name: "Turnierpunkte pro Spiel",
                    key: "turnierPPT",
                    prec: 1,
                    old: false
                },
                {
                    category: "Echte Punkte"
                },
                {
                    name: "Echte Punkte",
                    key: "val",
                    prec: 0,
                    old: true
                },
                {
                    name: "Echte Turnier-Punkte",
                    key: "turnierPunkte",
                    prec: 0,
                    old: false
                },
                {
                    category: "Gegenspiel"
                },
                {
                    name: "Gewonnen [%]",
                    key: "ratioGegen",
                    prec: 1,
                    suffix: " %",
                    old: false
                },
                {
                    name: "Gespielt",
                    key: "gesGegen",
                    prec: 0,
                    old: false
                },
                {
                    name: "Gewonnen",
                    key: "gewGegen",
                    prec: 0,
                    old: false
                },
                {
                    name: "Verloren",
                    key: "verGegen",
                    prec: 0,
                    old: false
                }
            ];
        }

        function availableSeasons () {
            return [
                {key: 22, name: "Saison 22", info: "", old: false},
                {key: 21, name: "Saison 21", info: "", old: false},
                {key: 20, name: "Saison 20", info: "", old: false},
                {key: 19, name: "Saison 19", info: "", old: false},
                {key: 18, name: "Saison 18", info: "", old: false},
                {key: 17, name: "Saison 17", info: "", old: false},
                {key: 16, name: "Saison 16", info: "", old: false},
                {key: 15, name: "Saison 15", info: "", old: false},
                {key: 14, name: "Saison 14", info: "", old: false},
                {key: 13, name: "Saison 13", info: "", old: false},
                {key: 12, name: "Saison 12", info: "", old: false},
                {key: 11, name: "Saison 11", info: "", old: false},
                {key: 10, name: "Saison 10", info: "", old: false},
                {key: 9, name: "Saison 9", info: "", old: true},
                {key: 8, name: "Saison 8", info: "", old: true},
                {key: 7, name: "Saison 7", info: "", old: true},
                {key: 6, name: "Saison 6", info: "", old: true},
                {key: 5.5, name: "Interludium II", info: "", old: true},
                {key: 5, name: "Saison 5", info: "", old: true},
                {key: 4.5, name: "Interludium I", info: "", old: true},
                {key: 4, name: "Saison 4", info: "", old: true},
                {key: 3, name: "Saison 3", info: "", old: true},
                {key: 2, name: "Saison 2", info: "", old: true},
                {key: 1, name: "Saison 1", info: "", old: true}
            ];
        }
    }]);