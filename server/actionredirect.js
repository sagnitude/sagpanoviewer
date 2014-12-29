/**
 * Created by sagnitude on 14/12/25.
 */

var express = require("express");
var app = express();
var http = require("http");

app.get("/", function (req, res) {
    res.send("get");
});

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

app.get("/ids/:action", function(req, res){
    if(req.params.action == "listPofsOfMall.action"){
        s_getListOfPofs(req.query, res);
    }else if(req.params.action == "listMallWithFullShot.action"){
        s_getMallWithFullShot(req.query, res);
    }
});

function s_getListOfPofs(queryBody, outputPipe){
    if(queryBody.mallId && queryBody.operatorKey){
        var reqUrl = "http://www.navior.cn:6603/ids/listPofsOfMall.action?mallId="+queryBody.mallId+"&operatorKey="+queryBody.operatorKey;
        s_transferAction(reqUrl, queryBody, outputPipe);
    }
}

function s_getMallWithFullShot(queryBody, outputPipe){
    if(queryBody.mallId && queryBody.operatorKey){
        var reqUrl = "http://www.navior.cn:6603/ids/listMallWithFullShot.action?mallId="+queryBody.mallId+"&operatorKey="+queryBody.operatorKey;
        s_transferAction(reqUrl, queryBody, outputPipe);
    }
}

function s_transferAction(actionUrl, queryBody, outputPipe){
    var req = http.request(actionUrl, function(res) {
        console.log("STATUS: " + res.statusCode);
        var result = "";
        res.on('data', function (chunk) {
            console.log('BODY CHUNK GOT');
            result += chunk;
        }).on('end', function() {
            outputPipe.send(JSON.parse(result));
        });
    });
    req.write(require('querystring').stringify(queryBody));
    req.end();
}

app.listen(8997);