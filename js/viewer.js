/**
 * Created by sagnitude on 14/12/25.
 */

//variables
var allPofs = [];
var allFsPath = [];

//constants
//window.serverUrl = "http://www.navior.cn:6603/ids/";
window.serverUrl = "http://demo.sagnitude.com/ids/";
window.dataServer = "http://www.indoorstar.com:6601/";
window.windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
window.windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

var operatorKey = "FA07C1D5-800E-4065-8A40-7DD2D925C1A3";

var kListPofsOfMallActionUrl = "listPofsOfMall.action";
var kListFsPathOfMallActionUrl = "listFsPathOfMall.action";

function fetchActionJson(url, cb){
    $.get(url, function (data, status) {
        if(data.s === 0){
            var resultSet = data.d;
            console.log(data.m);
            return cb(resultSet);
        }else{
            console.log("Data fetch failed: ", data.m);
        }
    }, "json");
}

function getPofsListOfMall(mallId){
    fetchActionJson(assembleListPofsActionUrl(mallId), function (result) {
        result.replace("\\\/", "\/");
        console.log(result);
    })
}

function getFsPathListOfMall(mallId){
    $.get();
}

function assembleListPofsActionUrl(mallId){
    return window.serverUrl + kListPofsOfMallActionUrl + "?mallId=" + mallId + "&operatorKey=" + operatorKey;
}

$(document).ready(function () {
    getPofsListOfMall(823);
});