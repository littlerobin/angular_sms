'use strict';

const fs = require('fs');
const gulp = require("gulp");
const plugins = require('gulp-load-plugins')();
const paths = require('./gulp/paths');
const revCollector = require('gulp-rev-collector');


/**
 * @name getTask
 * @kind function
 * @description
 * Return the current gulp task function from gulp/tasks directory
 * @param {String} task's name
 * @returns {Function}const
 */

var getTask = function (task) {

    return require('./gulp/tasks/' + task)(gulp, plugins, paths);
};



/*
 |---------------------------------------------------------
 | UGLIFYING JS/CSS
 |---------------------------------------------------------
 */


gulp.task('scss', getTask('scss'));

gulp.task('scripts', getTask('scripts'));

gulp.task('css', getTask('css'));


/*
 |---------------------------------------------------------
 | FONTS
 |---------------------------------------------------------
 */


gulp.task('fonts', getTask('fonts'));


/*
 |---------------------------------------------------------
 | OBFUSCATION
 |---------------------------------------------------------
 */


gulp.task('obfuscate', getTask('obfuscate'));


/*
 |---------------------------------------------------------
 | LAZY LOADER
 |---------------------------------------------------------
*/


gulp.task('lazy-loader', getTask('lazyLoader'));

gulp.task('lazy-loader-html', getTask('lazyLoaderHtml'));


/*
 |---------------------------------------------------------
 | MODALS
 |---------------------------------------------------------
 */


gulp.task('modals', getTask('modals'));


/*
 |---------------------------------------------------------
 | DEFAULT TASK
 |---------------------------------------------------------
 */
var revts = require('gulp-rev-timestamp');

gulp.task('rev-timestamp', function() {
  gulp.src("index.html")
    .pipe(revts({strict: false, mode: 'timestamp'}))
    .pipe(gulp.dest('.'))
});

gulp.task("default", [
    'scss',
    'scripts',
    'fonts',
    'css',
    'obfuscate',
    'lazy-loader',
    'lazy-loader-html',
    'modals',
    'rev-timestamp'
]);


/*
 |---------------------------------------------------------
 | GULP WATCH
 |---------------------------------------------------------
 */


gulp.task('watch', function() {
    gulp.watch(paths.lazyLoaderHtml.engines, ['lazy-loader-html']);
    gulp.watch(paths.lazyLoader.engines, ['lazy-loader']);
    gulp.watch(paths.modals, ['modals']);
});


