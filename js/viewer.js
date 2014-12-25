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
        result = base64decode(result);
        result = zip_inflate(result);
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

var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var base64DecodeChars = new Array(
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
    52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
    -1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14,
    15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
    -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);


function base64decode(str) {
    var c1, c2, c3, c4;
    var i, len, out;

    len = str.length;
    i = 0;
    out = "";
    while(i < len) {
        /* c1 */
        do {
            c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
        } while(i < len && c1 == -1);
        if(c1 == -1)
            break;

        /* c2 */
        do {
            c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
        } while(i < len && c2 == -1);
        if(c2 == -1)
            break;

        out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

        /* c3 */
        do {
            c3 = str.charCodeAt(i++) & 0xff;
            if(c3 == 61)
                return out;
            c3 = base64DecodeChars[c3];
        } while(i < len && c3 == -1);
        if(c3 == -1)
            break;

        out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));

        /* c4 */
        do {
            c4 = str.charCodeAt(i++) & 0xff;
            if(c4 == 61)
                return out;
            c4 = base64DecodeChars[c4];
        } while(i < len && c4 == -1);
        if(c4 == -1)
            break;
        out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
    }
    return out;
}
