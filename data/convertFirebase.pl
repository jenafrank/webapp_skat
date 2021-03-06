#!/usr/bin/perl
use feature qw(say switch);
use strict;
use warnings;
use Firebase;
use open ':std', ':encoding(UTF-8)';

my $debug = 0;
my $nrArg = $#ARGV + 1;
my $fb    = Firebase->new( firebase => 'luminous-inferno-9676' );

if ($debug) { print "$nrArg arguments detected... \n"; }

if ( $nrArg == 0 ) {
    print "\n ERROR 003. Please provide filenames. \n\n";
    exit(1);
}

for ( my $i = 0; $i < $nrArg; $i++ ) {

    my $filename = $ARGV[$i];
    my $j        = $i + 1;

    print STDERR "\n Datei $j: $filename \n";

    # Regex. Format specification for file name
    $filename =~ /(\d\d)_(\d\d)/;

    my $season = $1;
    my $day    = $2;

    if ($debug) { print "Season $season. Day $day."; }

    if ( !$season || !$day ) {
        print "\n ERROR 002. Name not in correct format. exiting...\n\n";
        exit(1);
    }

    my @plys;
    my $game = 0;
    my $id   = 0;

    open( my $fh, $filename );

    while ( my $row = <$fh> ) {

        # Mode 1: Activate new players

        # Regex for changing the player table (3,4,5 players supported)
        my $isRoundChange = $row
            =~ /([a-zA-z]+) ([a-zA-z]+) ([a-zA-z]+)\s?([a-zA-z]+)?\s?([a-zA-z]+)?/;

        my $p1 = $1;
        my $p2 = $2;
        my $p3 = $3;
        my $p4 = $4;
        my $p5 = $5;

        if ($isRoundChange) {

            # parse line if valid

            if ($p5) {

                # Five-Player mode
                if ($debug) {
                    print "5 players detected. $p1 $p2 $p3 $p4 $p5. \n";
                }
                @plys = ( $p1, $p2, $p3, $p4, $p5 );

            }
            elsif ($p4) {

                # Four-Player mode
                if ($debug) {
                    print "4 players detected. $p1 $p2 $p3 $p4. \n";
                }
                @plys = ( $p1, $p2, $p3, $p4 );

            }
            elsif ($p3) {

                # Three-Player mode
                if ($debug) {
                    print "3 players detected. $p1 $p2 $p3. \n";
                }
                @plys = ( $p1, $p2, $p3 );
            }

  # Reset game counter. The game counter is necessary to determine the current
  # 3-player active subset for 4-player and 5-player tables
            if ($p3) {
                $game = 0;
            }
        }

        # Mode 2: Database entries

        # Regex for Games:

        my $isGame        = $row =~ /([a-zA-z]+)\s(-?[0-9]+)\s?([a-zA-z]+)?/;
        my $isEingemischt = $row =~ /[^a-zA-z]*(E)[^a-zA-z]*/;

        my $p      = $1;
        my $val    = $2;
        my $kontra = $3;
        my $error  = "";

        #parse line if valid

        if ($isEingemischt) {
            $p   = 'E';
            $val = 0;
        }

        if ( $isGame || $isEingemischt ) {

            $game++;
            $id++;

            if ($debug) {
                print "Alle Spieler sind: @plys. ";
                print "Alleinspieler ist: $p. ";
            }

            my $index       = 0;
            my $removeIndex = -1;
            my @against     = ();
            my $nrPlys      = @plys;

            if ( $nrPlys == 3 ) {
                @against = @plys;
            }
            elsif ( $nrPlys == 4 ) {
                my $cls = ( $game - 1 ) % 4;
                if ( $cls == 3 ) {
                    @against = ( $plys[0], $plys[1], $plys[2] );
                }
                elsif ( $cls == 0 ) {
                    @against = ( $plys[1], $plys[2], $plys[3] );
                }
                elsif ( $cls == 1 ) {
                    @against = ( $plys[2], $plys[3], $plys[0] );
                }
                elsif ( $cls == 2 ) {
                    @against = ( $plys[3], $plys[0], $plys[1] );
                }
            }
            elsif ( $nrPlys == 5 ) {
                my $cls = ( $game - 1 ) % 5;
                if ( $cls == 0 ) {
                    @against = ( $plys[1], $plys[2], $plys[4] );
                }
                elsif ( $cls == 1 ) {
                    @against = ( $plys[2], $plys[3], $plys[0] );
                }
                elsif ( $cls == 2 ) {
                    @against = ( $plys[3], $plys[4], $plys[1] );
                }
                elsif ( $cls == 3 ) {
                    @against = ( $plys[4], $plys[0], $plys[2] );
                }
                elsif ( $cls == 4 ) {
                    @against = ( $plys[0], $plys[1], $plys[3] );
                }
            }
            else {
                if ($debug) { print "ERROR 004. Exiting..."; }
                exit(1);
            }

            # Validation 1
            my $found    = 0;
            my $foundAll = 0;

            foreach my $el (@against) {
                if ( $el eq $p ) {
                    $found = 1;
                }
            }

            foreach my $el (@plys) {
                if ( $el eq $p ) {
                    $foundAll = 1;
                }
            }

            if ( !$found && !( $p eq 'E' ) ) {
                my $errstr
                    = "ERROR 001. $season/$day/$id. Alleinspieler $p nicht im aktuellen Spielersatz @against. \n";
                print STDERR $errstr;
                $error = $error . $errstr;
            }

            if ( !$foundAll && !( $p eq 'E' ) ) {
                my $errstr
                    = "ERROR SERIOUS-001. $season/$day/$id. Alleinspieler $p nicht im GESAMTEN Spielersatz @against. \n";
                print STDERR $errstr;
                $error = $error . $errstr;

            }

            if ($debug) {
                print "Teilnehmende Spieler sind: @against.";
                print "Wert ist: $val.";
            }

            if ($kontra) {

                # Validation 2
                my $found = 0;
                foreach my $el (@against) {
                    if ( $el eq $kontra ) {
                        $found = 1;
                    }
                }
                if ( !$found ) {
                    my $errstr
                        = "ERROR 005. $season/$day/$id. Kontraspieler $kontra nicht im aktuellen Spielersatz @against. \n";
                    print STDERR $errstr;
                    $error = $error . $errstr;
                }

                if ($debug) { print "Kontra wurde gegeben von: $kontra"; }
            }

            if ($debug) {
                print "\n";
                print "CSV: \n";
            }

            my $kontraCaught = $kontra ? $kontra : '';
            my $betterGameNr = $game % $nrPlys;
            if ( $betterGameNr == 0 ) {
                $betterGameNr = $nrPlys;
            }

            my @sortedPlayers = sort @plys;
            print
                "$season,$day,$id,,$nrPlys,$betterGameNr,$p,$against[0],$against[1],$against[2],",
                join( '', @sortedPlayers ), ",$val,$kontraCaught\n";

            my $address = "season_$season/day_$day/game_$id";
            say $address;

            my $result = $fb->put(
                $address,
                {   time        => "",
                    declarer    => $p,
                    points      => $val,
                    activeThree => join( ' ', @against ),
                    kontra      => $kontraCaught,
                    nrPlayers   => $nrPlys,
                    mod         => $betterGameNr,
                    allPlayers  => join( ' ', @sortedPlayers ),
                    error       => $error
                }
            );
        }
    }
}
