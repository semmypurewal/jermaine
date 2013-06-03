/**
 * Validator
 * 
 * Creates a named function that can be attached to attribute for validation.
 * The Validator function allows for customization of the thrown error message.
 *
 * This source file also handles all default validators that come packaged with
 * Jermaine. This includes isA, isOneOf, isGreaterThan, isLessThan, etc.
 *
 * Simple example:
 *
 * isGreaterThan = new Validator(function (number) {
 *     //this.message points to the error message
 *     //that will be thrown
 *     this.message = "Validation Error: " + 
 *                    this.param + " should be greater than " + number;
 *
 *     //this.param points to the actual parameter sent to the validator
 *     //return true if the validation passes, false otherwise
 *     return this.param > number;
 * });
 *
 * Later, a validator can be attached to the attribute object.
 *
 * Attr.isGreaterThan = isGreaterThan;
 *
 * and can be used when creating attributes:
 *
 * var age = new Attr("age").which.isGreaterThan(0);
 *
 */

window.jermaine.util.namespace("window.jermaine", function (ns) {
    "use strict";
    var that = this,
        Validator,   // the exported validator object
        validators = {};  //the set of static validators


    /**
     * Validator 'Constructor'
     *
     * This simply returns a validation function that handles the custom error
     * message and can be attached to an attribute. So it's not really
     * technically a constructor. This is only important to know so that you
     * don't try something like this:
     *
     * var v = new Validator( ... );
     * 
     * //this will always fail, bc v is not an object
     * if (v instanceof Validator) { ... }
     * 
     * The spec function is just a specification for the validator. It allows
     * for a couple of things to be attached to "this" that will be used
     * in the return function. This includes "this.message" and "this.param".
     * The message is the error string that is thrown on failure and
     * this.param is the actual parameter that gets sent in to be validated.
     */
    Validator = function (spec) {
        // this is the actual function that is returned
        var validatorFunction = function (arg) {
            var result, 
                resultObject = {},
                errorMessage;

            // spec is called on the argument with 'this' pointing
            // to an empty object (resultObject),
            // note the validator will return either true or false
            result = spec.call(resultObject, arg);

            // if it's false, the parameter has failed validation
            if (!result) {
                // throw the error
                errorMessage = resultObject.message ||
                               "validator failed with parameter " + arg;
                throw new Error(errorMessage);
            }
            return result;
        };

        // see? all that's being returned is a function
        // also note that since 'this' is never used,
        // we can call this constructor with or without 'new'
        return validatorFunction;
    };

    /**
     * This static function adds a named validator to the list of
     * validators. The second argument is a validation function
     * that simply returns a Validator function created as above.
     *
     * The nice thing about adding a Validator this way is that
     * you can actually validate the parameter sent to the validator!
     * Why might that be important? Well, consider the following:
     *
     * var isGreaterThanInteger = new Validator(function (val) {
     *     this.message = this.param + " should be greater than " + val;
     *     return this.param > val;
     * });
     *
     * Now we can call isGreaterThanNumber like this:
     *
     * isGreaterThanNumber(5)(6); // will pass validation
     * isGreaterThanNumber(5)(3); // will throw
     * isGreaterThanNumber("dog")(3); // ???
     *
     * So we need to confirm that the user sends in an integer as a parameter.
     * You might want to try something like this:
     *
     * var isGreaterThanInteger = new Validator(function (val) {
     *     if (typeof(val) !== "number") throw Error("Not cool!");
     *     this.message = this.param + " should be greater than " + val;
     *     return this.param > val;
     * });
     *
     * This will actually work on the example above:
     *
     * isGreaterThanNumber("dog")(3); // throws error now
     *
     * The problem is that with Jermaine, we create the validator
     * and then don't actually call it until an attribute is about to be
     * set. So, in other words:
     *
     * var a = new Attr("thing").which.isGreaterThanNumber("dog"); //no error (yet)
     *
     * will not cause an error until it's attached to an object and thing
     * is attempted to be set.
     *
     * So a temporary workaround is to validate the validator in the
     * addValidator function below. That's handled by the argValidator
     * validator. (Phew, this is getting really meta)
     *
     * I'm not sure this is the best solution. Seems like there should be
     * a way to validate the argument in the constructor function, but
     * that might require some rewiring that breaks multigraph. This is
     * the best I could come up with for now.
     *
     * @name The name of the validator for the attribute, must be a string
     *       or an error will be thrown
     *
     * @v The validator specification (returns a boolean)
     *    must be a function or an error will be thrown
     *
     * @argValidator optional function that checks the types of args sent
     *           to the validator, must be a function or an error will be thrown
     *
     * So an error will be thrown in the cases that "name" is not a string,
     * v is not a function, argValidator is not a function, or if the static
     * validator is already defined.
     */
    Validator.addValidator = function (name, v, argValidator) {
        if (name === undefined || typeof(name) !== "string") {
            throw new Error("addValidator requires a name to be specified as the first parameter");
        }

        if (v === undefined || typeof(v) !== "function") {
            throw new Error("addValidator requires a function as the second parameter");
        }

        // optional third argument to validate the 
        // expected value that gets sent to the validator
        // for example, isA("number") works but isA("nmber")
        // doesn't work
        if (argValidator !== undefined && typeof(argValidator) !== "function") {
            throw new Error("addValidator third optional argument must be a "+
                            "function");
        }

        if (validators[name] === undefined) {
            validators[name] = function (expected) {
                if (argValidator !== undefined) {
                    if (!argValidator(expected)) {
                        throw new Error ("Validator: Invalid argument for " +
                                         name + " validator");
                    }
                }
                return new Validator(function (val) {
                    var resultObject = {"actual":val, "param":val},
                        result = v.call(resultObject, expected);
                    this.message = resultObject.message;
                    return result;
                });
            };
        } else {
            throw new Error("Validator '" + name +"' already defined");
        }
    };


    /**
     * Get the built-in validator by its name.
     *
     * @name a string representing the name of the validator to return
     * 
     * throws an error if name is not a string
     */
    Validator.getValidator = function (name) {
        var result;

        if (name === undefined) {
            throw new Error("Validator: getValidator method requires a string parameter");
        } else if (typeof (name) !== "string") {
            throw new Error("Validator: parameter to getValidator method must be a string");
        }

        result = validators[name];

        if (result === undefined) {
            throw new Error("Validator: '" + name + "' does not exist");
        }

        return result;
    };



    /**
     * return an array of of static validator names
     */
    Validator.validators = function () {
        var prop,
            result = [];
        for (prop in validators) {
            if (validators.hasOwnProperty(prop)) {
                result.push(prop);
            }
        }

        return result;
    };

    /**
     * Built-In validators. Hopefully these are self-explanatory
     * Will document them more later.
     */
    Validator.addValidator("isGreaterThan", function (val) {
        this.message = this.param + " should be greater than " + val;
        return this.param > val;
    });

    Validator.addValidator("isLessThan", function (val) {
        this.message = this.param + " should be less than " + val;
        return this.param < val;
    });


    // TODO: add array validation for val
    Validator.addValidator("isOneOf", function (val) {
        this.message = this.param + " should be one of the set: " + val;
        return val.indexOf(this.param) > -1;
    });

    /**
     * This one is the only one that uses an argument validator. It confirms
     * that the argument is a primitive javascript type or a named Jermaine
     * model.
     */
    Validator.addValidator("isA", function (val) {
        var types = ["string", "number", "boolean", "function", "object"],
            models = window.jermaine.getModels();
        if (typeof(val) === "string" && types.indexOf(val) > -1) {
            this.message = this.param + " should be a " + val;
            return typeof(this.param) === val;
        } else if (typeof(val) === "string" && models.indexOf(val) > -1) {
            this.message = "parameter should be an instance of " + val;
            return this.param instanceof window.jermaine.getModel(val);
        } else if (val === 'integer') {
            // special case for 'integer'; since javascript has no integer type,
            // just check for number type and check that it's numerically an int
            if (this.param.toString !== undefined)  {
                this.message = this.param.toString() + " should be an integer";
            } else {
                this.message = "parameter should be an integer";
            }
            return (typeof(this.param) === 'number') && (parseInt(this.param,10) === this.param);
        } /*else if (typeof(val) === "string") {
            throw new Error("Validator: isA accepts a string which is one of " + types);
        } else {
            throw new Error("Validator: isA only accepts a string for a primitive types for the time being");
        }*/
    },
    //argument validator
    function (val) {
        var typesAndModels = ["string", "number", "boolean", "function",
                              "object", "integer"].concat(window.jermaine.getModels());
        return typesAndModels.indexOf(val) >= 0;
    });


    // grammatical alias for isA
    validators.isAn = validators.isA;

    ns.Validator = Validator;
});
