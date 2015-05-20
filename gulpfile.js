var gulp = require('gulp');
var del  = require('del');

var jshint  = require('gulp-jshint');
var sass    = require('gulp-sass');
var concat  = require('gulp-concat');
var uglify  = require('gulp-uglify');
var minify  = require('gulp-minify-css');
var nodemon = require('gulp-nodemon');

gulp.task('clean', function() {
    del([
        'dist/*.css',
        'dist/*.js'
    ]);
});

gulp.task('lint', function() {
    return gulp.src('assets/js/core/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('sass', function() {
    return gulp.src('assets/sass/*.scss')
        .pipe(concat('main.css'))
        .pipe(gulp.dest('./'))
        .pipe(sass())
        .pipe(minify())
        .pipe(gulp.dest('dist'));
});

gulp.task('scripts', function() {
   return gulp.src('assets/js/*.js')
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'))
});

gulp.task('watch', function() {
    gulp.watch('assets/js/*.js', ['lint', 'scripts']);
    gulp.watch('assets/scss/*.scss', ['sass']);
});

gulp.task('server', function() {
    nodemon({ 
        script: 'app.js',
        ext: 'js scss html'
    });
});

gulp.task('default', ['clean', 'lint', 'sass', 'scripts', 'server']);