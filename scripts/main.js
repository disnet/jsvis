function isDomElement(obj) {
  return obj instanceof HTMLElement;
}

var JSVIS = {
  width: 1400,
  height: 730,
  coloring: true,
  starting_object: {obj:window, name: "window"},
  canvas: null,
  graph: null,
  max_depth: 2,
  json_list: [],

  initVis : function(json) {
    this.canvas = new Canvas('mycanvas', {
      'injectInto': 'infovis',
      'width' : this.width,
      'height': this.height
      });
      
    this.graph = new RGraph(this.canvas, {
      interpolation: 'linear',
      levelDistance: 100,
      Node: {
        color: '#ccddee',
        dim: 1
      },
      Edge: {
        color: '#772277'
      },
      onCreateLabel: function(el, node) {
        el.innerHTML = node.name;
        if(JSVIS.coloring) {
          $(el).addClass("node_" + node.data.type);
        }
        el.onclick = function() {
          JSVIS.graph.onClick(node.id);
        };
      }
    });
    this.graph.loadJSON(json);
    this.graph.refresh();
  },

  gatherData : function() {
    var node_index = 0;
    var recurseDepth = 0;
    var MAX_ARRAY_LENGTH = 30;
    var MAX_DEPTH = this.max_depth;
    var visited_refs = [];

    function constructJsonNode(obj, name) {
      var currentDepth = recurseDepth++;
      var child_index = 0;

      if(currentDepth > MAX_DEPTH) {
        recurseDepth = currentDepth;
        return null;
      }
      // prevent circular refs or dup refs (note this could be wrong--don't I want to know that $ is the same as jQuery?)
      if(visited_refs.indexOf(obj) != -1) { 
        recurseDepth = currentDepth;
        return null;
      }
      visited_refs.push(obj);

      var children = [];
      var childObj;
      try {
        for(child in obj) {
          try{
            childObj = obj[child];
          }
          catch(e) {
            // oops, can't touch that
            childObj = undefined;
          }

          // ignoring DOM elements (really big tree)
          if(ignored.indexOf(child) == -1 
              && childObj !== undefined 
              && typeof obj !== 'string'
              && !isDomElement(childObj)) {

            // might want to handle arrays (could be lot's o numbers) differently
            if(obj instanceof Array && child_index > MAX_ARRAY_LENGTH) {
              var etcChild = constructJsonNode(childObj, "...");
              if(etcChild !== null) {
                children.push(etcChild);
              }
              break;
            }

            var newChild = constructJsonNode(childObj, child);
            if(newChild !== null) {
              children.push(newChild); 
            }
            child_index++;
          }
        }
      }
      catch(e) {
        console.log("Exception for node: " + name);
        console.log(e);
      }

      recurseDepth = currentDepth;
      var data_type = typeof obj;
      return {
        'id': 'node' + node_index++,
        'name': name,
        'data': {'level': recurseDepth, type: data_type },
        'children': children
      };
    }

    return constructJsonNode(this.starting_object.obj, this.starting_object.name);
  },

  refreshVis : function() {
    $("#infovis").css("width", this.width);
    $("#infovis").css("height", this.height);

    this.canvas.resize(this.width, this.height);
    this.graph.fx.clearLabels(true);
    this.graph.loadJSON(this.json);
    this.graph.refresh();
  },
  
  initControls : function() {
    $("#controls").draggable();
    $(".control input[name='width']").val(this.width);
    $(".control input[name='height']").val(this.height);
    $(".control input[name='depth']").val(this.max_depth);
    $(".control input[name='start']").val(this.starting_object.name);
    $(".control input[name='coloring']").attr("checked", this.coloring);

    $("#infovis").css("width", this.width);
    $("#infovis").css("height", this.height);

    $("#controls").keypress(function(e) {
      if(e.which === 13) { // enter
        $("#btnRefresh").trigger("click");
      }
    });

    $("#btnRefresh").click(function(e) {
      var width = $(".control input[name='width']").val();
      var height = $(".control input[name='height']").val();
      var depth = $(".control input[name='depth']").val();
      var start = $(".control input[name='start']").val();
      var coloring = $(".control input[name='coloring']").attr("checked");
      JSVIS.width = parseInt(width);
      JSVIS.height = parseInt(height);
      JSVIS.coloring = coloring;

      if(parseInt(depth) !== this.max_depth
          || start !== JSVIS.starting_object.name) {
        JSVIS.starting_object.name = start;
        JSVIS.starting_object.obj = window[start];
        JSVIS.max_depth = parseInt(depth);
        JSVIS.json = JSVIS.gatherData();
      }
      else {
        JSVIS.max_dpeth = parseInt(depth);
      }
      JSVIS.refreshVis();
    });
  },

  begin : function() {
    var i;
    var that = this;
    this.initControls();
    this.json = this.gatherData();
    this.json_list.push(this.json);
    this.initVis(this.json);

    for(i = 0; i < 1000; i++){
      LONG_ARRAY.push(i);
    } 

    this.json_list.push(this.gatherData());

    $.each(this.json_list, function(i, el) {
      $("#changeList ul").append("<li><a data-index='" + i + "' href='#'>" + i + "</a></li>");
    });

    $("#changeList a").click(function(e) {
      var index = parseInt($(e.target).attr("data-index"));
      that.json = that.json_list[index];
      that.refreshVis();
    });
  }
};



