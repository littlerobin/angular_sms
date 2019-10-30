
module.exports = function (gulp, plugins, paths) {
    return function () {
        gulp.src(paths.scss.backend)
            .pipe(plugins.sass().on('error', plugins.sass.logError))
            .pipe(gulp.dest("dist/assets/css"));
    };
};