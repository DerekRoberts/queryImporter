/**
 * Created by sdiemert on 15-08-19.
 */

var Factory         = require("./Factory").Factory;
var LibraryFunction = require("./model/LibraryFunction").LibraryFunction;
var fs              = require("fs");
var constants       = require("./constants");

function FunctionFactory(proc) {

    proc = proc || {};

    //inherits from Factory object.
    var that = Factory(proc);

    /**
     * Creates a new Query object from the data in a directive object.
     *
     * @param dir {Object} the directive object for the query.
     * @param user {User} the user object to associate with this query.
     * @param conn {Object} Mongoose connection object that contains the models we need.
     *
     * @return {Query} a query object
     */
    var create = function (dir, user, conn) {

        if (!proc.verifyInput(dir)) {

            console.log(dir.name + " failed verifyInput()");

            return null;
        }

        var f = new LibraryFunction(conn);

        f.setUser(user);
        f.setName(dir.name);

        var code = proc.fetchCode(dir.path);

        if (!code) {

            console.log("Failed to get query from: " + dir.path);
            return null;

        } else {

            f.setCode(code);

        }

        return f;

    };


    /**
     * Checks that the query's input is valid.
     *
     * @param dir {Object} a directive object for the query to make.
     *
     * @return {Boolean} true if the directive passes verification, false otherwise.
     */
    var verifyInput = function (dir) {

        if (!dir) {

            return false;

        } else if (!dir.type || dir.type !== "FUNCTION") {

            return false;

        } else if (!dir.name) {

            return false;

        } else if (!dir.path) {

            return false;

        } else if (dir.name === "initiatives") {


            if (constants.SKIP_INITS) {

                // The SKIP_INITS flag is used to toggle whether the initiatives() function is imported or not.
                //  If SKIP_INITS is true, the current initiatives function in the database will NOT be overwritten.
                //  If SKIP_INITS is false (or not set), the current initiatives function in the database WILL BE overwritten.

                return false;

            }

        } else {

            return true;

        }

    };

    proc.verifyInput = verifyInput;

    that.create = create;

    return that;
}

module.exports = {FunctionFactory: FunctionFactory};
