/*global describe, it, beforeEach, expect, xit, jasmine */

describe("namespace utility", function () {
    "use strict";

    var namespace = window.jermaine.util.namespace;

    it("should throw an error on a malformed namespace string", function () {
        expect(function () {
            namespace("not;a;namespace", function () {});
        }).toThrow("namespace: not;a;namespace is a malformed namespace string");

        expect(function () {
            namespace("window.this.is.a.namespace", function () { });
        }).not.toThrow();

        expect(function () {
            namespace("aliases.testOne", function () {});
        }).not.toThrow();

        expect(function () {
            namespace("window", function () {});
        }).toThrow("namespace: window is a malformed namespace string");
    });

    it("should throw an error if the last parameter exists and is not a function", function () {
        expect(function () {
            namespace("this.is.a.test", "namespace");
        }).toThrow("namespace: second argument must be an object of aliased local namespaces");

        expect(function () {
            namespace("this.is.a.test", {}, function () {});
        }).not.toThrow();
    });

    it("should throw an error if the second argument exists, and a third function argument does not exist", function () {
        expect(function () {
            namespace("this.is.a.test", {});
        }).toThrow("namespace: if second argument exists, final function argument must exist");
    });

    it("should throw an error if the second parameter exists and is not an object when the last parameter is a function", function () {
        expect(function () {
            namespace("this.is.a.test", "string", function () {});
        }).toThrow("namespace: second argument must be an object of aliased local namespaces");
    });

    it("should create the appropriate namespace", function () {
        var ns = namespace("window.test", function (exports) {
            exports.message = "this is a message in the namespace";
        });

        expect(window.test).not.toBeUndefined();
        expect(window.test.message).not.toBeUndefined();
        expect(window.test.message).toBe("this is a message in the namespace");
    });

    it("should not throw an error on a single argument", function () {
        var ns = namespace("this.is.a.test");
    });

    it("should add the namespace to the window if it is not explicitly the first part of the namespace string", function () {
        var ns = namespace("newNameSpace", function (exports) {
            exports.message = "another test namespace";
        });

        expect(window.newNameSpace).not.toBeUndefined();
        expect(window.newNameSpace.message).toBe("another test namespace");
        expect(ns).toBe(window.newNameSpace);
        expect(ns.message).toBe("another test namespace");
    });

    it("should not overwrite an existing namespace on multiple calls", function () {
        var ns1, ns2;
        ns1 = namespace("test", function (exports) {
            exports.Test1 = function () {};
            exports.message1 = "hello world!";
        });

        ns2 = namespace("test", function (exports) {
            exports.Test2 = function () {};
            exports.message2 = "greetings planet!";
        });

        expect(window.test.Test1).not.toBeUndefined();
        expect(window.test.Test2).not.toBeUndefined();
        expect(window.test.message1).not.toBeUndefined();
        expect(window.test.message2).not.toBeUndefined();
    });

    it("should make the aliases accessible in the namespace function", function () {
        var ns1, ns2, ns3, nsFunction;

        nsFunction = function (ns) {
            var t = new this.Thing();

            expect(this.ns1).toBe(namespace("aliases.testOne"));
            expect(this.ns2).toBe(namespace("aliases.testTwo"));
            expect(this.ns2.Thing).not.toBeUndefined();
            expect(this.Thing).not.toBeUndefined();
            expect(t).not.toBeUndefined();
            ns.thing = this.ns2.Thing;
            ns.whatever = "hello world";
        };

        ns1 = namespace("aliases.testOne");
        ns2 = namespace("aliases.testTwo", function (exports) {
            exports.Thing = function () {};
        });

        ns3 = namespace("aliases.testThree",
                        { ns1: "aliases.testOne",
                          ns2: "aliases.testTwo",
                          Thing: "aliases.testTwo.Thing"
                        },
                        nsFunction);


        expect(ns3.whatever).not.toBeUndefined();
        expect(ns3.thing).not.toBeUndefined();
        expect(ns3.thing).toBe(ns2.Thing);
    });
});