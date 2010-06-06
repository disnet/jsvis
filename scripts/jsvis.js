// TODO: need these?
function isDomElement(obj) {
  return obj instanceof HTMLElement;
}

Array.prototype.contains = function(obj) {
  return this.indexOf(obj) != -1
}

function JSVis(events) {
  var $ = jQuery;
  var m_width = 1400;
  var m_height = 730;
  var m_coloring = true;
  var m_noShowDups = true;
  var m_startingObject = {obj:window, name: "window"};
  var m_canvas = null;
  var m_graph = null;
  var m_maxDepth = 2;
  var m_jsonList = [];

  return {
    getJsonList : function() {
      return m_jsonList;
    },
    initVis : function(json) {
      m_canvas = new Canvas('mycanvas', {
        'injectInto': 'infovis',
        'width' : m_width,
        'height': m_height
        });
        
      m_graph = new RGraph(m_canvas, {
        interpolation: 'linear',
        levelDistance: 150,
        Node: {
          color: '#ccddee',
          dim: 2
        },
        Edge: {
          //color: '#772277'
          color: 'darkred'
        },
        onPlaceLabel: function(el, node) {
          el.innerHTML = node.name;

          if(node._depth <= 1) {
            $(el).addClass("node_primary");            
            $(el).removeClass("node_secondary");            
          }
          else {
            $(el).addClass("node_secondary");
            $(el).removeClass("node_primary");
          }

          if(m_coloring) {
            $(el).addClass("node_" + node.data.type);
          }
          el.onclick = function() {
            m_graph.onClick(node.id);
          };
        }
      });
      m_graph.loadJSON(json);
      m_graph.refresh();
    },

    gatherData : function() {
      var node_index = 0;
      var recurseDepth = 0;
      var MAX_ARRAY_LENGTH = 30;
      var MAX_DEPTH = m_maxDepth;

      var json = [];

      function getIdFromJson(obj) {
        var i;
        for(i = 0; i < json.length; i++) {
          if(json[i].data.obj === obj) {
            return json[i].id;
          }
        }
        return undefined;
      }

      function constructJsonNode(obj, name, parent) {
        var currentDepth = recurseDepth++;
        var child_index = 0;
        var unique_id = name + parent;
        
        // can short circuit if we've already visited this obj
        var idFromJson = getIdFromJson(obj);
        if(idFromJson !== undefined) { 
          if(m_noShowDups) { // don't want to record we saw this
            recurseDepth = currentDepth;
            return null;
          }
          else {
            //unique_id = idFromJson; // use the other obj's id
            recurseDepth = currentDepth;
            return idFromJson; // use the other obj's id
          }
        }

        if(currentDepth > MAX_DEPTH) {
          recurseDepth = currentDepth;
          return null;
        }

        var children = [];
        var childObj;
        try {
          for(child in obj) {
            try{
              childObj = obj[child];
            }
            catch(e) {
              // oops, can't touch that (hammer time)
              childObj = undefined;
            }

            // ignoring DOM elements (really big tree)
            if(ignored.indexOf(child) == -1 
                && childObj !== undefined 
                && typeof obj !== 'string'
                && !isDomElement(childObj)) {

              // might want to handle arrays (could be lot's o numbers) differently
              if(obj instanceof Array && child_index > MAX_ARRAY_LENGTH) {
                var etcChild = constructJsonNode(childObj, "...", unique_id);
                if(etcChild !== null) {
                  children.push(etcChild);
                }
                break;
              }

              var childName = constructJsonNode(childObj, child, unique_id);
              if(childName !== null) {
                children.push(childName); 
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
        json.push({
          'id': unique_id,
          'name': name,
          'data': {'level': recurseDepth, 'type': data_type, 'obj': obj},
          'adjacencies': children
        });
        return unique_id;
      }
      constructJsonNode(m_startingObject.obj, m_startingObject.name, "TOPLEVEL");
      json.reverse();
      return json; 
    },

    refreshVis : function() {
      $("#infovis").css("width", m_width);
      $("#infovis").css("height", m_height);

      m_canvas.resize(m_width, m_height);
      m_graph.fx.clearLabels(true);
      m_graph.loadJSON(m_jsonList[m_jsonList.length-1]);
      m_graph.refresh();
    },
    
    initControls : function() {
      var that = this;
      $("#controls").draggable();
      $(".control input[name='width']").val(m_width);
      $(".control input[name='height']").val(m_height);
      $(".control input[name='depth']").val(m_maxDepth);
      $(".control input[name='start']").val(m_startingObject.name);
      $(".control input[name='coloring']").attr("checked", m_coloring);
      $(".control input[name='dups']").attr("checked", !m_noShowDups);

      $("#infovis").css("width", m_width);
      $("#infovis").css("height", m_height);

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
        var no_show_dups = !$(".control input[name='dups']").attr("checked");
        m_width = parseInt(width);
        m_height = parseInt(height);
        m_coloring = coloring;
        m_noShowDups = no_show_dups;

        m_startingObject.name = start;
        m_startingObject.obj = window[start];
        m_maxDepth = parseInt(depth);
        m_jsonList.push(that.gatherData());
        that.refreshVis();
      });
    },

    init : function() {
      var that = this;
      var json;

      this.initControls();
      json = this.gatherData();
      m_jsonList.push(json);
      this.initVis(json);

      $.each(events, function(i, eventObj) {
        $(eventObj.selector).bind(eventObj.event,function() {
          var json = that.gatherData();
          m_jsonList.push(json);
          $("#changeList ul").append("<li><a data-index='" 
                                     + (m_jsonList.length - 1)
                                     + "' href='#'>" 
                                     + eventObj.selector 
                                     + "."
                                     + eventObj.event
                                     + "</a></li>");
        });
      });

      $("#changeList ul").append("<li><a data-index='0' href='#'>initial</a></li>");

      $("#changeList a").live("click", function(e) {
        $(this).addClass("selected");
        var index = parseInt($(e.target).attr("data-index"));
        var newJson = m_jsonList[index];
        m_graph.op.morph(newJson, {type: 'fade'});
      });
    }
  }
};
