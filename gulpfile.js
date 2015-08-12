var gulp   = require('gulp');
var wrap   = require('gulp-wrap');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var jscs   = require('gulp-jscs');
var babel  = require('gulp-babel');
var mocha  = require('gulp-mocha-phantomjs');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var header = require('gulp-header');
var pkg    = require('./package.json');

var banner = '/*! <%= pkg.name %> - v<%= pkg.version %> | <%= new Date().getFullYear() %> */\n';

var src = [
	'./src/d3-funnel/d3-funnel.js',
	'./src/d3-funnel/utils.js'
];
var wrapper = './src/d3-funnel/.wrapper.js';

gulp.task('test-format', function () {
	return gulp.src(src)
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		.pipe(jshint.reporter('fail'))
		.pipe(jscs({
			configPath: './.jscsrc'
		}));
});

gulp.task('compile', function () {
	return gulp.src(src)
		.pipe(concat('d3-funnel.js'))
		.pipe(wrap({
			src: wrapper
		}))
		.pipe(babel())
		.pipe(gulp.dest('./compiled/'));
});

gulp.task('test-mocha', ['compile'], function () {
	return gulp.src(['test/test.html'])
		.pipe(mocha({reporter: 'spec'}));
});

gulp.task('build', ['test-format', 'test-mocha'], function () {
	return gulp.src(['./compiled/d3-funnel.js'])
		.pipe(gulp.dest('./dist/'))
		.pipe(rename({
			extname: '.min.js'
		}))
		.pipe(uglify())
		.pipe(header(banner, {
			pkg: pkg
		}))
		.pipe(gulp.dest('./dist/'));
});

gulp.task('default', ['build']);
