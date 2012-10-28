/*global describe, it, beforeEach, expect, xit, jasmine */

describe("Collection", function () {
    "use strict";
    var Collection = window.jermaine.util.Collection,
        AttrList = window.jermaine.AttrList,
        c,
        al,
        obj;

    beforeEach(function () {
        al = new AttrList("friends");
        c = new Collection(al);
        obj = {};
    });
    
    it("should have a pop function", function () {
        expect(c.actualList.pop).not.toBeUndefined();
    });
    
    describe("size method", function () {
        it("should be initialized to 0", function () {
            expect(c.actualList.size()).toEqual(0);
        });

        it("should increase when an object is added", function () {
            var size = c.actualList.size();
            c.actualList.add("john");
            expect(c.actualList.size()).toEqual(size+1);
        });

        xit("should decrease when an object is removed", function () {
            c.actualList.add("john");
            var size = c.actualList.size();
            c.actualList.pop();
            expect(c.actualList.size()).toEqual(size-1);
        });
    });
    
    describe("at method", function () {
        it("should return the element at a given index", function () {
            c.actualList.add("john");
            expect(c.actualList.at(0)).toEqual("john");
            c.actualList.add("semmy");
            expect(c.actualList.at(0)).toEqual("john");
            expect(c.actualList.at(1)).toEqual("semmy");
            c.actualList.add("mark");
            expect(c.actualList.at(0)).toEqual("john");
            expect(c.actualList.at(1)).toEqual("semmy");
            expect(c.actualList.at(2)).toEqual("mark");
        });

        it("should throw an exception if the parameter is out of bounds", function () {
            c.actualList.add("john");
            c.actualList.add("semmy");

            expect(function() {
                c.actualList.at(-1);
            }).toThrow(new Error("AttrList: Index out of bounds"));

            expect(function() {
                c.actualList.at(1);
            }).not.toThrow(new Error("AttrList: Index out of bounds"));
  
            expect(function() {
                c.actualList.at(2);
            }).toThrow(new Error("AttrList: Index out of bounds"));
        });
    });



    describe("add method", function () {
        it("should add an element to the end of the list", function () {
            c.actualList.add("john");
            expect(c.actualList.at(c.actualList.size()-1)).toEqual("john");
            c.actualList.add("semmy");
            expect(c.actualList.at(c.actualList.size()-2)).toEqual("john");
            expect(c.actualList.at(c.actualList.size()-1)).toEqual("semmy");
        });

        it("should call the validator function", function () {
            var v = jasmine.createSpy();
            var t = function (friend) {
                v();
                return true;
            };

            al.validatesWith(t);
            al.addTo(obj);
            c.actualList.add("john");
            expect(v).toHaveBeenCalled();

        });

        it("should throw an error when the object does not pass validation", function () {
            expect(function () {
                al.validatesWith(function (friend) {
                    this.message = "Invalid";
                    return typeof(friend) === 'string';
                });
                al.addTo(obj);
                c.actualList.add(1);
            }).toThrow(new Error("Invalid"));
        });
    });
    
    describe("replace method", function () {
        it("should replace the element at the specified index", function () {
            c.actualList.add("john");
            c.actualList.add("semmy");
            expect(c.actualList.at(0)).toEqual("john");
            expect(c.actualList.at(1)).toEqual("semmy");
            expect(c.actualList.size()).toEqual(2);
            c.actualList.replace(0, "mark");
            expect(c.actualList.at(0)).toEqual("mark");
            expect(c.actualList.at(1)).toEqual("semmy");
            expect(c.actualList.size()).toEqual(2);

            c.actualList.add("larry");
            expect(c.actualList.at(0)).toEqual("mark");
            expect(c.actualList.at(1)).toEqual("semmy");
            expect(c.actualList.at(2)).toEqual("larry");
            expect(c.actualList.size()).toEqual(3);
            c.actualList.replace(2, "curly");
            expect(c.actualList.at(0)).toEqual("mark");
            expect(c.actualList.at(1)).toEqual("semmy");
            expect(c.actualList.at(2)).toEqual("curly");
            expect(c.actualList.size()).toEqual(3);
        });

        it("should throw an error when the index is not an integer", function () {
            al.validatesWith(function (friend) {
                this.message = "Invalid";
                return typeof(friend) === 'string';
            });
            al.addTo(obj);
            c.actualList.add("larry");
            c.actualList.add("curly");
            c.actualList.add("moe");

            expect(function () {
                c.actualList.replace("john", "semmy");
            }).toThrow(new Error("AttrList: replace method requires index parameter to be an integer"));

            expect(function () {
                c.actualList.replace(1.5, "mark");
            }).toThrow(new Error("AttrList: replace method requires index parameter to be an integer"));
        });

        it("should throw an error when the index is out of bounds", function () {
            al.validatesWith(function (friend) {
                this.message = "Invalid";
                return typeof(friend) === 'string';
            });
            al.addTo(obj);
            c.actualList.add("larry");
            c.actualList.add("curly");
            c.actualList.add("moe");

            expect(function () {
                c.actualList.replace(4, "semmy");
            }).toThrow(new Error("AttrList: replace method index parameter out of bounds"));

            expect(function () {
                c.actualList.replace(-1, "mark");
            }).toThrow(new Error("AttrList: replace method index parameter out of bounds"));
        });

        it("should throw an error when the object does not pass validation", function () {
            al.validatesWith(function (friend) {
                this.message = "Invalid";
                return typeof(friend) === 'string';
            });
            al.addTo(obj);
            c.actualList.add("larry");
            c.actualList.add("curly");
            c.actualList.add("moe");

            expect(function () {
                c.actualList.replace(1, 12);                
            }).toThrow(new Error("Invalid"));

            expect(function () {
                c.actualList.replace(2, ["john", "mark", "semmy"]);                
            }).toThrow(new Error("Invalid"));
        });
    });

    describe("pop method", function () {
        it("should return the object which was popped", function () {
            var lastObj = "mark",
            poppedObj;
            c.actualList.add("john");
            c.actualList.add("semmy");
            c.actualList.add(lastObj);
            poppedObj = c.actualList.pop();
            expect(poppedObj).toEqual(lastObj);
        });

        it("should decrease the size of the attr_list", function () {
            var size;
            c.actualList.add("john");
            c.actualList.add("semmy");
            c.actualList.add("mark");
            size = c.actualList.size();
            c.actualList.pop();
            expect(c.actualList.size()).toEqual(size-1);
        });
    });
});
