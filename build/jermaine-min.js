if(!Array.prototype.indexOf){Array.prototype.indexOf=function(c){if(this==null){throw new TypeError()}var d=Object(this);var a=d.length>>>0;if(a===0){return -1}var e=0;if(arguments.length>0){e=Number(arguments[1]);if(e!=e){e=0}else{if(e!=0&&e!=Infinity&&e!=-Infinity){e=(e>0||-1)*Math.floor(Math.abs(e))}}}if(e>=a){return -1}var b=e>=0?e:Math.max(a-Math.abs(e),0);for(;b<a;b++){if(b in d&&d[b]===c){return b}}return -1}}(function(b){var a=function(f,c,h){var j=/^([a-zA-Z]+)(\.[a-zA-Z]*)*$/,g,e,d;if(f.match(j)===null||f==="window"){throw new Error("namespace: "+f+" is a malformed namespace string")}if(c!==undefined&&h===undefined){if(typeof(c)==="function"){h=c;c=undefined}else{if(typeof(c)==="object"){throw new Error("namespace: if second argument exists, final function argument must exist")}else{if(typeof(c)!=="object"){throw new Error("namespace: second argument must be an object of aliased local namespaces")}}}}else{if(typeof(c)!=="object"&&typeof(h)==="function"){throw new Error("namespace: second argument must be an object of aliased local namespaces")}}g=f.split(".");if(g[0]==="window"){e=window}else{e=(window[g[0]]===undefined)?window[g[0]]={}:window[g[0]]}if(h!==undefined&&typeof(h)!=="function"){throw new Error("namespace: last parameter must be a function that accepts a namespace parameter")}for(d=1;d<g.length;d=d+1){if(e[g[d]]===undefined){e[g[d]]={}}e=e[g[d]]}if(c===undefined&&h){h(e)}else{if(h){for(d in c){if(c.hasOwnProperty(d)){c[d]=a(c[d])}}h.call(c,e)}}return e};return a(b,function(c){c.namespace=a})}("window.jermaine.util"));window.jermaine.util.namespace("window.jermaine.util",function(a){var b=function(){var d=this,c={};this.on=function(e,f){if(typeof(e)!=="string"){throw new Error("EventEmitter: first argument to 'on' should be a string")}if(typeof(f)!=="function"){throw new Error("EventEmitter: second argument to 'on' should be a function")}if(!c[e]){c[e]=[]}c[e].push(f);return d};this.addListener=this.on;this.once=function(e,h){var g=function(){h(arguments);d.removeListener(e,g)};d.on(e,g);return d};this.removeListener=function(f,g){var e;if(typeof(f)!=="string"){throw new Error("EventEmitter: first parameter to removeListener method must be a string representing an event")}if(typeof(g)!=="function"){throw new Error("EventEmitter: second parameter must be a function to remove as an event listener")}if(c[f]===undefined||c[f].length===0){throw new Error("EventEmitter: there are no listeners registered for the '"+f+"' event")}e=c[f].indexOf(g);if(e!==-1){c[f].splice(e,1)}return d};this.removeAllListeners=function(e){if(typeof(e)!=="string"){throw new Error("EventEmitter: parameter to removeAllListeners should be a string representing an event")}if(c[e]!==undefined){c[e]=[]}return d};this.setMaxListeners=function(e){return d};this.listeners=function(e){if(typeof(e)!=="string"){throw new Error("EventEmitter: listeners method must be called with the name of an event")}else{if(c[e]===undefined){return[]}}return c[e]};this.emit=function(f,g){var e,h;if(arguments.length>1){h=[]}for(e=1;e<arguments.length;++e){h.push(arguments[e])}if(c[f]!==undefined){for(e=0;e<c[f].length;e=e+1){c[f][e].apply(this,h)}}};return d};a.EventEmitter=b});window.jermaine.util.namespace("window.jermaine",function(c){var d=this,b,a={};b=function(e){var f=function(h){var g,j={},i;g=e.call(j,h);if(!g){i=j.message||"validator failed with parameter "+h;throw new Error(i)}return g};return f};b.addValidator=function(f,e){if(f===undefined||typeof(f)!=="string"){throw new Error("addValidator requires a name to be specified as the first parameter")}if(e===undefined||typeof(e)!=="function"){throw new Error("addValidator requires a function as the second parameter")}if(a[f]===undefined){a[f]=function(g){return new b(function(j){var i={actual:j,param:j},h=e.call(i,g);this.message=i.message;return h})}}else{throw new Error("Validator '"+f+"' already defined")}};b.getValidator=function(f){var e;if(f===undefined){throw new Error("Validator: getValidator method requires a string parameter")}else{if(typeof(f)!=="string"){throw new Error("Validator: parameter to getValidator method must be a string")}}e=a[f];if(e===undefined){throw new Error("Validator: '"+f+"' does not exist")}return e};b.validators=function(){var f,e=[];for(f in a){if(a.hasOwnProperty(f)){e.push(f)}}return e};b.addValidator("isGreaterThan",function(e){this.message=this.param+" should be greater than "+e;return this.param>e});b.addValidator("isLessThan",function(e){this.message=this.param+" should be less than "+e;return this.param<e});b.addValidator("isA",function(f){var e=["string","number","boolean","function","object"];if(typeof(f)==="string"&&e.indexOf(f)>-1){this.message=this.param+" should be a "+f;return typeof(this.param)===f}else{if(f==="integer"){if(this.param.toString!==undefined){this.message=this.param.toString()+" should be an integer"}else{this.message="parameter should be an integer"}return(typeof(this.param)==="number")&&(parseInt(this.param,10)===this.param)}else{if(typeof(f)==="string"){throw new Error("Validator: isA accepts a string which is one of "+e)}else{throw new Error("Validator: isA only accepts a string for a primitive types for the time being")}}}});a.isAn=a.isA;b.addValidator("isOneOf",function(e){this.message=this.param+" should be one of the set: "+e;return e.indexOf(this.param)>-1});c.Validator=b});window.jermaine.util.namespace("window.jermaine",function(b){var a={};var c=function(g){var j=[],n=this,o="invalid setter call for "+g,k,l,m,f,d,r=false,e,q,p={},s=window.jermaine.AttrList,h=window.jermaine.Validator,t=window.jermaine.util.EventEmitter;p.set=function(){};p.get=function(){};e=function(i){for(m=0;m<j.length;++m){j[m](i)}return true};l=function(){return(typeof(k)==="function")?k():k};if(g===undefined||typeof(g)!=="string"){throw new Error("Attr: constructor requires a name parameter which must be a string")}this.validatesWith=function(i){if(typeof(i)==="function"){j.push(new h(i));return this}else{throw new Error("Attr: validator must be a function")}};this.defaultsTo=function(i){k=i;return this};this.isImmutable=function(){r=true;return this};this.isMutable=function(){r=false;return this};this.name=function(){return g};this.clone=function(){var u=(this instanceof s)?new s(g):new c(g),v;for(v=0;v<j.length;++v){u.validatesWith(j[v])}u.defaultsTo(k);if(r){u.isImmutable()}return u};this.and=this;this.which=this;this.validator=function(){return e};this.on=function(i,u){if(i!=="set"&&i!=="get"){throw new Error("Attr: first argument to the 'on' method should be 'set' or 'get'")}else{if(typeof(u)!=="function"){throw new Error("Attr: second argument to the 'on' method should be a function")}else{p[i]=u}}};this.addTo=function(w){var u,v,i;if(!w||typeof(w)!=="object"){throw new Error("Attr: addAttr method requires an object parameter")}w[g]=function(y){var x;if(y!==undefined){if(r&&u!==undefined){throw new Error("cannot set the immutable property "+g+" after it has been set")}else{if(!e(y)){throw new Error(o)}else{x=u;u=y;p.set.call(w,y,x)}}return w}else{p.get.call(w,u);return u}};i=l();if(i!==undefined&&e(i)){w[g](i)}else{if(i!==undefined&&!e(i)){throw new Error("Attr: Default value of "+i+" does not pass validation for "+g)}}};d=function(i){n[i]=function(u){j.push(h.getValidator(i)(u));return n}};for(m=0;m<h.validators().length;++m){d(h.validators()[m])}};b.Attr=c});window.jermaine.util.namespace("window.jermaine",function(a){function b(c){var e=this;a.Attr.call(this,c);var d=function(g,f){return function(){return g[f].apply(g,arguments)}};this.validateWith=this.validatesWith;this.defaultsTo=function(){};this.isImmutable=function(){};this.isMutable=function(){};this.eachOfWhich=this;this.addTo=function(h){var i,f=[],g={};if(!h||typeof(h)!=="object"){throw new Error("AttrList: addTo method requires an object parameter")}else{g.pop=d(f,"pop");g.add=function(j){if((e.validator())(j)){f.push(j);return this}else{throw new Error(e.errorMessage())}};g.replace=function(j,k){if((typeof(j)!=="number")||(parseInt(j,10)!==j)){throw new Error("AttrList: replace method requires index parameter to be an integer")}if(j<0||j>=this.size()){throw new Error("AttrList: replace method index parameter out of bounds")}if(!(e.validator())(k)){throw new Error(e.errorMessage())}f[j]=k;return this};g.at=function(j){if(j<0||j>=this.size()){throw new Error("AttrList: Index out of bounds")}return f[j]};g.get=g.at;g.size=function(){return f.length};g.toJSON=function(m){var k=[],n,l;for(n=0;n<m.length;++n){if(m[n].object===this){k=m[n].JSONrep}}for(n=0;n<f.length;++n){if(f[n].toJSON){k.push(f[n].toJSON(m))}else{k.push(f[n])}}return k};h[c]=function(){return g}}}}b.prototype=new window.jermaine.Attr(name);a.AttrList=b});window.jermaine.util.namespace("window.jermaine",function(a){var b=function(c,d){if(!c||typeof(c)!=="string"){throw new Error("Method: constructor requires a name parameter which must be a string")}else{if(!d||typeof(d)!=="function"){throw new Error("Method: second parameter must be a function")}}this.addTo=function(e){if(!e||typeof(e)!=="object"){throw new Error("Method: addTo method requires an object parameter")}e[c]=d}};a.Method=b});window.jermaine.util.namespace("window.jermaine",function(a){function b(x){var i=this,s={},j={},r,n,t,f=true,d=[],p=[],u=[],c=a.Method,w=a.Attr,m=a.AttrList,h=a.util.EventEmitter,g,y,l,k,v=function(){},q=function(){},e=function(){if(f){l()}return q.apply(this,arguments)};if(arguments.length>1){x=arguments[arguments.length-1]}if(x&&typeof(x)==="function"){e=new b();x.call(e);return e}else{if(x){throw new Error("Model: specification parameter must be a function")}}var o=function(B,A){var D,z,C;D=B==="Attr"?w:m;z=B==="Attr"?"hasA":"hasMany";f=true;if(typeof(A)==="string"){C=new D(A);j[A]=C;return C}else{throw new Error("Model: "+z+" parameter must be a string")}};g=function(B,A){var z;if(typeof(A)!=="string"){throw new Error("Model: expected string argument to "+B+" method, but recieved "+A)}z=B==="attribute"?j[A]:s[A];if(z===undefined){throw new Error("Model: "+B+" "+A+" does not exist!")}return z};y=function(B){var A,C=[],z=B==="attributes"?j:s;for(A in z){if(z.hasOwnProperty(A)){C.push(A)}}return C};l=function(A){var D=this,B,z,C;e.validate();q=function(){var I=this,G,F,E,M;if(!(this instanceof e)){throw new Error("Model: instances must be created using the new operator")}M=function(Q,P){var O=P==="attributes"?j:s,N;for(N in O){if(O.hasOwnProperty(N)){if(O===j&&k){O[N].isImmutable()}O[N].addTo(Q)}}};E=new h();this.emitter=function(){return E};this.on=function(N,O){I.emitter().on(N,function(P){O.call(I,P)})};var K,L={},J,H;J=function(N){N.on("set",function(Q,P){var O=this;if(L[N.name()]===undefined){L[N.name()]=function(T){var S=[],R=true;for(G=0;G<T.length&&R===true;++G){S.push(T[G]);if(T[G].origin===this){R=false}}if(R){S.push({key:N.name(),origin:this});this.emitter().emit("change",S)}}}if(H!==undefined){if(P!==undefined&&P!==null&&P.emitter!==undefined){P.emitter().removeListener("change",H);H=undefined}}if(Q!==null&&typeof(Q)==="object"&&Q.on!==undefined&&Q.emitter!==undefined){if(P!==undefined&&P!==null&&H!==undefined){P.emitter().removeListener("change",H)}H=function(R){L[N.name()].call(O,R)};Q.emitter().on("change",H)}O.emitter().emit("change",[{key:N.name(),value:Q,origin:O}])})};for(G=0;G<y("attributes").length;++G){K=j[y("attributes")[G]];if(K instanceof w){J.call(this,K)}}this.toJSON=function(O){var S=e.attributes(),R,P,N,Q={},T;if(O===undefined){O=[];O.push({object:this,JSONrep:Q})}else{if(typeof(O)!=="object"){throw new Error("Instance: toJSON should not take a parameter (unless called recursively)")}else{for(P=0;P<O.length;++P){if(O[P].object===this){Q=O[P].JSONrep}}}}for(P=0;P<S.length;++P){T=null;R=this[S[P]]();for(N=0;N<O.length;++N){if(O[N].object===R){T=O[N].JSONrep}}if(R!==undefined&&R!==null&&R.toJSON!==undefined&&T===null){T=(j[S[P]] instanceof m)?[]:{};O.push({object:R,JSONrep:T});O[O.length-1].JSONrep=R.toJSON(O)}if(T===null){Q[S[P]]=R}else{Q[S[P]]=T}}return Q};M(this,"attributes");M(this,"methods");if(r!==undefined){this.toString=r}if(arguments.length>0){if(arguments.length<d.length){C="Constructor requires ";for(G=0;G<d.length;++G){C+=d[G];C+=G===d.length-1?"":", "}C+=" to be specified";throw new Error(C)}if(arguments.length>d.length+p.length){throw new Error("Too many arguments to constructor. Expected "+d.length+" required arguments and "+p.length+" optional arguments")}else{for(G=0;G<arguments.length;++G){F=G<d.length?d[G]:p[G-d.length];if(e.attribute(F) instanceof m){if(Object.prototype.toString.call(arguments[G])!=="[object Array]"){throw new Error("Model: Constructor requires 'names' attribute to be set with an Array")}else{for(z=0;z<arguments[G].length;++z){this[F]().add(arguments[G][z])}}}else{this[F](arguments[G])}}}}v.call(this)};return q};e.hasA=function(z){return o("Attr",z)};e.hasAn=e.hasA;e.hasSome=e.hasA;e.hasMany=function(z){return o("AttrList",z)};e.isA=function(B){var A,z,D,C;f=true;C=function(F){var E,G=new b();for(E in G){if(G.hasOwnProperty(E)&&typeof(F[E])!==typeof(G[E])){return false}}return true};if(typeof(B)!=="function"||!C(B)){throw new Error("Model: parameter sent to isA function must be a Model")}if(u.length===0){u.push(B)}else{throw new Error("Model: Model only supports single inheritance at this time")}z=u[0].attributes();for(A=0;A<z.length;++A){if(j[z[A]]===undefined){j[z[A]]=u[0].attribute(z[A]).clone();j[z[A]].isMutable()}}D=u[0].methods();for(A=0;A<D.length;++A){if(s[D[A]]===undefined){s[D[A]]=u[0].method(D[A])}}for(A=0;A<u.length;A++){e.prototype=new u[A]()}};e.isAn=e.isA;e.parent=function(){return u[0].apply(this,arguments)};e.attribute=function(z){return g("attribute",z)};e.attributes=function(){return y("attributes")};e.method=function(z){return g("method",z)};e.methods=function(){return y("methods")};e.isBuiltWith=function(){var z=false,A;f=true;d=[];p=[];for(A=0;A<arguments.length;++A){if(typeof(arguments[A])==="string"&&arguments[A].charAt(0)!=="%"){if(z){throw new Error("Model: isBuiltWith requires parameters preceded with a % to be the final parameters before the optional function")}else{d.push(arguments[A])}}else{if(typeof(arguments[A])==="string"&&arguments[A].charAt(0)==="%"){z=true;p.push(arguments[A].slice(1))}else{if(typeof(arguments[A])==="function"&&A===arguments.length-1){v=arguments[A]}else{throw new Error("Model: isBuiltWith parameters must be strings except for a function as the optional final parameter")}}}}};e.isImmutable=function(){k=true};e.looksLike=function(z){f=true;r=z};e.respondsTo=function(A,B){var z=new c(A,B);f=true;s[A]=z};e.validate=function(){var B,A=this.attributes(),z=this.methods();for(B=0;B<d.length;++B){try{this.attribute(d[B])}catch(C){throw new Error(d[B]+", specified in the isBuiltWith method, is not an attribute")}}for(B=0;B<p.length;++B){try{this.attribute(p[B])}catch(C){throw new Error(p[B]+", specified in the isBuiltWith method, is not an attribute")}}for(B=0;B<A.length;B++){if(z.indexOf(A[B])>-1){throw new Error("Model: invalid model specification to "+A[B]+" being both an attribute and method")}}if(k){for(B=0;B<A.length;B++){if(d.indexOf(A[B])<0){throw new Error("immutable objects must have all attributes required in a call to isBuiltWith")}}}f=false};return e}a.Model=b});