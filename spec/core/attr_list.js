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

    it("should have a pop function", function () {
        expect(obj.friends().pop).not.toBeUndefined();
    });

    it("should have a validateWith function which is an alias for validatesWith", function () {
        expect(al.validateWith).toBe(al.validatesWith);
    });

    describe("eachOfWhich syntactic sugar", function () {
        it("should return the object", function () {
            expect(al.eachOfWhich).toEqual(al);
        });
    });

    describe("size method", function () {
        it("should be initialized to 0", function () {
            expect(obj.friends().size()).toEqual(0);
        });

        it("should increase when an object is added", function () {
            var size = obj.friends().size();
            obj.friends().add("john");
            expect(obj.friends().size()).toEqual(size+1);
        });

        xit("should decrease when an object is removed", function () {

        });
    });

    describe("at method", function () {
        it("should return the element at a given index", function () {
            obj.friends().add("john");
            expect(obj.friends().at(0)).toEqual("john");
            obj.friends().add("semmy");
            expect(obj.friends().at(0)).toEqual("john");
            expect(obj.friends().at(1)).toEqual("semmy");
            obj.friends().add("mark");
            expect(obj.friends().at(0)).toEqual("john");
            expect(obj.friends().at(1)).toEqual("semmy");
            expect(obj.friends().at(2)).toEqual("mark");
        });

        it("should throw an exception if the parameter is out of bounds", function () {
            obj.friends().add("john");
            obj.friends().add("semmy");

            expect(function() {
                obj.friends().at(-1);
            }).toThrow(new Error("AttrList: Index out of bounds"));

            expect(function() {
                obj.friends().at(1);
            }).not.toThrow(new Error("AttrList: Index out of bounds"));
  
            expect(function() {
                obj.friends().at(2);
            }).toThrow(new Error("AttrList: Index out of bounds"));
        });
    });



    describe("add method", function () {
        it("should add an element to the end of the list", function () {
            obj.friends().add("john");
            expect(obj.friends().at(obj.friends().size()-1)).toEqual("john");
            obj.friends().add("semmy");
            expect(obj.friends().at(obj.friends().size()-2)).toEqual("john");
            expect(obj.friends().at(obj.friends().size()-1)).toEqual("semmy");
        });

        it("should call the validator function", function () {
            var v = jasmine.createSpy();
            var t = function (friend) {
                v();
                return true;
            };

            al.validatesWith(t);
            al.addTo(obj);
            obj.friends().add("john");
            expect(v).toHaveBeenCalled();

        });

        it("should throw an error when the object does not pass validation", function () {
            expect(function () {
                al.validatesWith(function (friend) {
                    this.message = "Invalid";
                    return typeof(friend) === 'string';
                });
                al.addTo(obj);
                obj.friends().add(1);
            }).toThrow(new Error("Invalid"));
        });
    });

    describe("addTo method", function () {
        var Person = {};

        it("should add the AttrList to the specified object", function () {
            al.addTo(Person);
            expect(Person.friends).not.toBeUndefined();
            expect(Person.friends().add).not.toBeUndefined();
            expect(Person.friends().at).not.toBeUndefined();
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

    describe("replace method", function () {
        it("should replace the element at the specified index", function () {
            obj.friends().add("john");
            obj.friends().add("semmy");
            expect(obj.friends().at(0)).toEqual("john");
            expect(obj.friends().at(1)).toEqual("semmy");
            expect(obj.friends().size()).toEqual(2);
            obj.friends().replace(0, "mark");
            expect(obj.friends().at(0)).toEqual("mark");
            expect(obj.friends().at(1)).toEqual("semmy");
            expect(obj.friends().size()).toEqual(2);

            obj.friends().add("larry");
            expect(obj.friends().at(0)).toEqual("mark");
            expect(obj.friends().at(1)).toEqual("semmy");
            expect(obj.friends().at(2)).toEqual("larry");
            expect(obj.friends().size()).toEqual(3);
            obj.friends().replace(2, "curly");
            expect(obj.friends().at(0)).toEqual("mark");
            expect(obj.friends().at(1)).toEqual("semmy");
            expect(obj.friends().at(2)).toEqual("curly");
            expect(obj.friends().size()).toEqual(3);
        });

        it("should throw an error when the index is not an integer", function () {
            al.validatesWith(function (friend) {
                this.message = "Invalid";
                return typeof(friend) === 'string';
            });
            al.addTo(obj);
            obj.friends().add("larry");
            obj.friends().add("curly");
            obj.friends().add("moe");

            expect(function () {
                obj.friends().replace("john", "semmy");
            }).toThrow(new Error("AttrList: replace method requires index parameter to be an integer"));

            expect(function () {
                obj.friends().replace(1.5, "mark");
            }).toThrow(new Error("AttrList: replace method requires index parameter to be an integer"));
        });

        it("should throw an error when the index is out of bounds", function () {
            al.validatesWith(function (friend) {
                this.message = "Invalid";
                return typeof(friend) === 'string';
            });
            al.addTo(obj);
            obj.friends().add("larry");
            obj.friends().add("curly");
            obj.friends().add("moe");

            expect(function () {
                obj.friends().replace(4, "semmy");
            }).toThrow(new Error("AttrList: replace method index parameter out of bounds"));

            expect(function () {
                obj.friends().replace(-1, "mark");
            }).toThrow(new Error("AttrList: replace method index parameter out of bounds"));
        });

        it("should throw an error when the object does not pass validation", function () {
            al.validatesWith(function (friend) {
                this.message = "Invalid";
                return typeof(friend) === 'string';
            });
            al.addTo(obj);
            obj.friends().add("larry");
            obj.friends().add("curly");
            obj.friends().add("moe");

            expect(function () {
                obj.friends().replace(1, 12);                
            }).toThrow(new Error("Invalid"));

            expect(function () {
                obj.friends().replace(2, ["john", "mark", "semmy"]);                
            }).toThrow(new Error("Invalid"));
        });
    });

    describe("pop method", function () {
        it("should return the object which was popped", function () {
            var lastObj = "mark",
            poppedObj;
            obj.friends().add("john");
            obj.friends().add("semmy");
            obj.friends().add(lastObj);
            poppedObj = obj.friends().pop();
            expect(poppedObj).toEqual(lastObj);
        });

        it("should decrease the size of the attr_list", function () {
            var size;
            obj.friends().add("john");
            obj.friends().add("semmy");
            obj.friends().add("mark");
            size = obj.friends().size();
            obj.friends().pop();
            expect(obj.friends().size()).toEqual(size-1);
        });
    });
});
