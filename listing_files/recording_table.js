
function formRecordingTable() {
	var disp_row = function (row) {
		var channelID = row.getElementsByTagName('channelID')[0].firstChild.nodeValue
		var start = row.getElementsByTagName('start')[0].firstChild.nodeValue
		var progID = channelID + start;
		
		var formed_row =[];
		formed_row.push(row.getElementsByTagName('title')[0].firstChild.nodeValue);
		formed_row.push(row.getElementsByTagName('desc')[0].firstChild.nodeValue);
		formed_row.push( zapTimeToDate(row.getElementsByTagName('start')[0].firstChild.nodeValue).toLocaleString());
		formed_row.push(zapTimeToDate(row.getElementsByTagName('stop')[0].firstChild.nodeValue).toLocaleString());
		formed_row.push(row.getElementsByTagName('channel')[0].firstChild.nodeValue);
		formed_row.push(INPUT({'type':'checkbox','value':progID}));
		return TR({'id':"recording:" + progID},map(partial(TD,null), formed_row));	
	}
	
	var new_table = TABLE({'id':'recording','class':'tblRecord'},
		THEAD({'style':'width:100%'},
			TR({'class':'tblRecordHead'},
				map(partial(TD,{'class':'tblRecord'}), ['Title','Description','Start','End','Channel','Remove']))),
        TBODY({'style':'width:100%'},
			map(disp_row,recording.programmes)));
	swapDOM('recording',new_table);
}
