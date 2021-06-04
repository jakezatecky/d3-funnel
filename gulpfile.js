const autoprefixer = require('gulp-autoprefixer');
const browserSyncImport = require('browser-sync');
const cleanCss = require('gulp-clean-css');
const eslint = require('gulp-eslint');
const exec = require('gulp-exec');
const gulp = require('gulp');
const header = require('gulp-header');
const rename = require('gulp-rename');
const styleLint = require('gulp-stylelint');
const sass = require('gulp-dart-sass');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');

const pkg = require('./package.json');
const testWebpackConfig = require('./webpack.test.config');
const webpackConfig = require('./webpack.config');

const banner = '/*! <%= pkg.name %> - v<%= pkg.version %> | <%= new Date().getFullYear() %> */\n';
const browserSync = browserSyncImport.create();

gulp.task('test-script-format', () => (
    gulp.src([
        './examples/src/**/*.js',
        './src/**/*.js',
        './test/*.js',
        './test/d3-funnel/**/*.js',
        './*.js',
    ])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError())
));

gulp.task('compile-test-script', () => (
    gulp.src(['./test/index.js'])
        .pipe(webpackStream(testWebpackConfig, webpack))
        .pipe(gulp.dest('./test/compiled/'))
));

gulp.task('test-script-mocha', gulp.series('compile-test-script', () => (
    gulp.src('./gulpfile.js')
        .pipe(exec('npm run mocha'))
        .pipe(exec.reporter())
)));

gulp.task('test-script', gulp.series(gulp.parallel('test-script-format', 'test-script-mocha')));

gulp.task('build-script', gulp.series('test-script', () => (
    gulp.src(['./src/index.js'])
        .pipe(webpackStream({ ...webpackConfig, mode: 'none' }, webpack))
        .pipe(gulp.dest('./dist/'))
)));

gulp.task('build-script-min', gulp.series('build-script', () => (
    gulp.src(['./src/index.js'])
        .pipe(webpackStream({
            ...webpackConfig,
            mode: 'production',
        }, webpack))
        .pipe(rename({ extname: '.min.js' }))
        .pipe(header(banner, { pkg }))
        .pipe(gulp.dest('./dist/'))
)));

gulp.task('build', gulp.series('build-script-min'));

function buildExamplesScript(mode = 'development') {
    return gulp.src(['./examples/src/js/index.js'])
        .pipe(webpackStream({ ...testWebpackConfig, mode }, webpack))
        .pipe(gulp.dest('./examples/dist/'));
}

function buildExamplesStyle(minifyStyles = false) {
    let stream = gulp.src('./examples/src/scss/**/*.scss')
        .pipe(styleLint({
            reporters: [
                { formatter: 'string', console: true },
            ],
        }))
        .pipe(sass({
            outputStyle: 'expanded',
        }).on('error', sass.logError))
        .pipe(autoprefixer());

    if (minifyStyles) {
        stream = stream.pipe(cleanCss());
    }

    return stream.pipe(gulp.dest('./examples/dist'));
}

gulp.task('build-examples-script', () => (
    buildExamplesScript().pipe(browserSync.stream())
));

gulp.task('build-examples-script-prod', () => (
    buildExamplesScript('production')
));

gulp.task('build-examples-style', () => (
    buildExamplesStyle().pipe(browserSync.stream())
));

gulp.task('build-examples-style-prod', () => (
    buildExamplesStyle(true)
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

gulp.task('default', gulp.series('build'));
gulp.task('build-gh-pages', gulp.parallel('build-examples-style-prod', 'build-examples-script-prod', 'build-examples-html'));
