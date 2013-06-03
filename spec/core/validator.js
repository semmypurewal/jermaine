/*global describe, it, beforeEach, expect, xit, jasmine */

describe("Validator", function () {
    "use strict";
    var Validator = window.jermaine.Validator;

    xit("should throw an error on an empty parameter", function () {

    });

    xit("should throw an error on a non-function parameter", function () {

    });

    xit("should return a function object that has the specified message as" +
        " an attributes", function () {

    });


    describe("static addValidator method", function () {
        var trivialValidator = function () {
            return true;
        };

        it("should throw an error if the first parameter is absent or not a " +
           "string", function () {
            expect(function () {
                Validator.addValidator();
            }).toThrow(new Error("addValidator requires a name to be " + 
                                 "specified as the first parameter"));

            expect(function () {
                Validator.addValidator(5);
            }).toThrow(new Error("addValidator requires a name to be " + 
                                 "specified as the first parameter"));
        });

        it("should throw an error if the second parameter is absent or not a " +
           "function", function () {
            expect(function () {
                Validator.addValidator("isGreaterThan");
            }).toThrow("addValidator requires a function as the second " +
                       "parameter");

            expect(function () {
                Validator.addValidator("isGreaterThan", 5);
            }).toThrow("addValidator requires a function as the second " + 
                       "parameter");
        });

        it("should add the validator object to the static validators list", 
           function () {
               expect(function () {
                   Validator.addValidator("isGreaterThan5", function (expected){
                       this.message = "Expected " + this.actual + " to be " +
                                      "greater than 5";
                       return this.actual > 5;
                   });
               }).not.toThrow();
           }
        );

        it("should throw an error if a validator is added that already exists", 
           function () {
               expect(function () {
                   Validator.addValidator("isGreaterThan5", function (thing) {
                       return false;
                   });
               }).toThrow("Validator 'isGreaterThan5' already defined");
           }
        );


        it("should accept a third arg that must be a function" , function () {
            expect(function () {
                Validator.addValidator("isLessThan5", function () {}, 5);
            }).toThrow();

            expect(function () {
                Validator.addValidator("isLessThan10", function () {}, 
                                       function () {});
            }).not.toThrow();
        });

        it("should call the argValidator on the expected val once added",
           function () {
               var argValidatorSpy = jasmine.createSpy(),
                   argValidator = function () {
                       argValidatorSpy.apply(argValidatorSpy,arguments);
                       return true;
                   };
               

               Validator.addValidator("exampleValidator", trivialValidator,
                                      argValidator);
               Validator.getValidator("exampleValidator")("example");
               expect(argValidatorSpy).toHaveBeenCalledWith("example");
           }
        );

        it("should throw an error if the argValidator fails",
           function () {
               var argValidator= function (arg) {
                   //only valid input to this validator
                   return arg === "test";
               };
           
               Validator.addValidator("exampleValidator2", trivialValidator,
                                      argValidator);
               
               expect(function () {
                   Validator.getValidator("exampleValidator2")("example");
               }).toThrow();

               expect(function () {
                   Validator.getValidator("exampleValidator2")("example");
               }).toThrow();
           }
        );
    });

    describe("static getValidator method", function () {
        it("should throw an error if there is no parameter specified",
           function () {
               expect(function () {
                   Validator.getValidator();
               }).toThrow("Validator: getValidator method requires a string " +
                          "parameter");
           }
        );

        it("should throw an error if the parameter is not a string",
           function () {
               expect(function () {
                   Validator.getValidator(5);
               }).toThrow("Validator: parameter to getValidator method must be" +
                          " a string");
           }
        );

        it("should throw an error if validator does not exist", function () {
            expect(function () {
                Validator.getValidator("nonExistentValidator");
            }).toThrow("Validator: 'nonExistentValidator' does not exist");
        });

        it("should return the specified validator function", function () {
            var v = Validator.getValidator("isGreaterThan5");
            expect(v).not.toBeUndefined();
            expect(v()(6)).toBe(true);
            expect(function () {
                v()(4);
            }).toThrow();
        });
    });

    describe("validators method", function () {
        xit("should return a list of validator names", function () {

        });
    });

    ///////////////////////////////////////////////////////////////////////////
    /////////////////////// BUILT-IN VALIDATOR TESTS //////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    describe("built-in validators", function () {
        describe("#isGreaterThan", function () {
            it("it should throw if the arg is not greater than the parameter",
               function () {
                   var isGreaterThan = Validator.getValidator("isGreaterThan"),
                       isGreaterThan5 = isGreaterThan(5);
                   expect(function () {
                       isGreaterThan5(4);
                   }).toThrow("4 should be greater than 5");
                   
                   expect(function () {
                       isGreaterThan5(6);
                   }).not.toThrow();
               }
            );
        });

        describe("#isLessThan", function () {
            it("it should throw if the arg is not less than the parameter",
               function () {
                   var isLessThan5 = Validator.getValidator("isLessThan")(5),
                       isLessThan10 = Validator.getValidator("isLessThan")(10);
                   
                   expect(function () {
                       isLessThan5(6);
                   }).toThrow("6 should be less than 5");
                   
                   expect(function () {
                       isLessThan10(12);
                   }).toThrow("12 should be less than 10");
                   
                   expect(function () {
                       isLessThan10(8);
                   }).not.toThrow();
                   
                   expect(function () {
                       isLessThan5(4);
                   }).not.toThrow();
                   
               }
            );
        });

        describe("#isOneOf", function () {
            it("should throw if param does not come from the set", function () {
                var isOneOf = Validator.getValidator("isOneOf"),
                    isOneOfTester = isOneOf(["A","B","C"]);

                expect(function () {
                    isOneOfTester("D");
                }).toThrow("D should be one of the set: A,B,C");

                expect(function () {
                    isOneOfTester("A");
                }).not.toThrow();
            });
        });

        describe("#isA", function () {
            var isA;

            beforeEach(function () {
                isA = Validator.getValidator("isA");
            });

            it("it should throw an error if the param is not the correct type",
               function () {
                   expect(function () {
                       isA("number")(4);
                   }).not.toThrow();
                   
                   expect(function () {
                       isA("string")("hello");
                   }).not.toThrow("");
                   
                   expect(function () {
                       isA("number")("hello");
                   }).toThrow("hello should be a number");
               }
            );

            it ("should allow for model types to be sent in", function () {
                var a,
                    t,
                    Thing;

                Thing = window.jermaine.Model("Thing", function () { });

                t = new Thing();

                expect(function () {
                    isA("Thing")(5);
                }).toThrow();
                
                expect(function () {
                    isA("Thing")(t);
                }).not.toThrow();
            });


            it("should throw an error if the parameter is a string and not" + 
               "one of the JS predefined types", function () {
                   expect(function () {
                       isA("nmbr");
                   }).toThrow();
               }
            );

            describe("integer validation", function() {
                it("should not throw an error when an integer is assigned",
                   function() {
                       expect(function () {
                           isA("integer")(-1);
                       }).not.toThrow();
                   }
                );

                it("should throw an error on a non-integer", function() {
                    expect(function () {
                        isA("integer")(-1.2);
                    }).toThrow(new Error("-1.2 should be an integer"));
                    expect(function () {
                        isA("integer")("fred");
                    }).toThrow(new Error("fred should be an integer"));
                });
            });
        });

        describe("#isAn", function () {
            it ("should be an alias for isA", function () {
                var isA = Validator.getValidator("isA"),
                    isAn = Validator.getValidator("isAn");

                expect(isA).toEqual(isAn);
            });
        });
    });

    ///////////////////////////////////////////////////////////////////////////
    /////////////////////// END BUILT-IN VALIDATOR TESTS //////////////////////
    ///////////////////////////////////////////////////////////////////////////
});
