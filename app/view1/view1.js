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

        //
        console.log("Executed");
        $rootScope.isOn = false;

        // get bubble elements
        var bubbleElement1 = document.getElementById("bubble1");
        var bubbleElement2 = document.getElementById("bubble2");
        var bubbleElement3 = document.getElementById("bubble3");
        var x;

        // Shoot first to third bubble!! yeah.
        $timeout(function () {
            refreshBubbleWithNumber("1");
            bubbleElement1.classList.add('y1');
        }, 6000);

        $timeout(function () {
            refreshBubbleWithNumber("2");
            bubbleElement2.classList.add('y2');
        }, 16000);

        $timeout(function () {
            refreshBubbleWithNumber("3");
            bubbleElement3.classList.add('y3');
        }, 26000);

        // get informed when animation (one bubbling procedure) finishes and update picture
        bubbleElement1.addEventListener("animationend", function () {
            bubbleElement1.classList.remove('y1');
            refreshBubbleWithNumber("1");
            x = bubbleElement1.offsetWidth;
            bubbleElement1.classList.add('y1');
        }, false);

        bubbleElement2.addEventListener("animationend", function () {
            bubbleElement2.classList.remove('y2');
            refreshBubbleWithNumber("2");
            x = bubbleElement2.offsetWidth;
            bubbleElement2.classList.add('y2');
        }, false);

        bubbleElement3.addEventListener("animationend", function () {
            bubbleElement3.classList.remove('y3');
            refreshBubbleWithNumber("3");
            x = bubbleElement3.offsetWidth;
            bubbleElement3.classList.add('y3');
        }, false);

        // react on selection of element
        $rootScope.showInfo = function (bubbleNr) {
            $rootScope.isOn = true;
            var key = getKey(bubbleNr);
            var re = /img[^\)"]*/;
            var substr = re.exec(key);
            $rootScope.bubbleInfo = $rootScope.explanations[substr[0]];
            focusAnimation(bubbleNr);
        };

        function getKey(bubbleNr) {
            return $(".bubble" + bubbleNr).css("background-image");
        }

        function focusAnimation(bubbleNr) {
            var el = null;
            if (bubbleNr === '1') {
                el = bubbleElement1;
            } else if (bubbleNr === '2') {
                el = bubbleElement2;
            } else if (bubbleNr === '3') {
                el = bubbleElement3;
            }

            el.style.borderColor = "rgb(194, 253, 61)";
            el.style.boxShadow = "10px 10px 5px #888888";
            el.style.width = "200px";
            el.style.height = "200px";

            $timeout(function () {
                $rootScope.isOn = false;
                resetSelection();
            }, 5000);
        }

        function resetSelection() {
            var elements = [bubbleElement1, bubbleElement2, bubbleElement3];
            elements.forEach(function (el) {
                el.style.borderColor = "rgb(75,124,54)";
                el.style.boxShadow = "none";
                el.style.width = "150px";
                el.style.height = "150px";
            });
        }

        // Refresh picture and cycle through pictures
        function refreshBubbleWithNumber(bubbleNr) {
            $(".bubble" + bubbleNr).css("background-image", nextPicture());
            console.log($(".bubble" + bubbleNr).css("background-image"));
        }

        $scope.picIndex = -1;
        function nextPicture() {
            $scope.picIndex++;
            if ($scope.picIndex === $rootScope.pictures.length) {
                $scope.picIndex = 0;
            }
            return 'url("' + $scope.pictures[$scope.picIndex] + '")';
        }

    }]);