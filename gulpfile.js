const gulp = require('gulp');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha-phantomjs');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const header = require('gulp-header');
const scsslint = require('gulp-scss-lint');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const webpack = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');
const testWebpackConfig = require('./webpack.test.config.js');
const pkg = require('./package.json');

const banner = '/*! <%= pkg.name %> - v<%= pkg.version %> | <%= new Date().getFullYear() %> */\n';

gulp.task('test-format', () =>
	gulp.src(['./src/d3-funnel/**/*.js'])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failOnError())
);

gulp.task('compile-test', () =>
	gulp.src(['./test/index.js'])
		.pipe(webpack(testWebpackConfig))
		.pipe(gulp.dest('./test/compiled/'))
);

gulp.task('test-mocha', ['compile-test'], () =>
	gulp.src(['test/test.html'])
		.pipe(mocha({ reporter: 'spec' }))
);

gulp.task('test', ['test-format', 'test-mocha']);

gulp.task('compile-build', () =>
	gulp.src(['./src/index.js'])
		.pipe(webpack(webpackConfig))
		.pipe(gulp.dest('./compiled/'))
);

gulp.task('build', ['test', 'compile-build'], () =>
	gulp.src(['./compiled/d3-funnel.js'])
		.pipe(gulp.dest('./dist/'))
		.pipe(rename({
			extname: '.min.js',
		}))
		.pipe(uglify())
		.pipe(header(banner, { pkg }))
		.pipe(gulp.dest('./dist/'))
);

gulp.task('build-examples-style', () =>
	gulp.src('./examples/src/sass/**/*.scss')
		.pipe(scsslint())
		.pipe(scsslint.failReporter())
		.pipe(sass({
			outputStyle: 'expanded',
		}).on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
		}))
		.pipe(gulp.dest('./examples/dist/css'))
);

gulp.task('build-examples-script', () =>
	gulp.src(['./examples/src/js/index.js'])
		.pipe(webpack(testWebpackConfig))
		.pipe(gulp.dest('./examples/dist/js'))
);

gulp.task('build-examples', ['build-examples-style', 'build-examples-script'], () =>
	gulp.src('./examples/src/index.html')
		.pipe(gulp.dest('./examples/dist'))
);

gulp.task('watch', () =>
	gulp.watch(['./src/d3-funnel/**/*.js', './examples/src/**/*.js'], ['build-examples'])
);

gulp.task('default', ['build']);
