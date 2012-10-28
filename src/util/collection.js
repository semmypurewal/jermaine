window.jermaine.util.namespace("window.jermaine.util", function (ns) {
    "use strict";

    var Collection = function(attrlist) {
        var that = this;
        this.arr = [];
        this.actualList = {};

        this.delegate = function (obj, func) {
            return function () { return obj[func].apply(obj, arguments); };
        };

        this.actualList.add = function (obj) {
            if ((attrlist.validator())(obj)) {
                that.arr.push(obj);
                return this;         
            } else {
                throw new Error(that.errorMessage());
            }
        };

        this.actualList.pop = this.delegate(this.arr, "pop");

        this.actualList.size = function () {
            return that.arr.length;
        };

        this.actualList.contains = function(obj) {
            for(var i in that.arr) {
                if(obj === that.arr[i]) {
                    return true;
                }
            }
            return false;
        };
        
        this.actualList.replace = function (index, obj) {
            if ((typeof(index) !== 'number') || (parseInt(index, 10) !== index)) {
                throw new Error("AttrList: replace method requires index parameter to be an integer");
            }

            if (index < 0 || index >= this.size()) {
                throw new Error("AttrList: replace method index parameter out of bounds");
            }

            if (!(attrlist.validator())(obj)) {
                throw new Error(that.errorMessage());
            }

            that.arr[index] = obj;
            return this;
        };
        
        this.actualList.at = function (index) {
            if (index < 0 || index >= this.size()) {
                throw new Error("AttrList: Index out of bounds");
            }
            return that.arr[index];
        };

        //to keep things more java-y
        this.actualList.get = this.actualList.at;
        
        this.actualList.toJSON = function (JSONreps) {
            var result = [], 
            i, j;

            //check to make sure the current list is not in JSONreps
            for (i = 0;i < JSONreps.length; ++i) {
                if (JSONreps[i].object === this) {
                    result = JSONreps[i].JSONrep;
                }
            }
            
            for (i = 0; i < that.arr.length; ++i) {
                if (that.arr[i].toJSON) {
                    result.push(that.arr[i].toJSON(JSONreps));
                } else {
                    result.push(that.arr[i]);
                }
            }
            return result;
        };

    };

    ns.Collection = Collection;
});