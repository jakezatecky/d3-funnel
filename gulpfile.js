var gulp   = require('gulp');
var jshint = require('gulp-jshint');
var jscs   = require('gulp-jscs');
var babel  = require('gulp-babel');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var header = require('gulp-header');
var pkg    = require('./package.json');

var banner = '/*! <%= pkg.name %> - v<%= pkg.version %> | <%= new Date().getFullYear() %> */\n';

gulp.task('build', function() {
    return gulp.src('./src/d3-funnel/d3-funnel.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'))
        .pipe(jscs({
            esnext: true,
            verbose: true
        }))
        .pipe(babel())
        .pipe(gulp.dest('./dist/'))
        .pipe(rename({
            extname: '.min.js'}
        ))
        .pipe(uglify())
        .pipe(header(banner, {
            pkg: pkg
        }))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('default', ['build']);
