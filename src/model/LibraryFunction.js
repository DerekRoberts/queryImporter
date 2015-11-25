/**
 * Wrapper around the Mongoose models to allow for functions to handle and consistency check.
 */

var mongoose = require("mongoose");

var LibraryFunction = function (conn) {

    this.conn = conn;

    this.fun = new this.conn.models.LibraryFunction();

    this.fun.name       = null;
    this.fun.definition = null;
    this.fun.user_id    = null;


};


LibraryFunction.prototype.commit = function (next) {

    var x = this.fun.toObject();

    delete x._id;

    var that = this;

    this.conn.models.LibraryFunction.findOneAndUpdate(
        {name: that.fun.name},
        x,
        {upsert: true},
        function (err) {

            if (err) {

                console.log(err);

            } else {

                console.log(that.fun.name + " was committed to Mongo");

            }

            next(err);

        }
    );

};

/**
 * @throws {TypeError} if the user parameter is an invalid type.
 * @param user {User}
 */
LibraryFunction.prototype.setUser = function (user) {

    if (!user) {
        throw new TypeError("Query.setUser(User) expects a single User type parameter, got: " + user + " instead.");
    }

    this.fun.user_id = mongoose.Types.ObjectId(user._id)
};

/**
 * @throws {TypeError} if name parameter is an invalid type.
 * @param name {String}
 */
LibraryFunction.prototype.setName = function (name) {

    if (!name || typeof name !== "string") {

        throw new TypeError("Query.setName(String) expects a single String type parameter, got: " + name + " instead.");

    }

    this.fun.name = name;

};

/**
 *
 * @throws {TypeError} if the code parameter is an invalid type.
 * @param code {String}
 */
LibraryFunction.prototype.setCode = function (code) {

    if (!code || typeof code !== "string") {

        throw new TypeError("Query.setCode(String) expects a single String type parameter, got: " + code + " instead.");

    }

    this.fun.definition = code;


};


module.exports = {LibraryFunction: LibraryFunction};