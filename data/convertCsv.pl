#!/usr/bin/perl
use feature qw(say switch);
use strict;
use warnings;
use open ':std', ':encoding(UTF-8)';

say "Hello!";

my $nrArg = $#ARGV + 1;

print "$nrArg arguments detected... \n";

if ($nrArg != 1) {
	print "\n ERROR 003. Please provide exactly one argument. \n\n";
	exit(1);
}

my $debug = 0;
my $filename = $ARGV[0];

$filename =~ /(\d\d)_(\d\d)/;
my $season = $1;
my $day = $2;

print "Season $season. Day $day.";

if (!$season || !$day) {
	print "\n ERROR 002. Name not in correct format. exiting...\n\n";
	exit(1);
}

my @plys;
my $game = 0;

open(my $fh, $filename);

while (my $row = <$fh>) {

	# Mode 1: Activate new players

	$row =~ /([a-zA-z]+) ([a-zA-z]+) ([a-zA-z]+)\s?([a-zA-z]+)?\s?([a-zA-z]+)?/;

	my $p1 = $1;
	my $p2 = $2;
	my $p3 = $3;
	my $p4 = $4;
	my $p5 = $5;

	if ($debug) {
		if ($p1 && $p2 && $p3) {
			print "$row _ $p1 $p2 $p3";
		}

		if ($p4) {
			print " $p4";
		}

		if ($p5) {
			print " $p5";
		}
		print "\n";
	}

	# parse line if valid

	if ($p5) {
		# Five-Player mode
		print "5 players detected. $p1 $p2 $p3 $p4 $p5. \n";
		@plys = ($p1,$p2,$p3,$p4,$p5);

	} elsif ($p4) {
		# Four-Player mode
		print "4 players detected. $p1 $p2 $p3 $p4. \n";
		@plys = ($p1,$p2,$p3,$p4);

	} elsif ($p3) {
		# Three-Player mode
		print "3 players detected. $p1 $p2 $p3. \n";
		@plys = ($p1,$p2,$p3);
	}

	if ($p3) {
		$game = 0;
	}

	# Mode 2: Database entries

	$row =~ /([a-zA-z]+) (\d+)\s?([a-zA-z]+)?/;

	my $p = $1;
	my $val = $2;
	my $kontra = $3;

	if ($debug) {
		if ($p && $val) {
			print "Player: $p Punkte: $val";
		}
		if ($kontra) {
			print " Kontra gegeben von: $kontra";
		}
	}

	#parse line if valid

	if ($p && $val) {

		$game++;

		print "Alle Spieler sind: @plys. ";
		print "Alleinspieler ist: $p. ";

		my $index = 0;
		my $removeIndex = -1;
		my @against = ();
		my $nrPlys = @plys;

		if ($nrPlys == 3) {
			@against = @plys;
		} elsif ($nrPlys == 4) {
			my $cls = $game % 4;
			if ($cls == 3) {
				@against = ($plys[0],$plys[1],$plys[2]);
			} elsif ($cls == 0 ) {
				@against = ($plys[1],$plys[2],$plys[3]);
			} elsif ($cls == 1 ) {
				@against = ($plys[2],$plys[3],$plys[0]);
			} elsif ($cls == 2 ) {
				@against = ($plys[3],$plys[0],$plys[1]);
			}
		} elsif ($nrPlys == 5) {
			my $cls = $game % 5;
			if ($cls == 0) {
				@against = ($plys[1],$plys[2],$plys[4]);
			} elsif ($cls == 1 ) {
				@against = ($plys[2],$plys[3],$plys[0]);
			} elsif ($cls == 2 ) {
				@against = ($plys[3],$plys[4],$plys[1]);
			} elsif ($cls == 3 ) {
				@against = ($plys[4],$plys[0],$plys[2]);
			} elsif ($cls == 4 ) {
				@against = ($plys[0],$plys[1],$plys[3]);
			}
		} else {
			print "ERROR XXX.";
			exit(1);
		}

		# Validation 1
		foreach (@against) {
			if ( $plys[$index] eq $p ) {
				$removeIndex = $index;
			}
			$index++;
		}

		if ($removeIndex == -1) {
			print "ERROR 001 ERROR! Alleinspieler nicht im aktuellen Spielersatz.";
			exit(1);
		}

		print "Mitspieler sind: @against.";
		print "Wert ist: $val.";

		if ($kontra) {
			print "Kontra wurde gegeben von: $kontra";
		}

		print "\n";
		print "CSV: \n";
		print "$season, $day,,$p,$against[0],$against[1],$against[2],$val,$kontra";
	}
}
