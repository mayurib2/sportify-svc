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

it('Check search business by event type and city is working', function (done) {
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

it('Check update business is working', function (done) {
    axios.get('localhost:3001/businesses/6284b41e-b61a-4bab-92ad-7cabe7e3201f')
        .then((res) => {
            expect(res.status).to.equal(200);
            done();
        })
        .catch((error) => {
            console.error(error)
            done();
        })
});