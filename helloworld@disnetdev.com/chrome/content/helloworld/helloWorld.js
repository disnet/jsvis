FBL.ns(function() { with (FBL) {
function HelloWorldPanel() {}
HelloWorldPanel.prototype = extend(Firebug.Panel,
{
    name: "HelloWorld",
    title: "Hello World!",

    initialize: function() {
      Firebug.Panel.initialize.apply(this, arguments);
      var elt = this.document.createElement("p");
      elt.innerHTML = "hello";
      var msg = "";

      var first = undefined;
      jsd.enumerateScripts({enumerateScript: function(script)
      {
          if(!first) {
            first = script;
          }
      /*
          if (script.callCount)
          {
              var sourceLink = FBL.getSourceForScript(script, context);
              if (sourceLink && sourceLink.href in sourceFileMap)
              {
                  var call = new ProfileCall(script, context, script.callCount, script.totalExecutionTime,
                      script.totalOwnExecutionTime, script.minExecutionTime, script.maxExecutionTime, sourceLink);
                  calls.push(call);

                  totalCalls += script.callCount;
                  totalTime += script.totalOwnExecutionTime;

                  script.clearProfileData();
              }
          }
          */
      }});

      for(key in getDOMMembers(window)) {
        msg += key + "\n"
      }

      elt.innerHTML = "hello";
      elt.innerHTML += msg;
      this.panelNode.appendChild(elt);
    },
});

Firebug.registerPanel(HelloWorldPanel);

}});
