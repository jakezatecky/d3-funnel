module.exports = function(grunt) {
	var banner = '/*! <%= pkg.name %> - v<%= pkg.version %> | <%= grunt.template.today("yyyy-mm-dd") %> */\n';
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		jshint: {
			options: {
				jshintrc: true
			},
			main: ["src/d3-funnel/**/*.js"]
		},
		jscs: {
			src: "src/d3-funnel/**/*.js",
			options: {
				config: ".jscsrc",
				verbose: true
			}
		},
		concat: {
			dist: {
				src: ["src/d3-funnel/d3-funnel.js"],
				dest: "dist/d3-funnel.js"
			}
		},
		uglify: {
			options: {
				banner: banner
			},
			dist: {
				files: {
					"dist/d3-funnel.min.js": "src/d3-funnel/d3-funnel.js"
				}
			}
		}
	});

	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-jscs");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-concat");

	grunt.registerTask("default", ["jshint", "jscs", "concat", "uglify"]);
};
