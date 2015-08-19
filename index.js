var QueryImporter = require("./src/QueryImporter").QueryImporter;

var q = QueryImporter();

q.connect("localhost", "27017", "query_composer_development", function (x) {

    if (x) {
        console.log("Connected!");

        q.import(function () {

            console.log("Done!");

        });

    } else {
        console.log("Failed to connect...");
    }
});

