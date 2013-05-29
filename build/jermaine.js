if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
        "use strict";
        if (this === null) {
            throw new TypeError();
        }
        var t = Object(this);
        var len = t.length >>> 0;
        if (len === 0) {
            return -1;
        }
        var n = 0;
        if (arguments.length > 0) {
            n = Number(arguments[1]);
            if (n !== n) { // shortcut for verifying if it's NaN
                n = 0;
            } else if (n !== 0 && n !== Infinity && n !== -Infinity) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }
        if (n >= len) {
            return -1;
        }
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        return -1;
    };
}
;/*global describe, it, beforeEach, expect, xit, jasmine */

(function (ns) {
    "use strict";

    var namespace = function (ns, aliases, func) {
        var nsRegExp = /^([a-zA-Z]+)(\.[a-zA-Z]*)*$/,
            nsArray,
            currentNS,
            i;

        //check to assure ns is a properly formatted namespace string
        if (ns.match(nsRegExp) === null || ns === "window") {
            throw new Error("namespace: " + ns + " is a malformed namespace string");
        }

        //check to assure that if alias is defined that func is defined
        if (aliases !== undefined && func === undefined) {
            if (typeof (aliases) === "function") {
                func = aliases;
                aliases = undefined;
            } else if (typeof (aliases) === "object") {
                throw new Error("namespace: if second argument exists, final function argument must exist");
            } else if (typeof (aliases) !== "object") {
                throw new Error("namespace: second argument must be an object of aliased local namespaces");
            }
        } else if (typeof (aliases) !== "object" && typeof (func) === "function") {
            throw new Error("namespace: second argument must be an object of aliased local namespaces");
        }

        //parse namespace string
        nsArray = ns.split(".");

        //set the root namespace to window (if it's not explictly stated)
        if (nsArray[0] === "window") {
            currentNS = window;
        } else {
            currentNS = (window[nsArray[0]] === undefined) ? window[nsArray[0]] = {} : window[nsArray[0]];
        }

        //confirm func is actually a function
        if (func !== undefined && typeof (func) !== "function") {
            throw new Error("namespace: last parameter must be a function that accepts a namespace parameter");
        }

        //build namespace
        for (i = 1; i < nsArray.length; i = i + 1) {
            if (currentNS[nsArray[i]] === undefined) {
                currentNS[nsArray[i]] = {};
            }
            currentNS = currentNS[nsArray[i]];
        }

        //namespaces.push(currentNS);
        //namespace = currentNS;

        //if the function was defined, but no aliases run it on the current namespace
        if (aliases === undefined && func) {
            func(currentNS);
        } else if (func) {
            for (i in aliases) {
                if (aliases.hasOwnProperty(i)) {
                    aliases[i] = namespace(aliases[i]);
                }
            }
            func.call(aliases, currentNS);
        }

        //return namespace
        return currentNS;
    };

    return namespace(ns, function (exports) {
        exports.namespace = namespace;
    });
}("window.jermaine.util"));;window.jermaine.util.namespace("window.jermaine.util", function (ns) {
    "use strict";
    var EventEmitter = function () {
        var that = this,
            listeners = {};

        //an registers event and a listener
        this.on = function (event, listener) {
            if (typeof(event) !== "string") {
                throw new Error("EventEmitter: first argument to 'on' should be a string");
            }
            if (typeof(listener) !== "function") {
                throw new Error("EventEmitter: second argument to 'on' should be a function");
            }
            if (!listeners[event]) {
                listeners[event] = [];
            }
            listeners[event].push(listener);
            return that;
        };

        //alias addListener
        this.addListener = this.on;
    
        this.once = function (event, listener) {
            var f = function () {
                listener(arguments);
                that.removeListener(event, f);
            };

            that.on(event, f);
            return that;
        };

        this.removeListener = function (event, listener) {
            var index;

            if (typeof(event) !== "string") {
                throw new Error("EventEmitter: first parameter to removeListener method must be a string representing an event");
            }
            if (typeof(listener) !== "function") {
                throw new Error("EventEmitter: second parameter must be a function to remove as an event listener");
            }
            if (listeners[event] === undefined || listeners[event].length === 0) {
                throw new Error("EventEmitter: there are no listeners registered for the '" + event + "' event");
            }

            index = listeners[event].indexOf(listener);

            if (index !== -1) {
                //remove it from the list
                listeners[event].splice(index,1);
            }

            return that;
        };

        this.removeAllListeners = function (event) {
            if (typeof(event) !== "string") {
                throw new Error("EventEmitter: parameter to removeAllListeners should be a string representing an event");
            }

            if (listeners[event] !== undefined) {
                listeners[event] = [];
            }
            
            return that;
        };
    
        this.setMaxListeners = function (number) {
            return that;
        };

        //get the listeners for an event
        this.listeners = function (event) {
            if (typeof(event) !== 'string') {
                throw new Error("EventEmitter: listeners method must be called with the name of an event");
            } else if (listeners[event] === undefined) {
                return [];
            }
            return listeners[event];
        };

        //execute each of the listeners in order with the specified arguments
        this.emit = function (event, data) {
            var i,
                params;


            if (arguments.length > 1) {
                params = [];
            }

            for (i = 1; i < arguments.length; ++i) {
                params.push(arguments[i]);
            }

            if (listeners[event] !== undefined) {
                for (i = 0; i < listeners[event].length; i=i+1) {
                    listeners[event][i].apply(this, params);
                }
            }
        };

        return that;
    }; //end EventEmitter

    ns.EventEmitter = EventEmitter;
});
;window.jermaine.util.namespace("window.jermaine", function (ns) {
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

    Validator.addValidator = function (name, v) {
        if (name === undefined || typeof(name) !== "string") {
            throw new Error("addValidator requires a name to be specified as the first parameter");
        }

        if (v === undefined || typeof(v) !== "function") {
            throw new Error("addValidator requires a function as the second parameter");
        }

        if (validators[name] === undefined) {
            validators[name] = function (expected) {
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
;/**
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
;window.jermaine.util.namespace("window.jermaine", function (ns) {
    "use strict";

    function AttrList(name) {
        var that = this,
            listeners = {};

        //this is where the inheritance happens now
        ns.Attr.call(this, name);

        var delegate = function (obj, func) {
            return function () { return obj[func].apply(obj, arguments); };
        };

        //syntactic sugar to keep things grammatically correct
        this.validateWith = this.validatesWith;

        //disable defaultsTo and isImmutable until we figure out how to make it make sense
        this.defaultsTo = function () {
            //no op
        };

        this.isImmutable = function () {
            //no op
        };

        this.isMutable = function () {
            //no op
        };

        this.eachOfWhich = this;

        this.on = function (event, listener) {
            if (event !== "add") {
                throw new Error("AttrList: 'on' only responds to 'add' event");
            }

            if (typeof(listener) !== "function") {
                throw new Error("AttrList: 'on' requires a listener function as the second parameter");
            }

            listeners[event] = listener;
        };


        this.addTo = function (obj) {
            var prop,
            arr = [],
            actualList = {};
            if(!obj || typeof(obj) !== 'object') {
                throw new Error("AttrList: addTo method requires an object parameter");                
            } else {
                actualList.pop = delegate(arr, "pop");
                
                actualList.add = function (item) {
                    if ((that.validator())(item)) {
                        arr.push(item);
                        if (listeners.add !== undefined) {
                            //listeners.add.call();
                            listeners.add.call(obj, item, actualList.size());
                        }
                        return this;         
                    } else {
                        throw new Error(that.errorMessage());
                    }
                };

                actualList.replace = function (index, obj) {
                    if ((typeof(index) !== 'number') || (parseInt(index, 10) !== index)) {
                        throw new Error("AttrList: replace method requires index parameter to be an integer");
                    }

                    if (index < 0 || index >= this.size()) {
                        throw new Error("AttrList: replace method index parameter out of bounds");
                    }

                    if (!(that.validator())(obj)) {
                        throw new Error(that.errorMessage());
                    }

                    arr[index] = obj;
                    return this;
                };

                actualList.at = function (index) {
                    if (index < 0 || index >= this.size()) {
                        throw new Error("AttrList: Index out of bounds");
                    }
                    return arr[index];
                };

                //to keep things more java-y
                actualList.get = actualList.at;

                actualList.size = function () {
                    return arr.length;
                };

                actualList.toJSON = function (JSONreps) {
                    var result = [], 
                        i, j;

                    //check to make sure the current list is not in JSONreps
                    if (JSONreps !== undefined) {
                        for (i = 0;i < JSONreps.length; ++i) {
                            if (JSONreps[i].object === this) {
                                result = JSONreps[i].JSONrep;
                            }
                        }
                    }
                    
                    for (i = 0; i < arr.length; ++i) {
                        if (arr[i].toJSON) {
                            result.push(arr[i].toJSON(JSONreps));
                        } else {
                            result.push(arr[i]);
                        }
                    }
                    return result;
                };

                obj[name] = function () {
                    return actualList;
                };
            }
        };
    }

    //this needs to stay if we're going to use instanceof
    //but note we override all of the methods via delegation
    //so it's not doing anything except for making an AttrList
    //an instance of Attr
    AttrList.prototype = new window.jermaine.Attr(name);

    ns.AttrList = AttrList;
});
;window.jermaine.util.namespace("window.jermaine", function (ns) {
    "use strict";

    var Method = function (name, method) {
        if (!name || typeof(name) !== "string") { 
            throw new Error("Method: constructor requires a name parameter which must be a string");
        } else if (!method || typeof(method) !== "function") {
            throw new Error("Method: second parameter must be a function");
        }
        
        this.addTo = function (obj) {
            if (!obj || typeof(obj) !== 'object') {
                throw new Error("Method: addTo method requires an object parameter");
            }
            
            obj[name] = method;
        };
    };
    ns.Method = Method;
});;window.jermaine.util.namespace("window.jermaine", function (ns) {
    "use strict";
    
    var models = {},
        getModel,
        Model;
    

    getModel = function (name) {
        if (models[name] === undefined) {
            throw new Error("No model by the name of " + name + " found");
        } else {
            return models[name];
        }
    };

    Model = function (specification) {
        var methods = {},
            attributes = {},
            pattern,
            modelName,
            modified = true,
            requiredConstructorArgs = [],
            optionalConstructorArgs = [],
            parents = [],
            Method = ns.Method,
            Attr = ns.Attr,
            AttrList = ns.AttrList,
            EventEmitter = ns.util.EventEmitter,
            property,
            listProperties,
            updateConstructor,
            isImmutable,
            initializer = function () {},
            constructor = function () {},
            model = function () {
                if (modified) {
                    //validate the model if it has been modified
                    model.validate();
                    updateConstructor();
                }
                return constructor.apply(this, arguments);
            };

        if (arguments.length === 1) {
            if (typeof(specification) === "string") {
                modelName = specification;
                specification = undefined;
            }
        }

        if (arguments.length > 1) {
            modelName = specification;
            specification = arguments[arguments.length-1];
        }

        //handle specification function
        if (specification && typeof(specification) === "function") {
            model = new Model();
            specification.call(model);
            return model;
        } else if (specification) {
            throw new Error("Model: specification parameter must be a function");
        }

        //handle model name
        if (modelName !== undefined) {
            models[modelName] = model;
        }

        
        /********** BEGIN PRIVATE METHODS ****************/
        /* private method that abstracts hasA/hasMany */
        var hasAProperty = function (type, name) {
            var Property,
                methodName,
                attribute;

            //Property is one of Attr or AttrList
            Property = type==="Attr"?Attr:AttrList;

            //methodName is either hasA or hasMany
            methodName = type==="Attr"?"hasA":"hasMany";

            modified = true;
            
            if (typeof(name) === 'string') {
                attribute = new Property(name);
                attributes[name] = attribute;
                return attribute;
            } else {
                throw new Error("Model: " + methodName + " parameter must be a string");
            }
        };

        /* private method that abstracts attribute/method */
        property = function (type, name) {
            var result;

            if (typeof(name) !== "string") {
                throw new Error("Model: expected string argument to " + type + " method, but recieved " + name);
            }

            result = type==="attribute" ? attributes[name] : methods[name];

            if (result === undefined) {
                throw new Error("Model: " + type + " " + name  + " does not exist!");
            }

            return result;
        };

        /* private method that abstracts attributes/methods */
        listProperties = function (type) {
            var i,
            list = [],
            properties = type==="attributes"?attributes:methods;

            for (i in properties) {
                if (properties.hasOwnProperty(i)) {
                    list.push(i);
                }
            }

            return list;
        };

        /* private function that updates the constructor */
        updateConstructor = function () {
            constructor = function () {
                var i, j,
                    err,
                    attribute,
                    attributeList = model.attributes(), 
                    methodList = model.methods(), 
                    emitter = new EventEmitter(),
                    attr,
                    attrChangeListeners = {},
                    changeHandler,
                    addProperties,
                    that = this;

                if (!(this instanceof model)) {
                    if (arguments.length > 0) {
                        //bad form, but hopefully temporary
                        /*jshint newcap:false */
                        return new model(arguments);
                    } else {
                        //bad form, but hopefully temporary
                        /*jshint newcap:false */
                        return new model();
                    }
                    //throw new Error("Model: instances must be created using the new operator");
                }


                ////////////////////////////////////////////////////////////////
                ////////////// PUBLIC API FOR ALL INSTANCES ////////////////////
                ////////////////////////////////////////////////////////////////

                // this is a method associated with unit test
                // it("should not increment the listeners associated with the last object created"
                // it has been removed now that the bug has been fixed
                /*this.attrChangeListeners = function () {
                    return attrChangeListeners;
                };*/

                /**
                 * Returns the EventEmitter associated with this instance.
                 *
                 */
                this.emitter = function () {
                    return emitter;
                };

                /**
                 * Wrapper methods added to the internal EventEmitter object
                 * 
                 */

                this.emitter().removeJermaineChangeListener = function (attrName, obj) {
                    if (typeof(attrName) !== "string") {
                        throw new Error("attrName must be a string");
                    } else if (typeof(obj) !== "object" || obj.toJSON === undefined ||
                               obj.emitter === undefined) {
                        throw new Error("obj must be a jermaine object");
                    } else {
                        obj.emitter().removeListener("change", attrChangeListeners[attrName]);
                    }
                };

                this.emitter().addJermaineChangeListener = function (attrName, obj) {
                    if (typeof(attrName) !== "string") {
                        throw new Error("attrName must be a string");
                    } else if (typeof(obj) !== "object" || obj.toJSON === undefined ||
                               obj.emitter === undefined) {
                        throw new Error("obj must be a jermaine object");
                    } else {
                        if (attrChangeListeners[attrName] === undefined) {
                            attrChangeListeners[attrName] = function (data) {
                                var newData = [],
                                emit = true;
                                
                                for (i = 0; i < data.length && emit === true; ++i) {
                                    newData.push(data[i]);
                                    if (data[i].origin === that) {
                                        emit = false;
                                    }
                                }
                                
                                if (emit) {
                                    newData.push({key:attrName, origin:that});
                                    that.emit("change", newData);
                                }
                            };
                            
                        }
                        obj.emitter().on("change", attrChangeListeners[attrName]);
                    }
                };


                /**
                 * Registers a listener for this instance's changes.
                 *
                 */
                this.on = this.emitter().on;

                /**
                 * Emits an event
                 */
                this.emit = this.emitter().emit;

                /**
                 * Returns a JSON representation of this instance.
                 *
                 */
                this.toJSON = function (JSONreps) {
                    var attributeValue,
                        i, j,
                        thisJSONrep = {},
                        attributeJSONrep;

                    if (JSONreps === undefined) {
                        // first call
                        JSONreps = [];
                        JSONreps.push({object:this, JSONrep:thisJSONrep});
                    } else if (typeof(JSONreps) !== "object") {
                        // error condition 
                        throw new Error("Instance: toJSON should not take a parameter (unless called recursively)");
                    } else {
                        // find the current JSON representation of this object, if it exists
                        for (i = 0; i < JSONreps.length; ++i) {
                            if (JSONreps[i].object === this) {
                                thisJSONrep = JSONreps[i].JSONrep;
                            }
                        }
                    }

                    for (i = 0; i < attributeList.length; ++i) {
                        attributeJSONrep = null;
                        // get the attribute
                        attributeValue = this[attributeList[i]]();
                        
                        // find the current JSON representation for the attribute, if it exists
                        for (j = 0; j < JSONreps.length; ++j) {
                            if (JSONreps[j].object === attributeValue) {
                                attributeJSONrep = JSONreps[j].JSONrep;
                            }
                        }

                        if (attributeValue !== undefined && attributeValue !== null && attributeValue.toJSON !== undefined && attributeJSONrep === null) {
                            // create a new entry for the attribute
                            attributeJSONrep = (attributes[attributeList[i]] instanceof AttrList)?[]:{};
                            JSONreps.push({object:attributeValue, JSONrep:attributeJSONrep});
                            JSONreps[JSONreps.length-1].JSONrep = attributeValue.toJSON(JSONreps);
                        }

                        // fill out the JSON representation for this object
                        if(attributeJSONrep === null) {
                            thisJSONrep[attributeList[i]] = attributeValue;
                        } else {
                            thisJSONrep[attributeList[i]] = attributeJSONrep;
                        }
                    }
                    return thisJSONrep;
                };

                /**
                 * Returns a String representation of this instance
                 *
                 */
                this.toString = (pattern !== undefined)?pattern:function () {
                    return "Jermaine Model Instance";
                };


                ////////////////////////////////////////////////////////////////
                ////////////// END PUBLIC API FOR ALL INSTANCES ////////////////
                ////////////////////////////////////////////////////////////////


                /**
                 * This is a private method that sets up handling for the setter
                 * It attaches a change listener on new objects
                 * and it removes the change listener from old objects
                 */
                changeHandler = function (attr) {
                    if (!(attr instanceof AttrList)) {
                        //when set handler is called, this should be the current object
                        attr.on("set", function (newValue, preValue) {
                            // if preValue is a model instance, we need to remove the listener from it
                            if (preValue !== undefined && preValue !== null && preValue.on !== undefined &&
                                preValue.toJSON !== undefined && preValue.emitter !== undefined) {
                                // we now assume preValue is a model instance
                                
                                // sanity check 1
                                if (preValue.emitter().listeners("change").length < 1) {
                                    throw new Error("preValue should always have a listener defined if it is a model");
                                }
                                
                                this.emitter().removeJermaineChangeListener(attr.name(), preValue);
                            }
                            
                            // if newValue is a model instance, we need to attach a listener to it
                            if (newValue !== undefined && newValue !== null && newValue.on !== undefined &&
                                newValue.toJSON !== undefined && newValue.emitter !== undefined) {
                                // we now assume newValue is a model instance
                                
                                // attach a listener
                                this.emitter().addJermaineChangeListener(attr.name(), newValue);
                            }

                            // finally emit that a change has happened
                            this.emit("change", [{key:attr.name(), value:newValue, origin:this}]);
                        });
                    } else {
                        attr.on("add", function (newValue, newSize) {
                            this.emit("change", [{action:"add", key:attr.name(), value:newValue, origin:this}]);
                        });
                    }
                };

                //set up event handling for sub objects
                for (i = 0; i < attributeList.length;  ++i) {
                    attr = model.attribute(attributeList[i]);

                    // temporarily not adding handlers to attr lists
                    // until we get the bugs sorted out
                    // see model test "should not add change listeners to attr list"
                    //if (!(attr instanceof AttrList)) {
                    changeHandler.call(this, attr);
                    //}
                }


                // add all of the attributes and the methods to the object
                for (i = 0; i < attributeList.length + methodList.length; ++i)  {
                    if (i < attributeList.length) {
                        //if the object is immutable, all attributes should be immutable
                        if (isImmutable) {
                            model.attribute(attributeList[i]).isImmutable();
                        }
                        model.attribute(attributeList[i]).addTo(this);
                    } else {
                        model.method(methodList[i-attributeList.length]).addTo(this);
                    }
                }

                // build the object using the constructor arguments
                if(arguments.length > 0) {
                    if (arguments.length < requiredConstructorArgs.length) {
                        //construct and throw error
                        err = "Constructor requires ";
                        for(i = 0; i < requiredConstructorArgs.length; ++i) {
                            err += requiredConstructorArgs[i];
                            err += i===requiredConstructorArgs.length-1?"":", ";
                        }
                        err += " to be specified";
                        throw new Error(err);
                    } if (arguments.length > requiredConstructorArgs.length + optionalConstructorArgs.length) {
                        throw new Error("Too many arguments to constructor. Expected " + requiredConstructorArgs.length + " required arguments and " +
                                        optionalConstructorArgs.length + " optional arguments");
                    }
                    else {
                        for (i = 0; i < arguments.length; ++i) {
                            attribute = i < requiredConstructorArgs.length?
                                requiredConstructorArgs[i]:
                                optionalConstructorArgs[i-requiredConstructorArgs.length];

                            if (model.attribute(attribute) instanceof AttrList) {
                                //make sure that arguments[i] is an array
                                if (Object.prototype.toString.call(arguments[i]) !== "[object Array]") {
                                    throw new Error("Model: Constructor requires 'names' attribute to be set with an Array");
                                } else {
                                    //iterate over the array adding the elements
                                    for (j = 0; j < arguments[i].length; ++j) {
                                        this[attribute]().add(arguments[i][j]);
                                    }
                                }
                            } else {
                                //go ahead and set it like normal
                                this[attribute](arguments[i]);
                            }
                        }
                    }
                }

                // finally, call the initializer
                initializer.call(this);
            };
        };
        /*********** END PRIVATE METHODS **************/


        /*********** BEGIN PUBLIC API *****************/
        model.hasA = function (attr) {
            return hasAProperty("Attr", attr);
        };
        
        model.hasAn = model.hasA;
        model.hasSome = model.hasA;
        
        model.hasMany = function (attrs) {
            return hasAProperty("AttrList", attrs);
        };

        model.isA = function (parent) {
            var i,
                parentAttributes,
                parentMethods,
                isAModel;

            modified = true;

            //checks to make sure a potentialModel has all attributes of a model
            isAModel = function (potentialModel) {
                var i,
                    M = new Model();
                for (i in M) {
                    if (M.hasOwnProperty(i) && typeof(potentialModel[i]) !== typeof(M[i])) {
                        return false;
                    }
                }
                return true;
            };

            //confirm parent is a model via duck-typing
            if (typeof (parent) !== "function" || !isAModel(parent)) {
                throw new Error("Model: parameter sent to isA function must be a Model");
            }

            //only allow single inheritance for now
            if (parents.length === 0) {
                parents.push(parent);
            } else {
                throw new Error("Model: Model only supports single inheritance at this time");
            }

            //add attributes and methods to current model
            parentAttributes = parents[0].attributes();
            for (i = 0; i < parentAttributes.length; ++i) {
                if (attributes[parentAttributes[i]] === undefined) {
                    attributes[parentAttributes[i]] = parents[0].attribute(parentAttributes[i]).clone();
                    //subclass attributes are mutable by default
                    attributes[parentAttributes[i]].isMutable();
                }
            }

            parentMethods = parents[0].methods();
            for (i = 0; i < parentMethods.length; ++i) {
                if (methods[parentMethods[i]] === undefined) {
                    methods[parentMethods[i]] = parents[0].method(parentMethods[i]);
                }
            }            

            for (i = 0; i < parents.length; i++) {
                model.prototype = new parents[i]();
            }
        };

        model.isAn = model.isA;

        model.parent = function () {
            return parents[0].apply(this, arguments);
        };

        model.attribute = function (attr) {
            return property("attribute", attr);
        };

        model.attributes = function () {
            return listProperties("attributes");
        };

        model.method = function (m) {
            return property("method", m);
        };
        
        model.methods = function () {
            return listProperties("methods");
        };

        model.isBuiltWith = function () {
            var optionalParamFlag = false,
            i;

            modified = true;
            requiredConstructorArgs = [];
            optionalConstructorArgs = [];

            for (i = 0; i < arguments.length; ++i) {
                if (typeof(arguments[i]) === "string" && arguments[i].charAt(0) !== '%') {
                    //in required parms
                    if (optionalParamFlag) {
                        //throw error
                        throw new Error("Model: isBuiltWith requires parameters preceded with a % to be the final parameters before the optional function");
                    } else {
                        //insert into required array
                        requiredConstructorArgs.push(arguments[i]);
                    }
                } else if(typeof(arguments[i]) === "string" && arguments[i].charAt(0) === '%') {
                    //in optional parms
                    optionalParamFlag = true;
                    //insert into optional array
                    optionalConstructorArgs.push(arguments[i].slice(1));
                } else if(typeof(arguments[i]) === "function" && i === arguments.length - 1) {
                    //init function
                    initializer = arguments[i];
                } else {
                    throw new Error("Model: isBuiltWith parameters must be strings except for a function as the optional final parameter");
                }
            }
        };
        
        model.isImmutable = function () {
            isImmutable = true;
        };

        model.looksLike = function (p) {
            modified = true;
            pattern = p;
        };

        model.respondsTo = function (methodName, methodBody) {
            var m = new Method(methodName, methodBody);
            modified = true;
            methods[methodName] = m;
        };
        
        model.validate = function () {
            var i,
                attributes = this.attributes(),
                methods = this.methods();

            //check to make sure that isBuiltWith has actual attributes
            for (i = 0; i < requiredConstructorArgs.length; ++i) {
                try {
                    this.attribute(requiredConstructorArgs[i]);
                } catch (e) {
                    throw new Error(requiredConstructorArgs[i] + ", specified in the isBuiltWith method, is not an attribute");
                }
            }

            for (i = 0; i < optionalConstructorArgs.length; ++i) {
                try {
                    this.attribute(optionalConstructorArgs[i]);
                } catch (e) {
                    throw new Error(optionalConstructorArgs[i] + ", specified in the isBuiltWith method, is not an attribute");
                }
            }

            //check for method/attribute collisions
            for (i = 0; i < attributes.length; i++) {
                if (methods.indexOf(attributes[i]) > -1) {
                    throw new Error("Model: invalid model specification to " + attributes[i] + " being both an attribute and method");
                }
            }

            //check to make sure that all attributes are requiredConstructorArgs if the object is immutable
            if (isImmutable) {
                for (i = 0; i < attributes.length; i++) {
                    if (requiredConstructorArgs.indexOf(attributes[i]) < 0) {
                        throw new Error("immutable objects must have all attributes required in a call to isBuiltWith");
                    }
                }
            }

            //set modifiedSinceLastValidation to false
            modified = false;
        };
        /************** END PUBLIC API ****************/
        
        //here we are returning our model object
        //which is a function with a bunch of methods that
        //manipulate how the function behaves
        return model;
    };


    ns.getModel = getModel;
    ns.Model = Model;
});
