window.jermaine.util.namespace("window.jermaine", function (ns) {
    "use strict";

    var Model = function (specification) {
        var methods = {},
            attributes = {},
            pattern,
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


        //temporary fix so API stays the same
        if (arguments.length > 1) {
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
                    setHandler,
                    addProperties,
                    that = this;

                if (!(this instanceof model)) {
                    throw new Error("Model: instances must be created using the new operator");
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
                setHandler = function (attr) {
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
                };

                //set up event handling for sub objects
                for (i = 0; i < attributeList.length;  ++i) {
                    attr = model.attribute(attributeList[i]);

                    // temporarily not adding handlers to attr lists
                    // until we get the bugs sorted out
                    // see model test "should not add change listeners to attr list"
                    if (!(attr instanceof AttrList)) {
                        setHandler.call(this, attr);
                    }
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

    ns.Model = Model;
});
