var currentMall, allFsPath, allPofs, psv, displayingPofs;

window.dataServer = "http://www.indoorstar.com:6601/";

angular.module('panoViewer', ['ui.bootstrap', 'ngCookies'])
    .controller('ListCtrl', function($scope, $http) {
        $scope.loadData = function(mid){
            $http.get("http://www.indoorstar.com/ids/listMallWithFullShot.action?mallId=" + mid + "&endUserSn=" + "1234").success(function(response){
                $scope.handleResponse(response);
            });
        };

        $scope.loadData(1174);

        $http.get("mall.json").success(function(response){
            $scope.handleResponse(response);
        });

        $scope.handleResponse = function(response) {
            currentMall = JSON.parse(decodeURI(response.d));

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

            $scope.floors = unsortedFloors;
        };

        $scope.loadPicture = function(id) {
            loadPofsFullShot(id);
        };
    }).controller('MainCtrl', function($scope, $http, $cookieStore, $cookies) {
        //
    }).controller('ViewCtrl', function($scope) {
        //
    }).filter('orderByObjectProperty', function() {
        return function(items, field, reverse) {
            var filtered = [];
            angular.forEach(items, function(item) {
                filtered.push(item);
            });
            filtered.sort(function (a, b) {
                return (a[field] > b[field] ? 1 : -1);
            });
            if(reverse) filtered.reverse();
            return filtered;
        };
    });

var operatorKey = "FA07C1D5-800E-4065-8A40-7DD2D925C1A3";

function loadPofsFullShot(pofsId){
    var pofs = allPofs[pofsId];
    console.log(pofs);
    displayingPofs = pofs;
    loadPictureFromUrl(pofs.fullShot, pofs.id);
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

function loadPictureFromUrl(fullShot, pofsId){
    var div = document.getElementById('container');

    var url = window.dataServer + fullShot.image;

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