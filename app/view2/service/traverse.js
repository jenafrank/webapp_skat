angular.module('myApp.view2')
    .factory('Traverse', ['Const', function (Const) {

        var currentDay, x, y;

        return {
            start: startTraverse,

            process: process,
            postTraverse: postTraverse,

            old_process: old_process,
            old_postTraverse: old_postTraverse
        };

        function postTraverse(x) {
            // Auswertung der akkumulierten Spieldaten
            x.refGames = max(x.teil);
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

        function old_postTraverse(x) {
            // Auswertung der akkumulierten Spieldaten
            x.refGames = max(x.teil);
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

        function startTraverse(o,func,xVar,yVar) {
            x = xVar;
            y = yVar;
            currentDay = 0;
            traverse(o,func);
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
            var substrDay = keyOfObject.substring(0, 3);
            var currentDayStr = currentDay.toString();

            if (substrDay === 'day') {
                currentDay++;
                currentDayStr = currentDay.toString();
                x.days[currentDayStr] = {};
            }

            // Akkumuliere alle Spiele-Objekte der Firebase-Referenz
            if (substr === 'game') {

                var threeplayers = object.activeThree.split(" ");
                var points = parseInt(object.points);

                // Punkte zusammenzählen
                if (object.declarer != 'E') {
                    acc(x.val, object.declarer, points);
                    // Spieltage einzeln akkumulieren
                    acc(x.days[currentDayStr], object.declarer, points);
                }

                // Teilgenommene Spiele
                acc(x.teil, threeplayers[0], 1);
                acc(x.teil, threeplayers[1], 1);
                acc(x.teil, threeplayers[2], 1);

                // Spiele insgesamt in Skatrunde
                acc(x, "nrGames", 1);

                // Gewonnen als Alleinspieler
                if (points > 0) {
                    acc(x.gew, object.declarer, 1);
                }

                // Gespielt als Alleinspieler
                if (object.declarer != 'E') {
                    acc(x.ges, object.declarer, 1);
                }

                // Gewonnen und gespielt als Gegenspieler
                threeplayers.forEach(function (el) {
                    if (el != object.declarer) {
                        acc(x.gesGegen, el, 1);
                        if (points < 0) {
                            acc(x.gewGegen, el, 1);
                        }
                    }
                });

                // Eingemischte Spiele registrieren
                acc(x, "eingemischt", 1);

                // ToDo: Kontras

                // ToDo: Spielwert-Statistik
            }

            // ToDo: Grafiken, Zeitverläufe parsen zu bestimmten Größen
        }

        function old_process(keyOfObject, object) {
            // Erstellung primärer Summen:
            // val, teil, gew, ges

            var substr = keyOfObject.substring(0, 3);
            var ply;

            // Akkumuliere alle Spiele-Objekte der Firebase-Referenz
            if (substr === 'day') {

                // Punkte
                for (ply in object.val) {
                    acc(x.val, ply, parseFloat(object.val[ply]));
                }

                // Teilgenommen
                for (ply in object.teil) {
                    acc(x.teil, ply, parseInt(object.teil[ply]));
                }

                // Gespielte Spiele
                for (ply in object.ges) {
                    acc(x.ges, ply, parseInt(object.ges[ply]));
                }

                // Gewonnene Spiele
                for (ply in object.gew) {
                    acc(x.gew, ply, parseInt(object.gew[ply]));
                }
            }
        }

        // helper routines

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

    }]);