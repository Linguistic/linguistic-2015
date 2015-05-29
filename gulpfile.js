var gulp = require('gulp');
var del = require('del');

var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minify = require('gulp-minify-css');
var shell = require('gulp-shell');
var glob = require('glob');

var COMPILE_DIRECTORY = 'dist';

gulp.task('clean', function () {
    del([
        COMPILE_DIRECTORY + '/*.css',
        COMPILE_DIRECTORY + '/*.js'
    ]);
});

gulp.task('lint', function () {
    return gulp.src('static/js/core/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('sass', function () {
    return gulp.src('static/sass/*.scss')
        .pipe(concat('main.min.css'))
        .pipe(gulp.dest(COMPILE_DIRECTORY))
        .pipe(sass({
            includePaths: ["static/sass"]
        }))
        .pipe(minify())
        .pipe(gulp.dest(COMPILE_DIRECTORY));
});

gulp.task('scripts', function () {
    return gulp.src('static/js/*.js')
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(COMPILE_DIRECTORY))
});

gulp.task('rebuild_po', shell.task([
    './node_modules/.bin/extract-pot --locale locale .',
    './node_modules/i18n-abide/bin/merge-po.sh locale'
]));

gulp.task('compile_json', shell.task([
    './node_modules/i18n-abide/bin/compile-json locale locale'
]));

gulp.task('default', ['clean', 'lint', 'sass', 'scripts', 'compile_json']);