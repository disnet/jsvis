#!/usr/bin/ruby
################################################################################
#WebVo: Web-based PVR
#Copyright (C) 2006 Molly Jo Bault, Tim Disney, Daryl Siu

#This program is free software; you can redistribute it and/or
#modify it under the terms of the GNU General Public License
#as published by the Free Software Foundation; either version 2
#of the License, or (at your option) any later version.

#This program is distributed in the hope that it will be useful,
#but WITHOUT ANY WARRANTY; without even the implied warranty of
#MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#GNU General Public License for more details.

#You should have received a copy of the GNU General Public License
#along with this program; if not, write to the Free Software
#Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
################################################################################
#form_space.rb
#returns the amount of space on the hard drive and how much is free

require "cgi"

  puts "Content-Type:text/xml\n\n"

  #runs UNIX free space command
  readme = IO.popen("df --type ext3")
  sleep (0.5)
  
  #gets information from the command line as to how much space is available
  header = readme.gets
  header_arr = Array.new
  header_arr = header.scan(/\w+/)
  values = readme.gets
  values_arr = Array.new
  values_arr = values.scan(/\w+/)
  available = values_arr[header_arr.index("Available")].to_i
  used = values_arr[header_arr.index("Used")].to_i
  total = used+available
  puts "<tv>"
  puts "<available>" + available.to_s + "</available>"
  puts "<total>" + total.to_s + "</total>"
  puts "</tv>"
  readme.close 
