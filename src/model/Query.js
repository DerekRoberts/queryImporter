/**
 * Wrapper around the Mongoose models to allow for functions to handle and consistency check.
 */

var QUERY_REGEX = "[A-Z]{3,5}-[a-zA-Z0-9]{3,}"; //matches things of form: PDC-XXX...

var QUERY_TYPES = ["RATIO", "CLASS", "STRATIFIED"]; //Allowed query types.
var QUERY_PANELS = ["PPhRR", "PopulationHealth", "PracticeReflection", "Attachment"];

var Query = function (conn) {

    this.conn = conn;

    this.query = new this.conn.models.Query();
    //TODO: Change this.query.reduce so it isn't hard coded!

    this.query.title        = null;
    this.query.description  = null;
    this.query.display_name = null;
    this.query.unit         = null;
    this.query.target       = {value: null, reference: null, description: null};
    this.query.query_type   = null;
    this.query.map          = null;
    this.query.reduce       = "function reduce(key, values){return Array.sum(values);}";


};

Query.prototype.commit = function (next) {

    var x = this.query.toObject();

    delete x._id;

    var that = this;

    this.conn.models.Query.findOneAndUpdate(
        {title: that.query.title},
        x,
        {upsert: true},
        function (err) {

            if (err) {

                console.log(err);

            } else {

                console.log(that.query.title + " was updated in MongoDB");

            }

            next(err);

        }
    );

};

/**
 * Sets the title of the query. Note, the title is used as the unique idenitifier for the query
 * across the PDC system. It should have form "XXX-xxxx" for example: "PDC-001"
 *
 * @throws {TypeError} - If the input is invalid type or does not meet the formatting specification for query titles.
 *
 * @param t {String} - The title of the string, must be non-empty String type.
 */
Query.prototype.setTitle = function (t) {

    // empty string, "", evaluates to false.
    if (!t || typeof t !== "string") {
        throw new TypeError("Query.setTitle(String) expects a single String type argument, got: " + (typeof t) + " instead.");
    }

    //check that the query title conforms to our specification.
    var re = new RegExp(QUERY_REGEX, "g");

    if (re.exec(t)) {
        this.query.title = t;
    } else {
        throw new TypeError("Query.setTItle(String) expects a title that conforms to the regular expression: " + QUERY_REGEX);
    }

};

/**
 * Sets the description field of the query.
 *
 * @throws {TypeError} if the parameter d is not a valid String.
 *
 * @param d {String} A description to show for the query. Must be a non-empty String.
 */
Query.prototype.setDescription = function (d) {

    if (!d || typeof d !== "string") {
        throw new TypeError("Query.setDescription(String) expects single String parameter, got: " + (typeof d) + " instead.");
    }


    this.query.description = d;

};

/**
 * Sets the map function for the query.
 *
 * @throws {TypeError} if the input is not a valid String, or is an empty String.
 *
 * @param m {String} The map function string, must be a non-empty string that contains valid JavaScript.
 */
Query.prototype.setMap = function (m) {

    if (!m || typeof m !== "string") {

        throw new TypeError("Query.setMap(String) expects single String parameter, got: " + (typeof m) + " instead.");
    }

    //TODO: Add javascript linting here, for now assume it works.

    this.query.map = m;

};

/**
 * Sets the reduce function for the query.
 *
 * @throws {TypeError} if the input is not a valid String, or is an empty String.
 *
 * @param m {String} The reduce function string, must be a non-empty string that contains valid JavaScript.
 */
Query.prototype.setReduce = function (r) {

    if (!r || typeof r !== "string") {

        throw new TypeError("Query.setReduce(String) expects single String parameter, got: " + (typeof m) + " instead.");
    }

    //TODO: Add javascript linting here, for now assume it works.

    //TODO: Remove Error and subsequent line uncomment to support dynamic reduce functions.
    throw new Error("Query object currently defaults to hardcoded reduce function, see Query.js to change this.");
    //this.query.reduce = r;

};

/**
 * Sets the display name for the query.
 *
 * @throws {TypeError} if the input is not a valid String, or is an empty String.
 *
 * @param d {String} The display_name string, must be a non-empty string that contains valid JavaScript.
 */
Query.prototype.setDisplayName = function (d) {

    if (!d || typeof d !== "string") {

        throw new TypeError("Query.setDisplayName(String) expects single String parameter, got: " + (typeof m) + " instead.");
    }

    this.query.display_name = d;

    //TODO: Eventually remove this, the 'name' field is required by hQuery for populating its UI.
    this.query.name = d;

};

/**
 * Sets the unit for the query.
 *
 * @throws {TypeError} if the input is not a valid String, or is an empty String.
 *
 * @param d {String} The unit string, must be a non-empty string that contains valid JavaScript.
 */
Query.prototype.setUnit = function (u) {

    if (!u || typeof u !== 'string') {

        throw new TypeError("Query.setUnit(String) expects single String parameter, got: " + (typeof m) + " instead.");
    }

    this.query.unit = u;

};

Query.prototype.setTarget = function (target_value, target_reference, target_description) {

    if (!target_value || typeof target_value !== "string") {

        throw new TypeError("Query.setTarget(String, String, String) expects first parameter to be String , got: " + (typeof m) + " instead.");

    }

    this.query.target.value       = target_value;
    this.query.target.description = target_description || null;
    this.query.target.reference   = target_reference || null;

};

/**
 * Sets the type of query. Type is one of ratio, stratified, class
 *
 * @throws TypeError} if the input is a invalid String or is not in the QUERY_TYPES array.
 *
 * @param type {String} the identifier for the query, must be a string that is in QUERY_TYPES.
 */
Query.prototype.setType = function (type) {

    if (!type || typeof type !== "string" || QUERY_TYPES.indexOf(type) < 0) {

        throw new TypeError("Queryl.setType(String) expects parameter to be a String, got: " + (typeof type) + " instead.");

    }

    this.query.query_type = type;

};

/**
 * Sets the panels array for the query to indicate which query "panel" is associated. Panel names must by in QUERY_PANELS array.
 *
 * @throws {TypeError} If the input is not an Array or the values in the are not valid Strings which are part of the QUERY_PANELS array.
 *
 * @param p {Array} Contains strings that identify which panels this query is involved with.
 */
Query.prototype.setPanels = function (p) {

    if (!p || !(p instanceof Array)) {

        throw new TypeError("Query.setPanels(Array) expects single Array parameter, got: " + (typeof m) + " instead.");
    }

    for (var i = 0; i < p.length; i++) {

        if (!p[i] || typeof p[i] !== "string" || !QUERY_PANELS.indexOf(p[i]) < 0) {

            //clear the panels array before we throw the error.
            this.query.panels = [];

            throw new TypeError("Query.setPanels(Array) expects elements of Array parameter to be of type String, and also be in QUERY_PANELS array");

        } else {

            this.query.panels.push(p[i]);

        }


    }


};

module.exports = {Query: Query};