/*
  + what about isNotGreaterThan()?, isNotLessThan()?  Or, better still: a general 'not' operator, as in jasmine?
  + use of deprecated errorsWith in implementation of clone()?
*/

if(!window.jermaine) {
    window.jermaine = {};
}

(function (ns) {
    "use strict";

    var staticValidators = {};

    var Attr = function (name) {
        var validators = [],
            that = this,
            errorMessage = "invalid setter call for " + name,
            defaultValueOrFunction,
            getDefaultValue,
            i,
            prop,
            addDefaultValidator,
            immutable = false,
            validator,
            AttrList = window.jermaine.AttrList;

        /* This is the validator that combines all the specified validators */
        validator = function (thingBeingValidated) {
            for (i = 0; i < validators.length; ++i) {
                validators[i](thingBeingValidated);
            }
            return true;
        };

        getDefaultValue = function() {
            return (typeof(defaultValueOrFunction) === 'function') ? defaultValueOrFunction() : defaultValueOrFunction;
        };

        if (name === undefined || typeof(name) !== 'string') {
            throw new Error("Attr: constructor requires a name parameter which must be a string");
        }

        this.validatesWith = function (v) {
            if (typeof(v) === 'function') {
                validators.push(new window.jermaine.Validator(v));
                return this;
            } else {
                throw new Error("Attr: validator must be a function");
            }
        };

        /* DEPRECATED */
        /*this.errorsWith = function (error) {
            if (typeof(error) === 'string') {
                errorMessage = error;
                return this;
            } else {
                throw new Error("Attr: errorsWith method requires string parameter");
            }
        };*/

        this.defaultsTo = function (value) {
            defaultValueOrFunction = value;
            return this;
        };

        /* DEPRECATED */
        /*this.errorMessage = function () {
            return errorMessage;
        };*/

        this.isImmutable = function () {
            immutable = true;
            return this;
        };

        this.isMutable = function () {
            immutable = false;
            return this;
        };

        this.clone = function () {
            var result = (this instanceof AttrList)?new AttrList(name):new Attr(name),
                i;

            for (i = 0; i < validators.length; ++i) {
                result.validatesWith(validators[i]);
            }

            //result.errorsWith(errorMessage).defaultsTo(defaultValueOrFunction);
            result.defaultsTo(defaultValueOrFunction);
            if (immutable) {
                result.isImmutable();
            }

            return result;
        };

        //syntactic sugar
        this.and = this;
        this.which = this;
        this.eachOfWhich = this;

        this.validator = function () {
            return validator;
        };

        this.addTo = function (obj) {
            var attribute,
                defaultValue;

            if (!obj || typeof(obj) !== 'object') {
                throw new Error("Attr: addAttr method requires an object parameter");
            }

            defaultValue = getDefaultValue();

            if (defaultValue !== undefined && validator(defaultValue)) {
                attribute = defaultValue;
            } else if (defaultValue !== undefined && !validator(defaultValue)) {
                throw new Error("Attr: Default value of " + defaultValue + " does not pass validation for " + name);
            }
            
            obj[name] = function (newValue) {
                if (newValue !== undefined) {
                    //setter
                    if (immutable && attribute !== undefined) {
                        throw new Error("cannot set the immutable property " + name + " after it has been set");
                    } else
                    if (!validator(newValue)) {
                        throw new Error(errorMessage);
                    } else {
                        attribute = newValue;
                    }
                    return obj;
                } else {
                    //getter
                    return attribute;
                }
            };
        };

        //add a default validator
        addDefaultValidator = function (name) {
            that[name] = function (val) {
                that.validatesWith(function (param) {
                    var obj = {},
                    result;
                    obj.param = param;
                    result = staticValidators[name].call(obj, val);
                    this.message = obj.message;
                    return result;   
                });
                return that;
            };
        };

        //add default validator set
        for (prop in staticValidators) {
            if (staticValidators.hasOwnProperty(prop)) {
                addDefaultValidator(prop, staticValidators[prop]);
            }
        }
    };

    Attr.addValidator = function (name, v) {
        if (name === undefined || typeof(name) !== "string") {
            throw new Error("addValidator requires a name to be specified as the first parameter");
        }

        if (v === undefined || typeof(v) !== "function") {
            throw new Error("addValidator requires a function as the second parameter");
        }

        if (staticValidators[name] === undefined) {
            staticValidators[name] = v;
        } else {
            throw new Error("Validator '" + name +"' already defined");
        }
    };

    Attr.addValidator("isGreaterThan", function (val) {
        this.message = this.param + " should be greater than " + val;
        return this.param > val;
    });

    Attr.addValidator("isLessThan", function (val) {
        this.message = this.param + " should be less than " + val;
        return this.param < val;
    });

    Attr.addValidator("isA", function (val) {
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
            throw new Error("Attr: isA accepts a string which is one of " + types);
        } else {
            throw new Error("Attr: isA only accepts a string for a primitive types for the time being");

            /*if (this.param.toString !== undefined)  {
                this.message = this.param.toString() + " should be an Object";
            } else {
                this.message = "parameter should be an Object";
            }
            return this.param instanceof val;*/

        }
    });

    Attr.addValidator("isOneOf", function (val) {
        this.message = this.param + " should be one of the set: " + val;
        return val.indexOf(this.param) > -1;
    });

    ns.Attr = Attr;
}(window.jermaine));