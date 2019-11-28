const superTest = require("supertest");
const should = require("should");
const axios = require('axios');
const request = require('request');
const expect = require('chai').expect;

require("../index.js");

it('Check get business by business id is working', function(done) {
    axios.get('http://localhost:3001/businesses/02151fdb-8b50-4068-b8a1-1d24ed425c59')
        .then((res) => {
            expect(res.status).to.equal(200);
            done();
        })
        .catch((error) => {
            console.error(error)
            done();
        })
});

it('Check search business by event type is working', function (done) {
    axios.get('http://localhost:3001/businesses?event_type=restaurant&city=Danville')
        .then((res) => {
            expect(res.status).to.equal(200);
            done();
        })
        .catch((error) => {
            console.error(error)
            done();
        })
});
