window.jermaine.util.namespace("window.jermaine.util", function (ns) {
    "use strict";
    var EventEmitter = function () {
        var that = this,
            listeners = {};

        //an registers event and a listener
        this.on = function (event, listener) {
            if (typeof(event) !== "string") {
                throw new Error("EventEmitter: first argument to 'on' should be a string");
            }
            if (typeof(listener) !== "function") {
                throw new Error("EventEmitter: second argument to 'on' should be a function");
            }
            if (!listeners[event]) {
                listeners[event] = [];
            }
            listeners[event].push(listener);
            return that;
        };

        //alias addListener
        this.addListener = this.on;
    
        this.once = function (event, listener) {
            var f = function () {
                listener(arguments);
                that.removeListener(event, f);
            };

            that.on(event, f);
            return that;
        };

        this.removeListener = function (event, listener) {
            var index;

            if (typeof(event) !== "string") {
                throw new Error("EventEmitter: first parameter to removeListener method must be a string representing an event");
            }
            if (typeof(listener) !== "function") {
                throw new Error("EventEmitter: second parameter must be a function to remove as an event listener");
            }
            if (listeners[event] === undefined || listeners[event].length === 0) {
                throw new Error("EventEmitter: there are no listeners registered for the '" + event + "' event");
            }

            index = listeners[event].indexOf(listener);

            if (index !== -1) {
                //remove it from the list
                listeners[event].splice(index,1);
            }

            return that;
        };

        this.removeAllListeners = function (event) {
            if (typeof(event) !== "string") {
                throw new Error("EventEmitter: parameter to removeAllListeners should be a string representing an event");
            }

            if (listeners[event] !== undefined) {
                listeners[event] = [];
            }
            
            return that;
        };
    
        this.setMaxListeners = function (number) {
            return that;
        };

        //get the listeners for an event
        this.listeners = function (event) {
            if (typeof(event) !== 'string') {
                throw new Error("EventEmitter: listeners method must be called with the name of an event");
            } else if (listeners[event] === undefined) {
                return [];
            }
            return listeners[event];
        };

        //execute each of the listeners in order with the specified arguments
        this.emit = function (event, data) {
            var i,
                params;


            if (arguments.length > 1) {
                params = [];
            }

            for (i = 1; i < arguments.length; ++i) {
                params.push(arguments[i]);
            }

            if (listeners[event] !== undefined) {
                for (i = 0; i < listeners[event].length; i=i+1) {
                    listeners[event][i].apply(this, params);
                }
            }
        };

        return that;
    }; //end EventEmitter

    ns.EventEmitter = EventEmitter;
});
