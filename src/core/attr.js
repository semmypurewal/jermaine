/*
  + what about isNotGreaterThan()?, isNotLessThan()?  Or, better still: a general 'not' operator, as in jasmine?
*/

window.jermaine.util.namespace("window.jermaine", function (ns) {
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
            addValidator,
            immutable = false,
            validator,
            emitter,
            delegate,
            AttrList = window.jermaine.AttrList,
            Validator = window.jermaine.Validator,
            EventEmitter = window.jermaine.util.EventEmitter;



        EventEmitter.call(this);

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
                validators.push(new Validator(v));
                return this;
            } else {
                throw new Error("Attr: validator must be a function");
            }
        };

        this.defaultsTo = function (value) {
            defaultValueOrFunction = value;
            return this;
        };

        this.isImmutable = function () {
            immutable = true;
            return this;
        };

        this.isMutable = function () {
            immutable = false;
            return this;
        };

        this.name = function () {
            return name;
        };

        this.clone = function () {
            var result = (this instanceof AttrList)?new AttrList(name):new Attr(name),
                i;

            for (i = 0; i < validators.length; ++i) {
                result.validatesWith(validators[i]);
            }

            result.defaultsTo(defaultValueOrFunction);
            if (immutable) {
                result.isImmutable();
            }

            return result;
        };

        //syntactic sugar
        this.and = this;
        this.which = this;
        //this.eachOfWhich = this;

        this.validator = function () {
            return validator;
        };

        this.addTo = function (obj) {
            var attribute,
                listener,
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
                var emittedData = {},
                    oldAttribute;


                if (newValue !== undefined) {
                    //setter
                    if (immutable && attribute !== undefined) {
                        throw new Error("cannot set the immutable property " + name + " after it has been set");
                    } else
                    if (!validator(newValue)) {
                        throw new Error(errorMessage);
                    } else {
                        if (obj.on && newValue.on) {
                            //first, we remove the old listener if it exists
                            if (attribute && attribute.listeners("change").length > 0 && typeof(listener) === "function") {
                                attribute.removeListener("change", listener);
                            }
                            //then we create and add the new listener
                            listener =  function (data) {
                                var newData = {};
                                newData[name] = data;
                                obj.emit("change", newData);
                            };
                            newValue.on("change",listener);
                        }

                        //finally set the value
                        attribute = newValue;
                        emittedData[name] = newValue;
                        that.emit("set", newValue);
                        that.emit("change", emittedData);
                    }
                    return obj;
                } else {
                    //getter
                    that.emit("get", attribute);
                    return attribute;
                }
            };
        };

        //add a single validator object to the attribute
        addValidator = function (name) {
            that[name] = function (param) {
                validators.push(Validator.getValidator(name)(param));
                return that;
            };
        };

        //add the validators to the attribute
        for (i = 0; i < Validator.validators().length; ++i) {
            addValidator(Validator.validators()[i]);
        }
    };

    ns.Attr = Attr;
});
