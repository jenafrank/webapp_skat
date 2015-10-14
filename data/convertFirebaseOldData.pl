#!/usr/bin/perl
use feature qw(say switch);
use strict;
use warnings;
use Firebase;
use Data::Dumper;
use open ':std', ':encoding(UTF-8)';

my $fb = Firebase->new( firebase => 'luminous-inferno-9676' );

my $filename  = $ARGV[0];
my $day       = 0;
my $oldSeason = 0;

open( my $fh, $filename );
while ( my $row = <$fh> ) {
    $day++;

    my @components = split( ";", $row );
    my $season = $components[0];
    if ( $season > $oldSeason ) {
        $oldSeason = $season;
        $day       = 1;
    }

    my $date   = $components[1];
    my @punkte = splice( @components, 2, 7 );
    my @teil   = splice( @components, 2, 7 );
    my @ges    = splice( @components, 2, 7 );
    my @gew    = splice( @components, 2, 7 );

    my %punkteObj = (
        A  => shift @punkte,
        F  => shift @punkte,
        Ra => shift @punkte,
        R  => shift @punkte,
        Ro => shift @punkte,
        S  => shift @punkte,
        T  => shift @punkte
    );

    my %teilObj = (
        A  => shift @teil,
        F  => shift @teil,
        Ra => shift @teil,
        R  => shift @teil,
        Ro => shift @teil,
        S  => shift @teil,
        T  => shift @teil
    );

    my %gesObj = (
        A  => shift @ges,
        F  => shift @ges,
        Ra => shift @ges,
        R  => shift @ges,
        Ro => shift @ges,
        S  => shift @ges,
        T  => shift @ges
    );

    my %gewObj = (
        A  => shift @gew,
        F  => shift @gew,
        Ra => shift @gew,
        R  => shift @gew,
        Ro => shift @gew,
        S  => shift @gew,
        T  => shift @gew
    );

    my $address = "season_$season/day_$day/";
    say $address;

    my $result = $fb->put(
        $address,
        {   date => $date,
            val  => {
                A  => $punkteObj{A},
                F  => $punkteObj{F},
                Ra => $punkteObj{Ra},
                R  => $punkteObj{R},
                Ro => $punkteObj{Ro},
                S  => $punkteObj{S},
                T  => $punkteObj{T},
            },
            teil => {
                A  => $teilObj{A},
                F  => $teilObj{F},
                Ra => $teilObj{Ra},
                R  => $teilObj{R},
                Ro => $teilObj{Ro},
                S  => $teilObj{S},
                T  => $teilObj{T},
            },
            ges => {
                A  => $gesObj{A},
                F  => $gesObj{F},
                Ra => $gesObj{Ra},
                R  => $gesObj{R},
                Ro => $gesObj{Ro},
                S  => $gesObj{S},
                T  => $gesObj{T},
            },
            gew => {
                A  => $gewObj{A},
                F  => $gewObj{F},
                Ra => $gewObj{Ra},
                R  => $gewObj{R},
                Ro => $gewObj{Ro},
                S  => $gewObj{S},
                T  => $gewObj{T},
            }
        }
    );
}

