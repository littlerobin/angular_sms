module.exports = function (gulp, plugins, paths) {

    const path = require('path');
    return function () {


            paths.lazyLoader.engines.forEach(function (item) {

                var fileName = path.basename(item,'.js');
                var dirName = path.dirname(item).replace('engines-origin', 'engines');
               // var newDir = dirName + '/minified/';
                gulp.src(item)
                    .pipe(plugins.uglify({
                        mangle: false,
                    }).on('error', function(e){
                        console.log(e);
                    }))
                    .pipe(plugins.concat(fileName + ".js"))
                    .pipe(gulp.dest(dirName));

            });


    };


};
