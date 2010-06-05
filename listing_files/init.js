/*
 WebVo: Web-based PVR
Copyright (C) 2006 Molly Jo Bault, Tim Disney, Daryl Siu

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/

window.onload = init;

// Global var which will hold the xml formatted channels and programmes
// along with misc values relating to the schedule
var schedule = Object();

schedule.xmlChannels = null;        // holds the channels -- packed when the user first navigates to the site
schedule.xmlProgrammes = null;      // holds the progrmames -- packed when the user selectes a time  
schedule.rows = Object();
schedule.timesHeader = [];          // used to fill the time slots on the top of the schedule table
schedule.numHours = 3;              // number of hours the schedule will display
schedule.startDate = null;			// first day that we have programme information on
schedule.stopDate = null;			// last day that we have programme information on
schedule.slotsPerHour = 60;
schedule.progTDs = [];

var recording = Object();			// Object for recording programmes
recording.programmes = null;		// To store array of programme elements

recording.find = function (progID) {//  
	if(recording.programmes == null) {return -1;}
	
	var ch = null;
	var st = null;
	for (var i = 0; i < recording.programmes.length; i++) {
		ch = recording.programmes[i].getElementsByTagName('channelID')[0].firstChild.nodeValue;
		st = recording.programmes[i].getElementsByTagName('start')[0].firstChild.nodeValue;
		if( progID == ch + st) {
			return i;
		}
	}
	return -1;	
};

var recorded = Object();
recorded.programmes = null;

var defRecording = new Deferred();
var defRecorded = new Deferred();

var dayOfWeek = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

// Once the page loads, connect up the events
function init() { 
    makeVisible($('boxLoading'));

    // get the channels
    var ch = doSimpleXMLHttpRequest('ruby/form_channels.py');
    ch.addCallbacks(gotChannels_init,fetchFailed);
	
    var st = doSimpleXMLHttpRequest('ruby/form_space.rb');
    st.addCallbacks(gotSpace,fetchFailed);

	defRecording = doSimpleXMLHttpRequest('ruby/form_recording.py');
	defRecording.addCallbacks(gotRecording,fetchFailed);
	
	defRecorded = doSimpleXMLHttpRequest('ruby/form_recorded.py');
	defRecorded.addCallbacks(gotRecorded,fetchFailed);
	
    connect('btnListing','onclick',btnListing_click);
	connect('btnRecording','onclick',btnRecording_click);
	connect('btnRecorded','onclick',btnRecorded_click);
	connect('btnRemoveRecording','onclick',btnRemoveRecording_click);
	connect('btnDeleteRecorded','onclick',btnDeleteRecorded_click);
}

// Populate the date/time switcher
function initFormTime() {
	var day = isoDate(schedule.startDate.slice(0,4) + "-" +
		schedule.startDate.slice(4,6) + "-" + schedule.startDate.slice(6,8));
	var end = isoDate(schedule.stopDate.slice(0,4) + "-" +
		schedule.stopDate.slice(4,6) + "-" + schedule.stopDate.slice(6,8));
	var time = new Date();
	
	$('boxDate').firstChild.nodeValue = time.toLocaleDateString();
	
    // Fill all the days we have on the server
	while(day <= end) { 
		var opDate = OPTION({'value':day}, 
			[dayOfWeek[day.getDay()] + " " + day.getDate()]);
		$('selDate').appendChild(opDate);
		day.setDate(day.getDate() + 1);
	}
    today = time;
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    selDay = new Date( $('selDate').value );
    if (today > selDay) {
        $('selDate').value = today;
    }
    // Fill 24 hours
	time.setHours(0); // start at 00:00
	for(var i = 0; i < 24; i++) {
		var opTime = OPTION({'value':time.getHours()},
			mil2std(time.getHours() + ":00"));
		$('selTime').appendChild(opTime);
		time.setHours(time.getHours() + 1);
	}

    var now = new Date().getHours();
    $('selTime').value = now;
	
	connect('btnLoad','onclick',btnLoad_click);
	makeInvisible('boxLoading');
	
	btnLoad_click(null);	// load up default time
}
