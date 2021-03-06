import Server from "../src/rest/Server";

import InsightFacade from "../src/controller/InsightFacade";
import {expect} from "chai";
import {InsightDatasetKind, InsightError} from "../src/controller/IInsightFacade";
import chai = require("chai");
import chaiHttp = require("chai-http");
import Response = ChaiHttp.Response;
import Log from "../src/Util";
import * as fs from "fs";

describe("Facade D3", function () {

    let facade: InsightFacade;
    let server: Server;

    chai.use(chaiHttp);

    before(function () {
        facade = new InsightFacade();
        server = new Server(4321);
        // TODO: start server here once and handle errors properly
        server.start().then((result: boolean) => {
            Log.trace("Server successfully started! " + result);
        }).catch((err: any) => {
            Log.error("Server crashed while starting! " + err.toString());
        });
    });

    after(function () {
        // TODO: stop server here once!
        server.stop().then((result: boolean) => {
            Log.trace("Server successfully stopped! " + result);
        }).catch((err: any) => {
            Log.error("Server crashed while stopping! " + err.toString());
        });
    });

    beforeEach(function () {
        // might want to add some process logging here to keep track of what"s going on
        Log.test("Running test");
    });

    afterEach(function () {
        // might want to add some process logging here to keep track of what"s going on
        Log.test("Ending test");
    });

    // Sample on how to format PUT requests
    /*
    it("PUT test for courses dataset", function () {
        try {
            return chai.request(SERVER_URL)
                .put(ENDPOINT_URL)
                .send(ZIP_FILE_DATA)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    expect(res.status).to.be.equal(204);
                })
                .catch(function (err) {
                    // some logging here please!
                    expect.fail();
                });
        } catch (err) {
            // and some more logging here!
        }
    });
    */

    // The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation

    it("PUT test for courses dataset (success)", function () {
        try {
            let data: Buffer = fs.readFileSync("./test/data/courses.zip");
            return chai.request("http://localhost:4321")
                .put("/dataset/courses/" + InsightDatasetKind.Courses)
                .send(data)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    Log.info("Server::echo(..) - responding " + 200);
                    expect(res.status).to.be.equal(200);
                })
                .catch(function (err: Response) {
                    Log.error(err + " :Shouldn't reject 1");
                    expect.fail();
                });
        } catch (err) {
            Log.error("Shouldn't reject 2");
            expect.fail();
        }
    });

    it("PUT test for courses dataset (fail)", function () {
        try {
            let data: Buffer = fs.readFileSync("./test/data/courses.zip");
            return chai.request("http://localhost:4321")
                .put("/dataset/courses_/" + InsightDatasetKind.Courses)
                .send(data)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    Log.info(res + " :Should not add dataset");
                    expect.fail();
                })
                .catch(function (err) {
                    Log.error("Server::echo(..) - responding 400");
                    expect(err.status).to.be.equal(400);
                });
        } catch (err) {
            Log.error("Server::echo(..) - responding 400");
            expect(err).to.be.instanceOf(InsightError);
        }
    });

    it("DELETE test for remove dataset (success)", function () {
        try {
            return chai.request("http://localhost:4321")
                .del("/dataset/courses")
                .then(function (res: Response) {
                    Log.info("Server::echo(..) - responding " + 200);
                    expect(res.status).to.be.equal(200);
                })
                .catch(function (err) {
                    Log.error(err + " :Shouldn't reject");
                    expect.fail();
                });
        } catch (err) {
            Log.error("Shouldn't reject");
            expect.fail();
        }
    });

    it("DELETE test for remove dataset (fail)", function () {
        try {
            return chai.request("http://localhost:4321")
                .del("/dataset/rooms_")
                .then(function (res: Response) {
                    Log.info(res + " :Shouldn't remove dataset");
                    expect.fail();
                })
                .catch(function (err) {
                    Log.error("Server::echo(..) - responding 400");
                    expect(err.status).to.be.equal(400);
                });
        } catch (err) {
            Log.error("Server::echo(..) - responding 400");
            expect(err.status).to.be.equal(400);
        }
    });

    it("GET test for list dataset", function () {
        try {
            return chai.request("http://localhost:4321")
                .get("/datasets")
                .then(function (res: Response) {
                    Log.info("Server::echo(..) - responding " + 200);
                    expect(res.status).to.be.equal(200);
                });
        } catch (err) {
            Log.error("Shouldn't reject");
            expect.fail();
        }
    });

    it("POST test for perform query (success)", function () {
        try {
            let query = {
                WHERE: {
                    GT: {
                        courses_avg: 97
                    }
                },
                OPTIONS: {
                    COLUMNS: [
                        "courses_dept",
                        "courses_avg"
                    ],
                        ORDER: "courses_avg"
                }
            };
            return chai.request("http://localhost:4321")
                .post("/query")
                .send(query)
                .set("Content-Type", "application/json")
                .then(function (res: Response) {
                    Log.info("Server::echo(..) - responding " + 200);
                    expect(res.status).to.be.equal(200);
                })
                .catch(function (err: Response) {
                    Log.error("Shouldn't reject" + err);
                    expect.fail();
                });
        } catch (err) {
            Log.error("Shouldn't reject");
            expect.fail();
        }
    });

    it("POST test for perform query (fail)", function () {
        try {
            let query: any = {
                    WHERE: {
                        AND: []
                    },
                    OPTIONS: {
                        COLUMNS: [
                            "courses_dept",
                            "courses_id",
                            "courses_avg"
                        ],
                        ORDER: "courses_avg"
                    }
                };
            return chai.request("http://localhost:4321")
                .post("/query")
                .send(query)
                .set("Content-Type", "application/json")
                .then(function (res: Response) {
                    Log.info(res + " :Shouldn't remove dataset not existing");
                    expect.fail();
                })
                .catch(function (err: Response) {
                    Log.error("Server::echo(..) - responding 400");
                    expect(err.status).to.be.equal(400);
                });
        } catch (err) {
            Log.error("Server::echo(..) - responding 400");
            expect(err.status).to.be.equal(400);
        }
    });

});
