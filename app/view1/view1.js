'use strict';

angular.module('myApp.view1', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {

        $routeProvider.when('/view1', {
            templateUrl: 'view1/view1.html',
            controller: 'View1Ctrl'
        });
    }])

    .controller('View1Ctrl', ['$scope','$timeout', '$rootScope', function ($scope,$timeout,$rootScope) {

        // Not necessary if CSS animations are used
        $timeout(function() {
            $(".line0").css("opacity", "1");
        },1000);

        $timeout(function() {
            $(".line1").css("opacity", "1");
        },1000);

        $timeout(function() {
            $(".line2").css("opacity", "0.5");
        },3500);

        $timeout(function() {
            $(".line3").css("opacity", "0.8");
        },6000);

        // Reshuffle pictures

        $scope.picIndex = -1;

        // Start refreshing after first iteration only
        $timeout(function() {
            // first timeout for delay
            refreshBubbleWithNumber("1");
            // now frequently
            scheduleRefreshOfBubbleNr("1");
        },5500);

        $timeout(function() {
            // first timeout for delay
            refreshBubbleWithNumber("2");
            // now frequently
            scheduleRefreshOfBubbleNr("2");
        },15500);

        $timeout(function() {
            // first timeout for delay
            refreshBubbleWithNumber("3");
            // now frequently
            scheduleRefreshOfBubbleNr("3");
        },25500);

        function scheduleRefreshOfBubbleNr(bubbleNr) {
            $timeout(function() {
                refreshBubbleWithNumber(bubbleNr);
                scheduleRefreshOfBubbleNr(bubbleNr);
            }, 30000);
        }

        function refreshBubbleWithNumber(bubbleNr) {
            $(".bubble"+bubbleNr).css("background-image",nextPicture());
            console.log($(".bubble"+bubbleNr).css("background-image"));
        }

        function nextPicture() {
            $scope.picIndex++;
            if ($scope.picIndex === $rootScope.pictures.length) {
                $scope.picIndex = 0;
            }
            return 'url("'+$scope.pictures[$scope.picIndex]+'")';
        }
    }]);