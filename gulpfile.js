var del = require('del'),
    concat = require('gulp-concat'),
    glob = require('glob'),
    gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    minify = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify');

var COMPILE_DIRECTORY = 'public';

gulp.task('clean', function () {
    del([
        COMPILE_DIRECTORY + '/css/*.css',
        COMPILE_DIRECTORY + '/js/*.js'
    ]);
});

gulp.task('lint', function () {
    return gulp.src('static/js/core/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('styles', function () {
    return gulp.src('static/scss/*.scss')
        .pipe(sass({
            includePaths: ["static/scss"]
        }))
        .pipe(minify({ processImport: false }))
        .pipe(rename('main.min.css'))
        .pipe(gulp.dest(COMPILE_DIRECTORY + '/css'));
});

gulp.task('watch', function () {
    gulp.watch('static/scss/*.scss', ['sass']);
    gulp.watch('static/scss/**/*.scss', ['sass']);
});

gulp.task('default', ['sass', 'lint']);
