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
        var result = getListOfPofs(res);
        console.log("get: " + result.s);
    }
});

function getListOfPofs(outputPipe){
    var req = http.request("http://www.navior.cn:6603/ids/listPofsOfMall.action?mallId=824&operatorKey=FA07C1D5-800E-4065-8A40-7DD2D925C1A3", function(res){
        console.log("res got");
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        var result = "";
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
            result += chunk;
        }).on('end', function (){
            console.log("response from navior end: ", result);
            return JSON.parse(result);
        });
    });
    req.end();
}

app.listen(8997);