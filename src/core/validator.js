window.jermaine.util.namespace("window.jermaine", function (ns) {
    "use strict";
    var that = this,
        Validator,
        validators = {};

    Validator = function (spec) {
        var validatorFunction = function (arg) {
            var result, 
                resultObject = {},
                errorMessage;
            result = spec.call(resultObject, arg);
            if (!result) {
                errorMessage = resultObject.message || "validator failed with parameter " + arg;
                throw new Error(errorMessage);
            }
            return result;
        };
        return validatorFunction;
    };

    /**
     * @name The name of the validator for the attribute
     * @v The validator specification (returns a boolean)
     * @argValidator the boolean that checks the types of args sent
     *           to the validator
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
                        throw new Error ("Validator: Invalid argument for " + name + " validator");
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

    Validator.addValidator("isGreaterThan", function (val) {
        this.message = this.param + " should be greater than " + val;
        return this.param > val;
    });

    Validator.addValidator("isLessThan", function (val) {
        this.message = this.param + " should be less than " + val;
        return this.param < val;
    });

    Validator.addValidator("isA", function (val) {
        var types = ["string", "number", "boolean", "function", "object"];
        if (typeof(val) === "string" && types.indexOf(val) > -1) {
            this.message = this.param + " should be a " + val;
            return typeof(this.param) === val;
        } else if (val === 'integer') {
            // special case for 'integer'; since javascript has no integer type,
            // just check for number type and check that it's numerically an int
            if (this.param.toString !== undefined)  {
                this.message = this.param.toString() + " should be an integer";
            } else {
                this.message = "parameter should be an integer";
            }
            return (typeof(this.param) === 'number') && (parseInt(this.param,10) === this.param);
        } else if (typeof(val) === "string") {
            throw new Error("Validator: isA accepts a string which is one of " + types);
        } else {
            throw new Error("Validator: isA only accepts a string for a primitive types for the time being");
        }
    });

    validators.isAn = validators.isA;

    Validator.addValidator("isOneOf", function (val) {
        this.message = this.param + " should be one of the set: " + val;
        return val.indexOf(this.param) > -1;
    });

    ns.Validator = Validator;
});
