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
var decryptKey = "IDS12345";

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
        console.log("SRC: ", result);

        result = base64decode(result);
        console.log("B64DECODED: ", result);

        var ar = s2a(result);
        console.log("TO AR: ", ar);

        result = a2s(unzipArray(ar));
        console.log("UNGZIPPED: ", result, " AND IN AR: ", s2a(result));

        result = utf8to16(result);
        console.log("INUTF16: ", result);

        result = des(decryptKey, result, 0, 0);
        console.log("UN-DES: ", result);

        ar = s2a(result);
        console.log("UNDES AR: ", ar);
    })
}

function getFsPathListOfMall(mallId){
    $.get();
}

function assembleListPofsActionUrl(mallId){
    return window.serverUrl + kListPofsOfMallActionUrl + "?mallId=" + mallId + "&operatorKey=" + operatorKey;
}

$(document).ready(function () {
    getPofsListOfMall(824);

    var source = "{}";
    encodeSource(source);
});

function decodeActionResult(originString){
    var result = base64decode(originString);
    result = window.unzip(result);
    result = utf8to16(result);
    result = des(decryptKey, result, 0, 0);
    console.log(result);
}

function encodeSource(string){
    console.log("ENC-SRC: ", string);

    var ar = s2a(string);
    console.log("INPUT AR: ", ar);

    string = des(decryptKey, string, 1, 0);
    console.log("DES-ENC: ", string);

    string = utf16to8(string);
    console.log("INUTF8: ", string);

    ar = s2a(string);
    ar = da2ba(ar);
    console.log("IN BINARY STR: ", ba2s(ar));

    ar = window.zip(result);
    string = a2s(ar);
    console.log("GZIPPED: ", ar, " IN STRING ", string);

    string = base64encode(string);
    console.log("B64ENCODED: ", string);

    return string;
}