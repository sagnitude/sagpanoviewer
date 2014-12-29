/**
 * Created by sagnitude on 14/12/25.
 */

var express = require("express");
var app = express();
var http = require("http");
var app2 = express();

var dataServer = "http://www.indoorstar.com:6601";
var serverUrl = "http://www.navior.cn:6603/ids";

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

app2.get('/*.jpg', function(req, res){
    res.writeHead('200', {'Content-Type': 'image/jpeg'});
    var request = http.request(dataServer + req.path, function(res2){
        console.log("STATUS: " + res2.statusCode);
        var result = "";
        res2.on('data', function (chunk) {
            result += chunk;
            console.log("BODY CHUNK GOT");
            res.write(chunk);
        }).on('end', function() {
            res.end();
        })
    });
    request.end();
});

app.listen(8997);
app2.listen(8998);