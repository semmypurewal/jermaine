/*global describe, it, beforeEach, expect, xit, jasmine */

describe("Validator", function () {
    "use strict";
    var Validator = window.jermaine.Validator;

    xit("should throw an error on an empty parameter", function () {

    });

    xit("should throw an error on a non-function parameter", function () {

    });

    xit("should return a function object that has the specified message as an attributes", function () {

    });


    describe("static addValidator method", function () {
        var trivialValidator = function () {
            return true;
        };

        it("should throw an error if the first parameter is absent or not a string", function () {
            expect(function () {
                Validator.addValidator();
            }).toThrow(new Error("addValidator requires a name to be specified as the first parameter"));

            expect(function () {
                Validator.addValidator(5);
            }).toThrow(new Error("addValidator requires a name to be specified as the first parameter"));
        });

        it("should throw an error if the second parameter is absent or not a function", function () {
            expect(function () {
                Validator.addValidator("isGreaterThan");
            }).toThrow("addValidator requires a function as the second parameter");

            expect(function () {
                Validator.addValidator("isGreaterThan", 5);
            }).toThrow("addValidator requires a function as the second parameter");
        });

        it("should add the validator object to the static validators list", function () {
            expect(function () {
                Validator.addValidator("isGreaterThan5", function (expected) {
                    this.message = "Expected " + this.actual + " to be greater than 5";
                    return this.actual > 5;
                });
            }).not.toThrow();
        });

        it("should throw an error if a validator is added that already exists", function () {
            expect(function () {
                Validator.addValidator("isGreaterThan5", function (thing) {
                    return false;
                });
            }).toThrow("Validator 'isGreaterThan5' already defined");
        });

        it("should accept a third arg that must be a function" , function () {
            expect(function () {
                Validator.addValidator("isLessThan5", function () {}, 5);
            }).toThrow();

            expect(function () {
                Validator.addValidator("isLessThan10", function () {}, function () {});
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
        it("should throw an error if there is no parameter specified", function () {
            expect(function () {
                Validator.getValidator();
            }).toThrow("Validator: getValidator method requires a string parameter");
        });

        it("should throw an error if the parameter is not a string", function () {
            expect(function () {
                Validator.getValidator(5);
            }).toThrow("Validator: parameter to getValidator method must be a string");
        });

        it("should throw an error if the validator does not exist", function () {
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
});
