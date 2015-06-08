var gulp = require('gulp');
var del = require('del');

var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minify = require('gulp-minify-css');
var shell = require('gulp-shell');
var glob = require('glob');

var COMPILE_DIRECTORY = 'public';

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
    return gulp.src('static/scss/*.scss')
        .pipe(concat('main.min.css'))
        .pipe(gulp.dest(COMPILE_DIRECTORY + '/css'))
        .pipe(sass({
            includePaths: ["static/scss"]
        }))
        .pipe(minify({ processImport: false }))
        .pipe(gulp.dest(COMPILE_DIRECTORY + '/css'));
});

gulp.task('rjs', shell.task([
    'node_modules/.bin/r.js -o build.js optimize=none'
]));

gulp.task('scrape_po', shell.task([
    './node_modules/.bin/extract-pot --locale locale .',
    './node_modules/i18n-abide/bin/merge-po.sh locale'
]));

gulp.task('compile_json', shell.task([
    './node_modules/i18n-abide/bin/compile-json locale locale'
]));

gulp.task('watch', function () {
    gulp.watch('static/js/**/*.js', ['scripts']);
    gulp.watch('static/scss/*.scss', ['sass']);
    gulp.watch('static/**/LC_MESSAGES/*.po', ['compile_json']);
});

gulp.task('scripts', ['lint', 'rjs']);
gulp.task('default', ['clean', 'sass', 'compile_json', 'scripts', 'watch']);
