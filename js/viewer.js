/**
 * Created by sagnitude on 14/12/25.
 */

//variables
var allPofs, allFsPath, currentMall, floors, displayingPofs, psv;

//constants
window.serverUrl = "http://www.indoorstar.com/ids/";
//window.serverUrl = "http://demo.sagnitude.com/ids/";
window.dataServer = "http://www.indoorstar.com:6601/";
window.windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
window.windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

var kListPofsOfMallActionUrl = "listPofsOfMall.action";
var kListFsPathOfMallActionUrl = "listFsPathOfMall.action";
var kGetMallWithFullShotActionUrl = "listMallWithFullShot.action";

function fetchActionJson(url, cb){
    //$.get(url, function (data, status) {
    //    if(data.s === 0){
    //        var resultSet = data.d;
    //        console.log(data.m);
    //        return cb(resultSet);
    //    }else{
    //        console.log("Data fetch failed: ", data.m);
    //    }
    //}, "json");

    $.ajax({
        url: url,
        type: 'GET',
        success: function(data, status){
            if(data.s === 0){
                var resultSet = data.d;
                console.log(data.m);
                return cb(resultSet);
            }else{
                console.log("Data fetch failed: ", data.m);
            }
        }
    });
}

function handleExtractedMallObject(mallObject){
    currentMall = mallObject;

    allFsPath = currentMall.fsps;
    allPofs = Object();

    var unsortedFloors = [];

    for(var key in currentMall.l){
        var floor = currentMall.l[key];
        floor.g = null;
        floor.pois = null;
        unsortedFloors.push(floor);
        allPofs = mergeObject(allPofs, floor.pofs);
    }

    unsortedFloors.sort(function(a, b){return b.level - a.level});

    floors = unsortedFloors;

    $('#accordion').html("");

    for(var floor in floors){
        $('#accordion').append(getFloorElement(floors[floor]));
    }
    try{
        $('#accordion').accordion().accordion("destroy").accordion({
            heightStyle: "content",
            collapsible: true,
            event: "click hoverintent"
        });
        $('.pofs_icon_table').selectable({
            selected: function(event, ui){
                trySelectPofs(ui.selected.innerHTML);
            }
        });
    }catch(e){
        console.log(e);
    }
}

function loadMallFromLocalFile(filePath){
    $.get(filePath, function(result){
        handleExtractedMallObject(result);
    });
}

function trySelectPofs(pofsId){
    if(displayingPofs){
        if(Number(pofsId) !== displayingPofs.id){
            loadPofsFullShot(pofsId);
        }
    }else{
        loadPofsFullShot(pofsId);
    }
}

function loadPofsFullShot(pofsId){
    var pofs = allPofs[pofsId];
    console.log(pofs);
    displayingPofs = pofs;
    loadPictureFromUrl(pofs.fullShot, pofs.id);
}

function loadPictureFromUrl(fullShot, pofsId){
    var div = document.getElementById('container');

//    var url = window.location.origin + "/" + fullShot.image;
    var url = window.dataServer + fullShot.image;

    //$('#hidden_img_loader').attr("src", url);

    var adjacents = [];

    for(var key in allFsPath){
        var fspath = allFsPath[key];
        if(fspath.p1 === pofsId){
            adjacents.push(fspath.p2);
        }else if(fspath.p2 === pofsId){
            adjacents.push(fspath.p1);
        }
    }

    var adAgPairs = Object();

    for(var k in adjacents){
        var p2 = allPofs[adjacents[k]];
        var angle = Math.atan2(p2.y - allPofs[pofsId].y, p2.x - allPofs[pofsId].x);
        adAgPairs[adjacents[k]] = angle;
    }

    psv = new PhotoSphereViewer({
        panorama: url,
        container: div,
        anime: false,
        src: url,
        curves: fullShot,
        adjacents: adAgPairs,
        onJumpCallBack: function(targetPofsId){
            trySelectPofs(targetPofsId);
        }
    });
}

function getPofsListOfMall(mallId){
    fetchActionJson(assembleListPofsActionUrl(mallId), function (result) {
        allPofs = JSON.parse(result);
        fillPofsInTable();
    });
}

function getFsPathListOfMall(mallId){
    fetchActionJson(assembleListFsPathActionUrl(mallId), function (result) {
        allFsPath = JSON.parse(result);
    });
}

function getMallWithFullShot(mallId){
    fetchActionJson(window.serverUrl + kGetMallWithFullShotActionUrl + "?mallId=" + mallId + "&operatorKey=" + operatorKey, function(result) {
        handleExtractedMallObject(JSON.parse(decodeActionRawData(result)));
    });
}

function getFloorElement(floor){
    var h3 = "<h3>"+floor.nm+"</h3>";
    var div = "<div id=\"floor_"+floor.id+"\"> " + "<ol class=\"pofs_icon_table\">";
    var tail = "</ol>" + " </div>";

    var result = h3 + div;
    for(var key in floor.pofs){
        result += "<li class=\"ui-widget-content\">"+key+"</li>";
    }
    result += tail;
    return result;
}

//@deprecated
function fillPofsInTable(){
    $('#list_wrapper').html("<table class=\"table table-bordered table-hover\" id=\"pofs_table\"></table>>");
    for (var key in allPofs){
        $("#pofs_table").append("<tr><td>" + key + "</td></tr>");
    }
}

function assembleListPofsActionUrl(mallId){
    return window.serverUrl + kListPofsOfMallActionUrl + "?mallId=" + mallId + "&operatorKey=" + operatorKey;
}

function assembleListFsPathActionUrl(mallId){
    return window.serverUrl + kListFsPathOfMallActionUrl + "?mallId=" + mallId;
}

function assembleGetMallWithFullShotActionUrl(mallId){
    return window.serverUrl + kGetMallWithFullShotActionUrl + "?mallId=" + mallId + "&operatorKey=" + operatorKey;
}

$(document).ready(function () {
    loadMallFromLocalFile("./small.json");
    //getMallWithFullShot(823);
    //getPofsListOfMall(823);
    //getFsPathListOfMall(823);
});

function mergeObject(o1, o2){
    for(var key in o2){
        o1[key] = o2[key];
    }
    return o1;
}

var Event = {
    addHandler: function (oElement, sEvent, fnHandler) {
        oElement.addEventListener ? oElement.addEventListener(sEvent, fnHandler, false) : oElement.attachEvent("on" + sEvent, fnHandler)
    },
    removeHandler: function (oElement, sEvent, fnHandler) {
        oElement.removeEventListener ? oElement.removeEventListener(sEvent, fnHandler, false) : oElement.detachEvent("on" + sEvent, fnHandler)
    }
};