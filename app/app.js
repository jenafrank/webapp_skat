'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'myApp.view1',
    'myApp.view2',
    'myApp.version',
    'ngAnimate'
]).
    config(['$routeProvider', function ($routeProvider) {
        $routeProvider.otherwise({redirectTo: '/reactive'});
    }])
    .run(['$rootScope', '$timeout', function ($rootScope, $timeout) {

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

        $rootScope.showInfo = function (bubbleNr) {
            $rootScope.isOn = true;
            var key = getKey(bubbleNr);
            var re = /img[^\)]*/;
            var substr = re.exec(key);
            $rootScope.bubbleInfo = $rootScope.explanations[substr[0]];
        }

        function getKey(bubbleNr) {
            return $(".bubble" + bubbleNr).css("background-image");
        }

        /*
         var myDataRef = new Firebase('https://gw821jhtt5n.firebaseio-demo.com/');
         console.log("Check");

         var name="Frank";
         var text="Firebug awesomeness is incredibly exciting"

         var obj={name: name, text2: text};

         myDataRef.push(obj);

         myDataRef.on('child_added', function(snapshot) {
         var msg = snapshot.val();
         $rootScope.name = msg.name;
         $rootScope.text = msg.text2;
         });
         */
    }])
    .controller('mainCtrl', ['$timeout', '$rootScope', '$scope', function ($timeout, $rootScope, $scope) {
        console.log("Executed");
        $rootScope.isOn = false;

        // sync animation and reload of picture
        var bubbleElement1 = document.getElementById("bubble1");
        var bubbleElement2 = document.getElementById("bubble2");
        var bubbleElement3 = document.getElementById("bubble3");
        var x;

        // Shoot first to third bubble!! yeah.
        $timeout(function() {
            refreshBubbleWithNumber("1");
            bubbleElement1.classList.add('y1');
        },6000);

        $timeout(function() {
            refreshBubbleWithNumber("2");
            bubbleElement2.classList.add('y2');
        },16000);

        $timeout(function() {
            refreshBubbleWithNumber("3");
            bubbleElement3.classList.add('y3');
        },26000);

        // get informed when animation (one bubbling procedure) finishes and update picture
        bubbleElement1.addEventListener("animationend", function() {
            bubbleElement1.classList.remove('y1');
            refreshBubbleWithNumber("1");
            x = bubbleElement1.offsetWidth;
            bubbleElement1.classList.add('y1');
        }, false);

        bubbleElement2.addEventListener("animationend", function() {
            bubbleElement2.classList.remove('y2');
            refreshBubbleWithNumber("2");
            x = bubbleElement2.offsetWidth;
            bubbleElement2.classList.add('y2');
        }, false);

        bubbleElement3.addEventListener("animationend", function() {
            bubbleElement3.classList.remove('y3');
            refreshBubbleWithNumber("3");
            x = bubbleElement3.offsetWidth;
            bubbleElement3.classList.add('y3');
        }, false);

        // time-fixed selection of elements, they get bigger, ugh!
        $('#bubbles').click(function () {
            // ToDo: Empty selection
            //
            $(this).find(":focus").each(function (idx) {
                var id = this.id;
                document.getElementById(id).style.borderColor = "rgb(194, 253, 61)";
                document.getElementById(id).style.boxShadow = "10px 10px 5px #888888";
                document.getElementById(id).style.width = "200px";
                document.getElementById(id).style.height = "200px";
                $timeout(function () {
                    $rootScope.isOn = false;
                    console.log(id);
                    document.getElementById(id).style.borderColor = "rgb(75,124,54)";
                    document.getElementById(id).style.boxShadow = "none";
                    document.getElementById(id).style.width = "150px";
                    document.getElementById(id).style.height = "150px";
                }, 5000);
            });
        });

        // Reshuffle pictures
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
