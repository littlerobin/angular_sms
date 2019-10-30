module.exports = function (gulp, plugins, paths) {

    const path = require('path');

    var opts = {
        empty:true,
        ssi:true,
        cdata:true,
        comments:false,
        spare:true,
        quotes:true,
        loose : true,
        conditionals:true
    };
    var cachebust = require('gulp-cache-bust');
    return function () {


        paths.lazyLoaderHtml.engines.forEach(function (item) {

            var fileName = path.basename(item,'.html').replace('-optimal', '');

            var dirName = path.dirname(item).replace('engines-origin', 'engines');

            gulp.src(item)
                .pipe(plugins.minifyHtml2(opts)
                    .on('error', function(e){
                    console.log(e);
                }))
                .pipe(plugins.concat(fileName + ".html"))
                .pipe(gulp.dest(dirName));

        });


    };


};
