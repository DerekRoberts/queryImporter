/**
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
