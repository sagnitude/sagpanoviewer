/**
 * Created by sagnitude on 14/12/25.
 */

var express = require("express");
var app = express();

app.get("/", function (req, res) {
    res.send("get");
});

app.get("/ids/:action", function(req, res){
    if(req.params.action == "listPofsOfMall.action"){
        console.log("get");
    }
    res.send("response");
});

app.listen(8997);