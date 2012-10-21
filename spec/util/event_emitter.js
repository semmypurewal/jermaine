/*global describe, it, beforeEach, expect, xit, jasmine */

describe("event emitter", function () {
    "use strict";
    
    var EventEmitter = window.jermaine.util.EventEmitter,
        e,
        listener1, listener2, listener3;

    beforeEach(function () {
        e = new EventEmitter();

        listener1 = function () {
            console.log("hello from listener1!");
        };
        
        listener2 = function () {
            console.log("hello from listener2!");
        };
        
        listener3 = function () {
            console.log("hello from listener3!");
        };
    });

    describe("constructor", function () {
        
    });

    describe("on method", function () {
        it("should register a callback on an event", function () {
            e.on("event", function () {});
            expect(e.listeners("event").length).toBe(1);
        });
        
        it("should register multiple callbacks for a single event", function () {
            e.on("event", function () {
                console.log("function 1");
            });
            e.on("event", function () {
                console.log("function 2");
            });
            expect(e.listeners("event").length).toBe(2);
        });
        
        it("should register callbacks for multiple events", function () {
            e.on("event1", function () { });
            e.on("event2", function () { });
            expect(e.listeners("event1").length).toBe(1);
            expect(e.listeners("event2").length).toBe(1);
        });

        it("should return an instance of EventEmitter so the call can be chained", function () {
            expect(e.on("event", function () {}) instanceof EventEmitter).toBeTruthy();
        });

        it("should register callbacks to be registered in a chain", function () {
            e.on("event1", function () { })
                .on("event2", function () { });
            expect(e.listeners("event1").length).toBe(1);
            expect(e.listeners("event2").length).toBe(1);           
        });

        it("should register multiple callbacks for a single event in a chain", function () {
            e.on("event", function () { console.log("function 1");}).on("event", function () { console.log("function 2");});
            expect(e.listeners("event").length).toBe(2);
        });

        it("should throw an error if the event is not a string", function () {
            expect(function () {
                e.on(1, function () { });
            }).toThrow(new Error("EventEmitter: first argument to 'on' should be a string"));
        });
        
        it("should throw an error if the listener is not a function", function () {
            expect(function () {
                e.on("event", 1);
            }).toThrow(new Error("EventEmitter: second argument to 'on' should be a function"));
        });
    });

    describe("addListener method", function () {
        it("should be an alias for the 'on' method", function () {
            expect(e.addListener).toBe(e.on);
        });
    });

    describe("once method", function () {

    });

    describe("removeListener method", function () {
        it("should throw an error if the first parameter is not a string", function () {
            expect(function () {
                e.removeListener(5);
            }).toThrow("EventEmitter: first parameter to removeListener method must be a string representing an event");
        });

        it("should throw an error if the second parameter is not a function", function () {
            expect(function () {
                e.removeListener("event1", 5);
            }).toThrow("EventEmitter: second parameter must be a function to remove as an event listener");
        });

        it("should throw an error if there are no listeners for that particular event", function () {
            expect(function () {
                e.removeListener("whatever", function () {});
            }).toThrow("EventEmitter: there are no listeners registered for the 'whatever' event");
        });

        it("should remove the listener from the event", function () {
            e.on("event", listener1);
            e.on("event", listener2);
            e.on("event", listener3);
            expect(e.listeners("event").length).toBe(3);
            e.removeListener("event", listener2);
            expect(e.listeners("event").length).toBe(2);
            expect(e.listeners("event").indexOf(listener2)).toBe(-1);
            e.removeListener("event", listener1);
            expect(e.listeners("event").length).toBe(1);
            expect(e.listeners("event").indexOf(listener1)).toBe(-1);
            e.removeListener("event", listener3);
            expect(e.listeners("event").length).toBe(0);
            expect(e.listeners("event").indexOf(listener3)).toBe(-1);
        });
    });
    
    describe("removeAllListeners method", function () {
        it("should throw an error if the parameter is not a string", function () {
            expect(function () {
                e.removeAllListeners(5);
            }).toThrow("EventEmitter: parameter to removeAllListeners should be a string representing an event");
        });

        it("should remove all listeners for the object", function () {
            e.on("event", listener1);
            e.on("event", listener2);
            e.on("event", listener3);
            e.removeAllListeners("event");
            expect(e.listeners("event").length).toBe(0);
        });
    });

    describe("setMaxListeners method", function () {

    });

    describe("listeners method", function () {
        it("should return the listeners for a given event", function () {
            var listener1 = function () {
            };
            
            var listener2 = function () {
            };
            
            e.on("event", listener1).on("event", listener2);
            expect(e.listeners("event").length).toBe(2);
            expect(e.listeners("event")).toEqual([listener1, listener2]);
        });

        it("should throw an error if the method is called without a string", function () {
            expect(function () { e.listeners(); }).toThrow(new Error("EventEmitter: listeners method must be called with the name of an event"));
        });
    });

    describe("once method", function () {
        var stubA;

        beforeEach(function () {
            stubA = jasmine.createSpy("stubA");
        });

        it("should call the listener when the event is emitted", function () {
            e.on("event1", stubA);
            e.emit("event1");
            expect(stubA).toHaveBeenCalled();
        });

        it("should remove the listener after the event is called", function () {
            e.once("event1", stubA);
            e.emit("event1");
            expect(stubA).toHaveBeenCalled();
            expect(e.listeners("event1").length).toBe(0);
        });

    });

    describe("emit method", function () {
        var stubA;
        var stubB;
        beforeEach(function () {
            stubA = jasmine.createSpy("stubA");
            stubB = jasmine.createSpy("stubB");
        });

        it("should respond with a correct listener and data when an event is emitted", function () {
            e.on("event1", stubA);
            e.emit("event1");
            expect(stubA).toHaveBeenCalled();
            e.emit("event1",5);
            expect(stubA).toHaveBeenCalledWith(5);
        });

        it("should not respond with incorrect listener when an event is emitted", function () {
            e.on("event1", stubA);
            e.on("event2", stubB);
            e.emit("event1");
            expect(stubA).toHaveBeenCalled();
            expect(stubB).not.toHaveBeenCalled();
        });

        it("should respond with all listeners when an event is emitted", function () {
            e.on("event1", stubA);
            e.on("event1", stubB);
            e.emit("event1", 5);
            expect(stubA).toHaveBeenCalledWith(5);
            expect(stubB).toHaveBeenCalledWith(5);
        });

        it("should be able to call listeners with multiple parameters", function () {
            e.on("event1", stubA);
            e.emit("event1", 5, "hello", 10);
            expect(stubA).toHaveBeenCalledWith(5, "hello", 10);
        });

        xit("should throw an error if the first parameter is not a string", function () {

        });

    });
});
