// Collection of utility functions

// Converts an object to an 2D array (sort of)
// for every property in obj (assume each property is an array)
// arr[i] = obj.property
function obj2arr(obj) {
    var arr = [];
    var i = 0;
    for (name in obj) {
       arr[i++] = obj[name]; 
    }
    return arr;
}

// Converts zap2it timestamp to a date object
function zapTimeToDate(str_date) {
    parsed_date = str_date.slice(0,4) + '-';
    parsed_date += str_date.slice(4,6) + '-';
    parsed_date += str_date.slice(6,8) + ' ';
    parsed_date += str_date.slice(8,10) + ':';
    parsed_date += str_date.slice(10,12) + ':';
    parsed_date += str_date.slice(12);
    return isoTimestamp(parsed_date);
}

// Convets a date object to a zap2it timestamp
function dateToZapTime(date) {
    isoTime = toISOTimestamp(date);
	
    zapTime = isoTime.slice(0,4);	//year
    zapTime += isoTime.slice(5,7);	//month
    zapTime += isoTime.slice(8,10);	//day

	if(date.getHours() < 10) {	// need to pad an extra zero for the hour
		zapTime += "0" + isoTime.slice(11,12);
		zapTime += isoTime.slice(13,15);
		zapTime += isoTime.slice(16,18);
	}
	else {
		zapTime += isoTime.slice(11,13);	//hour
		zapTime += isoTime.slice(14,16);	//miniute
    	zapTime += isoTime.slice(17,19);	//second
	}
    return zapTime;
}

// Converts military time to standard
function mil2std(mil) {
	var hour = parseInt(mil.slice(0,2));
	if (hour < 12) {
		if(hour == 0) {
			return "12:" + mil.slice(2) + "AM";
		}
		return mil + "AM";
	}
	if(hour == 12) {
		return mil + "PM";
	}
	else {
		hour -= 12;
		return (hour.toString()) + mil.slice(2) + "PM";
	}
}

// Hide an element
function makeInvisible(el) {
	addElementClass(el,'invisible');
}
// Unhide an element
function makeVisible(el) {
	removeElementClass(el,'invisible');
}
