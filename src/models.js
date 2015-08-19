/**
 * Created by sdiemert on 15-08-19.
 *
 * Contains models used by the query importer tool. These should reflect objects that are stored in the Mongo database.
 */

var mongoose = require("mongoose");

var querySchema = mongoose.Schema(
    {
        title      : String,
        _type      : {type: String, default: "Query"},
        description: String,
        map        : String,
        reduce     : String,
        user_id    : mongoose.Schema.ObjectId
    }, {
        collection: 'queries'
    }
);

var functionSchema = mongoose.Schema(
    {
        name      : String,
        user_id   : mongoose.Schema.ObjectId,
        definition: String
    }, {
        collection: "library_functions"
    }
);

var userSchema = mongoose.Schema(
    {
        first_name: String,
        last_name : String,
        username  : String,
        admin     : Boolean
    }, {
        collection: "users"
    }
);

var Query            = mongoose.model("Query", querySchema);
var Library_Function = mongoose.model("LibraryFunction", functionSchema);
var User             = mongoose.model("User", userSchema);

module.exports = {Query: Query, Function: Library_Function, User: User};
