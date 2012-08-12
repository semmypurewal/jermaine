window.jermaine.util.namespace("window.jermaine.util", function (ns) {
    "use strict";
    var EventEmitter = function () {
        var listeners = {};

        //registers an event and a listener
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
            return this;
        };

        //alias addListener
        this.addListener = this.on;
    
        this.once = function (event, listener) {


            return this;
        };

        this.removeListener = function (event, listener) {
            var index;

            if (typeof(event) !== "string") {
                throw new Error("EventEmitter: first parameter to removeListener method must be a string representing an event");
            }
            if (typeof(listener) !== "function") {
                throw new Error("EventEmitter: second parameter must be a function to remove as an event listener");
            }
            
            index = listeners[event].indexOf(listener);

            if (index !== -1) {
                //remove it from the list
                listeners[event].splice(index,1);
            }

            return this;
        };

        this.removeAllListeners = function (event) {
            if (typeof(event) !== "string") {
                throw new Error("EventEmitter: parameter to removeAllListeners should be a string representing an event");
            }

            if (listeners[event] !== undefined) {
                listeners[event] = [];
            }
        };
    
        this.setMaxListeners = function (number) {
            return this;
        };

        //get the listeners for an event
        this.listeners = function (event) {
            if (typeof(event) !== 'string') {
                throw new Error("EventEmitter: listeners method must be called with the name of an event");
            } else if (listeners[event] === undefined) {
                throw new Error("EventEmitter: event '" + event + "' has not yet been registered");
            }
            return listeners[event];
        };

        //execute each of the listeners in order with the specified arguments
        this.emit = function (event, data) {
            var i;
            if (listeners[event] !== undefined) {
                for(i = 0; i < listeners[event].length; i=i+1) {
                    listeners[event][i](data);
                }
            }
        };
    }; //end EventEmitter

    ns.EventEmitter = EventEmitter;
});