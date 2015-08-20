var parseArgs = require('minimist'); //provides argument processing.

var QueryImporter = require("./src/QueryImporter").QueryImporter;

var q = QueryImporter();

var global_vars = {};

function processArgs(args) {

    //find the high level action:
    if (args._.length <= 1) {// this did not give an explicit action
        return "no_action";
    } else if (args._[2] == "import") {
        //this corresponds to importing the queries into the database.
        //if we get here, we need to populate the globa global_vars object.

        //first check that the bear minimum of params are given:
        if ((args["mongo-host"] == null || args["mongo-host"] == undefined) ||
            (args["mongo-port"] == null || args["mongo-port"] == undefined) ||
            (args["mongo-db"] == null || args["mongo-db"] == undefined)
        ) {
            //if they are here, we are missing an input parameter for the database.
            return "missing_param";
        }

        //if we get here we know we have enough to connect to the database.
        global_vars.host     = args["mongo-host"];
        global_vars.port     = args["mongo-port"];
        global_vars.database = args["mongo-db"];

        if (args["mongo-user"] != null && args["mongo-user"] != undefined) {
            global_vars.user = args["mongo-user"];
        }

        if (args["mongo-pass"] != null && args["mongo-pass"] != undefined) {
            global_vars.user = args["mongo-pass"];
        }

        if (args["pdc-user"] != null && args["pdc-user"] != undefined) {
            global_vars.pdc_user = args["pdc-user"];
        } else {
            global_vars.pdc_user = "admin";
        }

        return "import";
    }

}

function runImport() {

    q.connect(global_vars.host, global_vars.port, global_vars.database, global_vars.pdc_user, function (x) {

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

}


function main() {

    var argv = parseArgs(process.argv);

    var action = processArgs(argv);

    switch (action) {

        case "no_action":
            break;
        case "missing_param":
            break;
        case "import":
            runImport();
            break;
        default:
            break;

    }

}

//Call the main function;
main();

