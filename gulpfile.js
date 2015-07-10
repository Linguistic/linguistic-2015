var del = require('del'),
    concat = require('gulp-concat'),
    glob = require('glob'),
    gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    minify = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    shell = require('gulp-shell'),
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

gulp.task('sass', function () {
    return gulp.src('static/scss/*.scss')
        .pipe(sass({
            includePaths: ["static/scss"]
        }))
        .pipe(minify({ processImport: false }))
        .pipe(rename('main.min.css'))
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
