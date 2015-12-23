/**
 * Created by frankpeuker on 19.12.15.
 */

'use strict';

angular.module('myApp.view2')
    .controller('EingabeViewCtrl', ['$scope', 'Const', 'Render', 'Traverse', function ($scope,Const,Render,Traverse) {

        var myFirebaseRef = new Firebase(Const.firebase_url);

        $scope.text = "New game data";
        $scope.sendData = sendData;

        activate();

        function activate() {

        }

        function sendData() {

        }
    }]);