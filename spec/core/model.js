/*global describe, it, beforeEach, expect, xit, jasmine, spyOn */

describe("Model", function () {
    "use strict";
    var Model = window.jermaine.Model,
        Attr = window.jermaine.Attr,
        AttrList = window.jermaine.AttrList,
        Method = window.jermaine.Method,
        getModel = window.jermaine.getModel,
        Person;


    beforeEach(function () {
        // this creates an anonymous model
        Person = new Model();
    });

    describe("#constructor", function () {
        describe("model name features", function () {
            it ("should allow for a string to be sent as a first arg",
                 function () {
                     expect(function () {
                         Person = new Model("Person");
                     }).not.toThrow();
                 }
            );

            it ("should allow a spec function to be sent in as a second arg",
                 function () {
                     var p;

                     expect(function () {
                         Person = new Model("Person", function () {
                             this.hasA("name").which.isA("string");
                             this.hasAn("age").which.isAn("integer");
                         });
                     }).not.toThrow();

                     p = new Person();
                     expect(p.age).not.toBeUndefined();
                     expect(p.name).not.toBeUndefined();
                 }
            );

            it ("should store the model by its name if the name is specified",
                 function () {
                     var PersonAlias;

                     Person = new Model("Person");
                     PersonAlias = getModel("Person");
                     expect(Person).toEqual(PersonAlias);
                 }
            );

            xit ("should overwrite the old model if the model constructor is " +
                 " called again", function () {
                     var Person2 = new Model("Person");
                     Person = new Model("Person");
                     expect(Person2).not.toEqual(getModel("Person"));
                 }
            );

            xit ("should throw an error if the model name is not a string",
                 function () {
                     
                 }
            );


            xit ("should throw an error if the spec function is not a function",
                 function () {

                 }
            );
        });
    });

    describe("hasA method", function () {
        it("should create a new Attr with the specified name", function () {
            var a = Person.hasA("friend");
            expect(a instanceof Attr).toBe(true);
            expect(Person.attribute("friend")).not.toBeUndefined();
        });

        it("should add the attribute to the spec object", function () {
            Person.hasA("friend");
            expect(Person.attribute("friend")).not.toBeUndefined();
        });

        it("should return the Attr object so it can be cascaded with other functions", function () {
            var a = Person.hasA("friend");
            expect(a instanceof Attr).toBe(true);
            expect(Person.attribute("friend")).not.toBeUndefined();
            expect(a.validatesWith).not.toBeUndefined();
        });

        it("should throw an error if the parameter is not a string", function () {
            expect(function () {
                Person.hasA(5);
            }).toThrow(new Error("Model: hasA parameter must be a string"));
        });
    });

    describe("hasAn method", function () {
        it("should be an alias for the hasA method", function () {
            expect(this.hasAn).toEqual(this.hasA);
        });
    });

    describe("hasSome method", function () {
        it("should be an alias for the hasA method", function () {
            expect(this.hasSome).toEqual(this.hasA);
        });
    });

    describe("hasMany method", function () {
        it("should create a new AttrList object with the specified name", function () {
            var al = Person.hasMany("friends");
            expect(al instanceof AttrList).toBe(true);
        });

        it("should add the AttrList to the Model object", function () {
            Person.hasMany("friends");
            expect(Person.attribute("friends")).not.toBeUndefined();
            expect(Person.attribute("friends") instanceof AttrList).toBe(true);
        });

        it("should return the AttrList so it can be cascaded", function () {
            var al = Person.hasMany("friends");
            expect(al instanceof AttrList).toBe(true);
        });

        it("should be callable twice on the same spec", function() {
            var al = Person.hasMany("friends"),
            al2 = Person.hasMany("cats");

            expect(Person.attribute("friends")).not.toBeUndefined();
            expect(Person.attribute("cats")).not.toBeUndefined();
            expect(al instanceof AttrList).toBe(true);
            expect(al2 instanceof AttrList).toBe(true);
        });

        it("should be callable twice on 2 different specs", function() {
            var m2 = new Model(),
            al = Person.hasMany("friends"),
            al2 = m2.hasMany("cats");

            expect(Person.attribute("friends")).not.toBeUndefined();
            expect(m2.attribute("cats")).not.toBeUndefined();
            expect(al instanceof AttrList).toBe(true);
            expect(al2 instanceof AttrList).toBe(true);
        });

        it("should throw an error if the parameter is not a string", function () {
            expect(function () {
                Person.hasMany(5);
            }).toThrow(new Error("Model: hasMany parameter must be a string"));
        });
    });

    describe("attribute method", function () {
        it("should return the attribute object associated with the attribute name", function () {
            var a,
            al;

            Person.hasA("name");
            a = Person.attribute("name");
            expect(a instanceof Attr).toBe(true);
            expect(a instanceof AttrList).toBe(false);

            Person.hasMany("friends");
            al = Person.attribute("friends");
            expect(al instanceof Attr).toBe(true);
            expect(al instanceof AttrList).toBe(true);
        });

        it("should throw an error if the attribute doesn't exist", function () {
            var a;
            expect(function () {
                a = Person.attribute("name");
            }).toThrow(new Error("Model: attribute name does not exist!"));
        });

        it("should throw an error if the argument is not a string", function () {
            expect(function () {
                Person.attribute(5);
            }).toThrow(new Error("Model: expected string argument to attribute method, but recieved 5"));
        });
    });

    describe("attributes method", function () {
        it("should return an empty array if the model has no attributes", function () {
            expect(Person.attributes()).toEqual([]);
        });

        it("should return an array of Model attribute names", function () {
            Person.hasA("firstName");
            Person.hasA("lastName");
            Person.hasAn("id");
            expect(Person.attributes().length === 3).toBe(true);
            expect(Person.attributes().indexOf("firstName") > -1).toBe(true);
            expect(Person.attributes().indexOf("lastName") > -1).toBe(true);
            expect(Person.attributes().indexOf("id") > -1).toBe(true);
        });


        it("should work when the model is created using a specification function", function () {
            var Person = new Model(function () {
                this.hasA("firstName");
                this.hasA("lastName");
                this.hasAn("id");
            });

            expect(Person.attributes().length === 3);
            expect(Person.attributes().indexOf("firstName") > -1).toBe(true);
            expect(Person.attributes().indexOf("lastName") > -1).toBe(true);
            expect(Person.attributes().indexOf("id") > -1).toBe(true);
        });

        it("should return an array of Model attribute names even if created via a model specification", function () {
            var Person = new Model(function () {
                this.hasA("firstName");
                this.hasA("lastName");
                this.hasA("job");
            });

            var Employee = new Model(function () {
                this.isA(Person);
                this.hasA("salary");
            });

            Person.hasA("thing");

            expect(Person.attributes().length === 4).toBe(true);
            expect(Person.attributes().indexOf("firstName") > -1).toBe(true);
            expect(Person.attributes().indexOf("thing") > -1).toBe(true);
            expect(Person.attributes().indexOf("job") > -1).toBe(true);
        });
    });

    describe("methods method", function () {
        it("should return an empty array if the model has no methods", function () {
            expect(Person.methods()).toEqual([]);
        });

        it("should return an array of Model method names", function () {
            Person.respondsTo("runsForOffice", function () {});
            Person.respondsTo("somethingElse", function () {});
            expect(Person.methods().length === 2);
            expect(Person.methods().indexOf("runsForOffice") > -1).toBe(true);
            expect(Person.methods().indexOf("somethingElse") > -1).toBe(true);
        });
    });

    describe("method method", function () {
        it("should return the method object associated with the method name", function () {
            var m;
            Person.respondsTo("isAwesome", function () {
                return true;
            });

            m = Person.method("isAwesome");

            expect(m instanceof Method).toBe(true);
        });

        it("should throw an error if the method doesn't exist", function () {
            var m;
            expect(function () {
                m = Person.method("isAwesome");
            }).toThrow(new Error("Model: method isAwesome does not exist!"));
        });

        it("should throw an error if the argument is not a string", function () {
            expect(function () {
                Person.method(5);
            }).toThrow(new Error("Model: expected string argument to method method, but recieved 5"));
        });
    });

    describe("isA method", function () {
        var Person, 
            Employee,
            e,
            p;

        beforeEach(function () {
            Person = new Model(function () {
                this.hasA("firstName");
                this.hasA("lastName");
                this.hasMany("friends");

                this.respondsTo("sayHello", function () {
                    return "hello from " + this.firstName();
                });
            });
           
            Employee = new Model(function () {
                this.isA(Person);
                this.hasA("salary").which.validatesWith(function (salary) {
                    return typeof(salary) === "number";
                });

                this.respondsTo("sayHello", function () {
                    return "hello from employee " + this.firstName() + " who has salary " + this.salary();
                });
            });
        });

        it("should throw an error if the argument is not a Model", function () {
            expect(function () {
                Person = new Model(function () {
                    this.isA(5);
                });
            }).toThrow(new Error("Model: parameter sent to isA function must be a Model"));

            expect(function () {
                Person = new Model(function () {
                    this.isA(function () { });
                });
            }).toThrow(new Error("Model: parameter sent to isA function must be a Model"));

            expect(function () {
                Person = new Model(function () {
                    this.hasA("name");
                });

                Employee = new Model(function () {
                    this.isA(Person);
                    this.hasA("salary");
                });
            }).not.toThrow(new Error("Model: parameter sent to isA function must be a Model"));
        });

        it("should throw an error if multiple inheritance is attempted", function () {
            var Car = new Model(),
                Pickup = new Model(),
                ElCamino;
            
            expect(function () {
                ElCamino = new Model(function () {
                    this.isA(Car);
                    this.isA(Pickup);
                });
            }).toThrow("Model: Model only supports single inheritance at this time");
        });

        it("should give all properties of argument model to this model", function () {
            var e2;
            e = new Employee();
            p = new Person();

            expect(e.firstName).not.toBeUndefined();
            expect(e.lastName).not.toBeUndefined();
            expect(e.friends).not.toBeUndefined();
            expect(e.salary).not.toBeUndefined();
            expect(p.salary).toBeUndefined();


            e.firstName("Semmy").lastName("Purewal").salary(5000);
            p.firstName("John").lastName("Frimmell");
            expect(e.firstName()).toBe("Semmy");
            expect(e.lastName()).toBe("Purewal");
            expect(e.salary()).toBe(5000);
            expect(p.firstName()).toBe("John");
            expect(p.lastName()).toBe("Frimmell");

            e2 = new Employee();
            e2.firstName("Mark").lastName("Phillips").salary(5001);

            expect(e2.firstName()).toBe("Mark");
            expect(e2.lastName()).toBe("Phillips");
            expect(e2.salary()).toBe(5001);
            expect(e.firstName()).toBe("Semmy");
            expect(e.lastName()).toBe("Purewal");
            expect(e.salary()).toBe(5000);
        });

        it("methods in current model should override any methods in previous model", function () {
            e = new Employee();
            p = new Person();
            
            e.firstName("John").salary(5000);
            p.firstName("Semmy");

            expect(e.sayHello()).toEqual("hello from employee John who has salary 5000");
            expect(p.sayHello()).toEqual("hello from Semmy");
        });

        it("should not be immutable if the parent model is not immutable", function () {
            Person = new Model(function () {
                this.hasA("firstName");
                this.hasA("lastName");
                this.isImmutable();
                this.isBuiltWith("firstName", "lastName");
            });

            p = new Person("hello","world");
            expect(p.firstName()).toBe("hello");
            expect(p.lastName()).toBe("world");

            Employee = new Model(function () {
                this.isA(Person);
                this.hasA("salary");
                this.isBuiltWith("lastName");
            });

            expect(function () {
                p = new Person("semmy");
            }).toThrow("Constructor requires firstName, lastName to be specified");

            expect(function () {
                e = new Employee();
                e.lastName("hello");
                e.lastName("world");
            }).not.toThrow();

            expect(e.lastName()).toBe("world");

            expect(function () {
                p = new Person("john", "resig");
                p.lastName("smith");
            }).toThrow("cannot set the immutable property lastName after it has been set");

        });

        it("objects of the resulting model should be an instanceof argument model", function () {
            e = new Employee();
            p = new Person();
            expect(e instanceof Employee).toBe(true);
            expect(e instanceof Person).toBe(true);
            expect(p instanceof Person).toBe(true);
            expect(p instanceof Employee).toBe(false);
        });

        it("should allow for deeper inheritance hierarchies", function () {
            var A, B, C, D, E, a, b, c, d, e;

            A = new Model();
            B = new Model(function () {
                this.isAn(A);
            });
            C = new Model(function () {
                this.isA(B);
            });
            D = new Model(function () {
                this.isA(B);
            });
            E = new Model(function () {
                this.isA(D);
            });

            a = new A();
            b = new B();
            c = new C();
            d = new D();
            e = new E();
            
            expect(a instanceof A).toBe(true);
            expect(a instanceof B).toBe(false);
            expect(a instanceof C).toBe(false);
            expect(a instanceof D).toBe(false);
            expect(a instanceof E).toBe(false);
            expect(b instanceof B).toBe(true);
            expect(b instanceof A).toBe(true);
            expect(b instanceof C).toBe(false);
            expect(b instanceof D).toBe(false);
            expect(b instanceof E).toBe(false);
            expect(c instanceof C).toBe(true);
            expect(c instanceof B).toBe(true);
            expect(c instanceof D).toBe(false);
            expect(c instanceof E).toBe(false);
            expect(d instanceof A).toBe(true);
            expect(d instanceof B).toBe(true);
            expect(d instanceof C).toBe(false);
            expect(d instanceof D).toBe(true);
            expect(d instanceof E).toBe(false);
            expect(e instanceof A).toBe(true);
            expect(e instanceof B).toBe(true);
            expect(e instanceof C).toBe(false);
            expect(e instanceof D).toBe(true);
            expect(e instanceof E).toBe(true);

        });

        it("should create different attrs for each instance of the submodel", function () {
            var A,
                a1,
                a2,
                B,
                b1,
                b2;

            A = new Model(function () {
                this.hasA("thing");
            });

            B = new Model(function () {
                this.isAn(A);
            });

            a1 = new A();
            a2 = new A();

            expect(a1.thing()).toBeUndefined();
            expect(a2.thing()).toBeUndefined();
            a1.thing(5);
            expect(a1.thing()).toBeDefined();
            expect(a2.thing()).toBeUndefined();

            b1 = new B();
            b2 = new B();

            expect(b1.thing()).toBeUndefined();
            expect(b2.thing()).toBeUndefined();
            b1.thing(5);
            expect(b1.thing()).toBeDefined();
            expect(b2.thing()).toBeUndefined();
        });

        it("should create different attr lists for each instance of the submodel", function () {
            var A,
                a,
                B,
                b1,
                b2;

            A = new Model(function () {
                this.hasMany("things");
            });

            B = new Model(function () {
                this.isAn(A);
            });

            a = new A();
            expect(a.things).toBeDefined();
            expect(a.things().size()).toBe(0);

            a.things().add(5);
            a.things().add(6);
            expect(a.things().size()).toBe(2);

            b1 = new B();
            expect(b1.things).toBeDefined();
            expect(b1.things()).toBeDefined();
            expect(b1.things().size()).toBe(0);
            b1.things().add(7);
            expect(b1.things().size()).toBe(1);

            b2 = new B();
            expect(b2.things).toBeDefined();
            expect(b2.things().size()).toBe(0);
        });

        it("should offer access to the super classes initializer function", function () {
            var initializer,
                A,
                a,
                B,
                B2,
                b,
                b2,
                spy = jasmine.createSpy();
            
            initializer = function () {
                var i;
                for (i = 0; i < 10; ++i) {
                    this.things().add(i);
                }
                spy();
            };
            
            A = new Model(function () {
                this.hasMany("things").eachOfWhich.isA("number");
                this.isBuiltWith(initializer);
            });

            a = new A();
            expect(a.things()).toBeDefined();
            expect(spy).toHaveBeenCalled();
            expect(spy.calls.length).toEqual(1);
            expect(a.things().at(0)).toBe(0);
            expect(a.things().size()).toBe(10);

            B = new Model(function () {
                this.isAn(A);
                this.isBuiltWith(this.parent);
            });

            b = new B();
            expect(b.things()).toBeDefined();


            //this is 3 because it creates a prototype object, too
            expect(spy.calls.length).toEqual(3);
            expect(b.things().at(0)).toBe(0);
            expect(b.things().size()).toBe(10);

            B2 = new Model(function () {
                var that = this;

                this.isAn(A);
                this.isBuiltWith(function () {
                    that.parent.apply(this,arguments);
                });
            });

            b2 = new B2();

            //this is 5 because it creates a prototype object, too
            expect(spy.calls.length).toEqual(5);
            expect(b2.things().at(0)).toBe(0);
            expect(b2.things().size()).toBe(10);

            var c = new B();
            expect(c.things).toBeDefined();
            expect(c.things().at(0)).toBe(0);
            expect(c.things().size()).toBe(10);
            
            c.things().add(20);
            expect(c.things().size()).toBe(11);
            expect(a.things().size()).toBe(10);
            expect(b.things().size()).toBe(10);

            expect(c instanceof B).toBe(true);
            expect(b instanceof A).toBe(true);
            expect(b2 instanceof B2).toBe(true);
            expect(b instanceof B2).toBe(false);
            expect(b2 instanceof B).toBe(false);
        });

        ///hmmmmm
        xit("should not clobber constructor variables when parent initializer is called", function () {
            var Person, Employee, e;

            Person = new Model(function () {
                this.hasA("name");
                this.hasAn("age");
                this.isBuiltWith("name", function () {
                    this.age(18);
                });
            });

            Employee = new Model(function () {
                var that = this;

                this.isA(Person);

                this.isBuiltWith("name", function () {
                    that.parent.apply(this, [this.name()]);
                });
            });

            e = new Employee("Mark");

            expect(e.age()).toBe(18);
            expect(e.name()).toBe("Mark");
        });

        it("should not throw an error if isBuiltWith is specified in the super-model", function () {
            Person = new Model(function () {
                this.hasA("name");
                this.hasAn("id");
                this.isBuiltWith("name", "id");
            });

            Employee = new Model(function () {
                this.isA(Person);
                this.hasA("salary");
            });

            expect(function () {
                e = new Employee();
            }).not.toThrow(new Error("Constructor requires name to be specified"));

            expect(function () {
                p = new Person("semmy");
            }).toThrow(new Error("Constructor requires name, id to be specified"));
        });

        /* this feature has been deprecated until we can find a better way to 
         * allow for non primitive 'isA' types
         */
        xit("should allow circular isA references", function () {
            var Human, Ferret;

            Ferret = new Model();

            Human = new Model(function () {
                this.hasA("ferret").which.isA(Ferret);
                this.hasA("name").which.isA("string");
                this.isBuiltWith("name");
            });

            var Person = new Model(function () {
                this.hasA("ferret").which.validatesWith(function (ferret) {
                    return ferret instanceof Ferret;
                });
                this.hasA("name").which.isA("string");
                this.isBuiltWith("name");
            });

            Ferret = new Model(function () {
                this.hasA("owner").which.isA(Human);
                this.hasA("name").which.isA("string");
                this.isBuiltWith("name");
            });

            var ferret = new Ferret("moe");
            var human = new Human("curly");
            var person = new Person("larry");

            expect(function () {
                person.ferret(ferret);
            }).not.toThrow();
            human.ferret(ferret);
            ferret.owner(human);
        });
    });
        
    describe("isImmutable method", function ()  {
        it("should be defined", function () {
            expect(Person.isImmutable).toBeDefined();
        });

        it("should make all attributes immutable when the constructor is called", function () {
            var p,
                Person = new Model(function () {
                    this.isImmutable();
                    this.hasA("firstName");
                    this.hasA("lastName");
                    this.isBuiltWith("firstName", "lastName");
                });

            p = new Person("hello", "world");
            expect(p.firstName()).toBe("hello");
            expect(function () {
                p.firstName("newname");
            }).toThrow(new Error("cannot set the immutable property firstName after it has been set"));

            expect(p.lastName()).toBe("world");
            expect(function () {
                p.lastName("newlastname");
            }).toThrow(new Error("cannot set the immutable property lastName after it has been set"));
        });
    });


    describe("instance resulting from model", function () {
        describe("toJSON method", function () {
            var Dog;

            beforeEach(function () {
                Dog = new Model(function () {
                    this.hasA("name").which.isA("string");
                    this.hasAn("owner").which.validatesWith(function (owner) {
                        return owner instanceof Person;
                    });
                });

                Person.hasA("name").which.isA("string");
                Person.hasAn("id").which.isAn("integer");

                Person.hasA("dog").which.validatesWith(function (dog) {
                    return dog instanceof Dog;
                });
            });

            it("should exist", function () {
                var p = new Person();
                expect(p.toJSON).not.toBeUndefined();
            });

            it("should return a JSON object that includes all attributes of the model", function () {
                var p,
                    p2,
                    d = new Dog(),
                    pJSON,
                    dJSON;

                Person.hasA("friend").which.validatesWith(function (friend) {
                    return friend instanceof Person;
                });

                p = new Person();
                p2 = new Person();

                p2.name("Mark").id(5555);
                p.name("Semmy").id(1234).friend(p2);
                p2.friend(p);
                d.name("Gracie").owner(p);
                p.dog(d);
                p2.dog(d);

                pJSON = p.toJSON();
                dJSON = d.toJSON();
                expect(pJSON.name).not.toBe(undefined);

                expect(pJSON.name).toBe("Semmy");
                expect(pJSON.id).toBe(1234);
                expect(pJSON.dog).not.toBeUndefined();
                expect(pJSON.dog.name).toBe("Gracie");
                expect(pJSON.dog.owner).not.toBe(undefined);
                expect(pJSON.dog.owner.name).toBe("Semmy");
                expect(pJSON.dog.owner.dog).not.toBeUndefined();
                expect(pJSON.dog.owner.dog.name).toBe("Gracie");

                expect(dJSON.name).not.toBe(undefined);
                expect(dJSON.name).toBe("Gracie");
                expect(dJSON.owner).not.toBe(undefined);
                expect(dJSON.owner.name).toBe("Semmy");
            });


            it("should also work when the model instance has an attr_list", function () {
                var p,
                    p2,
                    pJSON;
                
                Person.hasMany("friends").eachOfWhich.validatesWith(function (friend) {
                    return friend instanceof Person;
                });

                Person.isBuiltWith("name", "id", "%dog", "%friends");
                Dog.isBuiltWith("name", "%owner");

                p = new Person("Semmy", 12345, new Dog("Gracie"), [new Person("Mark", 5555)]);

                pJSON = p.toJSON();
                expect(pJSON.name).toBe("Semmy");
                expect(pJSON.id).toBe(12345);
                expect(pJSON.dog.name).toBe("Gracie");
                expect(pJSON.friends).toBeDefined();
                expect(pJSON.friends.length).toBeDefined();
                expect(pJSON.friends.length).toBe(1);

                p2 = new Person("John", 7777, new Dog("Spot"));
                p2.friends().add(p);
                p.friends().add(p2);

                expect(p2.toJSON().friends).toBeDefined();
                expect(p2.toJSON().friends.length).toBeDefined();
                expect(p2.toJSON().friends.length).toBe(1);
                expect(p2.toJSON().friends[0].name).toBe("Semmy");

                expect(p.toJSON().friends.length).toBe(2);
                expect(p.toJSON().friends[1].name).toBe("John");
                expect(p.toJSON().friends[1].dog.name).toBe("Spot");
            });

            it("should not throw an error when called on a null value", function () {
                var p, pJSON;

                Person.hasA("nullValue");

                p = new Person();
                p.nullValue(null);

                expect(function () {
                    pJSON = p.toJSON();
                }).not.toThrow();

                expect(pJSON).not.toBeUndefined();
                expect(pJSON.nullValue).toBeNull();
            });
        });
    });

    describe("EventEmitter functionality", function () {
        var p,
            spy1,
            spy2;

        beforeEach(function () {
            Person.hasA("name");
            Person.hasAn("id");
            Person.hasA("friend");
            spy1 = jasmine.createSpy();
            spy2 = jasmine.createSpy();
        });


        // this is temporary until we get all the bugs
        // worked out with attr change listeners
        // right now, attr lists should not have change event listeners
        xit("should not add change listeners to attr list", function () {
            Person.hasMany("things");
            spyOn(Person.attribute("things"), "on");
            expect(Person.attribute("things").on).not.toHaveBeenCalled();
            var p = new Person();
            expect(Person.attribute("things").on).not.toHaveBeenCalled();            
        });

        // this was a bug, but I had to add to the public API
        xit("should not increment the listeners associated with the last object created", function () {
            var Dog = new Model(function () {
                this.hasA("breed").which.isA("string");
                this.isBuiltWith("breed");
            });

            var Person = new Model(function () {
                this.hasA("name").which.isA("string");
                this.hasA("dog").which.validatesWith(function (dog) {
                    return dog instanceof Dog;
                });
                this.isBuiltWith("name");
            });

            var s = new Person("Semmy");
            var m = new Person("Mark");
            var d1 = new Dog("chow");
            var d2 = new Dog("shepherd");

            s.dog(d1);

            expect(s.attrChangeListeners().dog).not.toBeUndefined();
            expect(m.attrChangeListeners().dog).toBeUndefined();
        });

        it("should create an object that has an 'on' method and an 'emitter' method", function () {
            p = new Person();
            expect(p.on).toBeDefined();
            expect(typeof(p.on)).toBe("function");
            expect(p.emitter).toBeDefined();
            expect(typeof(p.emitter)).toBe("function");
            expect(p.emitter() instanceof window.jermaine.util.EventEmitter);
        });

        it("should create an object that emits a 'change' event when an attribute is changed", function () {
            p = new Person();
            p.on("change", spy1);
            p.name("semmy");
            p.id(1234);
            expect(spy1).toHaveBeenCalled();
            expect(spy1.callCount).toBe(2);
            expect(spy1).toHaveBeenCalledWith([{key:"name", value:"semmy", origin:p}]);
            expect(spy1).toHaveBeenCalledWith([{key:"id", value:1234, origin:p}]);
        });

        it("should emit appropriate events when it contains a submodel (hasA) that changes", function () {
            var Dog,
                d;

            Dog = new Model(function () {
                this.hasA("name");
                this.hasA("breed");
            });

            d = new Dog();
            d.name("Star").breed("Chow/Sheperd mix");

            Person.hasA("dog").which.validatesWith(function (dog) {
                return d instanceof Dog;
            });

            p = new Person();

            p.name("semmy").id(1234).dog(d);

            p.on("change", spy1);

            p.dog().name("Grace");
            expect(spy1).toHaveBeenCalled();
            expect(spy1).toHaveBeenCalledWith([{key:"name", value:"Grace", origin:d}, {key:"dog", origin:p}]);
        });

        it("should call an event emitter only when the instance of the model changes, not when an instance of another" +
           " model changes", function () {
            var p1, p2;
            p1 = new Person();
            p2 = new Person();

            p1.name("semmy");
            p2.name("mark");
            expect(spy1.callCount).toBe(0);
            expect(spy2.callCount).toBe(0);

            p1.on("change", spy1);
            p2.on("change", spy2);

            p1.name("bill");

            expect(spy1.callCount).toBe(1);
            expect(spy2.callCount).toBe(0);
        });

        it("should not emit infinite events on circular attributes", function () {
            var p1, p2;
            p1 = new Person();
            p2 = new Person();

            p1.name("semmy");
            p2.name("mark");

            expect(p1.emitter().listeners("change").length).toBe(0);
            expect(p2.emitter().listeners("change").length).toBe(0);

            expect(spy1.callCount).toBe(0);
            expect(spy2.callCount).toBe(0);

            p1.emitter().on("change", function (data) {
                spy1(data);
            });
            expect(p1.emitter().listeners("change").length).toBe(1);

            p2.emitter().on("change", spy2);

            expect(p2.emitter().listeners("change").length).toBe(1);

            p1.friend(p2);
            expect(spy1).toHaveBeenCalledWith([{key:"friend", value:p2, origin:p1}]);
            expect(p2.emitter().listeners("change").length).toBe(2);

            expect(spy1.callCount).toBe(1);
            expect(spy2.callCount).toBe(0);

            p2.name("mark");


            expect(spy2.callCount).toBe(1);
            expect(spy2).toHaveBeenCalledWith([{key:"name", value:"mark", origin:p2}]);

            expect(spy1.callCount).toBe(2);
            expect(spy1).toHaveBeenCalledWith([{key:"name", value:"mark", origin:p2}, {key:"friend", origin: p1}]);


            //should not cause an infinite loop
            p2.friend(p1);

            expect(spy2.callCount).toBe(2);
            expect(spy2).toHaveBeenCalledWith([{key:"friend", value:p1, origin:p2}]);
            expect(spy1.callCount).toBe(3);
            expect(spy1).toHaveBeenCalledWith([{key:"friend", value:p1, origin:p2}, {key:"friend", origin:p1}]);
        });

        it("should pass this second circular attribute test", function () {
            var Dog,
                Person,
                p1, p2,
                d1, d2, 
                spyp1 = jasmine.createSpy(),
                spyp2 = jasmine.createSpy(),
                spyd1 = jasmine.createSpy(),
                spyd2 = jasmine.createSpy();
            

            Dog = new Model(function () {
                this.hasAn("owner").which.validatesWith(function (owner) {
                    return owner instanceof Person;
                });
            });

            Person = new Model(function () {
                this.hasA("dog").which.validatesWith(function (dog) {
                    return dog instanceof Dog;
                });

                this.hasA("friend").which.validatesWith(function (friend) {
                    return friend instanceof Person;
                });
                
                this.respondsTo("hasADog", function (dog) {
                    this.dog(dog);
                    dog.owner(this);
                });

                this.respondsTo("isFriendsWith", function (friend) {
                    this.friend(friend);
                    friend.friend(this);
                });
            });

            p1 = new Person();
            p2 = new Person();
            d1 = new Dog();
            d2 = new Dog();

            p1.on("change", spyp1);
            d1.on("change", spyd1);
            p2.on("change", spyp2);
            d2.on("change", spyd2);

            p1.isFriendsWith(p2);
            expect(spyp1.callCount).toBe(2); //p1's friend changes, then p2 (a subobject of p1)'s friend changes
            expect(spyp1).toHaveBeenCalledWith([{key:"friend", value:p2, origin:p1}]);
            expect(spyp1).toHaveBeenCalledWith([{key:"friend", value:p1, origin:p2}, {key:"friend", origin:p1}]);
            expect(spyp2.callCount).toBe(1); //p2's friend changes
            expect(spyp2).toHaveBeenCalledWith([{key:"friend", value:p1, origin:p2}]);
            expect(spyd1.callCount).toBe(0);
            expect(spyd2.callCount).toBe(0);

            p1.hasADog(d1);
            expect(spyp1.callCount).toBe(4); //p1's dog changes, then d1 (a subobject of d1)'s dog changes
            expect(spyp1).toHaveBeenCalledWith([{key:"dog", value:d1, origin:p1}]);
            expect(spyp1).toHaveBeenCalledWith([{key:"owner", value:p1, origin:d1}, {key:"dog", origin:p1}]);

            expect(spyp2.callCount).toBe(3);
            expect(spyp2).toHaveBeenCalledWith([{key:"dog", value:d1, origin:p1}, {key:"friend", origin:p2}]);
            expect(spyp2).toHaveBeenCalledWith([{key:"owner", value:p1, origin:d1}, {key:"dog", origin:p1}, {key:"friend", origin:p2}]);


            expect(spyd1.callCount).toBe(1);
            expect(spyd1).toHaveBeenCalledWith([{key:"owner", value:p1, origin:d1}]);
            expect(spyd2.callCount).toBe(0); //no change spyd2

            p2.hasADog(d2);
            expect(spyp2.callCount).toBe(5);

            //as a result of p2's dog changing
            expect(spyp2).toHaveBeenCalledWith([{key:"dog", value:d2, origin:p2}]);
            expect(spyp1).toHaveBeenCalledWith([{key:"dog", value:d2, origin:p2}, {key:"friend", origin:p1}]);
            expect(spyd1).toHaveBeenCalledWith([{key:"dog", value:d2, origin:p2}, {key:"friend", origin:p1},
                                                {key:"owner", origin:d1}]);

            //as a result of d2's owner changing
            expect(spyd2.callCount).toBe(1);
            expect(spyd2).toHaveBeenCalledWith([{key:"owner", value:p2, origin:d2}]);
            expect(spyp2).toHaveBeenCalledWith([{key:"owner", value:p2, origin:d2}, {key:"dog", origin:p2}]);
           

            expect(spyp1.callCount).toBe(6);
            expect(spyp1).toHaveBeenCalledWith([{key:"owner", value:p2, origin:d2},{key:"dog", origin:p2},
                                                {key:"friend", origin:p1}]);
            expect(spyp1).toHaveBeenCalledWith([{key:"dog", value:d2, origin:p2}, {key:"friend", origin:p1}]);
        });

        it("should cascade 'change' events emitted from composed objects", function () {
            var Person,
                Dog,
                p,
                dog1,
                dog2,
                spy = jasmine.createSpy();

            Person = new Model(function () {
                this.hasA("name").which.isA("string");
                this.hasA("dog").which.validatesWith(function (dog) {
                    return dog instanceof Dog;
                });
                this.isBuiltWith("name");
            });

            Dog = new Model(function () {
                this.hasA("name").which.isA("string");
                this.isBuiltWith("name");
            });

            p = new Person("semmy");
            dog1 = new Dog("gracie");
            dog2 = new Dog("chico");

            p.on("change", spy);
            expect(p.emitter().listeners("change").length).toBe(1);

            expect(p.dog).toBeDefined();
            p.dog(dog1);
            expect(dog1.emitter().listeners("change").length).toBe(1);
            expect(p.dog()).toBe(dog1);
            expect(spy).toHaveBeenCalled();
            expect(spy.callCount).toBe(1);
            expect(spy).toHaveBeenCalledWith([{key:"dog", value:dog1, origin:p}]);

            dog1.name("ally");

            expect(spy.callCount).toBe(2);
            expect(spy).toHaveBeenCalledWith([{key:"name", value:"ally", origin:dog1}, {key:"dog", origin:p}]);

            expect(dog1.emitter().listeners("change").length).toBe(1);
            expect(dog2.emitter().listeners("change").length).toBe(0);
            p.dog(dog2);
            expect(dog1.emitter().listeners("change").length).toBe(0);
            expect(dog2.emitter().listeners("change").length).toBe(1);

            expect(spy.callCount).toBe(3);
            expect(spy).toHaveBeenCalledWith([{key:"dog", value:dog2, origin:p}]);

            //should not call the p's spy since dog1 is no longer attached to p1
            dog1.name("loki");
            expect(spy.callCount).toBe(3);

            dog2.name("layla");
            expect(spy.callCount).toBe(4);
            expect(spy).toHaveBeenCalledWith([{key:"name", value:"layla", origin:dog2}, {key:"dog", origin:p}]);

            p.dog(dog1);
            expect(spy.callCount).toBe(5);
            
            dog2.name("beau");
            expect(spy.callCount).toBe(5);

            dog1.name("howie");
            expect(spy.callCount).toBe(6);
        });


        it("should allow changes to and from null value without causing an error", function () {
            var p,
                Dog,
                d1, d2;

            Dog = new Model(function () {
                this.hasA("name").which.isA("string");
                this.isBuiltWith("name");
            });

            Person = new Model(function () {
                this.hasA("name").which.isA("string");
                this.hasA("dog").which.validatesWith(function (dog) {
                    return (dog instanceof Dog || dog === null);
                });
                this.isBuiltWith("name");
            });


            d1 = new Dog("Gracie");
            d2 = new Dog("Loki");

            expect(d1.emitter().listeners("change").length).toBe(0);
            expect(d2.emitter().listeners("change").length).toBe(0);

            p = new Person("Semmy");
            expect(p.dog()).toBeUndefined();
            p.dog(null);
           
            expect(p.dog()).toBeNull();

            expect(d1.emitter().listeners("change").length).toBe(0);
            expect(d2.emitter().listeners("change").length).toBe(0);

            expect(function () {
                p.dog(d1);
            }).not.toThrow();

            expect(p.dog().name()).toBe("Gracie");
            expect(d1.emitter().listeners("change").length).toBe(1);
            expect(d2.emitter().listeners("change").length).toBe(0);

            expect(function () {
                p.dog(null);
            }).not.toThrow();

            expect(d1.emitter().listeners("change").length).toBe(0);
            expect(d2.emitter().listeners("change").length).toBe(0);
            
            expect(p.dog()).toBe(null);

            p.dog(d2);

            expect(p.dog().name()).toBe("Loki");
            expect(d1.emitter().listeners("change").length).toBe(0);
            expect(d2.emitter().listeners("change").length).toBe(1);
        });


        it("should emit a change event when adding an element to a list", function () {
            var p,
                addSpy = jasmine.createSpy();

            Person = new Model(function () {
                this.hasA("name").which.isA("string");
                this.hasMany("aliases").eachOfWhich.isA("string");
            });

            p = new Person();

            p.on("change", addSpy);
            p.name("Semmy");

            expect(addSpy).toHaveBeenCalled();
            expect(addSpy.callCount).toBe(1);
            p.aliases().add("name1");
            expect(addSpy.callCount).toBe(2);
            expect(addSpy).toHaveBeenCalledWith([{key:"name", value:"Semmy", origin:p}]);
            expect(addSpy).toHaveBeenCalledWith([{action:"add", key:"aliases", value:"name1", origin:p}]);
        });

        it("should cascade change events when an object is added to a submodel's list", function () {
            var p,
                Dog,
                d,
                changeSpy = jasmine.createSpy();

            Dog = new Model(function () {
                this.hasA("name");
                this.hasMany("aliases").eachOfWhich.isA("string");
                this.isBuiltWith("name");
            });

            Person = new Model(function () {
                this.hasA("name").which.isA("string");
                this.hasA("dog").which.validatesWith(function (dog) {
                    return (dog instanceof Dog || dog === null);
                });
                this.isBuiltWith("name");
            });

            p = new Person("Semmy");
            p.on("change", changeSpy);
            
            d = new Dog("Loki");

            p.dog(d);
            expect(changeSpy).toHaveBeenCalled();
            expect(changeSpy.callCount).toBe(1);
            expect(changeSpy).toHaveBeenCalledWith([{key:"dog", value:d, origin:p}]);
            
            d.name("Gracie");
            expect(changeSpy.callCount).toBe(2);
            expect(changeSpy).toHaveBeenCalledWith([{key:"name", value:"Gracie", origin:d}, {key:"dog", origin:p}]);

            p.dog().aliases().add("Sugar Pie");
            expect(changeSpy.callCount).toBe(3);
            expect(changeSpy).toHaveBeenCalledWith([{action:"add", key:"aliases", value:"Sugar Pie", origin:d}, {key:"dog", origin:p}]);

            p.dog().aliases().add("Sweetie");
            expect(changeSpy.callCount).toBe(4);
            expect(changeSpy).toHaveBeenCalledWith([{action:"add", key:"aliases", value:"Sweetie", origin:d}, {key:"dog", origin:p}]);
        });


        describe("on method", function () {
            //this functionality is temporarily deprecated unless it is needed.
            //if it is, the current function can be replaced with this:
            /*var that = this;
              this.on = function (event, listener) {
                  that.emitter().on(event, function (data) {
                      listener.call(that, data);
                  });
              };*/
            it("should reference 'this' as the current object, and not the underlying event emitter", function () {
                var p = new Person();
                p.on("change", function () {
                    expect(this instanceof Person).toBe(true);
                });
                p.name("semmy");                
            });
        });


    });

    describe("isBuiltWith method", function () {
        it("should take any number of string parameters", function () {
            expect(function () {
                Person.isBuiltWith("larry", "moe", 3.4);
            }).toThrow(new Error("Model: isBuiltWith parameters must be strings except for a function as the optional " +
                                 "final parameter"));
            expect(function () {
                Person.isBuiltWith("larry", 3.4, "moe", "curly");
            }).toThrow(new Error("Model: isBuiltWith parameters must be strings except for a function as the optional " +
                                 "final parameter"));
            expect(function () {
                Person.isBuiltWith("larry", "moe", "curly", "semmy", "john");
            }).not.toThrow(new Error("Model: isBuiltWith parameters must be strings except for a function as the " +
                                     "optional final parameter"));
            //s = new Model();
            expect(function () {
                Person.isBuiltWith("larry", "curly", "moe", "semmy", "john", "mark", "anotherMark");
            }).not.toThrow(new Error("Model: isBuiltWith parameters must be strings except for a function as the " +
                                     "optional final parameter"));
        });


        it("should accept a function as an optional final argument", function () {
            var f = function () {
                return true;
            },  g = function () {
                return false;
            };
            expect(function () {
                Person.isBuiltWith("larry", "moe", f, g);
            }).toThrow(new Error("Model: isBuiltWith parameters must be strings except for a function as the optional " +
                                 "final parameter"));
            expect(function () {
                Person.isBuiltWith("larry", "moe", g, "curly", "semmy", "john");
            }).toThrow(new Error("Model: isBuiltWith parameters must be strings except for a function as the optional " + 
                                 "final parameter"));
            expect(function () {
                Person.isBuiltWith("larry", f);
            }).not.toThrow(new Error("Model: isBuiltWith parameters must be strings except for a function as the " + 
                                     "optional final parameter"));
        });

        it("should accept strings preceded with a % as the final parameters before the optional function", function () {
            expect(function () {
                Person.isBuiltWith("larry", "%moe", "curly");
            }).toThrow(new Error("Model: isBuiltWith requires parameters preceded with a % to be the final " + 
                                 "parameters before the optional function"));
            expect(function () {
                Person.isBuiltWith("larry", "moe", "curly", "%semmy");
            }).not.toThrow(new Error("Model: isBuiltWith requires parameters preceded with a % to be the final " +
                                     "parameters before the optional function"));
            expect(function () {
                Person.isBuiltWith("larry", "moe", "curly", "%semmy", "%john", function () { return false; });
            }).not.toThrow(new Error("Model: isBuiltWith requires parameters preceded with a % to be the final " + 
                                     "parameters before the optional function"));
        });


    });


    describe("looksLike method", function () {
        xit("should be way more interesting than it currently is", function () {

        });
    });

    describe("validate method", function () {
        var Person,
        m;

        beforeEach(function () {
            Person = new Model();
        });

        it("should throw an error if the object is immutable and any of the attributes aren't required in isBuiltWith",
           function () {
            var p;
            Person.hasA("firstName");
            Person.hasA("lastName");
            Person.isImmutable();
            expect(function () {
                p = new Person();
            }).toThrow(new Error("immutable objects must have all attributes required in a call to isBuiltWith"));

            Person.isBuiltWith("firstName", "lastName");

            expect(function () {
                p = new Person("hello", "world");
            }).not.toThrow(new Error("immutable objects must have all attributes required in a call to isBuiltWith"));

            expect(function () {
                p = new Person("hello");
            }).toThrow("Constructor requires firstName, lastName to be specified");

            p = new Person("hello", "world");
            
            expect(function () {
                p.firstName("newName");
            }).toThrow("cannot set the immutable property firstName after it has been set");
        });

        it("should throw an error if any of the strings are not defined as attributes but are specified in " +
           "isBuiltWith", function () {
            Person.hasA("firstName");
            Person.hasA("lastName");
            Person.hasAn("id");
            Person.isBuiltWith("firstName","lastName","ied");
            expect(function () {
                Person.validate();
            }).toThrow(new Error("ied, specified in the isBuiltWith method, is not an attribute"));

            Person.isBuiltWith("firstName","lastName","id");
            expect(function () {
                Person.validate();
            }).not.toThrow(new Error("ied, specified in the isBuiltWith method, is not an attribute"));

            Person.isBuiltWith("firstName","lastName","%ied");
            expect(function () {
                Person = Person.validate();
            }).toThrow(new Error("ied, specified in the isBuiltWith method, is not an attribute"));

            Person.isBuiltWith("firstName","lastName","%id");
            expect(function () {
                Person = Person.validate();
            }).not.toThrow(new Error("ied, specified in the isBuiltWith method, is not an attribute"));
        });

        it("should throw an error on method/attribute name collisions", function () {
            Person.hasA("firstName");
            Person.respondsTo("firstName", function () {});
            expect(function () {
                Person.validate();
            }).toThrow(new Error("Model: invalid model specification to firstName being both an attribute and method"));
        });
    });

    describe("resulting constructor function", function () {
        var s,
        Person,
        p;

        beforeEach(function () {
            Person = new Model();
            Person.hasA("name").which.validatesWith(function (name) {
                this.message = "name must be at least 3 characters";
                return name.length > 3;
            });
            
            Person.hasAn("id").which.validatesWith(function (id) {
                this.message = "id must be 9 digits";
                return 100000000 <= id && id <= 999999999;
            });

            Person.hasMany("friends").which.validateWith(function (friend) {
                this.message = "friend must be a person";
                return friend instanceof Person;
            });

            Person.respondsTo("runsForOffice", function () {
                return this.name() + " is running for office!";
            });

            Person.respondsTo("returnsNull", function () {
                return null;
            });

            Person.respondsTo("addsTwoNumbers", function (numA, numB) {
                return numA+numB;
            });
            
            p = new Person();
            p.name("Mark");

        });

        it("should return a constructor function that creates an object with all attributes", function () {
            expect(p.name).not.toBeUndefined();
            expect(p.id).not.toBeUndefined();
            expect(p.friends).not.toBeUndefined();
            expect(p.friends().add).not.toBeUndefined();
        });

        it("should not add any additional Attr methods", function () {
            expect(Person.validator).toBeUndefined();
            expect(p.validator).toBeUndefined();
            expect(p.validatesWith).toBeUndefined();
            expect(p.which).toBeUndefined();
            expect(p.and).toBeUndefined();
        });

        it("should add all specified methods to the object", function () {
            expect(p.runsForOffice).not.toBeUndefined();
            expect(p.runsForOffice()).toEqual("Mark is running for office!");
            expect(p.returnsNull).not.toBeUndefined();
            expect(p.returnsNull()).toBe(null);
            expect(p.addsTwoNumbers(3,2)).toEqual(5);
        });

        it("should allow for an empty constructor", function () {
            expect(function () {
                var p = new Person();
            }).not.toThrow();
        });

        it("should require the constructor to be called with the non-% parameters", function () {
            var Person,
            p;

            Person = new Model();
            Person.hasA("firstName");
            Person.hasA("lastName");
            Person.hasAn("id");

            Person.isBuiltWith("firstName", "lastName", "%id");

            expect(function () {
                p = new Person("semmy");
            }).toThrow(new Error("Constructor requires firstName, lastName to be specified"));

            expect(function () {
                p = new Person("semmy","purewal");
            }).not.toThrow(new Error("Constructor requires firstName, lastName to be specified"));

            expect(function () {
                p = new Person("semmy","purewal", 100);
            }).not.toThrow(new Error("Constructor requires firstName, lastName to be specified"));
        });

        it("should throw an error if the constructor is called with more arguments than isBuiltWith specifies", 
           function () {
            var Person,
                p;
            Person = new Model(function () {
                this.hasA("name").which.isA("string");
                this.hasMany("friends").eachOfWhich.validateWith(function (friend) {
                    return friend instanceof Person;
                });
            });

            expect(function () {
                p = new Person("Semmy");
            }).toThrow("Too many arguments to constructor. Expected 0 required arguments and 0 optional arguments");

    });

        it("should set the attributes associated with the attributes to the appropriate values", function () {
            var Card,
            Thing,
            t1,
            t2,
            t3,
            c;

            s = new Model();
            s.hasA("rank");
            s.hasA("suit");
            s.isBuiltWith("rank","suit");

            Card = new Model();

            Card.hasA("rank");
            Card.hasA("suit");
            Card.isBuiltWith("rank","suit");

            c = new Card("ace", "diamonds");
            
            expect(c.rank()).toBe("ace");
            expect(c.suit()).toBe("diamonds");
            expect(c.hasA).toBe(undefined);
            expect(Card.hasA).not.toBe(undefined);

            Thing = new Model();
            Thing.hasA("thing1");
            Thing.hasA("thing2");
            Thing.hasA("thing3");
            Thing.isBuiltWith("thing1", "%thing2", "%thing3");

            t1 = new Thing(5);
            t2 = new Thing(10, 20);
            t3 = new Thing(20, 30, 40);

            expect(t1.thing1()).toBe(5);
            expect(t1.thing2()).toBe(undefined);
            expect(t1.thing3()).toBe(undefined);            
            expect(t2.thing1()).toBe(10);
            expect(t2.thing2()).toBe(20);
            expect(t2.thing3()).toBe(undefined);            
            expect(t3.thing1()).toBe(20);
            expect(t3.thing2()).toBe(30);
            expect(t3.thing3()).toBe(40);
        });

        it("should require that the resulting constructor's parameters pass the appropriate validators", function () {
            var thing1Validator = jasmine.createSpy(),
            thing2Validator = jasmine.createSpy(),
            thing3Validator = jasmine.createSpy(),
            Thing,
            t1,
            t2,
            t3;

            Thing = new Model();

            Thing.hasA("thing1").which.validatesWith(function () { thing1Validator(); return true; });
            Thing.hasA("thing2").which.validatesWith(function () { thing2Validator(); return true; });
            Thing.hasA("thing3").which.validatesWith(function () { thing3Validator(); return true; });
            Thing.isBuiltWith("thing1", "%thing2", "%thing3");

            //Thing = s.create();
            t1 = new Thing(10);
            expect(thing1Validator).toHaveBeenCalled();
            expect(thing2Validator).not.toHaveBeenCalled();
            expect(thing3Validator).not.toHaveBeenCalled();

            t2 = new Thing(10, 20);
            expect(thing1Validator).toHaveBeenCalled();
            expect(thing2Validator).toHaveBeenCalled();
            expect(thing3Validator).not.toHaveBeenCalled();

            t1 = new Thing(10, 20, 30);
            expect(thing1Validator).toHaveBeenCalled();
            expect(thing2Validator).toHaveBeenCalled();
            expect(thing3Validator).toHaveBeenCalled();
        });

        //think of the optional function as an initializer that is run after the attributes are set
        //for example, consider the Deck model. In addition to setting up the hasMany("cards") attribute,
        //we'll want to create a nested for loop that creates a card of each suit/rank combination
        //that would be the 'initializer' function
        it("should call the optional function after the attributes are set in the constructor", function () {
            var initializer = jasmine.createSpy(),
            Thing,
            t1, 
            t2,
            t3;

            Thing = new Model();
            Thing.hasA("thing1");
            Thing.hasA("thing2");
            Thing.hasA("thing3");
            Thing.isBuiltWith("thing1", "%thing2", "%thing3", initializer);

            //Thing = s.create();
            t1 = new Thing(5);
            expect(initializer).toHaveBeenCalled();

            t2 = new Thing(10, 20);
            expect(initializer).toHaveBeenCalled();

            t3 = new Thing(20, 30, 40);
            expect(initializer).toHaveBeenCalled();
        });

        it("should allow for AttrList attributes to be specified by isBuiltWith and initialized with a raw array",
           function () {
            var Devil,
                satan,
                p1, p2, p3;
            
            Devil = new Model(function () {
                this.hasA("number").which.isA("integer");
                this.hasMany("names").eachOfWhich.isA("string");
                this.isBuiltWith("number", "names");
            });

            expect(function () {
                satan = new Devil(666);
            }).toThrow("Constructor requires number, names to be specified");
            
            expect(satan).toBe(undefined);
            
            expect(function () {
                satan = new Devil(666, 667);
            }).toThrow("Model: Constructor requires 'names' attribute to be set with an Array");
            
            expect(function () {
                satan = new Devil(666, ["lucifer", "beelzebub", 3]);
            }).toThrow();

            expect(satan).toBe(undefined);

            expect(function () {
                satan = new Devil(666, ["beelzebub", "lucifer", "prince of darkness"]);
            }).not.toThrow();
            
            expect(satan).not.toBe(undefined);
            
            expect(satan.names().size()).toBe(3);
            
            Person.isBuiltWith("name", "id", "%friends");

            p1 = new Person("Mark", 123456789);
            p2 = new Person("John", 223456789);

            expect(function () {
                p3 = new Person("Semmy", 323456789, [p1, p2]);
            }).not.toThrow();

            expect(p3.friends().size()).toBe(2);
        });
    });



    it("should allow for a specification function to be sent in that bootstraps the model", function () {
        var Person,
            p;

        Person = new Model(function () {
            this.hasA("firstName");
            this.hasA("lastName");
            this.hasAn("id");
            this.hasMany("friends");
            this.isBuiltWith("firstName", "lastName", "%id");
        });

        p = new Person("Mark", "Phillips");

        expect(p instanceof Person).toBe(true);
        expect(p.firstName()).toBe("Mark");
        expect(p.lastName()).toBe("Phillips");
        expect(p.id()).toBe(undefined);
        expect(Person.hasA).not.toBe(undefined);
    });

    it("should throw an error if the specification parameter is not a function", function () {
        var s;
        expect(function () {
            s = new Model(5);
        }).toThrow("Model: specification parameter must be a function");
    });


    // change the API as per Effective JavaScript
    xit("should throw an error if the constructor is not called with the new operator", function () {
        var p;

        expect(function () {
            /*jshint newcap:false */
            p = Person();
        }).toThrow("Model: instances must be created using the new operator");
    });

    it("should have a constructor that is new agnostic", function () {
        var p;
        /*jshint newcap:false */
        p = Person();
        expect(p instanceof Person).toBe(true);
    });

    it("should not throw an error when a model has a submodel defined in defaultsTo that changes", function () {
        var Dog, p;

        Dog = new Model(function () {
            this.hasA("name").which.isA("string");
            this.isBuiltWith("name");
        });

        Person.hasA("dog").which.defaultsTo(function () {
            return new Dog("Loki");
        });

        p = new Person();
        expect(p.dog().name()).toBe("Loki");

        expect(function () {
            p.dog(new Dog("Gracie"));
        }).not.toThrow();
    });



    it("should work with this example", function () {
        var Card,
        Deck,
        d,
        i,
        j,
        suits = ["clubs", "diamonds", "hearts", "spades"],
        ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];


        Card = new Model();
        Card.hasA("suit").which.isA("string").and.isOneOf(suits);
        Card.isBuiltWith('rank','suit');
        Card.hasA("rank").which.isA("string").and.isOneOf(ranks);

        Card.looksLike(function () {
            return this.rank() + " of " + this.suit();
        });

        var c = new Card("5", "diamonds");
        expect(c.toString()).toBe("5 of diamonds");
        
        expect(function () {
            c.rank(10);
        }).toThrow();

        expect(function () {
            c.rank("10");
        }).not.toThrow();

        Deck = new Model(function () {
            //this.hasMany("cards").which.isA(Card);
            this.hasMany("cards").eachOfWhich.validateWith(function (card) {
                this.message = "a card must be a valid Card object.";
                return card instanceof Card;
            });

            this.isBuiltWith(function () {
                for (i = 0; i < suits.length; ++i) {
                    for (j = 0; j < ranks.length; ++j) {
                        this.cards().add(new Card(ranks[j], suits[i]));
                    }
                }
            });
        });

        d = new Deck();

        expect(d.cards().at(0).toString()).toEqual("2 of clubs");
        expect(d.cards().at(51).toString()).toEqual("A of spades");

        expect(function () {
            d.cards().add(5);
        }).toThrow("a card must be a valid Card object.");

        expect(d.cards().at(0).toJSON()).toEqual({rank:"2", suit:"clubs"});
        expect(d.toJSON().cards.length).toBe(52);
    });

    it("should also work with this example", function () {
        var Card,
            Deck,
            suits = ["clubs", "diamonds", "hearts", "spades"],
            ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
        
        Card = new Model(function () {
            this.isImmutable();
            this.hasA("suit").which.isOneOf(suits);
            this.hasA("rank").which.isOneOf(ranks);
            this.isBuiltWith("rank","suit");
            this.looksLike(function () {
                return this.rank() + " of " + this.suit();
            });

        });

        Deck = new Model(function () {
            var rank,
            suit;

            //this.hasMany("cards").eachOfWhich.isA(Card);
            this.hasMany("cards").eachOfWhich.validateWith(function (card) {
                return card instanceof Card;
            });

            this.isBuiltWith(function () {
                for (suit = 0; suit < suits.length; suit++) {
                    for (rank = 0; rank < ranks.length; rank++) {
                        this.cards().add(new Card(ranks[rank], suits[suit]));
                    }
                }
            });

            this.looksLike(function () {
                var card,
                result = "";

                for(card = 0; card < this.cards().size(); ++card) {
                    result += this.cards().at(card).toString() + "\n";
                }

                return result;
            });
        });

        var d = new Deck();

        expect(function () {
            d.cards().add(5);
        }).toThrow("validator failed with parameter 5");

        expect(function () {
            d.cards().at(5).suit("diamonds");
        }).toThrow("cannot set the immutable property suit after it has been set");
    });


    /* deprecated until we find a good solution */
    describe("Mark's isA/validator bug", function () {
        xit("should not throw an error", function () {
            var Dog = new Model(function() {
                this.hasA("name"); //bizarre
            });
            
            var Person = new Model(function() {
                this.hasA("dog").which.isA(Dog);
            });
            
            var d = new Dog();
            var p = new Person();
            p.dog(d);
        });
    });
});
