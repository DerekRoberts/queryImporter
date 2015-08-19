/**
 * Created by sdiemert on 15-08-19.
 */

var mongoose        = require('mongoose');
var Query           = require("./model/Query").Query;
var mongoose_models = require("./model/models");
var fs              = require('fs');
var constants       = require("./constants");
var execSync        = require("child_process").execSync;

function QueryImporter(proc) {

    proc = proc || {};

    proc.models = null;

    var that = {};

    var connect = function (host, port, db, next) {

        if (!proc.connectPrecondition(host, port, db)) {

            throw new Error("QueryImporter.connect(String, String, String) failed precondition, did not attempt to connect to database");

        }


        var s = "mongodb://" + host + ":" + port + "/" + db;

        var conn = mongoose.createConnection();

        conn.open(s, {mongos: false}, function () {

            //See http://mongoosejs.com/docs/api.html#connection_Connection-readyState for db.readyState codes.

            //db.readyState === 1 means connected.
            if (conn.readyState !== 1) {

                next(false);

            } else {

                proc.conn = conn;
                mongoose_models.init(conn);

                next(true);

            }


        });


    };


    /**
     * Determines if the preconditions for connecting to MongoDB are met.
     *
     * @param host {String}
     * @param port {String}
     * @param db {String}
     *
     * @return {boolean} false if the preconditions are not met, true otherwise.
     */
    var connectPrecondition = function (host, port, db) {

        var portRegex = new RegExp("[0-9]{2,7}", 'g');

        if (!host || typeof host !== 'string') {

            console.log("QueryImporter.connectPrecondition() : Failed host check");
            return false

        } else if (!port || typeof port !== 'string' || !portRegex.exec(port)) {

            console.log("QueryImporter.connectPrecondition() : Failed port check");
            return false;

        } else if (!db || typeof port !== 'string') {

            console.log("QueryImporter.connectPrecondition() : Failed db check");
            return false;

        } else {

            return true;

        }

    };

    var importData = function (callback) {


        console.log("Starting import...");
        console.log("------------------");

        proc.clone();

        return callback();

        var q = new Query(proc.conn);

        q.setTitle("PDC-001");

        q.commit(function (e) {

            callback();

        });


    };

    var clone = function () {

        var reclone = constants.RECLONE || true;

        reclone = eval(reclone);

        //make a directory to put the repo in:
        if (!fs.existsSync(constants.TMP_DIR)) {
            fs.mkdirSync(constants.TMP_DIR);
        }

        var cmd = "git clone --branch " + constants.BRANCH + " " + constants.REPO + " " + constants.QUERIES_DIR;

        if (reclone) {

            console.log("Removing old " + constants.QUERIES_DIR + " if it exists and recloning from: " + constants.REPO);

            if (fs.existsSync(constants.QUERIES_DIR)) {
                //if the repo exists already, delete it and pull a fresh copy.
                execSync("rm -rf " + constants.QUERIES_DIR);
            }

            //clone a new copy of the the repo.
            console.log("Cloning into: " + constants.REPO + " branch: " + constants.BRANCH);
            execSync(cmd);

        } else {

            console.log("Reclone was false, will not overwrite any existing code in: " + constants.QUERIES_DIR);

            if (!fs.existsSync(constants.QUERIES_DIR)) {
                //clone a new copy of the the repo.
                console.log("Cloning into: " + constants.REPO + " branch: " + constants.BRANCH);
                execSync(cmd);
            }

        }

    };

    proc.connectPrecondition = connectPrecondition;
    proc.clone               = clone;

    that.connect = connect;
    that.import  = importData;

    return that;

}
module.exports = {QueryImporter: QueryImporter};