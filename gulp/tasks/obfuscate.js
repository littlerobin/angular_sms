module.exports = function (gulp, plugins, paths) {

    return function () {

        gulp.src([paths.obfuscate + 'moment.min.js',paths.obfuscate + 'helper.js'])
            .pipe(plugins.obfuscate())
            .pipe(gulp.dest(paths.obfuscate + "/js"));

    };
};