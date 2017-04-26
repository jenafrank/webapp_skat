'use strict';

angular.module('myApp.view2')
    .factory('Const', function () {

        var firebase_url = "https://luminous-inferno-9676.firebaseio.com";
        var svg_width = 600;
        var svg_height = 500;
        var player_colors = d3.scale.category10().
            domain(['A', 'F', 'R', 'P', 'S', 'Ro', 'Od', 'T', 'Ra', 'Pa']);

        return {
            firebase_url: firebase_url,
            svg_width: svg_width,
            svg_height: svg_height,
            derived_quantities: derived_quantities(),
            available_Statistics: available_Statistics(),
            seasons: seasons(),
            player_profiles: player_profiles(),
            player_colors: player_colors
        };

        function derived_quantities() {
            return {
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
                ratioGespielt: {},
                ronaldFaktor: {},
                ratioPPT: {},
                ronaldGedeckelt: {},
                ronaldPunkte: {},
                turnierPunkte: {},
                turnierRonaldPunkte: {},
                turnierPPT: {},
                days: {}
            };
        }

        function available_Statistics() {
            return [
                {
                    name: "Punkte",
                    key: "ronaldPunkte",
                    prec: 0,
                    old: true,
                    barchart: true,
                    render: true
                },
                {
                    name: "Punkte pro TS",
                    key: "ratioPPT",
                    prec: 1,
                    old: true,
                    barchart: true,
                    render: true
                },
                {
                    name: "Spieltage",
                    key: "spieltage",
                    prec: 0,
                    old: false,
                    barchart: false,
                    render: false
                },
                {
                    name: "Performanz",
                    key: "performanz",
                    old: true,
                    barchart: false,
                    renderSelector: 'performance',
                    render: true
                },
                {
                    name: "Gewonnene Spiele pro Spiel",
                    key: "ratioAllein",
                    prec: 1,
                    suffix: " %",
                    old: true,
                    barchart: true,
                    render: true
                },
                {
                    name: "Spiele pro TS",
                    key: "ratioGespielt",
                    prec: 1,
                    suffix: " %",
                    old: true,
                    barchart: true,
                    render: true
                },
                {
                    name: "Teilgenommen",
                    key: "teil",
                    prec: 0,
                    old: false,
                    barchart: true,
                    render: true
                },
                {
                    name: "Ronald-Faktor",
                    key: "ronaldFaktor",
                    prec: 2,
                    old: true,
                    barchart: true,
                    render: true
                },
                {
                    name: "Deckel-Faktor",
                    key: "ronaldGedeckelt",
                    prec: 2,
                    old: true,
                    barchart: true,
                    render: true
                },
                {
                    name: "Gespielt",
                    key: "ges",
                    prec: 0,
                    old: true,
                    barchart: true,
                    render: true
                },
                {
                    name: "Gewonnen",
                    key: "gew",
                    prec: 0,
                    old: true,
                    barchart: true,
                    render: true
                },
                {
                    name: "Verloren",
                    key: "ver",
                    prec: 0,
                    old: true,
                    barchart: true,
                    render: true
                },
                {
                    category: "Turnierwertung"
                },
                {
                    name: "Turnierpunkte",
                    key: "turnierRonaldPunkte",
                    prec: 0,
                    old: false,
                    barchart: true,
                    render: true
                },
                {
                    name: "Turnierpunkte pro Spiel",
                    key: "turnierPPT",
                    prec: 1,
                    old: false,
                    barchart: true,
                    render: true
                },
                {
                    category: "Echte Punkte"
                },
                {
                    name: "Echte Punkte",
                    key: "val",
                    prec: 0,
                    old: true,
                    barchart: true,
                    render: true
                },
                {
                    name: "Echte Turnier-Punkte",
                    key: "turnierPunkte",
                    prec: 0,
                    old: false,
                    barchart: true,
                    render: true
                },
                {
                    category: "Gegenspiel"
                },
                {
                    name: "Gewonnen [%]",
                    key: "ratioGegen",
                    prec: 1,
                    suffix: " %",
                    old: false,
                    barchart: true,
                    render: true
                },
                {
                    name: "Gespielt",
                    key: "gesGegen",
                    prec: 0,
                    old: false,
                    barchart: true,
                    render: true
                },
                {
                    name: "Gewonnen",
                    key: "gewGegen",
                    prec: 0,
                    old: false,
                    barchart: true,
                    render: true
                },
                {
                    name: "Verloren",
                    key: "verGegen",
                    prec: 0,
                    old: false,
                    barchart: true,
                    render: true
                }
            ];
        }

        function seasons() {
            return [
                {key: 26, name: "Saison 26", info: "", old: false},
                {key: 25, name: "Saison 25", info: "", old: false},
                {key: 24, name: "Saison 24", info: "", old: false},
                {key: 23, name: "Saison 23", info: "", old: false},
                {key: 22, name: "Saison 22", info: "", old: false},
                {key: 21, name: "Saison 21", info: "", old: false},
                {key: 20, name: "Saison 20", info: "", old: false},
                {key: 19, name: "Saison 19", info: "", old: false},
                {key: 18, name: "Saison 18", info: "", old: false},
                {key: 17, name: "Saison 17", info: "", old: false},
                {key: 16, name: "Saison 16", info: "", old: false},
                {key: 15, name: "Saison 15", info: "", old: false},
                {key: 14, name: "Saison 14", info: "", old: false},
                {key: 13, name: "Saison 13", info: "", old: false},
                {key: 12, name: "Saison 12", info: "", old: false},
                {key: 11, name: "Saison 11", info: "", old: false},
                {key: 10, name: "Saison 10", info: "", old: false},
                {key: 9, name: "Saison 9", info: "", old: true},
                {key: 8, name: "Saison 8", info: "17.01.2008 -- 21.08.2008", old: true},
                {key: 7, name: "Saison 7", info: "29.03.2007 -- 24.01.2008", old: true},
                {key: 6, name: "Saison 6", info: "09.04.2006 -- 22.03.2007", old: true},
                {key: 5.5, name: "Interludium II", info: "01.02.2006 -- 06.04.2006", old: true},
                {key: 5, name: "Saison 5", info: "03.11.2005 -- 25.01.2006", old: true},
                {key: 4.5, name: "Interludium I", info: "07.07.2005 -- 27.10.2005", old: true},
                {key: 4, name: "Saison 4", info: "10.03.2005 -- 23.06.2005", old: true},
                {key: 3, name: "Saison 3", info: "18.11.2004 -- 13.01.2005", old: true},
                {key: 2, name: "Saison 2", info: "16.10.2003 -- 23.07.2004", old: true},
                {key: 1, name: "Saison 1", info: "24.10.2002 -- 13.07.2003", old: true}
            ];
        }

        function player_profiles() {
            return {
                'Ra': {},
                'Ro': {},
                'R': {},
                'F': {},
                'A': {},
                'T': {},
                'S': {},
                'P': {},
                'Pa': {},
                'Tr': {},
                'St': {},
                'M': {},
                'C': {},
                'J': {}
            }
        }
    });
