var rev = require('gulp-rev');
var hash = require('gulp-hash');
module.exports = function (gulp, plugins, paths) {

    return function () {
        gulp.src(paths.css.backend)
            .pipe(plugins.cssmin())
            .pipe(plugins.concat("style.css"))
            .pipe(gulp.dest('dist/assets/css'))
		    .pipe(gulp.dest('dist'));

    };
};