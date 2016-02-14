var gulp     = require('gulp');
var scsslint = require('gulp-scss-lint');
var sass     = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');

gulp.task('test-style', function () {
	return gulp.src(['./scss/**/*.scss', '!./scss/_cayman.scss'])
		.pipe(scsslint());
});

gulp.task('build-style', ['test-style'], function () {
	return gulp.src('./scss/**/*.scss')
		.pipe(sass({
			outputStyle: 'expanded',
		}).on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 2 versions']
		}))
		.pipe(gulp.dest('./css'));
});

gulp.task('watch', function () {
	gulp.watch(['./scss/**/*.scss'], ['build-style']);
});

gulp.task('default', ['build-style']);
