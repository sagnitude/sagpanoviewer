/**
 * Created by sagnitude on 14/12/25.
 */

var express = require("express");
var app = express();
var http = require("http");

app.get("/", function (req, res) {
    res.send("get");
});

app.get("/ids/:action", function(req, res){
    if(req.params.action == "listPofsOfMall.action"){
        console.log("get: " + getListOfPofs().s);
    }
    res.send("response: " + getListOfPofs().m);
});

function getListOfPofs(){
    var result = "";
    var req = http.get("http://www.navior.cn:6603/ids/listPofsOfMall.action?mallId=823&operatorKey=FA07C1D5-800E-4065-8A40-7DD2D925C1A3", function(res){
        console.log("res got");
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
            result.concat(chunk);
        });
    });
    req.on('end', function(){
        return JSON.parse(result);
    });
}

app.listen(8997);