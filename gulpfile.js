const gulp = require('gulp');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha-phantomjs');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const header = require('gulp-header');
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

gulp.task('watch', () =>
	gulp.watch(['./src/d3-funnel/**/*.js'], ['build'])
);

gulp.task('default', ['build']);
