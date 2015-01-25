var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var angularFilesort = require('gulp-angular-filesort');
var karma = require('karma').server;
var ngAnnotate = require('gulp-ng-annotate');
var jshint = require('gulp-jshint');
var csso = require('gulp-csso');
var del = require('del');
var filesize = require('gulp-filesize');
var templateCache = require('gulp-angular-templatecache');

// task to clean up destination directory to prepare a new fresh build
gulp.task('clean', function(cb) {
    del(['dist/**'], cb);
});

// prepare dist: concatenate and minify scripts
gulp.task('scripts', function() {
    return gulp.src(['src/**/*.js', '.tmp/templates.js'])
        .pipe(angularFilesort())
        .pipe(concat('angular-tags-input.js'))
        .pipe(gulp.dest('dist'))
        .pipe(filesize())
        .pipe(rename({ suffix: '.min' }))
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(gulp.dest('dist'))
        .pipe(filesize());
});

// prepare dist: concatenate and minify styles
gulp.task('styles', function() {
    return gulp.src(['src/**/*.css'])
        .pipe(concat('angular-tags-input.css'))
        .pipe(gulp.dest('dist'))
        .pipe(filesize())
        .pipe(rename({ suffix: '.min' }))
        .pipe(csso())
        .pipe(gulp.dest('dist'))
        .pipe(filesize());
});

// prepare dist: concatenate and minify scripts
gulp.task('templates', function() {
    return gulp.src('src/**/*.html')
        .pipe(templateCache({ module: 'tagsInput' }))
        .pipe(gulp.dest('.tmp'))
        .pipe(filesize());
});

// run tests with karma
gulp.task('test', function (done) {
    karma.start({
        configFile:  __dirname + '/test/karma.conf.js',
        singleRun: true
    }, done);
});

// run jshint checks
gulp.task('lint', function () {
    return gulp.src('src/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));

});

// default Task
gulp.task('default', ['clean', 'templates'], function() {
    gulp.start('scripts');
    gulp.start('styles');
});