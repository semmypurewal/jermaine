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
            delegate,
            listeners = {},
            AttrList = window.jermaine.AttrList,
            Validator = window.jermaine.Validator,
            EventEmitter = window.jermaine.util.EventEmitter;


        listeners.set = function () {};
        listeners.get = function () {};


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

        this.validator = function () {
            return validator;
        };


        this.on = function (event, listener) {
            if (event !== "set" && event !== "get") {
                throw new Error("Attr: first argument to the 'on' method should be 'set' or 'get'");
            } else if (typeof(listener) !== "function") {
                throw new Error("Attr: second argument to the 'on' method should be a function");
            } else {
                listeners[event] = listener;
            }
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
                var emittedData = [],
                    emit = true,
                    i;

                if (newValue !== undefined) {
                    //setter
                    if (immutable && attribute !== undefined) {
                        throw new Error("cannot set the immutable property " + name + " after it has been set");
                    } else
                    if (!validator(newValue)) {
                        throw new Error(errorMessage);
                    } else {
                        if ((obj instanceof EventEmitter || obj.on && obj.emitter().emit) && newValue.on) {
                            //first, we remove the old listener if it exists
                            if (attribute && attribute.emitter().listeners("change").length > 0 && typeof(listener) === "function") {
                                attribute.emitter().removeListener("change", listener);
                            }
                            //then we create and add the new listener
                            listener =  function (data) {
                                for (i = 0; i < data.length && emit; ++i) {
                                    if (data[i].origin === obj) {
                                        emit = false;
                                    }
                                }

                                if (emit && data.push) {
                                    data.push({key:name, origin:obj});
                                    obj.emitter().emit("change", data);
                                }
                            };
                            if (newValue.on && newValue.emitter) {
                                newValue.emitter().on("change", listener);
                            }
                        }

                        //finally set the value
                        listeners.set(newValue);
                        attribute = newValue;
                        emittedData.push({key:name, value:newValue, origin:obj});

                        if ((obj instanceof EventEmitter || obj.on && obj.emitter().emit)) {
                            obj.emitter().emit("change", emittedData);
                        }
                    }
                    return obj;
                } else {
                    listeners.get(attribute);
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
