import {expect} from "chai";
import * as fs from "fs-extra";
import {InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "../src/controller/IInsightFacade";
import InsightFacade from "../src/controller/InsightFacade";
import Log from "../src/Util";
import TestUtil from "./TestUtil";
import Scheduler from "../src/scheduler/Scheduler";
import {SchedRoom, SchedSection, TimeSlot} from "../src/scheduler/IScheduler";
import SchedulerTestHelper from "../src/scheduler/SchedulerTestHelper";

export interface ITestScheduler {
    title: string;
    sections: any;
    rooms: any;
    result: any;
    filename: string;
}

// *** Hannah said to write tests like how we did the tests for performQuery (ie: make a bunch of json files
// and have the inputs in there (before it was "query" as input, but for scheduler, inputs are "sections"
// and "rooms"). Expected output is "result" in the json file
// Not sure exactly about how to route this test suite to go through each json file in test/scheduler
describe("Scheduler tests: small inputs, checks outputted timetable is correct", () => {
    let scheduler: Scheduler = null;
    let scheduleTest: SchedulerTestHelper = null;
    let testSchedules: ITestScheduler[] = [];

    // Load all the test queries, and call addDataset on the insightFacade instance for all the datasets
    before(function () {
        Log.test(`Before: ${this.test.parent.title}`);

        // Load the query JSON files under test/queries.
        // Fail if there is a problem reading ANY query.
        try {
            // **NOT SURE IF THIS IS RIGHT. In performQuery, it had readTestQuery() from TestUtil.. so I made
            // something similar in TestUtil but for scheduler. Not sure if we are supposed to touch TestUtil
            testSchedules = TestUtil.readTestScheduler();
        } catch (err) {
            expect.fail("", "", `Failed to read one or more test queries. ${err}`);
        }
    });

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });

    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });

    // Dynamically create and run a test for each test in testSchedules.
    // Creates an extra "test" called "Should run test queries" as a byproduct.
    // **** also not sure about if this is how to write the test that gets performed on each json file..
    // Hannah said when starting out, test small samples to make sure schedule() outputs the exact timetable we expect
    // it to be (ie: "result" in the json file. But that for larger ones, we should test that hard constraints pass
    // and that the optimalityscore passes (ie: is above a threshold)
    it("Should run test scheduler", function () {
        describe("Dynamic Scheduler tests", function () {
            for (const test of testSchedules) {
                it(`[${test.filename}] ${test.title}`, function () {
                    expect(scheduler.schedule(test.sections, test.rooms)).to.deep.equal(test.result);
                    expect(scheduleTest.passHardConstraints(scheduler.schedule(test.sections, test.rooms),
                        test.sections, test.rooms)).to.equal(true);
                    expect(scheduleTest.calcOptimalityScore(scheduler.schedule(test.sections, test.rooms),
                        test.sections)).to.be.at.least(0.90);
                });
            }
        });
    });
});

