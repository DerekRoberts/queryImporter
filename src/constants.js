/**
 * Constants that the importer depends on. These may specified at the commandline when running the importer.
 * This file contains their default values which are used if they are not avaliable via process.env.XXXX.
 *
 * Created by sdiemert on 15-08-19.
 */

module.exports = {

    //paths
    ROOT       : process.env.ROOT || "./",
    CODE_DIR   : process.env.CODE_DIR || "./src/",
    TMP_DIR    : process.env.TMP_DIR || "./tmp/",
    QUERIES_DIR: process.env.QUERIES_DIR || "./tmp/queries/",

    //control vars
    RECLONE: process.env.RECLONE || true,
    REPO   : process.env.REPO || "https://github.com/PhysiciansDataCollaborative/queries.git",
    BRANCH : process.env.BRANCH || "master"

};
