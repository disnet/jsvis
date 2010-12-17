JSVis allows you to visualize the object graph of a running JavaScript application. To see it in action check out this [example page](http://disnetdev.com/code.html).

To get started you can download JSVis [here](http://github.com/downloads/disnet/jsvis/jsvis_0.1.zip). The download contains a mostly empty HTML file along with all the required scripts and stylesheets.

If you want to try JSVis on your own page, you'll need to link the required CSS files:

    <link type="text/css" rel="stylesheet" href="jquery-ui-1.8.1.custom.css"/>
    <link type="text/css" rel="stylesheet" href="main.css"/>
    <link type="text/css" rel="stylesheet" href="vis.css"/>

Along with the required scripts:

    <script type="text/javascript" src="jit.js"></script>
    <script type="text/javascript" src="jquery-1.4.2.js"></script>
    <script type="text/javascript" src="jquery-ui-1.8.1.custom.min.js"></script>
    <script type="text/javascript" src="jsvis.js"></script>

Then you just need create a new instance of JSVis and initialize it:

    var VIS = new JSVis();
    VIS.init();
