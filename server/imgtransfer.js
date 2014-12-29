var express = require('express');
var app2 = express();

app2.get('/*.jpg', function(req, res){
    res.send(req.path);
});

app2.listen(8998);