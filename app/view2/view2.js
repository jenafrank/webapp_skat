'use strict';

angular.module('myApp.view2', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/start', {
            templateUrl: 'view2/view2.html',
            controller: 'View2Ctrl'
        });
    }])

    .controller('View2Ctrl', ['$scope', 'Const', 'Render', 'Traverse', function ($scope,Const,Render,Traverse) {

        var myFirebaseRef = new Firebase(Const.firebase_url);
        var x, y;

        $scope.isVisible = false;
        $scope.text = "Mein Text";
        $scope.games = [];
        $scope.clickSeason = clickSeason;
        $scope.clickQuantity = clickQuantity;

        $scope.nameOfStatId = Const.available_Statistics;
        $scope.nameOfSeasons = Const.seasons;
        $scope.currentSeason = $scope.nameOfSeasons[0];
        $scope.clickSeasonAndLoadQuantity = clickSeasonAndLoadQuantity;
        $scope.currentQuantity = null;
        $scope.playerProfiles = Const.player_profiles;

        $scope.arrays = {};

        $scope.render = Render.barchart;
        $scope.renderFollowUp = Render.barchart_animate;

        activate();

        function activate() {
            clickSeason($scope.currentSeason, function () {
                clickQuantity($scope.nameOfStatId[0],false);
            });
        }

        function calculateResults() /**/ {

            // Declaration of shorthands
            $scope.results = angular.copy(Const.derived_quantities);
            $scope.arrays = {};

            x = $scope.results;
            y = $scope.arrays;

            if (!$scope.currentSeason.old) {
                Traverse.start($scope.games, Traverse.process,x,y);
                Traverse.postTraverse(x);
            } else {
                Traverse.start($scope.games, Traverse.old_process,x,y);
                Traverse.old_postTraverse(x);
            }

            // Umwandlung in Datenstruktur für Darstellung in D3 und Angular
            for (var attr in x) {
                y[attr] = json2array(x[attr]);
            }

            y.days = [];
            for (var attr in x.days) {
                y.days.push(json2array(x.days[attr]));
            }
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

        function clickSeasonAndLoadQuantity(el) {
            clickSeason(el, function() {
                clickQuantity($scope.currentQuantity,false);
            });
        }

        function clickSeason(el, completionHandler) {
            $scope.currentSeason = el;
            var season = $scope.currentSeason.key;

            if (season == 5.5) {
                season = '5_5';
            }

            if (season == 4.5) {
                season = '4_5';
            }

            myFirebaseRef.child("season_" + season).on("value", function (snapshot) {

                $scope.games = snapshot.val();

                calculateResults();

                $scope.$apply();
                myFirebaseRef.child("season_" + season).off("value");

                if (completionHandler) {
                    completionHandler();
                }
            });
        }

        function clickQuantity(el,animate) {
            if (animate && $scope.currentQuantity && $scope.currentQuantity.barchart && el.barchart) {
                Render.barchart_animate($scope.arrays[el.key], el.prec, el.suffix);
            } else if (el.barchart) {
                Render.barchart($scope.arrays[el.key], el.prec, el.suffix);
            } else if (el.renderSelector) {
                Render[el.renderSelector]($scope.arrays.ratioAllein,$scope.arrays.ratioGespielt);
            }

            $scope.currentQuantity = el;
        }
    }]);