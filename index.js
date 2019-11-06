const express = require('express');
const cors = require('cors');
const https = require('https');
const AWS = require('aws-sdk');
require('dotenv').config();
const business = require('./routes/business');
const app = express();
const bodyparser = require("body-parser");
const port = process.env.PORT || 8080;

// AWS.config.update({
//     region: process.env.region,
//     endpoint: process.env.endpoint,
//     accessKeyId: process.env.accessKeyId,
//     secretAccessKey: process.env.secretAccessKey
//     httpOptions: {
//         agent: new https.Agent({keepAlive: true}),
//         timeout: 1000,
//     },
// });

app.use(cors())
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use('/business',  business);

app.get('/', function (req, res) {
    res.send('Hello World')
})


app.listen(port, function () {
    console.log(' listening on port', port);
});

module.exports = app;
