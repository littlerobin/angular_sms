var fs = require('fs');
var express = require('express');
var recursive = require('recursive-readdir');
var searching = require('searching');
var app = express();
var PORT=2525;
app.get('/', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "GET, POST","PUT");
    res.setHeader('Content-Type', 'application/json');
    (function (searchKey) {
        var dataArray = [];
        var filter=[];
        if(searchKey){
            recursive("../app/engines/support/documentation/markdown/pages/", ["*.png", "*.html"], function (err, files) {
                dataArray = files.map(function (file) {
                    if (fs.readFileSync(file, 'utf8').search(searchKey) != -1) {
                        if(file!=null){
                            return file;
                        }
                    }
                });
                dataArray.forEach(function (item) {
                    if(item){
                        filter.push(item);
                    }
                });
                res.send(JSON.stringify({status:'OK',data:filter}));
            });
        }else{
            res.send(JSON.stringify({status:'EMPTY'}));
        }


    })(req.query.search_key);
});
app.listen(PORT, function () {
    console.log('Server run on '+ PORT +" port");
});