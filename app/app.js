'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'myApp.view1',
    'myApp.view2',
    'myApp.version'
]).
    config(['$routeProvider', function ($routeProvider) {
        $routeProvider.otherwise({redirectTo: '/view1'});
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
    .controller('mainCtrl', ['$timeout', function ($timeout) {
        console.log("Executed");

        $('#bubbles').click(function () {
            $(this).find(":focus").each(function (idx) {
                var id = this.id;
                document.getElementById(id).style.borderColor = "rgb(75,124,54)";
                document.getElementById(id).style.boxShadow= "none";
                document.getElementById(id).style.width = "200px";
                document.getElementById(id).style.height = "200px";
                $timeout(function () {
                    console.log(id);
                    document.getElementById(id).style.borderColor = "rgb(75,124,54)";
                    document.getElementById(id).style.boxShadow= "none";
                    document.getElementById(id).style.width = "150px";
                    document.getElementById(id).style.height = "150px";
                }, 5000);
            });
        });
    }]);
