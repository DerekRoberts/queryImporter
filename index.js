var QueryImporter = require("./src/QueryImporter").QueryImporter;

var q = QueryImporter();

q.connect("localhost", "27017", "query_composer_development", 'admin', function (x) {

    if (x) {
        console.log("Connected!");

        q.import(function (err) {

            console.log("==========================");

            if (err) {
                console.log("Importing failed with error:");
                console.log(err);
            } else {

                console.log("Importing completed successfully");
            }

            process.exit();

        });

    } else {

        console.log("Failed to connect...");
        process.exit();

    }
});

