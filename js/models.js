/**
 * Created by sagnitude on 14/12/25.
 */

var IDSPOFS = function(id, x, y, z, floorId, name, status, fullShotId, poiId){
    var ele = Object();
    ele.id = id;
    ele.x = x;
    ele.y = y;
    ele.z = z;
    ele.floorId = floorId;
    ele.name = name;
    ele.status = status;
    ele.fullShotId = fullShotId;
    ele.poiId = poiId;
    return ele;
};

var IDSFSPath = function (id, p1, p2, mallId) {
    var ele = Object();
    ele.id = id;
    ele.p1 = p1;
    ele.p2 = p2;
    ele.mallId = mallId;
    return ele;
};

var IDSFullShot = function(id, interAngle, image, shotTime){
    var ele = Object();
    ele.id = id;
    ele.interAngle = interAngle;
    ele.image = image;
    ele.shotTime = shotTime;
    return ele;
};

var IDSEditPart = function(id, name, fullShotId, type, objectId, op, shape, productId){
    var ele = Object();
    ele.id = id;
    ele.name = name;
    ele.fullShotId = fullShotId;
    ele.type = type;
    ele.objectId = objectId;
    ele.op = op;
    ele.shape = shape;
    ele.productId = productId;
    return ele;
};

var IDSProduct = function(id, name){
    var ele = Object();
    ele.id = id;
    ele.name = name;
    return ele;
};

function linkFullShotIntoPofs(pofs, fullShot){
    if(pofs.fullShotId === fullShot.id){
        pofs.fullShot = fullShot;
    }
}
