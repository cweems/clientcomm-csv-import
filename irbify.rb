#!/usr/bin/env ruby

script_name = ARGV[0]
script = File.open(script_name, 'r').read

if File.readable? script_name
  puts 'eval ' + script.dump + '; exit'
  exit 0
else
  puts "Cannot read/open '#{ARGV[0]}'"
  exit 1
end