$(document).ready(function() {
  JSVIS.begin();
});

var LONG_ARRAY = [];

var ignored = [ "ignored", "_firebug", "_FirebugCommandLine", "location", "addEventListener", "_getFirebugConsoleElement", "loadFirebugConsole", "console", "window", "_FirebugConsole", "document", "navigator", "netscape", "XPCSafeJSObjectWrapper", "XPCNativeWrapper", "Components", "sessionStorage", "globalStorage", "getComputedStyle", "dispatchEvent", "removeEventListener", "name", "parent", "top", "dump", "getSelection", "scrollByLines", "scrollbars", "scrollX", "scrollY", "scrollTo", "scrollBy", "scrollByPages", "sizeToContent", "setTimeout", "setInterval", "clearTimeout", "clearInterval", "setResizable", "captureEvents", "releaseEvents", "routeEvent", "enableExternalCapture", "disableExternalCapture", "open", "openDialog", "frames", "applicationCache", "self", "screen", "history", "content", "menubar", "toolbar", "locationbar", "personalbar", "statusbar", "directories", "closed", "crypto", "pkcs11", "controllers", "opener", "status", "defaultStatus", "innerWidth", "innerHeight", "outerWidth", "outerHeight", "screenX", "screenY", "mozInnerScreenX", "mozInnerScreenY", "pageXOffset", "pageYOffset", "scrollMaxX", "scrollMaxY", "length", "fullScreen", "alert", "confirm", "prompt", "focus", "blur", "back", "forward", "home", "stop", "print", "moveTo", "moveBy", "resizeTo", "resizeBy", "scroll", "close", "updateCommands", "find", "atob", "btoa", "frameElement", "showModalDialog", "postMessage", "localStorage"];


var oldjson = { "id": "node02", "name": "0.2", "data": {}, "children": [{ "id": "node13", "name": "1.3", "data": {}, "children": [{ "id": "node24", "name": "2.4", "data": {}, "children": [] }, { "id": "node25", "name": "2.5", "data": {}, "children": [] }, { "id": "node26", "name": "2.6", "data": {}, "children": [] }, { "id": "node27", "name": "2.7", "data": {}, "children": [] }, { "id": "node28", "name": "2.8", "data": {}, "children": [] }, { "id": "node29", "name": "2.9", "data": {}, "children": [] }, { "id": "node210", "name": "2.10", "data": {}, "children": [] }, { "id": "node211", "name": "2.11", "data": {}, "children": [] }] }, { "id": "node112", "name": "1.12", "data": {}, "children": [{ "id": "node213", "name": "2.13", "data": {}, "children": [] }, { "id": "node214", "name": "2.14", "data": {}, "children": [] }, { "id": "node215", "name": "2.15", "data": {}, "children": [] }, { "id": "node216", "name": "2.16", "data": {}, "children": [] }, { "id": "node217", "name": "2.17", "data": {}, "children": [] }, { "id": "node218", "name": "2.18", "data": {}, "children": [] }, { "id": "node219", "name": "2.19", "data": {}, "children": [] }, { "id": "node220", "name": "2.20", "data": {}, "children": [] }] }, { "id": "node121", "name": "1.21", "data": {}, "children": [{ "id": "node222", "name": "2.22", "data": {}, "children": [] }, { "id": "node223", "name": "2.23", "data": {}, "children": [] }, { "id": "node224", "name": "2.24", "data": {}, "children": [] }, { "id": "node225", "name": "2.25", "data": {}, "children": [] }, { "id": "node226", "name": "2.26", "data": {}, "children": [] }, { "id": "node227", "name": "2.27", "data": {}, "children": [] }, { "id": "node228", "name": "2.28", "data": {}, "children": [] }, { "id": "node229", "name": "2.29", "data": {}, "children": [] }] }, { "id": "node130", "name": "1.30", "data": {}, "children": [{ "id": "node231", "name": "2.31", "data": {}, "children": [] }, { "id": "node232", "name": "2.32", "data": {}, "children": [] }, { "id": "node233", "name": "2.33", "data": {}, "children": [] }] }, { "id": "node134", "name": "1.34", "data": {}, "children": [{ "id": "node235", "name": "2.35", "data": {}, "children": [] }] }, { "id": "node136", "name": "1.36", "data": {}, "children": [{ "id": "node237", "name": "2.37", "data": {}, "children": [] }, { "id": "node238", "name": "2.38", "data": {}, "children": [] }, { "id": "node239", "name": "2.39", "data": {}, "children": [] }, { "id": "node240", "name": "2.40", "data": {}, "children": [] }] }, { "id": "node141", "name": "1.41", "data": {}, "children": [{ "id": "node242", "name": "2.42", "data": {}, "children": [] }, { "id": "node243", "name": "2.43", "data": {}, "children": [] }, { "id": "node244", "name": "2.44", "data": {}, "children": [] }, { "id": "node245", "name": "2.45", "data": {}, "children": [] }] }] };
