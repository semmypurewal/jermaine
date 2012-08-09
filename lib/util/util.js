/*global describe, it, beforeEach, expect, xit, jasmine */

(function (ns) {
    "use strict";

    var namespace = function (ns, aliases, func) {
        var nsRegExp = /^([a-zA-Z]+)(\.[a-zA-Z]*)*$/,
            nsArray,
            currentNS,
            i;

        //check to assure ns is a properly formatted namespace string
        if (ns.match(nsRegExp) === null || ns === "window") {
            throw new Error("namespace: " + ns + " is a malformed namespace string");
        }

        //check to assure that if alias is defined that func is defined
        if (aliases !== undefined && func === undefined) {
            if (typeof (aliases) === "function") {
                func = aliases;
                aliases = undefined;
            } else if (typeof (aliases) === "object") {
                throw new Error("namespace: if second argument exists, final function argument must exist");
            } else if (typeof (aliases) !== "object") {
                throw new Error("namespace: second argument must be an object of aliased local namespaces");
            }
        } else if (typeof (aliases) !== "object" && typeof (func) === "function") {
            throw new Error("namespace: second argument must be an object of aliased local namespaces");
        }

        //parse namespace string
        nsArray = ns.split(".");

        //set the root namespace to window (if it's not explictly stated)
        if (nsArray[0] === "window") {
            currentNS = window;
        } else {
            currentNS = (window[nsArray[0]] === undefined) ? window[nsArray[0]] = {} : window[nsArray[0]];
        }

        //confirm func is actually a function
        if (func !== undefined && typeof (func) !== "function") {
            throw new Error("namespace: last parameter must be a function that accepts a namespace parameter");
        }

        //build namespace
        for (i = 1; i < nsArray.length; i = i + 1) {
            if (currentNS[nsArray[i]] === undefined) {
                currentNS[nsArray[i]] = {};
            }
            currentNS = currentNS[nsArray[i]];
        }

        //namespaces.push(currentNS);
        //namespace = currentNS;

        //if the function was defined, but no aliases run it on the current namespace
        if (aliases === undefined && func) {
            func(currentNS);
        } else if (func) {
            for (i in aliases) {
                if (aliases.hasOwnProperty(i)) {
                    aliases[i] = namespace(aliases[i]);
                }
            }
            func.call(aliases, currentNS);
        }

        //return namespace
        return currentNS;
    };

    return namespace(ns, function (exports) {
        exports.namespace = namespace;
    });
}("window.jermaine.util"));