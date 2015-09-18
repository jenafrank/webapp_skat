'use strict';

angular.module('myApp.view1', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {

        $routeProvider.when('/reactive', {
            templateUrl: 'view1/view1.html',
            controller: 'View1Ctrl'
        });
    }])

    .controller('View1Ctrl', ['$scope', '$timeout', '$rootScope', function ($scope, $timeout, $rootScope) {

        // Not necessary if CSS animations are used
        $timeout(function () {
            $(".line0").css("opacity", "1");
        }, 1000);

        $timeout(function () {
            $(".line1").css("opacity", "1");
        }, 1000);

        $timeout(function () {
            $(".line2").css("opacity", "0.5");
        }, 3500);

        $timeout(function () {
            $(".line3").css("opacity", "0.8");
        }, 6000);


    }]);