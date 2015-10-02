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
        }

        var x = $scope.results;

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
            div($scope.results.ratioGegen, $scope.results.gewGegen, $scope.results.gesGegen);
            div($scope.results.ratioAllein, $scope.results.gew, $scope.results.ges);
            $scope.results.refGames = max($scope.results.teil);
            for (var el in x.teil) {
                x.ronaldFaktor[el] = x.refGames / x.teil[el];
                x.ronaldGedeckelt[el] = x.ronaldFaktor[el] > 3 ? 3 : x.ronaldFaktor[el];
                x.ronaldPunkte[el] = x.ronaldGedeckelt[el] * x.val[el];
                x.verGegen[el] = x.gesGegen[el] - x.gewGegen[el];
                x.ver[el] = x.ges[el] - x.gew[el];
                x.turnierPunkte[el] = x.val[el] + 50 * (x.gew[el] - x.ver[el]) + 40 * x.gewGegen[el];
                x.turnierRonaldPunkte[el] = x.turnierPunkte[el] * x.ronaldGedeckelt[el];
                x.turnierPPT[el] = x.turnierPunkte[el] / x.teil[el];
            }
            div(x.ratioPPT, x.val, x.teil);
            $scope.arrays.ronaldPunkte = json2array(x.ronaldPunkte);
        }

        function acc(key, attr, value) {
            if (key[attr]) {
                key[attr] += value;
            } else {
                key[attr] = value;
            }
        }

        function div(key, pathZ, pathN) {
            for (var attr in pathZ) {
                if (attr != 'E') {
                    var z = pathZ[attr];
                    var n = pathN[attr];
                    if (n < 1) {
                        n = 0;
                    }
                    key[attr] = z / n;
                }
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

    }]);