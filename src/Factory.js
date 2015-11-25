/**
 * Created by sdiemert on 15-08-19.
 */

var fs        = require("fs");
var constants = require("./constants");

function Factory(proc) {

    proc = proc || {};

    var that = {};

    var create = function (data, conn) {

        throw new Error("Factory.create(Object, Object) is an abstract method, must be implemented by a sub-object");

    };

    var verifyInput = function (data) {

        throw new Error("Factory.verifyInput(Object) is an abstract method, must be implemented by a sub-object");

    };

    /**
     * Fetches javascript code from a file at the specified path.
     *
     * @param path {String} - the path with respect to the QUERY_DIR constant to the JS code we will fetch.
     *
     * @throws {TypeError} if the input parameter is invalid.
     *
     * @return {String} contains the JS code, null if the file could not be found.
     */
    var fetchCode  = function (path) {

        //check for valid input.
        if (!path || typeof path !== "string") {

            throw new TypeError("Factory.fetchCode(String) expects single String parameter, got: " + typeof path + " instead");

        }

        //check that we are looking at a JS file.
        if (!path.match(".*/.*\.js")) {

            console.log("Factory.fetchCode(String) could not read code from file: " + constants.QUERIES_DIR + path + " not a javascript file, expects file extension *.js");
            return null;

        }

        //check that the path exists.
        if (!fs.existsSync(constants.QUERIES_DIR + path)) {

            console.log("Factory.fetchCode(String) could not read code from file: " + constants.QUERIES_DIR + path + " does not exist");
            return null;

        }

        try {

            return fs.readFileSync(constants.QUERIES_DIR + path, "utf8");

        } catch (e) {

            console.log("Factory.fetchCode(String) failed to read code from file: " + constants.QUERIES_DIR + path + " there was the error: " + e);
            return null;

        }


    };

    proc.verifyInput = verifyInput;
    proc.fetchCode = fetchCode;

    that.create = create;

    return that;
}

module.exports = {Factory: Factory};
