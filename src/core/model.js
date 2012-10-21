window.jermaine.util.namespace("window.jermaine", function (ns) {
    "use strict";
    function Model(specification) {
        var that = this,
            methods = {},
            attributes = {},
            pattern,
            getObserver,
            setObserver,
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
            create,
            isImmutable,
            initializer = function () {},
            constructor = function () {},
            model = function () {
                if (modified) {
                    create();
                }
                return constructor.apply(this, arguments);
            };


        //make instances of models instances of eventemitters
        //model.prototype = new EventEmitter();

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

        /* private function that creates the constructor */
        create = function (name) {
            var that = this,
                i, j,
                err;

            //validate the model first
            model.validate();

            constructor = function () {
                var that = this,
                    i,
                    attribute,
                    emitter,
                    addProperties;

                if (!(this instanceof model)) {
                    throw new Error("Model: instances must be created using the new operator");
                }

                //utility function that adds methods and attributes
                addProperties = function (obj, type) {
                    var properties = type==="attributes" ? attributes : methods,
                    i;
                    for (i in properties) {
                        if (properties.hasOwnProperty(i)) {
                            //if the object is immutable, all attributes should be immutable
                            if(properties === attributes && isImmutable) {
                                properties[i].isImmutable();
                            }
                            properties[i].addTo(obj);
                        }
                    }
                };

                emitter = new EventEmitter();

                this.emitter = function () {
                    return emitter;
                };

                //expose the the on method
                this.on = function (event, listener) {
                    that.emitter().on(event, function (data) {
                        listener.call(that, data);
                    });
                };
                //this.on = this.emitter().on;

                //add attributes
                addProperties(this, "attributes");
                addProperties(this, "methods");

                var attr,
                    attrChangeListeners = {},
                    setHandler,
                    lastListener;

                setHandler = function (attr) {
                    //when set handler is called, this should be the current object
                    attr.on("set", function (newValue, preValue) {
                        var that = this;

                        if (attrChangeListeners[attr.name()] === undefined) {
                            attrChangeListeners[attr.name()] = function (data) {
                                var newData = [],
                                    emit = true;

                                for (i = 0; i < data.length && emit === true; ++i) {
                                    newData.push(data[i]);
                                    if (data[i].origin === this) {
                                        emit = false;
                                    }
                                }

                                if (emit) {
                                    //maybe we should manipulate the data directly? copy it and emit a new data object?
                                    newData.push({key:attr.name(), origin:this});
                                    this.emitter().emit("change", newData);
                                }
                            };
                        }
                        
                        //get current attribute
                        if (typeof(newValue) === "object" && newValue.on !== undefined && newValue.emitter !== undefined) {
                            if (preValue !== undefined)  {
                                preValue.emitter().removeListener("change", lastListener);
                            }
                            lastListener = function (data) {
                                attrChangeListeners[attr.name()].call(that, data);
                            };
                            newValue.emitter().on("change", lastListener);
                        }
                        that.emitter().emit("change", [{key:attr.name(), value:newValue, origin:that}]);
                    });
                };

                //set up event handling for sub objects
                for (i = 0; i < listProperties("attributes").length; ++i) {
                    attr = attributes[listProperties("attributes")[i]];

                    if (attr instanceof Attr) {
                        setHandler.call(this, attr);
                    }
                }

                this.toJSON = function (JSONreps) {
                    var attributeList = model.attributes(),
                        attributeValue,
                        i, j,
                        thisJSONrep = null,
                        attributeJSONrep;

                    if (JSONreps === undefined) {
                        /* first call */
                        thisJSONrep = {};
                        JSONreps = [];
                        JSONreps.push({object:this, JSONrep:thisJSONrep});
                    } else if (typeof(JSONreps) !== "object") {
                        /* error condition */
                        throw new Error("Instance: toJSON should not take a parameter (unless called recursively)");
                    } else {
                        /* find the current JSON representation of this object, if it exists */
                        for (i = 0; i < JSONreps.length; ++i) {
                            if (JSONreps[i].object === this) {
                                thisJSONrep = JSONreps[i].JSONrep;
                            }
                        }
                    }

                    for (i = 0; i < attributeList.length; ++i) {
                        attributeJSONrep = null;
                        /* get the attribute */
                        attributeValue = this[attributeList[i]]();
                        
                        /* find the current JSON representation for the attribute, if it exists */
                        for (j = 0; j < JSONreps.length; ++j) {
                            if (JSONreps[j].object === attributeValue) {
                                attributeJSONrep = JSONreps[j].JSONrep;
                            }
                        }

                        if (attributeValue !== undefined && attributeValue.toJSON !== undefined && attributeJSONrep === null) {
                            /* create a new entry for the attribute */
                            attributeJSONrep = {};
                            JSONreps.push({object:attributeValue, JSONrep:attributeJSONrep});
                            JSONreps[JSONreps.length-1].JSONrep = attributeValue.toJSON(JSONreps);

                            /* this works */
                            /*attributeJSONrep = {object:attributeValue, JSONrep:attributeJSONrep};
                            JSONreps.push({object:attributeValue, JSONrep:attributeJSONrep});
                            attributeJSONrep.JSONrep = attributeValue.toJSON(JSONreps);
                            attributeJSONrep = attributeJSONrep.JSONrep;*/
                        }

                        /* fill out the JSON representation for this object */
                        if(attributeJSONrep === null) {
                            thisJSONrep[attributeList[i]] = attributeValue;
                        } else {
                            thisJSONrep[attributeList[i]] = attributeJSONrep;
                        }
                    }
                    return thisJSONrep;
                    
                };


                if (pattern !== undefined) {
                    this.toString = pattern;
                }

                //use constructor args to build object
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
                    } else {
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
                initializer.call(this);
            };
            return constructor;
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
    }

    ns.Model = Model;
});
