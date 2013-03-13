module.exports = function (grunt) {
    var sources, libraries;
    
    sources = [
        "util/index_of.js",
        "util/namespace.js",
        "util/event_emitter.js",
        "core/validator.js",
        "core/attr.js",
        "core/attr_list.js",
        "core/method.js",
        "core/model.js"
    ];
    
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        jshint: {
            options: {
                browser: true
            },
            all: ["Gruntfile.js", "src/**/*.js"]
        },
        
        concat: {
            options: {
                separator: ";"
            },
            source: {
                src: sources.map( function (source) {
                    return "src/" + source;
                }),
                dest: "build/jermaine.js"
            }
        },


        uglify: {
            minify: {
                files: {
                    "build/jermaine-min.js": ["build/jermaine.js"]
                }
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    
    grunt.registerTask("default", ["jshint", "concat", "uglify"]);
};
