// This file contains all of the event handlers

// Chaneges the background of a programme TD on a mouseover
var prog_mouseOver = function(e) {
	var progClass = getNodeAttribute(e.src(),'class');
	if( progClass == 'programme' ) {
		updateNodeAttributes(e.src(),{'class':'programmeOver'});
	}
	else if (progClass == 'programmePast') { // don't do any backgound change if it is in the past 
		return;
	}
	else {
		updateNodeAttributes(e.src(),{'class':'recordingProgrammeOver'});
	}
};

// Reverts the background chage from a mouseover
var prog_mouseOut = function(e) {
	var progClass = getNodeAttribute(e.src(),'class');
	if( progClass == 'programmeOver') {
		updateNodeAttributes(e.src(),{'class':'programme'});
	}
	else if (progClass == 'programmePast') {
		return;
	}
	else {
		updateNodeAttributes(e.src(),{'class':'recordingProgramme'});
	}
};

// Creates and displays extended info/record menu on a programme TD click
var prog_click = function(e) {
	makeInvisible('mnuAddStatus');
	
	var mousePos = e.mouse().page;
	
	// Create the close and record buttons
	var btnClose = INPUT({'id':'btnClose','class':'button', 'type':'button','value':'x'},null);
	var btnRecord = INPUT({'id':'btnRecord','class':'button', 'type':'submit','value':'Record'}, null);
	
	var elProgramme = e.src(); // Clicked programme TD
	
	connect(btnClose,'onclick',btnClose_click);
	connect(btnRecord,'onclick',btnRecord_click);
	
	var prog_id = elProgramme.getAttribute('id'); 
	var start_time = prog_id.slice(prog_id.length-14);		// Start time is part of progID
	var channel_id = prog_id.slice(0,prog_id.length-14);	// ChannelID is also part of progID
	
	var row = schedule.rows[channel_id];			// get the selected channel row and
	for (var i = 1; i < row.length; i++	) {			// search for selected show by start time
		var rowStart = row[i].getAttribute('start');
		rowStart = rowStart.slice(0,rowStart.length - 6);   // drop timezone
		if(rowStart == start_time) {
			var prog_title = row[i].getElementsByTagName('title')[0].firstChild.nodeValue;
		
			var prog_start = zapTimeToDate( row[i].getAttribute('start') );
			var prog_stop = zapTimeToDate( row[i].getAttribute('stop') );
			
			var desc_els = row[i].getElementsByTagName('desc');
			var prog_desc = (desc_els.length != 0) ? (desc_els[0].firstChild.nodeValue) : ("");
			
			var subtitle_els = row[i].getElementsByTagName('sub-title');
			var prog_subtitle = (subtitle_els.length != 0) ? (subtitle_els[0].firstChild.nodeValue) : ("");
		}
	}
	var progID = SPAN({'id':'prog_id','class':'invisible'},prog_id);
	var boxTitle = (prog_subtitle != "") ?  // Add subtitle if it exists
		("Show: " + prog_title + " -- " + prog_subtitle) : ("Show: " + prog_title); 
	
	var startMin = (prog_start.getMinutes() < 10) ?  // Pad time with 0 if needed
		("0" + prog_start.getMinutes().toString()) : (prog_start.getMinutes().toString());
	var stopMin = (prog_stop.getMinutes() < 10) ? 
		("0" + prog_stop.getMinutes().toString()) : (prog_stop.getMinutes().toString());

	var boxStart = "Start: " + mil2std(prog_start.getHours() + ":" + startMin);
	var boxStop = "Stop: " + mil2std(prog_stop.getHours() + ":" + stopMin);
	
	var boxMessage = (prog_desc != "") ? ("Description: " + prog_desc) : ("");

    if(recording.find(prog_id) != -1) {
        var btnRemove = INPUT({'id':'btnRemove','class':'button', 'type':'button','value':'Remove','name':prog_id},null);
        connect(btnRemove,'onclick',btnRemove_click);
        var boxContent = DIV({'id':'boxContent'},
            [[boxTitle,BR(null,null),boxStart,BR(null,null),boxStop,BR(null,null),BR(null,null),boxMessage,progID],btnRemove]);
    }
    else {
        var boxContent = DIV({'id':'boxContent'},
            [[boxTitle,BR(null,null),boxStart,BR(null,null),boxStop,BR(null,null),BR(null,null),boxMessage,progID],btnRecord]);
    }
	var box = DIV({'id':'mnuRecord'},
		[btnClose, boxContent]);
	
	// Positon box approx. box width to the right if at edge of screen
	var boxWidth = 250; 	// CBB: Hard coded because no easy way of finding dynamically
	if ( (boxWidth + mousePos.x) > elementDimensions('schedule').w) {
		mousePos.x -= boxWidth;
		setElementPosition(box,mousePos);
	}
	else {
		setElementPosition(box,mousePos);
	}

	swapDOM('mnuRecord',box);
	makeVisible($('mnuRecord'));
};

