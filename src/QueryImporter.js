/**
 * Created by sdiemert on 15-08-19.
 */

var mongoose        = require('mongoose');
var Query           = require("./model/Query").Query;
var mongoose_models = require("./model/models");
var fs              = require('fs');
var constants       = require("./constants");
var execSync        = require("child_process").execSync;
var QueryFactory = require("./QueryFactory").QueryFactory;
var async        = require("async");

/**
 * An object to import objects (queries and functions) into the MongoDatabase.
 * @constructor
 *
 * @param proc {Object} allows sharing of "protected" fields between parent and child objects.
 *
 * @returns {QueryImporter}
 */
function QueryImporter(proc) {

    proc = proc || {};

    proc.models = null;
    proc.queryFactory = QueryFactory();
    proc.user   = null;

    proc.rejectedFunctions = 0;
    proc.rejectedQueries   = 0;
    proc.acceptedFunctions = 0;
    proc.acceptedQueries   = 0;

    var that = {};

    var connect = function (host, port, db, username, next) {

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

                proc.getUser(username, function (success) {

                    return next(success);

                });


            }

        });

    };

    var getUser = function (username, next) {

        proc.conn.models.User.find(
            {username: username},
            function (err, val) {

                if (err) {

                    console.log("QueryImporter.getUser(String, Function) failed with error: " + err);
                    return next(false);

                } else {

                    if (val.length < 1) {

                        //unable to find username.
                        console.log("Unable to find user in Mongo with username: " + username);
                        return next(false);

                    } else if (val.length > 1) {

                        //to many users with same name.
                        console.log("Found to many users in Mongo with username: " + username);
                        return next(false);

                    } else {

                        //save the user in the protected object for use later.
                        proc.user = val[0];
                        return next(true);

                    }

                }


            }
        )

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

        if (!proc.importDataPrecondition(callback)) {
            callback()
        }


        console.log("Starting import...");
        console.log("------------------");

        if (!proc.clone()) {
            return callback(constants.QUERIES_DIR + " did not have expected format, failed.");
        }

        //after this we can assume that the queries are in a valid directory structure.

        var items = proc.getQueriesFromDirectives();

        proc.commitItems(items, callback);

    };

    var importDataPrecondition = function (cb) {

        if (!cb || !(cb instanceof Function)) {
            console.log("QueryImporter.importData(Function) expects a single Function type parameter as a callback");
            return false;
        } else if (!proc.user) {
            console.log("QueryImporter.importData(Function) requires that the proc.user field be set.");
            return false;
        } else {
            return true;
        }


    };

    /**
     * @return {Array} contains objects, each object represents a query or a function.
     */
    var getQueriesFromDirectives = function () {

        var directives = [];

        //get all of the file names in an array
        var files = fs.readdirSync(constants.QUERIES_DIR + "directives/");

        //tmp variable for holding directives.
        var d = null;
        var q = null;

        var toReturn = [];

        for (var i in files) {

            //1. Filter out all non-json files based on file extensions.

            if (!files[i].match(".*.json$")) {
                //not a json file, skip.
                continue;
            }

            //2. Read in file and parse the JSON into an object

            try {

                d = JSON.parse(fs.readFileSync(constants.QUERIES_DIR + "directives/" + files[i], "utf8"));

            } catch (e) {
                console.log("Could not read directive from: " + constants.QUERIES_DIR + "directives/" + files[i]);
                continue;
            }

            //3. Generate queries and function objects from the directives.

            if (d && d.type && d.type === "QUERY") {

                //create a new query object.

                q = proc.queryFactory.create(d, proc.user, proc.conn);

                if (q) {

                    proc.acceptedQueries++;
                    toReturn.push(q);

                } else {

                    proc.rejectedQueries++;

                }

            } else if (d && d.type && d.type == "FUNCTION") {

                //TODO: Implement function management.

            }

        }

        return toReturn;

    };

    var commitItems               = function (items, callback) {

        async.each(
            items,
            function (item, next) {

                item.commit(next);

            }, function (err) {

                if (err) {
                    console.log(err)
                }

                callback(err);

            }
        )
    };

    /**
     * Ensures that the expected directories exist in the queries/ directory.
     *
     * @return {Boolean} - true if the format for the queries directory is as expected. False otherwise.
     */
    var verifyQueriesDirectoryFormat = function () {

        if (!fs.existsSync(constants.QUERIES_DIR) || !fs.lstatSync(constants.QUERIES_DIR).isDirectory()) {
            console.log("Could not find any directory at: " + constants.QUERIES_DIR);
            return false;
        } else if (!fs.existsSync(constants.QUERIES_DIR + "queries/") || !fs.lstatSync(constants.QUERIES_DIR + "queries/").isDirectory()) {
            console.log("Could not find any directory at: " + constants.QUERIES_DIR + "queries/");
            return false;
        } else if (!fs.existsSync(constants.QUERIES_DIR + "directives/") || !fs.lstatSync(constants.QUERIES_DIR + "directives/").isDirectory()) {
            console.log("Could not find any directory at: " + constants.QUERIES_DIR + "directive/");
            return false;
        } else if (!fs.existsSync(constants.QUERIES_DIR + "functions/") || !fs.lstatSync(constants.QUERIES_DIR + "functions/").isDirectory()) {
            console.log("Could not find any directory at: " + constants.QUERIES_DIR + "functions/");
            return false;
        } else if (!fs.existsSync(constants.QUERIES_DIR + "test/") || !fs.lstatSync(constants.QUERIES_DIR + "test/").isDirectory()) {
            console.log("Could not find any directory at: " + constants.QUERIES_DIR + "test/");
            return false;
        } else {
            console.log("Passed directory structure tests");
            return true;
        }


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

        //ensure that the result is what we expect.
        return proc.verifyQueriesDirectoryFormat();

    };

    proc.connectPrecondition          = connectPrecondition;
    proc.clone                        = clone;
    proc.verifyQueriesDirectoryFormat = verifyQueriesDirectoryFormat;
    proc.getQueriesFromDirectives = getQueriesFromDirectives;
    proc.commitItems              = commitItems;
    proc.getUser                  = getUser;
    proc.importDataPrecondition   = importDataPrecondition;

    that.connect = connect;
    that.import  = importData;

    return that;

}
module.exports = {QueryImporter: QueryImporter};