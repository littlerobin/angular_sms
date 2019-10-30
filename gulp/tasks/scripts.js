var rev = require('gulp-rev');
module.exports = function (gulp, plugins, paths) {
    return function () {
        gulp.src(paths.bower.backend)

            .pipe(plugins.uglify())
            .pipe(plugins.concat("app.min.js"))
            .pipe(gulp.dest("dist/assets/js"))


        gulp.src(paths.browserify.app)
            .pipe(plugins.browserify().on("error", function (error) {
                console.info(error);
            }))
            .pipe(gulp.dest('dist'));

    };
};
