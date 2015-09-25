#!/usr/bin/perl

use feature qw(say switch);
use strict;
use warnings;
use Firebase;

say "Hello World";

my $fb = Firebase->new(firebase => 'luminous-inferno-9676');
 
my $result = $fb->put('foo', { this => 'that' });
$result = $fb->get('foo'); # or $fb->get('foo/this');

print $result;
