
function formRecordedTable() {
	var disp_row = function (row) {
		var channelID = row.getElementsByTagName('channelID')[0].firstChild.nodeValue
		var start = row.getElementsByTagName('start')[0].firstChild.nodeValue
		var progID = channelID + start;
		
		var formed_row =[];
        var path = row.getElementsByTagName('path')[0].firstChild.nodeValue;
        var title = row.getElementsByTagName('title')[0].firstChild.nodeValue;
        
        var pathAvi = path.substring(0,path.length-4) + '.avi'; //changed to point only to converted files FAILS if not converted yet
		formed_row.push(A({'href': pathAvi},title));
		formed_row.push(row.getElementsByTagName('desc')[0].firstChild.nodeValue);
		formed_row.push( zapTimeToDate(row.getElementsByTagName('start')[0].firstChild.nodeValue).toLocaleString());
		formed_row.push(zapTimeToDate(row.getElementsByTagName('stop')[0].firstChild.nodeValue).toLocaleString());
		var size = parseInt(row.getElementsByTagName('size')[0].firstChild.nodeValue);
		size = Math.round( size / (1024*1024));
		formed_row.push(size.toString() + " MB");
		formed_row.push(INPUT({'type':'checkbox','value':progID}));
		return TR({'id':"recorded:" + progID},map(partial(TD,null), formed_row));	
	}
	
	var new_table = TABLE({'id':'recorded','class':'tblRecord'},
		THEAD({'style':'width:100%'},
			TR({'class':'tblRecordHead'},
				map(partial(TD,{'class':'tblRecord'}), ['Title','Description','Start','End','Size','Delete']))),
        TBODY({'style':'width:100%'},
			map(disp_row,recorded.programmes)));
	swapDOM('recorded',new_table);
}
