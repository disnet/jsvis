// TODO: need these?
function isDomElement(obj) {
  return obj instanceof HTMLElement;
}

Array.prototype.contains = function(obj) {
  return this.indexOf(obj) != -1
}

function JSVis() {
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
    initVis : function(json) {
      m_canvas = new Canvas('mycanvas', {
        'injectInto': 'infovis',
        'width' : m_width,
        'height': m_height
        });
        
      m_graph = new RGraph(m_canvas, {
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
      var visited_refs = [];
      var visited_names = [];
      var unique_id = 0;

      function constructJsonNode(obj, name, parent) {
        var currentDepth = recurseDepth++;
        var child_index = 0;
        var id_name;

        if(currentDepth > MAX_DEPTH) {
          recurseDepth = currentDepth;
          return null;
        }
        if(m_noShowDups && (visited_refs.indexOf(obj) != -1)) { 
          recurseDepth = currentDepth;
          return null;
        }
        visited_refs.push(obj);
        visited_names.push(name);

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
                var etcChild = constructJsonNode(childObj, "...", name);
                if(etcChild !== null) {
                  children.push(etcChild);
                }
                break;
              }

              var newChild = constructJsonNode(childObj, child, name);
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

        if(visited_refs.contains(obj)) {
          if(m_noShowDups) {
            unique_id = name + parent;
          }
          else {
            unique_id = name;
          }
        }
        else {
          unique_id = name;
        }

        recurseDepth = currentDepth;
        var data_type = typeof obj;
        return {
          'id': unique_id,
          'name': name,
          'data': {'level': recurseDepth, type: data_type },
          'children': children
        };
      }

      return constructJsonNode(m_startingObject.obj, m_startingObject.name, "TOPLEVEL");
    },

    refreshVis : function() {
      $("#infovis").css("width", m_width);
      $("#infovis").css("height", m_height);

      m_canvas.resize(m_width, m_height);
      m_graph.fx.clearLabels(true);
      m_graph.loadJSON(m_json);
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

        if(parseInt(depth) !== m_maxDepth
            || start !== m_startingObject.name) {
          m_startingObject.name = start;
          m_startingObject.obj = window[start];
          m_maxDepth = parseInt(depth);
          m_json = that.gatherData();
        }
        else {
          m_maxDpeth = parseInt(depth);
        }
        that.refreshVis();
      });
    },

    init : function() {
      var i;
      var that = this;
      this.initControls();
      m_json = this.gatherData();
      m_jsonList.push(m_json);
      this.initVis(m_json);

      for(i = 0; i < 1000; i++){
        LONG_ARRAY.push(i);
      } 

      m_jsonList.push(this.gatherData());

      $.each(m_jsonList, function(i, el) {
        $("#changeList ul").append("<li><a data-index='" + i + "' href='#'>" + i + "</a></li>");
      });

      $("#changeList a").click(function(e) {
        var index = parseInt($(e.target).attr("data-index"));
        var newJson = m_jsonList[index];
        console.log(newJson);
        if(newJson.name === m_json.name) {
          newJson.id = m_json.id;
          m_graph.op.morph(newJson, {type: 'fade'});
        }
        //that.refreshVis();
        //m_graph.op.morph(newJson, {type: 'fade'});
      });
    }
  }
};
