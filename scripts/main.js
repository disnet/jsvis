



jQuery(document).ready(function() {
                         var VIS = new JSVis([{ "selector": "#btnCollect", "event": "click"}]);

                         jQuery("#btnCollect").click(function() {
                                                       var i;
                                                       for(i = 0; i < 1000; i++){
                                                         LONG_ARRAY.push(i);
                                                       } 
                                                     });

                         VIS.init();
                       });


var LONG_ARRAY = [];

var ignored = [ "ignored", "_firebug", "_FirebugCommandLine", "location", "addEventListener", "_getFirebugConsoleElement", "loadFirebugConsole", "console", "window", "_FirebugConsole", "document", "navigator", "netscape", "XPCSafeJSObjectWrapper", "XPCNativeWrapper", "Components", "sessionStorage", "globalStorage", "getComputedStyle", "dispatchEvent", "removeEventListener", "name", "parent", "top", "dump", "getSelection", "scrollByLines", "scrollbars", "scrollX", "scrollY", "scrollTo", "scrollBy", "scrollByPages", "sizeToContent", "setTimeout", "setInterval", "clearTimeout", "clearInterval", "setResizable", "captureEvents", "releaseEvents", "routeEvent", "enableExternalCapture", "disableExternalCapture", "open", "openDialog", "frames", "applicationCache", "self", "screen", "history", "content", "menubar", "toolbar", "locationbar", "personalbar", "statusbar", "directories", "closed", "crypto", "pkcs11", "controllers", "opener", "status", "defaultStatus", "innerWidth", "innerHeight", "outerWidth", "outerHeight", "screenX", "screenY", "mozInnerScreenX", "mozInnerScreenY", "pageXOffset", "pageYOffset", "scrollMaxX", "scrollMaxY", "length", "fullScreen", "alert", "confirm", "prompt", "focus", "blur", "back", "forward", "home", "stop", "print", "moveTo", "moveBy", "resizeTo", "resizeBy", "scroll", "close", "updateCommands", "find", "atob", "btoa", "frameElement", "showModalDialog", "postMessage", "localStorage"];
