/*global describe, it, beforeEach, expect, xit, jasmine */

describe("AttrList", function () {
    "use strict";
    
    var AttrList = window.jermaine.AttrList,
    al,
    obj;

    beforeEach(function () {
        al = new AttrList("friends");
        obj = {};
        al.addTo(obj);
    });

    it("should be an Attr object", function () {
        expect(al instanceof window.jermaine.Attr).toBe(true);
    });

    it("should have a validateWith function which is an alias for validatesWith", function () {
        expect(al.validateWith).toBe(al.validatesWith);
    });

    describe("eachOfWhich syntactic sugar", function () {
        it("should return the object", function () {
            expect(al.eachOfWhich).toEqual(al);
        });
    });

    describe("addTo method", function () {
        var Person = {};

        it("should add the AttrList to the specified object", function () {
            al.addTo(Person);
            expect(Person.friends).not.toBeUndefined();
            //expect(Person.friends().add).not.toBeUndefined();
            //expect(Person.friends().at).not.toBeUndefined();
            expect(Person.friends().size).not.toBeUndefined();
        });

        it("should not add any additional AttrList functions to the specified object", function () {
            al.addTo(Person);
            expect(Person.friends().validatesWith).toBeUndefined();
        });


        it("should accept the creation of two lists on the same object", function() {
            var al2 = new AttrList("cats");
            al.addTo(Person);
            al2.addTo(Person);
            expect(Person.friends).not.toBeUndefined();
            expect(Person.cats).not.toBeUndefined();
        });

        //test for the inheritance bug
        it("should allow for multiple attr_lists to be created", function () {
            var al2 = new AttrList("suit");
            
            al.validatesWith(function (suit) {
                return (suit === "diamonds");
            });

            expect(al.validator() !== al2.validator()).toBe(true);
        });

        it("should throw an error if the parameter is not an object", function () {
            expect(function () {
                al.addTo(5);
            }).toThrow(new Error("AttrList: addTo method requires an object parameter"));
        });

    });

});
