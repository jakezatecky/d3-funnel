const gulp = require('gulp');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha-phantomjs');
const rename = require('gulp-rename');
const header = require('gulp-header');
const scsslint = require('gulp-scss-lint');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const browserSync = require('browser-sync').create();
const webpackConfig = require('./webpack.config.js');
const testWebpackConfig = require('./webpack.test.config.js');
const pkg = require('./package.json');

const banner = '/*! <%= pkg.name %> - v<%= pkg.version %> | <%= new Date().getFullYear() %> */\n';

gulp.task('test-format', () => (
    gulp.src([
        './examples/src/**/*.js',
        './src/**/*.js',
        './test/d3-funnel/**/*.js',
        './*.js',
    ])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError())
));

gulp.task('compile-test', () => (
    gulp.src(['./test/index.js'])
        .pipe(webpackStream(testWebpackConfig, webpack))
        .pipe(gulp.dest('./test/compiled/'))
));

gulp.task('test-mocha', gulp.series('compile-test', () => (
    gulp.src(['test/test.html'])
        .pipe(mocha({ reporter: 'spec' }))
)));

gulp.task('test', gulp.series('test-format', 'test-mocha'));

gulp.task('build', gulp.series('test', () => (
    gulp.src(['./src/index.js'])
        .pipe(webpackStream(webpackConfig, webpack))
        .pipe(gulp.dest('./dist/'))
)));

gulp.task('build-min', gulp.series('build', () => (
    gulp.src(['./src/index.js'])
        .pipe(webpackStream({
            ...webpackConfig,
            mode: 'production',
        }, webpack))
        .pipe(rename({ extname: '.min.js' }))
        .pipe(header(banner, { pkg }))
        .pipe(gulp.dest('./dist/'))
)));

gulp.task('build-examples-style', () => (
    gulp.src('./examples/src/scss/**/*.scss')
        .pipe(scsslint())
        .pipe(scsslint.failReporter())
        .pipe(sass({
            outputStyle: 'expanded',
        }).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
        }))
        .pipe(gulp.dest('./examples/dist/css'))
        .pipe(browserSync.stream())
));

gulp.task('build-examples-script', () => (
    gulp.src(['./examples/src/js/index.js'])
        .pipe(webpackStream(testWebpackConfig, webpack))
        .pipe(gulp.dest('./examples/dist/js'))
        .pipe(browserSync.stream())
));

gulp.task('build-examples-html', () => (
    gulp.src('./examples/src/index.html')
        .pipe(gulp.dest('./examples/dist'))
        .pipe(browserSync.stream())
));

gulp.task('examples', gulp.series(gulp.parallel('build-examples-style', 'build-examples-script', 'build-examples-html'), () => {
    browserSync.init({ server: './examples/dist' });

    gulp.watch(['./src/**/*.js', './examples/src/**/*.js']).on('change', gulp.series('build-examples-script'));
    gulp.watch(['./examples/src/scss/**/*.scss']).on('change', gulp.series('build-examples-style'));
    gulp.watch(['./examples/src/**/*.html']).on('change', gulp.series('build-examples-html', browserSync.reload));
}));

gulp.task('default', gulp.series('build-min'));
