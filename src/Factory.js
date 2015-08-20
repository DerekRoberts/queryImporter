/**
 * Created by sdiemert on 15-08-19.
 */

function Factory(proc) {

    proc = proc || {};

    var that = {};

    var create = function (data, conn) {

        throw new Error("Factory.create(Object, Object) is an abstract method, must be implemented by a sub-object");

    };

    var verifyInput = function (data) {

        throw new Error("Factory.verifyInput(Object) is an abstract method, must be implemented by a sub-object");

    };

    proc.verifyInput = verifyInput;

    that.create = create;

    return that;
}

module.exports = {Factory: Factory};
