'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'myApp.view1',
    'myApp.view2',
    'myApp.version',
    'ngAnimate'
]).
    config(['$routeProvider', '$locationProvider', function ($routeProvider,$locationProvider) {
        $routeProvider.otherwise({redirectTo: '/start'});
    }])
    .run(['$rootScope', function ($rootScope) {

        $rootScope.bubbleInfo = " ";

        $rootScope.pictures = [
            'img/k_3.jpeg',
            'img/o_3.jpeg',
            'img/u_3.jpeg',
            'img/as_2.png',
            'img/k_2.png',
            'img/o_2.png',
            'img/u_2.png',
            'img/schell.png',
            'img/as.png',
            'img/gruen.png',
            'img/herz.png'
        ];

        $rootScope.explanations = {
            'img/o_3.jpeg': 'Ober. Carta Mundi. Tornhout Belgien.',
            'img/k_3.jpeg': 'König. Carta Mundi. Tornhout Belgien.',
            'img/u_3.jpeg': 'Unter. Carta Mundi. Tornhout Belgien.',
            'img/as_2.png': 'As. VEB Altenburg Coeur Altenburg.',
            'img/k_2.png': 'König. VEB Altenburg Coeur Altenburg.',
            'img/o_2.png': 'Ober. VEB Altenburg Coeur Altenburg.',
            'img/u_2.png': 'Unter. VEB Altenburg Coeur Altenburg.',
            'img/schell.png': 'Unter. Altenburger und Stralsunder Spielkartenfabrik (ASS).',
            'img/as.png': 'As. Altenburger und Stralsunder Spielkartenfabrik (ASS).',
            'img/gruen.png': 'König. Altenburger und Stralsunder Spielkartenfabrik (ASS).',
            'img/herz.png': 'Ober. Altenburger und Stralsunder Spielkartenfabrik (ASS).'
        };

    }])
    .controller('mainCtrl', ['$timeout', '$rootScope', '$scope', function ($timeout, $rootScope, $scope) {

    }]);
