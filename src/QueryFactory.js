/**
 * Created by sdiemert on 15-08-19.
 */

var Factory = require("./Factory").Factory;
var Query   = require("./model/Query").Query;

function QueryFactory(proc) {

    proc = proc || {};

    var that = Factory();

    /**
     *
     * @param dir {Object} the directive object for the query.
     * @param conn {Object} Mongoose connection object that contains the models we need.
     *
     * @return {Query} a query object
     */
    var create = function (dir, conn) {

        if (!proc.verifyInput(dir)) {
            return null;
        }

        console.log("query: " + dir.title + " passed verifyInput()");

        var q = new Query(conn);

        q.setTitle(dir.title);
        q.setDisplayName(dir.display_name);
        q.setDescription(dir.description);
        q.setType(dir.query_type);


        //TODO: Makes these fetch code....
        q.setMap(dir.map);
        //q.setReduce(dir.reduce);


        //the remainder of these fields are optional, so we need to check that they are
        //non-null before we try to use them.

        try {

            if (dir.unit) {
                q.setUnit(dir.unit);
            }

            if (dir.target && dir.target.value) {
                q.setTarget(dir.target.value, dir.target.reference, dir.target.description);
            }

            if (dir.panels && dir.panels.length > 0) {
                q.setPanels(dir.panels);
            }

        } catch (e) {

            console.log("failed to create a non-critical field in query object");

        }


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

        } else if (!dir.type) {

            return false;

        } else if (!dir.title) {

            return false;

        } else if (!dir.display_name) {

            return false;

        } else if (!dir.description) {

            return false;

        } else if (!dir.query_type) {

            return false;

        } else if (!dir.map) {

            return false;

        } else if (!dir.reduce) {

            return false;

        } else {

            return true;

        }

    };

    proc.verifyInput = verifyInput;

    that.create = create;

    return that;
}

module.exports = {QueryFactory: QueryFactory};
