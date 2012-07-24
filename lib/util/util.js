if (!window.util) {
    window.util = {};
}

(function (ns) {
    ns.namespace = function (ns, func) {
        var nsArray,
            currentNS,
            i,
            nsAdditions = {};

        //TODO: check to make sure ns is a properly formatted namespace string

        //TODO: confirm func is actually a function

        //parse namespace string
        nsArray = ns.split(".");

        //TODO: make sure root exists (can we do this for window?!?!?!?!)
        currentNS = window;

        //build namespace
        for (i = 1; i < nsArray.length; ++i) {
            if (currentNS[nsArray[i]] === undefined) {
                console.log("building subnamespace " + nsArray[i]);
                currentNS[nsArray[i]] = {};
            }
            currentNS = currentNS[nsArray[i]];
        }

        func(currentNS);
    };
}(window.util));