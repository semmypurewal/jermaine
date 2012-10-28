/*global describe, it, beforeEach, expect, xit, jasmine */

describe("Attr", function () {
    "use strict";
    var Attr = window.jermaine.Attr,
        EventEmitter = window.jermaine.util.EventEmitter,
        suits = ['clubs', 'diamonds', 'hearts', 'spades'],
        suit,
        ranks = ['2','3','4','5','6','7','8','9','10','J','Q','K'],
        rank,
        num,
        obj,
        age,
        Card;

    beforeEach(function () {
        suit = new Attr("suit");
        rank = new Attr("rank");
        num = new Attr("num");
        age = new Attr("age");
        Card = {};
        obj = {};
    });

    ////////////////////////////////////////////////////////////////////////////
    //////////////////////////// CONSTRUCTOR TESTS  ////////////////////////////
    ////////////////////////////////////////////////////////////////////////////

    describe("Constructor Tests", function () {
        it("should throw an error on an empty or no string parameter",
           function () {
               expect(function () {
                   suit = new Attr();
               }).toThrow(new Error("Attr: constructor requires a name " +
                                    "parameter which must be a string"));
               
               expect(function () {
                   suit = new Attr(5);
               }).toThrow(new Error("Attr: constructor requires a name " +
                                    "parameter which must be a string"));
           });
    });

    ////////////////////////////////////////////////////////////////////////////
    //////////////////////////// END CONSTRUCTOR TESTS  ////////////////////////
    ////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////
    /////////////////////////// MODIFIER TESTS /////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////

    describe("Modifier Tests", function () {
        describe("validatesWith method", function () {
            it("should add a new validation criteria", function () {
                var v = function (thing) {
                    if (thing === "hello") {
                        return true;
                    } else {
                        return false;
                    }
                };
                suit.validatesWith(v);
                expect(suit.validator()("hello")).toBe(true);
                expect(function () {
                    suit.validator()("goodbye");
                }).toThrow();
            });
            
            it("should allow for a new error message to be set using " +
               "this.message in the specified function", function () {
                var v = function (num) {
                    this.message = "Expected " + num + " to be bigger than 5";
                    return num > 5;
                };
                
                suit.validatesWith(v);
                
                suit.validatesWith(function (num) {
                    this.message = "Expected " + num + " to be less than 10";
                    return num < 10;
                });

                suit.validatesWith(function (num) {
                    this.message = "Expected " + num + " to be divisible by 4";
                    return num%4 === 0;
                });

                suit.addTo(obj);
                expect(function () {
                    obj.suit(3);
                }).toThrow("Expected 3 to be bigger than 5");
                
                expect(function () {
                    obj.suit(12);
                }).toThrow("Expected 12 to be less than 10");
                
                expect(function () {
                    obj.suit(7);
                }).toThrow("Expected 7 to be divisible by 4");
                
                expect(function () {
                    obj.suit(8);
                }).not.toThrow();
            });
            
            it("should allow for multiple attrs to be created with different " + 
               "validators", function () {
                suit.validatesWith(function (suit) {
                    return suits.indexOf(suit) >= 0;
                });
                
                expect(rank.validator() !== suit.validator()).toBe(true);
            });


            it("should return the Attr object for cascading", function () {
                expect(suit.validatesWith(function () {
                    return false;
                })).toEqual(suit);
            });
            
            it("should throw an error if the argument is not a function",
               function () {
                   expect(function () {
                       suit.validatesWith(5);
                   }).toThrow(new Error("Attr: validator must be a function"));
               });
        });

        describe("defaultsTo method", function () {
            it("should validate the default value when it is added to an object",
               function () {
                   var spy = jasmine.createSpy(),
                       v = function (age) {
                           spy();
                           return (typeof(age) === "number" && age >= 0);
                       };
                   
                   age.validatesWith(v).and.defaultsTo(0);
                   age.addTo(obj);
                   expect(spy).toHaveBeenCalled();
                   
                   age.defaultsTo(-5);
                   expect(function () {
                       age.addTo(obj);
                   }).toThrow();
               });
            
            it("should set the attribute to the parameter for all new objects",
               function () {
                   age.defaultsTo(0);
                   age.addTo(obj);
                   expect(obj.age()).toBe(0);
               });
            
            it("should call the function each time a default is assigned, " +
               "when the validator is a function", function() {
                var Dog = function (name) {
                    this.name = name;
                };
                var count = 0;
                var dog = new Attr("dog").which.validatesWith(function (dog) {
                    return dog instanceof Dog;
                }).and.defaultsTo(function () {
                    ++count;
                    return new Dog("spot");
                });
                var fred = {};
                dog.addTo(fred);
                expect(fred.dog().name).toBe("spot");
                fred.dog().name = 'rover';
                expect(fred.dog().name).toBe("rover");
                var jane = {};
                dog.addTo(jane);
                expect(jane.dog().name).toBe("spot");
                expect(fred.dog().name).toBe("rover");
                expect(count).toBe(2);
            });

            it("should return the Attr object for cascading", function () {
                var result = age.defaultsTo(0);
                expect(result).toBe(age);
            });
        });
        
        describe("isWritable method", function () {
            beforeEach(function () {
                suit.isImmutable().and.validatesWith(function (suit) {
                    return suits.indexOf(suit) > -1;
                });
            });
            
            it("should make a formerly immutable attribute mutable again",
               function () {
                   suit.isWritable();
                   suit.addTo(Card);
                   Card.suit("clubs");
                   expect(Card.suit()).toBe("clubs");
                   Card.suit("hearts");
                   expect(Card.suit()).toBe("hearts");
                   Card.suit("diamonds");
                   expect(Card.suit()).toBe("diamonds");
               });
            
            it("should return the attribute for chaining", function () {
                expect(suit.isWritable()).toBe(suit);
            });
        });
        
        describe("isReadOnly method", function () {
            beforeEach(function () {
                suit.isReadOnly().and.validatesWith(function (suit) {
                    return suits.indexOf(suit) > -1;
                });
                suit.addTo(Card);
            });

            it("should allow for the setter to be called once after it is added " +
               "to an object", function () {
                   Card.suit("diamonds");
                   expect(Card.suit()).toBe("diamonds");
               });
            
            it("should still validate it the first time it is set", function () {
                expect(function () {
                    Card.suit("notARealRank");
                }).toThrow(new Error("validator failed with parameter " + 
                                     "notARealRank"));
            });
            
            it("should throw an error if the setter is called once the " +
               "attribute is set", function () {
                   Card.suit("diamonds");
                   expect(function () {
                       Card.suit("hearts");
                   }).toThrow(new Error("cannot set the immutable property " + 
                                        "suit after it has been set"));
               });
            
            it("should return the Attr object for chaining", function () {
                expect(suit.isReadOnly()).toBe(suit);
            });
        });

        describe("on method", function () {
            var name, 
                obj,
                obj2,
                getSpy,
                setSpy;

            beforeEach(function () {
                name = new Attr("name").which.isA("string");
                obj = {};
                obj2 = {};
                setSpy = jasmine.createSpy();
                getSpy = jasmine.createSpy();
            });
            
            it("should be defined", function () {
                expect(name.on).not.toBe(undefined);
            });
            
            it("should throw an error if the event parameter is not 'set' or " + 
               "'get'", function () {
                   expect(function () {
                       name.on("sets", function () {});
                   }).toThrow("Attr: first argument to the 'on' method should " + 
                              "be 'set' or 'get'");
                   
                   expect(function () {
                       name.on("set", function () {});
                   }).not.toThrow();
                   
                   expect(function () {
                       name.on("get", function () {});
                   }).not.toThrow();
               });
            
            it("should throw an error if the listener parameter is not a " + 
               "function", function () {
                   expect(function () {
                       name.on("set", 6);
                   }).toThrow("Attr: second argument to the 'on' method should " +
                              "be a function");
                   
                   expect(function () {
                       name.on("set", function () {});
                   }).not.toThrow();
               });
            
            it("should call the set listener when the attribute is set", function () {
                name.on("set", setSpy);
                name.on("get", getSpy);
                
                name.addTo(obj);
                
                obj.name("semmy");
                expect(setSpy).toHaveBeenCalled();
                expect(setSpy).toHaveBeenCalledWith("semmy", undefined);
                expect(getSpy).not.toHaveBeenCalled();
            });
            
            it("should call the get listener when the attribute is set", function () {
                name.on("set", setSpy);
                name.on("get", getSpy);
                
                name.addTo(obj);
                
                obj.name("semmy");
                expect(setSpy).toHaveBeenCalled();
                expect(getSpy).not.toHaveBeenCalled();
                expect(setSpy).toHaveBeenCalledWith("semmy", undefined);
                obj.name();
                expect(getSpy).toHaveBeenCalled();
                expect(getSpy).toHaveBeenCalledWith("semmy");
            });
            
            it("should work on multiple attributes", function () {
                var age = new Attr("age").which.isAn("integer"),
                    ageSpy = jasmine.createSpy();
                
                name.on("set", setSpy);
                name.on("get", getSpy);
                age.on("set", ageSpy);
                age.on("get", ageSpy);
                
                name.addTo(obj);
                age.addTo(obj);
                
                obj.age(50);
                expect(setSpy).not.toHaveBeenCalled();
                expect(getSpy).not.toHaveBeenCalled();
                expect(ageSpy).toHaveBeenCalled();
                expect(ageSpy).toHaveBeenCalledWith(50, undefined);
                
                obj.name("semmy");
                expect(setSpy).toHaveBeenCalled();
                expect(getSpy).not.toHaveBeenCalled();
                expect(setSpy).toHaveBeenCalledWith("semmy", undefined);
                obj.name();
                expect(getSpy).toHaveBeenCalled();
                expect(getSpy).toHaveBeenCalledWith("semmy");
                
                obj.age();
                expect(setSpy.callCount).toBe(1);
                expect(getSpy.callCount).toBe(1);
                expect(ageSpy.callCount).toBe(2);
            });

            it("should work when the attribute is added to multiple objects, " + 
               "the 'this' reference should point to the calling object", function () {
                   name.on("set", function (newValue) {
                       setSpy(newValue, this);
                   });
                   
                   name.addTo(obj);
                   name.addTo(obj2);
                   
                   obj.name("hello");
                   expect(setSpy).toHaveBeenCalled();
                   expect(setSpy).toHaveBeenCalledWith("hello", obj);
                   
                   obj2.name("world");
                   expect(setSpy.callCount).toBe(2);
                   expect(setSpy).toHaveBeenCalledWith("world", obj2);
                   
                   expect(setSpy).not.toHaveBeenCalledWith("hello", obj2);
                   expect(setSpy).not.toHaveBeenCalledWith("world", obj);
               });
            
            it("should call the listener with the newly set value AND the old value", function () {
                name.on("set", setSpy);
                name.addTo(obj);
                name.addTo(obj2);
                
                obj.name("semmy");
                expect(setSpy.callCount).toBe(1);
                expect(setSpy).toHaveBeenCalledWith("semmy", undefined);
                obj.name("mark");
                expect(setSpy.callCount).toBe(2);
                expect(setSpy).toHaveBeenCalledWith("mark", "semmy");
                obj.name("john");
                expect(setSpy.callCount).toBe(3);
                expect(setSpy).toHaveBeenCalledWith("john", "mark");
            });
            
            it("should call the appropriate listener when setting up a default value", function () {
                name.defaultsTo("hello world!");
                name.on("set", setSpy);
                name.addTo(obj);
                
                expect(setSpy).toHaveBeenCalled();
                expect(setSpy).toHaveBeenCalledWith("hello world!", undefined);
            });
        });
    });

    ////////////////////////////////////////////////////////////////////////////
    /////////////////////////// END MODIFIER TESTS /////////////////////////////
    ////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////
    /////////////////////////// GETTER TESTS ///////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////

    describe("Getter Tests", function () {
        describe("name method", function () {
            it("should return the name of the attribute", function () {
                expect(suit.name()).toBe("suit");
            });
        });

        describe("validator method", function () {
            it("should return the validator function", function () {
                expect(typeof(suit.validator())).toBe('function');
            });
        });
    });

    ////////////////////////////////////////////////////////////////////////////
    /////////////////////////// END GETTER TESTS ///////////////////////////////
    ////////////////////////////////////////////////////////////////////////////



    ////////////////////////////////////////////////////////////////////////////
    /////////////////////////// SYNTACTIC SUGAR TESTS //////////////////////////
    ////////////////////////////////////////////////////////////////////////////

    describe("Syntactic Sugar Tests", function () {
        describe("and syntactic sugar", function () {
            it("should return the object", function () {
                expect(suit.and).toEqual(suit);
            });
        });

        describe("which syntactic sugar", function () {
            it("should return the object", function () {
                expect(suit.which).toEqual(suit);
            });
        });

        describe("isImmutable syntactic sugar", function () {
            it("should be equal to isReadOnly", function () {
                expect(suit.isImmutable).toBe(suit.isReadOnly);
            });
        });

        describe("isMutable syntactic sugar", function () {
            it("should be equal to isWritable", function () {
                expect(suit.isMutable).toBe(suit.isWritable);
            });
        });
    });

    ////////////////////////////////////////////////////////////////////////////
    /////////////////////////// END SYNTACTIC SUGAR TESTS //////////////////////
    ////////////////////////////////////////////////////////////////////////////



    ////////////////////////////////////////////////////////////////////////////
    /////////////////////////// UTILITY TESTS //////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////

    describe("Utility Tests", function () {
        describe("clone method", function () {
            it("should clone all aspects of the attribute and return a new one", function () {
                var attribute = new Attr("test"),
                    validator = function () {
                        this.message = "5 must be greater than 3";
                        return 5 > 3;
                    },
                    def = 5,
                    clonedAttr,
                    objA = {},
                    objB = {};

                attribute.validatesWith(validator).and.defaultsTo(def);
                clonedAttr = attribute.clone();
                
                expect(clonedAttr.validator()()).toBe(true);
                
                attribute.addTo(objA);
                clonedAttr.addTo(objB);
                
                expect(objA.test()).toBe(def);
                expect(objB.test()).toBe(def);
                expect(objA.test()).toEqual(objB.test());
            });
        });        

        describe("addTo method", function () {
            it("should throw an error if the argument is not an object", function () {
                expect(function () {
                    suit.addTo();
                }).toThrow(new Error("Attr: addAttr method requires an object parameter"));
                
                expect(function () {
                    suit.addTo(5);
                }).toThrow(new Error("Attr: addAttr method requires an object parameter"));
            });

            it("should add the attribute to the specified object", function () {
                suit.addTo(Card);
                expect(Card.suit).not.toBeUndefined();
            });

            it("should default the value of the attribute to undefined, unless specified " +
               " otherwise", function () {
                suit.addTo(Card);
                expect(Card.suit()).toBeUndefined();
            });
        });
    });

    ////////////////////////////////////////////////////////////////////////////
    /////////////////////////// END UTILITY TESTS //////////////////////////////
    ////////////////////////////////////////////////////////////////////////////



    ///////////////////////////////////////////////////////////////////////////
    /////////////////////// VALIDATOR RELATED TESTS ///////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    describe("Validator-related Tests", function () {
        describe("isGreaterThan validator", function () {
            it("once added to the object, it should throw an error if the argument " + 
               " is not greater than the parameter", function () {
                   num.isGreaterThan(5);
                   num.addTo(obj);
                   
                   expect(function () {
                       obj.num(4);
                   }).toThrow("4 should be greater than 5");
               });
        });
        
        describe("isLessThan validator", function () {
            it("once added to the object, it should throw an error if the argument is " + 
               "not less than the parameter", function () {
                   num.isGreaterThan(5);
                   num.isLessThan(10);
                   num.addTo(obj);
                   
                   expect(function () {
                       obj.num(4);
                   }).toThrow("4 should be greater than 5");
                   
                   expect(function () {
                       obj.num(12);
                   }).toThrow("12 should be less than 10");
               });
        });
        
        describe("isA validator", function () {
            it("once added to the object, it should throw an error if the argument is " + 
               "not the correct type", function () {
                   num.isA("number").and.isGreaterThan(5).and.isLessThan(10);
                   
                   num.addTo(obj);
                   
                   expect(function () {
                       obj.num(4);
                   }).toThrow("4 should be greater than 5");
                   
                   expect(function () {
                       obj.num(12);
                   }).toThrow("12 should be less than 10");
                   
                   expect(function () {
                       obj.num("hello");
                   }).toThrow("hello should be a number");
               });
            
            //deprecated until we find a good way to handle circular references
            xit("should allow for constructor types to be sent in", function () {
                var a,
                    t,
                    Thing = function () {

                    };

                a = new Attr("thing");
                a.isA(Thing);
                t = new Thing();
                a.addTo(obj);
                
                expect(function () {
                    obj.thing(5);
                }).toThrow("5 should be an Object");
                
                expect(function () {
                    obj.thing(t);
                }).not.toThrow();
            });
            
            it("should throw an error if the parameter is a string and not one of " + 
               "the JS predefined types", function () {
                expect(function () {
                    num.isA("nmbr");
                    num.addTo(obj);
                    obj.num(5);
                }).toThrow();
            });
        });
        
        describe("isAn validator", function () {
            it("should exist", function () {
                expect(suit.isAn).toBeDefined();
            });
        });
        
        describe("isOneOf validator", function () {
            it("should throw an error if the parameter does not come from the specified set", function () {
                suit.isOneOf(suits);
                suit.addTo(Card);
                expect(function () {
                    Card.suit("cubs");
                }).toThrow("cubs should be one of the set: clubs,diamonds,hearts,spades");
            });
        });

        describe("integer validation", function() {
            it("should not throw an error when an integer is assigned", function() {
                var index = new Attr("index").which.isA('integer');
                var obj = {};
                index.addTo(obj);
                expect(function () {
                    obj.index(-1);
                }).not.toThrow();
            });

            it("should throw an error when a non-integer number is assigned", function() {
                var index = new Attr("index").which.isA('integer');
                var obj = {};
                index.addTo(obj);
                expect(function () {
                    obj.index(-1.2);
                }).toThrow(new Error("-1.2 should be an integer"));
                expect(function () {
                    obj.index("fred");
                }).toThrow(new Error("fred should be an integer"));
            });

            it("should correctly set/get values", function() {
                var index = new Attr("index").which.isA('integer');
                var obj = {};
                index.addTo(obj);
                obj.index(-1);
                expect(obj.index()).toBe(-1);
            });
        });
    });



    ///////////////////////////////////////////////////////////////////////////
    /////////////////////// END VALIDATOR RELATED TESTS ///////////////////////
    ///////////////////////////////////////////////////////////////////////////



    ///////////////////////////////////////////////////////////////////////////
    /////////////////////// POST ADDTO TESTS //////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    describe("Post-addTo Tests", function () {
        it("should correctly set the attribute, even if it is falsy", function () {
            var attr = new Attr("x"),
                obj = {};
            attr.addTo(obj);
            obj.x(0);
            expect(obj.x()).toBe(0);
        });

        it("should allow the resulting value to be set to null, assuming it passes validator", function () {
            var attr = new Attr("name");
            attr.addTo(obj);
            expect(obj.name).toBeDefined();
            expect(function () {
                obj.emitter = function () {
                    return new EventEmitter();
                };
                obj.on = obj.emitter().on;
                obj.name(null);
            }).not.toThrow();
        });

        it("should throw an error if the set value doesn't pass the validator", function () {
            suit.validatesWith(function (suit) {
                return suits.indexOf(suit) > 0;
            });
            suit.addTo(Card);
            expect(function () {
                Card.suit(4);
            }).toThrow();
        });
    });

    ///////////////////////////////////////////////////////////////////////////
    /////////////////////// END POST ADDTO TESTS //////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    ///////////////////////////////////////////////////////////////////////////
    /////////////////////// EXAMPLE TESTS /////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    describe("Example Tests", function () {
        describe("Example One", function () {
            it("should work with this example", function () {
                rank = new Attr("rank").which.isA('string').and.isOneOf(ranks);
                suit = new Attr("suit").which.isA('string').and.isOneOf(suits);
                
                rank.addTo(Card);
                suit.addTo(Card);
                
                Card.rank("5").suit("clubs");
                expect(Card.suit()).toEqual("clubs");
                expect(Card.rank()).toEqual("5");

                expect(function () {
                    Card.rank(5);
                }).toThrow();
                
                expect(function () {
                    Card.rank("5");
                }).not.toThrow();
            });
        });
    });


    ///////////////////////////////////////////////////////////////////////////
    /////////////////////// END EXAMPLE TESTS /////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
});