// BELOW: first-attempt at writing tests. Apparently writing them this way was wrong
//
//
// describe("Scheduler schedule (small samples - no addDataset/performQuery called)", function () {
//     let scheduler: Scheduler = null;
//     let scheduleTest: SchedulerTestHelper = null;
//
//     beforeEach(function () {
//         Log.test(`BeforeTest: ${this.currentTest.title}`);
//         scheduler  = new Scheduler();
//         scheduleTest = new SchedulerTestHelper();
//     });
//
//     after(function () {
//         Log.test(`After: ${this.test.parent.title}`);
//     });
//
//     afterEach(function () {
//         Log.test(`AfterTest: ${this.currentTest.title}`);
//     });
//
//     it("Test 1: Sample input (from course website) - hard constraint PASS, score PASS?", function () {
//         let sections = [ { courses_dept: "cpsc", courses_id: "340", courses_uuid: "1319", courses_pass: 101,
//             courses_fail: 7, courses_audit: 2},
//             { courses_dept: "cpsc", courses_id: "340", courses_uuid: "3397", courses_pass: 171, courses_fail: 3,
//                 courses_audit: 1 },
//             { courses_dept: "cpsc", courses_id: "344", courses_uuid: "62413", courses_pass: 93, courses_fail: 2,
//                 courses_audit: 0 },
//             { courses_dept: "cpsc", courses_id: "344", courses_uuid: "72385", courses_pass: 43, courses_fail: 1,
//                 courses_audit: 0} ];
//         let rooms = [ { rooms_shortname: "AERL", rooms_number: "120", rooms_seats: 144, rooms_lat: 49.26372,
//                 rooms_lon: -123.25099},
//             { rooms_shortname: "ALRD", rooms_number: "105", rooms_seats: 94,
//             rooms_lat: 49.2699, rooms_lon: -123.25318},
//             { rooms_shortname: "ANGU", rooms_number: "098", rooms_seats: 260,
//             rooms_lat: 49.26486, rooms_lon: -123.25364
//             }, { rooms_shortname: "BUCH", rooms_number: "A101", rooms_seats: 275, rooms_lat: 49.26826,
//                 rooms_lon: -123.25468} ];
//         let schedule = scheduler.schedule(sections, rooms);
//         expect(scheduleTest.passHardConstraints(schedule, sections, rooms)).to.equal(true);
//         expect(scheduleTest.calcOptimalityScore(schedule, sections)).to.be.at.least(0.95);
//     });
//
//     it("Test 2: 4 sections but only 2 rooms: hard constraints pass but score will fail (E score low)", function () {
//         let sections = [
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "1319",
//                 "courses_pass": 101,
//                 "courses_fail": 7,
//                 "courses_audit": 2
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "3397",
//                 "courses_pass": 171,
//                 "courses_fail": 3,
//                 "courses_audit": 1
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "344",
//                 "courses_uuid": "62413",
//                 "courses_pass": 93,
//                 "courses_fail": 2,
//                 "courses_audit": 0
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "344",
//                 "courses_uuid": "72385",
//                 "courses_pass": 43,
//                 "courses_fail": 1,
//                 "courses_audit": 0
//             }
//         ];
//         let rooms = [
//             {
//                 "rooms_shortname": "AERL",
//                 "rooms_number": "120",
//                 "rooms_seats": 144,
//                 "rooms_lat": 49.26372,
//                 "rooms_lon": -123.25099
//             },
//             {
//                 "rooms_shortname": "ALRD",
//                 "rooms_number": "105",
//                 "rooms_seats": 94,
//                 "rooms_lat": 49.2699,
//                 "rooms_lon": -123.25318
//             }
//         ];
//         let schedule = scheduler.schedule(sections, rooms);
//         expect(scheduleTest.passHardConstraints(schedule, sections, rooms)).to.equal(true);
//         expect(scheduleTest.calcOptimalityScore(schedule, sections)).to.be.lessThan(0.95);
//     });
//
//     it("Test 3: 1 section for 1 room - hard constraints PASS, score PASS", function () {
//         let sections = [
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "1319",
//                 "courses_pass": 101,
//                 "courses_fail": 7,
//                 "courses_audit": 2
//             }
//         ];
//         let rooms = [
//             {
//                 "rooms_shortname": "AERL",
//                 "rooms_number": "120",
//                 "rooms_seats": 144,
//                 "rooms_lat": 49.26372,
//                 "rooms_lon": -123.25099
//             }
//         ];
//         let schedule = scheduler.schedule(sections, rooms);
//         expect(scheduleTest.passHardConstraints(schedule, sections, rooms)).to.equal(true);
//         expect(scheduleTest.calcOptimalityScore(schedule, sections)).to.be.at.least(0.95);
//     });
//
//     it("Test 4: 1 section but room too small - hard constraint PASS (empty schedule), score FAILS", function () {
//         let sections = [
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "1319",
//                 "courses_pass": 101,
//                 "courses_fail": 7,
//                 "courses_audit": 2
//             }
//         ];
//         let rooms = [
//             {
//                 "rooms_shortname": "AERL",
//                 "rooms_number": "120",
//                 "rooms_seats": 50,
//                 "rooms_lat": 49.26372,
//                 "rooms_lon": -123.25099
//             }
//         ];
//         let schedule = scheduler.schedule(sections, rooms);
//         expect(scheduleTest.passHardConstraints(schedule, sections, rooms)).to.equal(true);
//         expect(scheduleTest.calcOptimalityScore(schedule, sections)).to.be.lessThan(0.95);
//     });
//
//     it("Test 5: All 15 sections from same course, valid (one goes to each of 15 timeslots) " +
//         "- hard constraints PASS, score PASS?", function () {
//         let sections = [
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "1",
//                 "courses_pass": 100,
//                 "courses_fail": 7,
//                 "courses_audit": 2
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "2",
//                 "courses_pass": 123,
//                 "courses_fail": 3,
//                 "courses_audit": 1
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "3",
//                 "courses_pass": 93,
//                 "courses_fail": 2,
//                 "courses_audit": 0
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "4",
//                 "courses_pass": 43,
//                 "courses_fail": 1,
//                 "courses_audit": 0
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "5",
//                 "courses_pass": 80,
//                 "courses_fail": 1,
//                 "courses_audit": 0
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "6",
//                 "courses_pass": 130,
//                 "courses_fail": 1,
//                 "courses_audit": 0
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "7",
//                 "courses_pass": 100,
//                 "courses_fail": 1,
//                 "courses_audit": 0
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "8",
//                 "courses_pass": 73,
//                 "courses_fail": 1,
//                 "courses_audit": 20
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "9",
//                 "courses_pass": 101,
//                 "courses_fail": 5,
//                 "courses_audit": 0
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "10",
//                 "courses_pass": 43,
//                 "courses_fail": 1,
//                 "courses_audit": 100
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "11",
//                 "courses_pass": 43,
//                 "courses_fail": 100,
//                 "courses_audit": 0
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "12",
//                 "courses_pass": 90,
//                 "courses_fail": 5,
//                 "courses_audit": 0
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "13",
//                 "courses_pass": 90,
//                 "courses_fail": 25,
//                 "courses_audit": 0
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "14",
//                 "courses_pass": 60,
//                 "courses_fail": 5,
//                 "courses_audit": 0
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "15",
//                 "courses_pass": 99,
//                 "courses_fail": 5,
//                 "courses_audit": 0
//             }
//         ];
//         let rooms = [
//             {
//                 "rooms_shortname": "AERL",
//                 "rooms_number": "120",
//                 "rooms_seats": 200,
//                 "rooms_lat": 49.26372,
//                 "rooms_lon": -123.25099
//             },
//             {
//                 "rooms_shortname": "ALRD",
//                 "rooms_number": "105",
//                 "rooms_seats": 200,
//                 "rooms_lat": 49.2699,
//                 "rooms_lon": -123.25318
//             },
//             {
//                 "rooms_shortname": "ANGU",
//                 "rooms_number": "098",
//                 "rooms_seats": 260,
//                 "rooms_lat": 49.26486,
//                 "rooms_lon": -123.25364
//             },
//             {
//                 "rooms_shortname": "BUCH",
//                 "rooms_number": "A101",
//                 "rooms_seats": 275,
//                 "rooms_lat": 49.26826,
//                 "rooms_lon": -123.25468
//             },
//             {
//                 "rooms_shortname": "AERL",
//                 "rooms_number": "220",
//                 "rooms_seats": 200,
//                 "rooms_lat": 49.26372,
//                 "rooms_lon": -123.25099
//             },
//             {
//                 "rooms_shortname": "ALRD",
//                 "rooms_number": "205",
//                 "rooms_seats": 200,
//                 "rooms_lat": 49.2699,
//                 "rooms_lon": -123.25318
//             },
//             {
//                 "rooms_shortname": "ANGU",
//                 "rooms_number": "198",
//                 "rooms_seats": 260,
//                 "rooms_lat": 49.26486,
//                 "rooms_lon": -123.25364
//             },
//             {
//                 "rooms_shortname": "BUCH",
//                 "rooms_number": "B101",
//                 "rooms_seats": 275,
//                 "rooms_lat": 49.26826,
//                 "rooms_lon": -123.25468
//             },
//             {
//                 "rooms_shortname": "AERL",
//                 "rooms_number": "320",
//                 "rooms_seats": 200,
//                 "rooms_lat": 49.26372,
//                 "rooms_lon": -123.25099
//             },
//             {
//                 "rooms_shortname": "ALRD",
//                 "rooms_number": "305",
//                 "rooms_seats": 200,
//                 "rooms_lat": 49.2699,
//                 "rooms_lon": -123.25318
//             },
//             {
//                 "rooms_shortname": "ANGU",
//                 "rooms_number": "298",
//                 "rooms_seats": 260,
//                 "rooms_lat": 49.26486,
//                 "rooms_lon": -123.25364
//             },
//             {
//                 "rooms_shortname": "BUCH",
//                 "rooms_number": "C101",
//                 "rooms_seats": 275,
//                 "rooms_lat": 49.26826,
//                 "rooms_lon": -123.25468
//             },
//             {
//                 "rooms_shortname": "AERL",
//                 "rooms_number": "420",
//                 "rooms_seats": 200,
//                 "rooms_lat": 49.26372,
//                 "rooms_lon": -123.25099
//             },
//             {
//                 "rooms_shortname": "ALRD",
//                 "rooms_number": "405",
//                 "rooms_seats": 200,
//                 "rooms_lat": 49.2699,
//                 "rooms_lon": -123.25318
//             },
//             {
//                 "rooms_shortname": "ANGU",
//                 "rooms_number": "398",
//                 "rooms_seats": 260,
//                 "rooms_lat": 49.26486,
//                 "rooms_lon": -123.25364
//             },
//             {
//                 "rooms_shortname": "BUCH",
//                 "rooms_number": "D101",
//                 "rooms_seats": 275,
//                 "rooms_lat": 49.26826,
//                 "rooms_lon": -123.25468
//             }
//         ];
//         let schedule = scheduler.schedule(sections, rooms);
//         expect(scheduleTest.passHardConstraints(schedule, sections, rooms)).to.equal(true);
//         expect(scheduleTest.calcOptimalityScore(schedule, sections)).to.be.at.least(0.95);
//     });
//
//     it("Test 6: All 16 sections from same course " +
//         "- hard constraint FAILS because 16th section causes overlap, score PASS?", function () {
//         let sections = [
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "1",
//                 "courses_pass": 100,
//                 "courses_fail": 7,
//                 "courses_audit": 2
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "2",
//                 "courses_pass": 123,
//                 "courses_fail": 3,
//                 "courses_audit": 1
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "3",
//                 "courses_pass": 93,
//                 "courses_fail": 2,
//                 "courses_audit": 0
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "4",
//                 "courses_pass": 43,
//                 "courses_fail": 1,
//                 "courses_audit": 0
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "5",
//                 "courses_pass": 80,
//                 "courses_fail": 1,
//                 "courses_audit": 0
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "6",
//                 "courses_pass": 130,
//                 "courses_fail": 1,
//                 "courses_audit": 0
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "7",
//                 "courses_pass": 100,
//                 "courses_fail": 1,
//                 "courses_audit": 0
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "8",
//                 "courses_pass": 73,
//                 "courses_fail": 1,
//                 "courses_audit": 20
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "9",
//                 "courses_pass": 101,
//                 "courses_fail": 5,
//                 "courses_audit": 0
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "10",
//                 "courses_pass": 43,
//                 "courses_fail": 1,
//                 "courses_audit": 100
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "11",
//                 "courses_pass": 43,
//                 "courses_fail": 100,
//                 "courses_audit": 0
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "12",
//                 "courses_pass": 90,
//                 "courses_fail": 5,
//                 "courses_audit": 0
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "13",
//                 "courses_pass": 90,
//                 "courses_fail": 25,
//                 "courses_audit": 0
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "14",
//                 "courses_pass": 60,
//                 "courses_fail": 5,
//                 "courses_audit": 0
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "15",
//                 "courses_pass": 99,
//                 "courses_fail": 5,
//                 "courses_audit": 0
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "16",
//                 "courses_pass": 40,
//                 "courses_fail": 5,
//                 "courses_audit": 0
//             }
//         ];
//         let rooms = [
//             {
//                 "rooms_shortname": "AERL",
//                 "rooms_number": "120",
//                 "rooms_seats": 200,
//                 "rooms_lat": 49.26372,
//                 "rooms_lon": -123.25099
//             },
//             {
//                 "rooms_shortname": "ALRD",
//                 "rooms_number": "105",
//                 "rooms_seats": 200,
//                 "rooms_lat": 49.2699,
//                 "rooms_lon": -123.25318
//             },
//             {
//                 "rooms_shortname": "ANGU",
//                 "rooms_number": "098",
//                 "rooms_seats": 260,
//                 "rooms_lat": 49.26486,
//                 "rooms_lon": -123.25364
//             },
//             {
//                 "rooms_shortname": "BUCH",
//                 "rooms_number": "A101",
//                 "rooms_seats": 275,
//                 "rooms_lat": 49.26826,
//                 "rooms_lon": -123.25468
//             },
//             {
//                 "rooms_shortname": "AERL",
//                 "rooms_number": "220",
//                 "rooms_seats": 200,
//                 "rooms_lat": 49.26372,
//                 "rooms_lon": -123.25099
//             },
//             {
//                 "rooms_shortname": "ALRD",
//                 "rooms_number": "205",
//                 "rooms_seats": 200,
//                 "rooms_lat": 49.2699,
//                 "rooms_lon": -123.25318
//             },
//             {
//                 "rooms_shortname": "ANGU",
//                 "rooms_number": "198",
//                 "rooms_seats": 260,
//                 "rooms_lat": 49.26486,
//                 "rooms_lon": -123.25364
//             },
//             {
//                 "rooms_shortname": "BUCH",
//                 "rooms_number": "B101",
//                 "rooms_seats": 275,
//                 "rooms_lat": 49.26826,
//                 "rooms_lon": -123.25468
//             },
//             {
//                 "rooms_shortname": "AERL",
//                 "rooms_number": "320",
//                 "rooms_seats": 200,
//                 "rooms_lat": 49.26372,
//                 "rooms_lon": -123.25099
//             },
//             {
//                 "rooms_shortname": "ALRD",
//                 "rooms_number": "305",
//                 "rooms_seats": 200,
//                 "rooms_lat": 49.2699,
//                 "rooms_lon": -123.25318
//             },
//             {
//                 "rooms_shortname": "ANGU",
//                 "rooms_number": "298",
//                 "rooms_seats": 260,
//                 "rooms_lat": 49.26486,
//                 "rooms_lon": -123.25364
//             },
//             {
//                 "rooms_shortname": "BUCH",
//                 "rooms_number": "C101",
//                 "rooms_seats": 275,
//                 "rooms_lat": 49.26826,
//                 "rooms_lon": -123.25468
//             },
//             {
//                 "rooms_shortname": "AERL",
//                 "rooms_number": "420",
//                 "rooms_seats": 200,
//                 "rooms_lat": 49.26372,
//                 "rooms_lon": -123.25099
//             },
//             {
//                 "rooms_shortname": "ALRD",
//                 "rooms_number": "405",
//                 "rooms_seats": 200,
//                 "rooms_lat": 49.2699,
//                 "rooms_lon": -123.25318
//             },
//             {
//                 "rooms_shortname": "ANGU",
//                 "rooms_number": "398",
//                 "rooms_seats": 260,
//                 "rooms_lat": 49.26486,
//                 "rooms_lon": -123.25364
//             },
//             {
//                 "rooms_shortname": "BUCH",
//                 "rooms_number": "D101",
//                 "rooms_seats": 275,
//                 "rooms_lat": 49.26826,
//                 "rooms_lon": -123.25468
//             }
//         ];
//         let schedule = scheduler.schedule(sections, rooms);
//         expect(scheduleTest.passHardConstraints(schedule, sections, rooms)).to.equal(false);
//         expect(scheduleTest.calcOptimalityScore(schedule, sections)).to.be.at.least(0.95);
//     });
//
//     it("Test 7: Many sections and rooms, but none fit the sections
//     - hard constrains PASS, score FAILS (low E score)", function () {
//         let sections = [
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "1",
//                 "courses_pass": 100,
//                 "courses_fail": 7,
//                 "courses_audit": 2
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "341",
//                 "courses_uuid": "2",
//                 "courses_pass": 123,
//                 "courses_fail": 3,
//                 "courses_audit": 1
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "342",
//                 "courses_uuid": "3",
//                 "courses_pass": 93,
//                 "courses_fail": 2,
//                 "courses_audit": 0
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "343",
//                 "courses_uuid": "4",
//                 "courses_pass": 43,
//                 "courses_fail": 1,
//                 "courses_audit": 0
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "344",
//                 "courses_uuid": "5",
//                 "courses_pass": 80,
//                 "courses_fail": 1,
//                 "courses_audit": 0
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "345",
//                 "courses_uuid": "6",
//                 "courses_pass": 130,
//                 "courses_fail": 1,
//                 "courses_audit": 0
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "346",
//                 "courses_uuid": "7",
//                 "courses_pass": 100,
//                 "courses_fail": 1,
//                 "courses_audit": 0
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "347",
//                 "courses_uuid": "8",
//                 "courses_pass": 73,
//                 "courses_fail": 1,
//                 "courses_audit": 20
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "348",
//                 "courses_uuid": "9",
//                 "courses_pass": 101,
//                 "courses_fail": 5,
//                 "courses_audit": 0
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "349",
//                 "courses_uuid": "10",
//                 "courses_pass": 43,
//                 "courses_fail": 1,
//                 "courses_audit": 100
//             }
//         ];
//         let rooms = [
//             {
//                 "rooms_shortname": "AERL",
//                 "rooms_number": "120",
//                 "rooms_seats": 40,
//                 "rooms_lat": 49.26372,
//                 "rooms_lon": -123.25099
//             },
//             {
//                 "rooms_shortname": "ALRD",
//                 "rooms_number": "105",
//                 "rooms_seats": 40,
//                 "rooms_lat": 49.2699,
//                 "rooms_lon": -123.25318
//             },
//             {
//                 "rooms_shortname": "ANGU",
//                 "rooms_number": "098",
//                 "rooms_seats": 40,
//                 "rooms_lat": 49.26486,
//                 "rooms_lon": -123.25364
//             },
//             {
//                 "rooms_shortname": "BUCH",
//                 "rooms_number": "A101",
//                 "rooms_seats": 40,
//                 "rooms_lat": 49.26826,
//                 "rooms_lon": -123.25468
//             },
//             {
//                 "rooms_shortname": "AERL",
//                 "rooms_number": "220",
//                 "rooms_seats": 40,
//                 "rooms_lat": 49.26372,
//                 "rooms_lon": -123.25099
//             },
//             {
//                 "rooms_shortname": "ALRD",
//                 "rooms_number": "205",
//                 "rooms_seats": 40,
//                 "rooms_lat": 49.2699,
//                 "rooms_lon": -123.25318
//             },
//             {
//                 "rooms_shortname": "ANGU",
//                 "rooms_number": "198",
//                 "rooms_seats": 40,
//                 "rooms_lat": 49.26486,
//                 "rooms_lon": -123.25364
//             },
//             {
//                 "rooms_shortname": "BUCH",
//                 "rooms_number": "B101",
//                 "rooms_seats": 40,
//                 "rooms_lat": 49.26826,
//                 "rooms_lon": -123.25468
//             },
//             {
//                 "rooms_shortname": "AERL",
//                 "rooms_number": "320",
//                 "rooms_seats": 40,
//                 "rooms_lat": 49.26372,
//                 "rooms_lon": -123.25099
//             },
//             {
//                 "rooms_shortname": "ALRD",
//                 "rooms_number": "305",
//                 "rooms_seats": 40,
//                 "rooms_lat": 49.2699,
//                 "rooms_lon": -123.25318
//             },
//             {
//                 "rooms_shortname": "ANGU",
//                 "rooms_number": "298",
//                 "rooms_seats": 40,
//                 "rooms_lat": 49.26486,
//                 "rooms_lon": -123.25364
//             },
//             {
//                 "rooms_shortname": "BUCH",
//                 "rooms_number": "C101",
//                 "rooms_seats": 40,
//                 "rooms_lat": 49.26826,
//                 "rooms_lon": -123.25468
//             },
//             {
//                 "rooms_shortname": "AERL",
//                 "rooms_number": "420",
//                 "rooms_seats": 40,
//                 "rooms_lat": 49.26372,
//                 "rooms_lon": -123.25099
//             },
//             {
//                 "rooms_shortname": "ALRD",
//                 "rooms_number": "405",
//                 "rooms_seats": 40,
//                 "rooms_lat": 49.2699,
//                 "rooms_lon": -123.25318
//             },
//             {
//                 "rooms_shortname": "ANGU",
//                 "rooms_number": "398",
//                 "rooms_seats": 40,
//                 "rooms_lat": 49.26486,
//                 "rooms_lon": -123.25364
//             },
//             {
//                 "rooms_shortname": "BUCH",
//                 "rooms_number": "D101",
//                 "rooms_seats": 40,
//                 "rooms_lat": 49.26826,
//                 "rooms_lon": -123.25468
//             }
//         ];
//         let schedule = scheduler.schedule(sections, rooms);
//         expect(scheduleTest.passHardConstraints(schedule, sections, rooms)).to.equal(true);
//         expect(scheduleTest.calcOptimalityScore(schedule, sections)).to.be.lessThan(0.95);
//     });
//
//     it("Test 8: Buildings too far - PASS hard constraints, FAILS low D score", function () {
//         let sections = [
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "1",
//                 "courses_pass": 100,
//                 "courses_fail": 7,
//                 "courses_audit": 2
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "341",
//                 "courses_uuid": "2",
//                 "courses_pass": 123,
//                 "courses_fail": 3,
//                 "courses_audit": 1
//             }
//         ];
//         let rooms = [
//             {
//                 "rooms_shortname": "ANSO",
//                 "rooms_number": "202",
//                 "rooms_seats": 150,
//                 "rooms_lat": 49.26958,
//                 "rooms_lon": -123.25741
//             },
//             {
//                 "rooms_shortname": "OSBO",
//                 "rooms_number": "203A",
//                 "rooms_seats": 110,
//                 "rooms_lat": 49.26047,
//                 "rooms_lon": -123.24467
//             },
//             {
//                 "rooms_shortname": "OSBO",
//                 "rooms_number": "203B",
//                 "rooms_seats": 110,
//                 "rooms_lat": 49.26047,
//                 "rooms_lon": -123.24467
//             }
//         ];
//         let schedule = scheduler.schedule(sections, rooms);
//         expect(scheduleTest.passHardConstraints(schedule, sections, rooms)).to.equal(true);
//         expect(scheduleTest.calcOptimalityScore(schedule, sections)).to.be.lessThan(0.95);
//     });
//
//     it("Test 9: Section added twice to timetable - FAILS hard constraints, SCORE pass?", function () {
//         let sections = [
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "1",
//                 "courses_pass": 100,
//                 "courses_fail": 7,
//                 "courses_audit": 2
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "1",
//                 "courses_pass": 100,
//                 "courses_fail": 7,
//                 "courses_audit": 2
//             }
//         ];
//         let rooms = [
//             {
//                 "rooms_shortname": "ANGU",
//                 "rooms_number": "098",
//                 "rooms_seats": 120,
//                 "rooms_lat": 49.26486,
//                 "rooms_lon": -123.25364
//             },
//             {
//                 "rooms_shortname": "BUCH",
//                 "rooms_number": "A101",
//                 "rooms_seats": 120,
//                 "rooms_lat": 49.26826,
//                 "rooms_lon": -123.25468
//             }
//         ];
//         let schedule = scheduler.schedule(sections, rooms);
//         expect(scheduleTest.passHardConstraints(schedule, sections, rooms)).to.equal(true);
//         expect(scheduleTest.calcOptimalityScore(schedule, sections)).to.be.at.least(0.95);
//     });
//
//     it("Test 10: Many sections all in same building - " +
//         "hard constraints PASS and score for sure PASS (D score = 1 exactly)", function () {
//         let sections = [
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "340",
//                 "courses_uuid": "1",
//                 "courses_pass": 100,
//                 "courses_fail": 7,
//                 "courses_audit": 2
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "341",
//                 "courses_uuid": "2",
//                 "courses_pass": 123,
//                 "courses_fail": 3,
//                 "courses_audit": 1
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "342",
//                 "courses_uuid": "3",
//                 "courses_pass": 93,
//                 "courses_fail": 2,
//                 "courses_audit": 0
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "343",
//                 "courses_uuid": "4",
//                 "courses_pass": 43,
//                 "courses_fail": 1,
//                 "courses_audit": 0
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "344",
//                 "courses_uuid": "5",
//                 "courses_pass": 80,
//                 "courses_fail": 1,
//                 "courses_audit": 0
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "345",
//                 "courses_uuid": "6",
//                 "courses_pass": 130,
//                 "courses_fail": 1,
//                 "courses_audit": 0
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "346",
//                 "courses_uuid": "7",
//                 "courses_pass": 100,
//                 "courses_fail": 1,
//                 "courses_audit": 0
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "347",
//                 "courses_uuid": "8",
//                 "courses_pass": 73,
//                 "courses_fail": 1,
//                 "courses_audit": 20
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "348",
//                 "courses_uuid": "9",
//                 "courses_pass": 101,
//                 "courses_fail": 5,
//                 "courses_audit": 0
//             },
//             {
//                 "courses_dept": "cpsc",
//                 "courses_id": "349",
//                 "courses_uuid": "10",
//                 "courses_pass": 43,
//                 "courses_fail": 1,
//                 "courses_audit": 100
//             }
//         ];
//         let rooms = [
//             {
//                 "rooms_shortname": "ANGU",
//                 "rooms_number": "098",
//                 "rooms_seats": 150,
//                 "rooms_lat": 49.26486,
//                 "rooms_lon": -123.25364
//             },
//             {
//                 "rooms_shortname": "ANGU",
//                 "rooms_number": "099",
//                 "rooms_seats": 150,
//                 "rooms_lat": 49.26486,
//                 "rooms_lon": -123.25364
//             },
//             {
//                 "rooms_shortname": "ANGU",
//                 "rooms_number": "100",
//                 "rooms_seats": 150,
//                 "rooms_lat": 49.26486,
//                 "rooms_lon": -123.25364
//             },
//             {
//                 "rooms_shortname": "ANGU",
//                 "rooms_number": "101",
//                 "rooms_seats": 150,
//                 "rooms_lat": 49.26486,
//                 "rooms_lon": -123.25364
//             },
//             {
//                 "rooms_shortname": "ANGU",
//                 "rooms_number": "102",
//                 "rooms_seats": 150,
//                 "rooms_lat": 49.26486,
//                 "rooms_lon": -123.25364
//             },
//             {
//                 "rooms_shortname": "ANGU",
//                 "rooms_number": "103",
//                 "rooms_seats": 150,
//                 "rooms_lat": 49.26486,
//                 "rooms_lon": -123.25364
//             },
//             {
//                 "rooms_shortname": "ANGU",
//                 "rooms_number": "202",
//                 "rooms_seats": 150,
//                 "rooms_lat": 49.26486,
//                 "rooms_lon": -123.25364
//             },
//             {
//                 "rooms_shortname": "ANGU",
//                 "rooms_number": "303",
//                 "rooms_seats": 150,
//                 "rooms_lat": 49.26486,
//                 "rooms_lon": -123.25364
//             },
//             {
//                 "rooms_shortname": "ANGU",
//                 "rooms_number": "304",
//                 "rooms_seats": 150,
//                 "rooms_lat": 49.26486,
//                 "rooms_lon": -123.25364
//             },
//             {
//                 "rooms_shortname": "ANGU",
//                 "rooms_number": "305",
//                 "rooms_seats": 150,
//                 "rooms_lat": 49.26486,
//                 "rooms_lon": -123.25364
//             }
//         ];
//         let schedule = scheduler.schedule(sections, rooms);
//         expect(scheduleTest.passHardConstraints(schedule, sections, rooms)).to.equal(true);
//         expect(scheduleTest.calcOptimalityScore(schedule, sections)).to.be.at.least(0.95);
//     });
// });


