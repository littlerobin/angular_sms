module.exports = function (gulp, plugins, paths) {

    return function () {

        gulp.src(paths.fonts.backend.other)
            .pipe(gulp.dest("dist/assets/fonts"));

        gulp.src(paths.fonts.backend.bootstrap)
            .pipe(gulp.dest("dist/assets/fonts/bootstrap"));

    };
};