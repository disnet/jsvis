var Log = {
    elem: false,
    write: function(text){
        if (!this.elem) 
            this.elem = document.getElementById('log');
        this.elem.innerHTML = text;
        this.elem.style.left = (500 - this.elem.offsetWidth / 2) + 'px';
    }
};

function addEvent(obj, type, fn) {
    if (obj.addEventListener) obj.addEventListener(type, fn, false);
    else obj.attachEvent('on' + type, fn);
};


function init(){
    //init data
    //By defining properties with the dollar sign ($)
    //in nodes and edges we can override the global configuration
    //properties for nodes and edges.
    //In this case we use "$type" and "$dim" properties to override
    //the type of the node to be plotted and its dimension.
    var json = [{
        "id": "node0",
        "name": "node0 name",
        "data": {
            "$dim": 16.759175934208628,
            "some other key": "some other value"
        },
        "adjacencies": [{
            "nodeTo": "node1",
            "data": {
                "weight": 3
            }
        }, {
            "nodeTo": "node2",
            "data": {
                "weight": 3
            }
        }, {
            "nodeTo": "node3",
            "data": {
                "weight": 3
            }
        }, {
            "nodeTo": "node4",
            "data": {
                "weight": 1
            }
        }, {
            "nodeTo": "node5",
            "data": {
                "weight": 1
            }
        }]
    }, {
        "id": "node1",
        "name": "node1 name",
        "data": {
            "$dim": 13.077119090372014,
            "$type": "square",
            "some other key": "some other value"
        },
        "adjacencies": [{
            "nodeTo": "node0",
            "data": {
                "weight": 3
            }
        }, {
            "nodeTo": "node2",
            "data": {
                "weight": 1
            }
        }, {
            "nodeTo": "node3",
            "data": {
                "weight": 3
            }
        }, {
            "nodeTo": "node4",
            "data": {
                "weight": 1
            }
        }, {
            "nodeTo": "node5",
            "data": {
                "weight": 1
            }
        }]
    }, {
        "id": "node2",
        "name": "node2 name",
        "data": {
            "$dim": 24.937383149648717,
            "$type": "triangle",
            "some other key": "some other value"
        },
        "adjacencies": [{
            "nodeTo": "node0",
            "data": {
                "weight": 3
            }
        }, {
            "nodeTo": "node1",
            "data": {
                "weight": 1
            }
        }, {
            "nodeTo": "node3",
            "data": {
                "weight": 3
            }
        }, {
            "nodeTo": "node4",
            "data": {
                "weight": 3
            }
        }, {
            "nodeTo": "node5",
            "data": {
                "weight": 1
            }
        }]
    }, {
        "id": "node3",
        "name": "node3 name",
        "data": {
            "$dim": 10.53272740718869,
            "some other key": "some other value"
        },
        "adjacencies": [{
            "nodeTo": "node0",
            "data": {
                "weight": 3
            }
        }, {
            "nodeTo": "node1",
            "data": {
                "weight": 3
            }
        }, {
            "nodeTo": "node2",
            "data": {
                "weight": 3
            }
        }, {
            "nodeTo": "node4",
            "data": {
                "weight": 1
            }
        }, {
            "nodeTo": "node5",
            "data": {
                "weight": 3
            }
        }]
    }, {
        "id": "node4",
        "name": "node4 name",
        "data": {
            "$dim": 5.3754347037767345,
            "$type":"triangle",
            "some other key": "some other value"
        },
        "adjacencies": [{
            "nodeTo": "node0",
            "data": {
                "weight": 1
            }
        }, {
            "nodeTo": "node1",
            "data": {
                "weight": 1
            }
        }, {
            "nodeTo": "node2",
            "data": {
                "weight": 3
            }
        }, {
            "nodeTo": "node3",
            "data": {
                "weight": 1
            }
        }, {
            "nodeTo": "node5",
            "data": {
                "weight": 3
            }
        }]
    }, {
        "id": "node5",
        "name": "node5 name",
        "data": {
            "$dim": 32.26403873194912,
            "$type": "star",
            "some other key": "some other value"
        },
        "adjacencies": [{
            "nodeTo": "node0",
            "data": {
                "weight": 1
            }
        }, {
            "nodeTo": "node1",
            "data": {
                "weight": 1
            }
        }, {
            "nodeTo": "node2",
            "data": {
                "weight": 1
            }
        }, {
            "nodeTo": "node3",
            "data": {
                "weight": 3
            }
        }, {
            "nodeTo": "node4",
            "data": {
                "weight": 3
            }
        }]
    }];
    //end
    var infovis = document.getElementById('infovis');
    var w = infovis.offsetWidth, h = infovis.offsetHeight;
    //init canvas
    //Create a new canvas instance.
    var canvas = new Canvas('mycanvas', {
        'injectInto': 'infovis',
        'width': w,
        'height': h
    });
    //end
    //init Hypertree
    var ht = new Hypertree(canvas, {
        //By setting overridable=true,
        //Node and Edge global properties can be
        //overriden for each node/edge.
        Node: {
            overridable: true,
            'transform': false,
            color: "#f00"
        },
        
        Edge: {
            overridable: true,
            color: "#088"
        },
        
        //Change the animation transition type
        transition: Trans.Back.easeOut,
        duration:1000,
        
        //This method is called right before plotting an
        //edge. This method is useful for adding individual
        //styles to edges.
        onBeforePlotLine: function(adj){
            //Set random lineWidth for edges.
            if (!adj.data.$lineWidth) 
                adj.data.$lineWidth = Math.random() * 5 + 1;
        },
        
        onBeforeCompute: function(node){
            Log.write("centering");
        },
        //Attach event handlers.
        onCreateLabel: function(domElement, node){
            domElement.innerHTML = node.name;
            domElement.style.cursor = "pointer";
            domElement.onclick = function () {
                ht.onClick(node.id, { hideLabels: false });
            };
        },
        
        //This method is called when moving/placing a label.
        //You can add some positioning offsets to the labels here.
        onPlaceLabel: function(domElement, node){
            var width = domElement.offsetWidth;
            var intX = parseInt(domElement.style.left);
            intX -= width / 2;
            domElement.style.left = intX + 'px';
        },
        
        onAfterCompute: function(){
            Log.write("done");

            //Make the relations list shown in the right column.
            var node = Graph.Util.getClosestNodeToOrigin(ht.graph, "pos");
            var html = "<h4>" + node.name + "</h4><b>Connections:</b>";
            html += "<ul>";
            Graph.Util.eachAdjacency(node, function(adj){
                var child = adj.nodeTo;
                html += "<li>" + child.name + "</li>";
            });
            html += "</ul>";
            document.getElementById('inner-details').innerHTML = html;
        }
    });
    //load JSON graph.
    ht.loadJSON(json, 2);
    //compute positions and plot
    ht.refresh();
    //end
    ht.controller.onBeforeCompute(Graph.Util.getNode(ht.graph, ht.root));
    ht.controller.onAfterCompute();
}
