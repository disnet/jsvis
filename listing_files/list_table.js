// Main work funcitons for listing table

// Parses the xml and form the listing table
var formListingTable = function () {
    var xmldoc = schedule.xmlProgrammes;

    var root_node = xmldoc.getElementsByTagName('tv').item(0);
	// grab all the channels
    var xml_channels = schedule.xmlChannels.getElementsByTagName('channel');
	// grab all the programmes
    var xml_programmes = root_node.getElementsByTagName('programme');
	
	// Comparator for channal sort function
	var cmpChannels = function(ch1,ch2) {
		var num1 = ch1.getElementsByTagName('display-name')[2].firstChild.nodeValue;
		var num2 = ch2.getElementsByTagName('display-name')[2].firstChild.nodeValue;
		return num1 - num2;
	};
	xml_channels = map(function(el){ return el}, xml_channels);	// convert from nodelist to array
	xml_channels.sort(cmpChannels);								// so we can sort it

    // Initialize <rows> Object(). Each channel is added as the first element of it's own property
    forEach(xml_channels, function(ch) { schedule.rows[ch.getAttribute('id')] = [ch]; });
	
    // Fill  <rows> Object() by pushing programmes into their associated channel slot
    forEach(xml_programmes, function(el) { schedule.rows[el.getAttribute('channel')].push(el); });

    schedule.progTDs = [];        // empty the TD array
	// create the listing table
    var new_table = TABLE({'id':'schedule','class':'schedule'},
		THEAD({'style':'width:100%'}, 
			form_table_head(schedule.timesHeader)),
        TBODY({'style':'width:100%'},
			form_table_body(schedule.rows)));
	swapDOM('schedule',new_table);
	makeInvisible('boxLoading');
};

// Forms the listing table header. It includes a row with spacing TDs and a row with the hours
function form_table_head(head) {
	var empty_slots = schedule.numHours * schedule.slotsPerHour;
	// number of slots that a 1/2 hour needs to span 
	var colSpan = empty_slots / (schedule.numHours * 2);	
	 
	var empty_data = [];
	for (var i = 0; i < empty_slots; i++) {
		empty_data.push('');
	}
	// Create the spacing TDs
	var empty_row = [TR(null,
		map(partial(TD,{'class':'empty', 'style':'border:0px;'}),empty_data))];
	// Create the hours TDs
	var head_row = [TR(null,
		[TD({'class':'head'},'Ch.')].concat(map(partial(TD,{'class':'head','colSpan':colSpan}),head)))];
	
	return empty_row.concat(head_row);
}

function form_table_body(rows) {
	return map(programme_row_display,obj2arr(rows));
}

// Returns DOM TRs for the schedule
// formed by individual <rows> property arrays which hold 
// xml elements for each channel and associated programmes
// INPUT: <row> array of xml elements -- first element is channel, rest are associated programmes
// RETURNS: DOM TR with channel and associated programmes
// KNOWN BUG: This will not work correctly if there is nothing being aired for a given time slot
var programme_row_display = function(row) {
    var channelID = row[0].getAttribute('id');
    var channel_name = row[0].getElementsByTagName('display-name')[0].firstChild.nodeValue;

	// first TD has the channel name and it's ID property is the associated channelID
    var formed_row = [TD({'class':'channelName'}, channel_name)];
    
	var programme_tds = []; 	//initialize the array of programme TDs
    for(var i = 1; i < row.length; i++) { // for every programme in <row>
        var prog_title = row[i].getElementsByTagName('title')[0].firstChild.nodeValue;
        var prog_start = row[i].getAttribute('start');
		var prog_stop = row[i].getAttribute('stop');
        var progID = channelID + prog_start.slice(0,prog_start.length - 6); // Drop the timezone in start time 

        var isoStart = zapTimeToDate(prog_start);
        var isoStop = zapTimeToDate(prog_stop);
    
        // UGLY HACK!! For demo purposes only!
        var hackedschedule = new Object();
        hackedschedule.start = new Date("Wed Mar 21 2007 18:00:00 GMT-0700 (PDT)");
        hackedschedule.stop = new Date(hackedschedule.start);
        hackedschedule.stop.setHours(hackedschedule.start.getHours() + 3);
		
		var show_length;
		// If the show starts before the current time schedule
		if (isoStart < hackedschedule.start) {
			// If the end is after the current time schedule 
			if( isoStop > hackedschedule.stop) 
				{ show_length = schedule.numHours; }// set time full
			// if the end is before the schedule end
			else 
				{ show_length = (isoStop-hackedschedule.start) / 3600000; } // 3600000 to convert from ms to hours
		}
		// if the show starts after the begining of the schedule
		else {
			// If the show end is after the schedule end
			if (isoStop > hackedschedule.stop) 
				{show_length = (hackedschedule.stop-isoStart) / 3600000;}  // 3600000 to convert from ms to hours
			// If the show end is before the schedule end
			else 
			{show_length = (isoStop-isoStart) / 3600000; }// 3600000 to convert from ms to hours			
			
		}
		
		var isRecording = recording.find(progID); 
		var colSpan = show_length * schedule.slotsPerHour;  
		if(isRecording != -1) {
			var prog_td = TD({'id':progID,'class':'recordingProgramme','colSpan':colSpan},prog_title); // colSpan *not* colspan -- I HATE IE!!!
		}
		else {
			var currTime = new Date();
			if(isoStop < currTime) {	// if show ends before now
                //var prog_td = TD({'id':progID,'class':'programmePast','colSpan':colSpan},prog_title); 
                //HACK!!
                var prog_td = TD({'id':progID,'class':'programme','colSpan':colSpan},prog_title); 
			}
			else {
				var prog_td = TD({'id':progID,'class':'programme','colSpan':colSpan},prog_title); 
			}
		}

		connect(prog_td,'onmouseover',prog_mouseOver);
		connect(prog_td,'onmouseout',prog_mouseOut);
		connect(prog_td,'onclick',prog_click);
		
		// insert the formed programme TDs into the TD array and global var
        schedule.progTDs.push(progID);
        programme_tds.push(prog_td); 
    }
	
    formed_row.push(programme_tds); 
    return TR({'style':'height:100%; width:100%;'},formed_row);
};