// IGNORE BELOW THIS
//
//
// describe("Scheduler schedule (larger samples - addDataset/performQuery called)", function() {
//     // Reference any datasets you've added to test/data here and they will
//     // automatically be loaded in the 'before' hook.
//     const datasetsToLoad: { [id: string]: string } = {
//         courses: "./test/data/courses.zip",
//         rooms: "./test/data/rooms.zip"
//     };
//     let datasets: { [id: string]: string } = {};
//     let insightFacade: InsightFacade = null;
//     let scheduler: Scheduler = null;
//     let scheduleTest: SchedulerTestHelper = null;
//     const cacheDir = __dirname + "/../data";
//     // let courses = fs.readFileSync("./test/data/courses.zip").toString("base64");
//     // let rooms = fs.readFileSync("./test/data/rooms.zip").toString("base64");
//
//     before(function () {
//         // This section runs once and loads all datasets specified in the datasetsToLoad object
//         // into the datasets object
//         Log.test(`Before all`);
//         for (const id of Object.keys(datasetsToLoad)) {
//             datasets[id] = fs.readFileSync(datasetsToLoad[id]).toString("base64");
//         }
//     });
//
//     beforeEach(function () {
//         Log.test(`BeforeTest: ${this.currentTest.title}`);
//         insightFacade  = new InsightFacade();
//         scheduler  = new Scheduler();
//         scheduleTest = new SchedulerTestHelper();
//     });
//
//     after(function () {
//         Log.test(`After: ${this.test.parent.title}`);
//     });
//
//     afterEach(function () {
//         Log.test(`AfterTest: ${this.currentTest.title}`);
//     });
//
//     //  Doing this test so we can save in cache for subsequent schedule() tests
//     it("Should add a valid courses dataset", function () {
//         const id: string = "courses";
//         const expected: string[] = [id];
//         return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses)
//             .then((result: string[]) => {
//                 expect(result).to.deep.equal(expected);
//             })
//             .catch((err: any) => {
//                 expect.fail(err, expected, "Should not have rejected");
//             });
//     });
//
//     //  Doing this test so we can save in cache for subsequent schedule() tests
//     it("Should add a valid rooms dataset - saves in cache for subsequent schedule() tests", function () {
//         const id: string = "rooms";
//         const expected: string[] = [id];
//         return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms)
//             .then((result: string[]) => {
//                 expect(result).to.deep.equal(expected);
//             })
//             .catch((err: any) => {
//                 expect.fail(err, expected, "Should not have rejected");
//             });
//     });
//
//     it("Query returns too many of same course - fails hard constraints,
//     fails E score since rooms too small", function (done) {
//         let queryCourses: any = {
//             "WHERE": {
//                 "AND": [
//                     {
//                         "GT": {
//                             "courses_avg": 70
//                         }
//                     },
//                     {
//                         "IS": {
//                             "courses_id": "310"
//                         }
//                     },
//                     {
//                         "IS": {
//                             "courses_dept": "cpsc"
//                         }
//                     }
//                 ]
//             },
//             "OPTIONS": {
//                 "COLUMNS": [
//                     "courses_dept",
//                     "courses_id",
//                     "courses_uuid",
//                     "courses_pass",
//                     "courses_fail",
//                     "courses_audit"
//                 ]
//             }
//         };
//         let queryRooms: any = {
//             "WHERE": {
//                 "LT": {
//                     "rooms_seats": 50
//                 }
//             },
//             "OPTIONS": {
//                 "COLUMNS": [
//                     "rooms_shortname",
//                     "rooms_number",
//                     "rooms_seats",
//                     "rooms_lat",
//                     "rooms_lon"
//                 ]
//             }
//         };
//         let filteredCourses: any[] = [];
//         let filteredRooms: any[] = [];
//         insightFacade.performQuery(queryCourses)
//             .then(function(coursesResponse) {
//                 filteredCourses = coursesResponse;
//                 })
//             .catch(function() {
//                 expect.fail();
//                 done();
//             });
//         insightFacade.performQuery(queryRooms)
//             .then(function(roomsResponse) {
//                 filteredRooms = roomsResponse;
//             })
//             .catch(function() {
//                 expect.fail();
//                 done();
//             });
//         let schedule = scheduler.schedule(filteredCourses, filteredRooms);
//         expect(scheduleTest.passHardConstraints(schedule, filteredCourses, filteredRooms)).to.equal(false);
//         expect(scheduleTest.calcOptimalityScore(schedule, filteredCourses)).to.be.lessThan(0.95);
//     });
// });