// Send a record request and display a wait box when record button is clicked
var btnRecord_click = function(e) {	
	makeVisible('boxLoading');
    // don't allow the user to click anywhere else
    //forEach(schedule.progTDs, function(el) { 
     //   disconnectAll(el,'onclick');
    //});
	
    // Setup loading box
	var prog_id = $('prog_id').firstChild.nodeValue;
	
	setElementPosition('mnuRecord',elementPosition('mnuRecord'));
	setElementDimensions('mnuRecord',elementDimensions('mnuRecord'));
	$('boxContent').innerHTML = "Adding Show...";
	
    // Initiate request
	var ad = doSimpleXMLHttpRequest('ruby/add_recording.py', {'prog_id':prog_id});
    ad.addCallbacks(gotAdd,fetchFailed);
}

// Hide the record menu when the close button is clicked
var btnClose_click = function(e) {
	makeInvisible($('mnuRecord'));
};

// Requests a new listing table for the given time/date
var btnLoad_click = function(e) {  
	makeVisible('boxLoading');
    // Fill a Date object with the date stored in the select box
	var date = new Date($('selDate').value);
	date.setHours($('selTime').value);
	date.setMinutes(0);
	date.setSeconds(0);

    // Check to see if we are at the end of our schedule
    var lastDay = new Date($('selDate').options[$('selDate').options.length - 1].value); // grabs the very last day
    lastDay.setHours(23 - (schedule.numHours - 1));   // move the end time back the length of the display schedule

    if (date > lastDay) { // if selected date is after the last <numHours> of the schedule
        date = lastDay;
    }
    
    // initialize the time header
    schedule.timesHeader = [];
	headDate = new Date(date);
    for (var i = 0; i < schedule.numHours; i++) {
        schedule.timesHeader.push( mil2std(headDate.getHours().toString() + ":00"));
        schedule.timesHeader.push( mil2std(headDate.getHours().toString() + ":30"));
		headDate.setHours(headDate.getHours() + 1);       
    }
   
    
    
    // find what date/time we want
    schedule.start = date;
    schedule.stop = new Date(date);
    schedule.stop.setHours(date.getHours() + schedule.numHours);
	
    // send the request
    var d = doSimpleXMLHttpRequest('ruby/form_listing.py',
        {'start_date_time':dateToZapTime(schedule.start),'end_date_time':dateToZapTime(schedule.stop)});
    d.addCallbacks(gotProgrammes,fetchFailed);
};

// Stub for displaying the recording table
var btnRecording_click = function(e) {
	makeInvisible('listingContent');
	makeVisible('recordingContent');
	makeInvisible('recordedContent');
	
	defRecording = doSimpleXMLHttpRequest('ruby/form_recording.py');
	defRecording.addCallbacks(gotRecordingFromScheduled,fetchFailed);		
};

// Stub for displaying the recording table
var btnRecorded_click = function(e) {
	makeInvisible('listingContent');
	makeVisible('recordedContent');
	makeInvisible('recordingContent');
	
	defRecording = doSimpleXMLHttpRequest('ruby/form_recorded.py');
	defRecording.addCallbacks(gotRecorded,fetchFailed);		
};

// Displays listing table
var btnListing_click = function(e) {
	makeInvisible('recordingContent');
	makeVisible('listingContent');
    makeInvisible('recordedContent');
};

var btnRemoveRecording_click = function(e) {
	var chkBox = $('recording').getElementsByTagName('input');
	var recArray = [];
	var removeIDs = [];
	for(var i = 0; i < chkBox.length; i++) {
		if(chkBox[i].checked == true) {
			recArray.push(doSimpleXMLHttpRequest('ruby/delete_recording.py',{'prog_id':chkBox[i].value}));
			recArray[recArray.length - 1].addCallbacks(gotDelRecording,fetchFailed);
			removeIDs.push(chkBox[i].value);
		}
	}
	map(function(id) { removeElement("recording:" + id);}, removeIDs);
};

var btnDeleteRecorded_click = function(e) {
    if(confirm("Are you sure you want to delete this show from the hard drive?")) {
        var chkBox = $('recorded').getElementsByTagName('input');
        var recArray = [];
        var removeIDs = [];
        for(var i = 0; i < chkBox.length; i++) {
            if(chkBox[i].checked == true) {
                recArray.push(doSimpleXMLHttpRequest('ruby/delete_recorded.py',{'prog_id':chkBox[i].value}));
                recArray[recArray.length - 1].addCallbacks(gotDelRecorded,fetchFailed);
                removeIDs.push(chkBox[i].value);
            }
        }
        map(function(id) { removeElement("recorded:" + id);}, removeIDs);
    }
};

// Delete button on the listing table
// Removes a recording show
var btnRemove_click = function(e) {
    var show = e.src().getAttribute('name');    
    makeVisible('boxLoading');

    //forEach(schedule.progTDs, function(el) {
     //   disconnectAll(el,'onclick'); 
   // });
    var del = doSimpleXMLHttpRequest('ruby/delete_recording.py',{'prog_id':show});
    del.addCallbacks(gotDelRecording,fetchFailed);
    makeInvisible('mnuRecord');
};

