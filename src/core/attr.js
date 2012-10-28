/**
 * Attr
 * 
 * Creates an encapsulated, chainable attribute that are validated by 
 * user-specified validation functions and can be attached to an arbitrary
 * JavaScript object. They can also call user-specified listeners upon being
 * accessed or changed.
 *
 * Jermaine models hold and manipulate Attr (and AttrList) objects until they
 * are attached to an object.
 */

/*!
 *
 * Notes and ToDos:
 * + what about isNotGreaterThan()?, isNotLessThan()?  Or, better still: a
 *   general 'not' operator, as in jasmine?
 *
 * + Attr should be decoupled from AttrList, see the clone() method
 *
 * + See issue 24 on github
 */
window.jermaine.util.namespace("window.jermaine", function (ns) {
    "use strict";

    var Attr = function (name) {
        var validators = [],
            that = this,
            errorMessage = "invalid setter call for " + name,
            defaultValueOrFunction,
            i,
            prop,
            addValidator,
            immutable = false,
            validator,
            listeners = {},
            AttrList = window.jermaine.AttrList,
            Validator = window.jermaine.Validator;

        // check for errors with constructor parameters
        if (name === undefined || typeof(name) !== 'string') {
            throw new Error("Attr: constructor requires a name parameter " +
                            "which must be a string");
        }

        // set up the validator that combines all validators
        validator = function (thingBeingValidated) {
            for (i = 0; i < validators.length; ++i) {
                validators[i](thingBeingValidated);
            }
            return true;
        };


        ////////////////////////////////////////////////////////////////////////
        /////////////////////////// MODIFIERS //////////////////////////////////
        ////////////////////////////////////////////////////////////////////////

        /**
         * Validate this attribute with the given validator. This also allows
         * this.message to be overridden to specify the error message on
         * validation failure.
         *
         * Examples:
         *
         *     age.validatesWith(function (age) {
         *         this.message = "age must be between 18 and 99, " + age +
         *                        " fails.";
         *         return age >= 18 && age <= 99;
         *     });
         *
         *     name.validatesWith(function (name) {
         *         this.message = "name must be a string and contain at least" +
         *                        " 3 letters, " + name + " fails.";
         *         return typeof(name) === "string && name.length >= 3;
         *     });
         *
         *
         * @param {Function} returns true if the argument passes validation 
         */
        this.validatesWith = function (v) {
            if (typeof(v) === 'function') {
                validators.push(new Validator(v));
                return this;
            } else {
                throw new Error("Attr: validator must be a function");
            }
        };

        /**
         * Assign a default value to all attributes of this type. The default
         * value may be an explicit value or object, or it may be a function
         * that returns a default value.
         *
         * Examples:
         *
         * @param {value} the explicit default value, or a function that
         *                returns the default value
         */
        this.defaultsTo = function (value) {
            defaultValueOrFunction = value;
            return this;
        };

        /**
         * Make this attribute read-only. If a setter is called on this
         * attribute, it will throw an error
         *
         * Examples:
         */
        this.isReadOnly = function () {
            immutable = true;
            return this;
        };

        /**
         * Make this attribute writable. Note that this is the default for all 
         * attributes, but this may be called if an attribute has been set to
         * read only and then needs to be changed back
         *
         * Examples:
         */
        this.isWritable = function () {
            immutable = false;
            return this;
        };

        /**
         * Sets up a listener for 'sets' or 'gets' to this attribute. It throws
         * an error if the event is not "set" or "get", and if a setter is
         * already set up for the event, it overrides it.
         *
         * Examples:
         *
         * @param {event} String that can only be "set" or "get"
         * @param {listener} Function that is called when the event occurs
         */
        this.on = function (event, listener) {
            if (event !== "set" && event !== "get") {
                throw new Error("Attr: first argument to the 'on' method " +
                                "should be 'set' or 'get'");
            } else if (typeof(listener) !== "function") {
                throw new Error("Attr: second argument to the 'on' method " +
                                "should be a function");
            } else {
                listeners[event] = listener;
            }
        };

        ////////////////////////////////////////////////////////////////////////
        /////////////////////////// END MODIFIERS //////////////////////////////
        ////////////////////////////////////////////////////////////////////////



        ////////////////////////////////////////////////////////////////////////
        /////////////////////// GETTERS ////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////

        /**
         * Returns the name of this attribute
         */
        this.name = function () {
            return name;
        };

        /**
         * Returns a function that combines all of the validators into
         * a single function that returns true or false.
         */
        this.validator = function () {
            return validator;
        };

        ////////////////////////////////////////////////////////////////////////
        /////////////////////// END GETTERS ////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////



        ////////////////////////////////////////////////////////////////////////
        /////////////////////// SYNTACTIC SUGAR ////////////////////////////////
        ////////////////////////////////////////////////////////////////////////

        /**
         * An alias for this object, for readability when calling multiple
         * modifiers
         *
         * Examples:
         */
        this.and = this;

        /**
         * An alias for this object, for readability.
         *
         * Examples:
         */
        this.which = this;

        /**
         * An alias for isReadOnly
         */
        this.isImmutable = this.isReadOnly;

        /**
         * An alias for isWritable
         */
        this.isMutable = this.isWritable;

        ////////////////////////////////////////////////////////////////////////
        /////////////////////// END SYNTACTIC SUGAR ////////////////////////////
        ////////////////////////////////////////////////////////////////////////



        ////////////////////////////////////////////////////////////////////////
        /////////////////////// UTILITIES //////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////

        /**
         * Returns an attribute with the same modifiers, defaultValue, and
         * validators. This is used in Jermaine's approach to inheritance.
         *
         * Examples:
         */
        this.clone = function () {
            var result,
                i;

            // set the result to the default attribute or attribute list
            // TODO: figure out how to make this work without explicitly
            //       knowing about AttrList so it can be decoupled from this
            //       code
            result = this instanceof AttrList?new AttrList(name):new Attr(name);

            // add this attributes validators to the new attribute
            for (i = 0; i < validators.length; ++i) {
                result.validatesWith(validators[i]);
            }

            // set up the same default for the new attribute
            result.defaultsTo(defaultValueOrFunction);

            // if the this attr is immutable, the cloned attr should also be
            // immutable
            if (immutable) {
                result.isImmutable();
            }

            return result;
        };

        /**
         * This attaches the attribute to a concrete object. It adds the
         * getter/setter function to the object, and captures the actual
         * value of the attribute in a closure.
         *
         * The resulting getter/setter calls all validators on the parameter
         * and calls the appropriate listener on this attribute. It also
         * returns the object itself so that attribute setters can be chained.
         *
         * Examples:
         *
         * @param {obj} the object to which this attribute will be attached
         */

        this.addTo = function (obj) {
            var attribute,
                listener,
                defaultValue;

            if (!obj || typeof(obj) !== 'object') {
                throw new Error("Attr: addAttr method requires an object " +
                                "parameter");
            }

            // This is the attribute getter/setter method that gets addded to
            // the object
            obj[name] = function (newValue) {
                var preValue;

                if (newValue !== undefined) {
                    // setter
                    if (immutable && attribute !== undefined) {
                        throw new Error("cannot set the immutable property " +
                                         name + " after it has been set");
                    } else if (!validator(newValue)) {
                        throw new Error(errorMessage);
                    } else {
                        // get the oldValue
                        preValue = attribute;

                        // first set the value
                        attribute = newValue;

                        // call the set listener
                        if (listeners.set !== undefined) {
                            listeners.set.call(obj, newValue, preValue);
                        }
                    }
                    return obj;
                } else {
                    // call the get listener
                    if (listeners.get !== undefined) {
                        listeners.get.call(obj, attribute);
                    }
                    return attribute;
                }
            };


            // assign the default value, depends on whether it is a function
            // or an explicit value
            defaultValue = typeof(defaultValueOrFunction) === 'function'?
                defaultValueOrFunction():
                defaultValueOrFunction;

            // call the setter with the defaultValue upon attaching it to the
            // object
            if (defaultValue !== undefined && validator(defaultValue)) {
                obj[name](defaultValue);
            } else if (defaultValue !== undefined && !validator(defaultValue)) {
                throw new Error("Attr: Default value of " + defaultValue +
                                " does not pass validation for " + name);
            }
        };

        ////////////////////////////////////////////////////////////////////////
        /////////////////////// END UTILITIES //////////////////////////////////
        ////////////////////////////////////////////////////////////////////////



        ////////////////////////////////////////////////////////////////////////
        /////////////////////// VALIDATOR RELATED //////////////////////////////
        ////////////////////////////////////////////////////////////////////////

        // add a single validator object to the attribute
        addValidator = function (name) {
            that[name] = function (param) {
                validators.push(Validator.getValidator(name)(param));
                return that;
            };
        };

        // the Validator object contains several default validators
        // that need to be attached to all Attrs
        for (i = 0; i < Validator.validators().length; ++i) {
            addValidator(Validator.validators()[i]);
        }

        ////////////////////////////////////////////////////////////////////////
        /////////////////////// END VALIDATOR RELATED //////////////////////////
        ////////////////////////////////////////////////////////////////////////
    };

    // export Attr to the specified namespace
    ns.Attr = Attr;
});
