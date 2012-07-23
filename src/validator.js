if (!window.jermaine) {
    window.jermaine = {};
}

(function (ns) {
    "use strict";
    var that = this,
        Validator;

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

    ns.Validator = Validator;
}(window.jermaine));