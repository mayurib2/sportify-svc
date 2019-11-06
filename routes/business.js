const express = require('express');
const AWS = require('aws-sdk');
const router = new express.Router();
const uuid = require('uuidv4').default;

AWS.config.update({
    region: process.env.region,
    endpoint: process.env.endpoint,
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey
});
const dynamodbDocClient = new AWS.DynamoDB.DocumentClient();


router.post('', (req, res, next) => {
    const params = {
        TableName: "businesses",
        Item: {
            "business_id": uuid(),
            "user_id": req.body.user_id,
            "email": req.body.email,
            "name": req.body.name,
            "categories": req.body.categories,
            "address": req.body.address,
            "city": req.body.city,
            "state": req.body.state,
            "postal_code": req.body.postal_code
        }
    };

    console.log("Adding a new item...");
    res.setHeader('Access-Control-Allow-Origin', '*');
    dynamodbDocClient.put(params, function (err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            return res.status(500).json({error: "Unable to add item"});
        } else {
            console.log("Added item:", JSON.stringify(data, null, 2));
            res.status(200).json(data);
        }
    });
});

function findBusinessHelper(params) {
    return new Promise((resolve, reject) => {
        dynamodbDocClient.scan(params, (err, data) => {
            if (err) {
                console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

const findBusiness = async (params) => {
    let scanresult;
    do {
        scanresult = await findBusinessHelper(params);
        // console.log(" %s scanresult after findBusinessHelper %s", new Date().toISOString(), JSON.stringify(scanresult));
        if (scanresult.Count > 0) {
            return scanresult.Items;
        } else {
            if (scanresult.LastEvaluatedKey) {
                scanresult.ExclusiveStartKey = scanresult.LastEvaluatedKey;
            } else {
                return {error: "Not Found"};
            }
        }
    } while (scanresult.LastEvaluatedKey);
}

router.get('', async function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    const user_id = req.query.user_id;
    console.log("Fetching records based on userid", user_id);
    const params = {
        TableName: "businesses",
        FilterExpression: '#user_id = :user_id',
        ExpressionAttributeNames: {
            '#user_id': 'user_id',
        },
        ExpressionAttributeValues: {
            ':user_id': user_id,
        },
    };
    findBusiness(params).then((data) => {
        console.log("%s ********* business = %s ", new Date().toISOString(), data);
        return res.json(data);
    }).catch((err) => {
        return res.status(404).json({error: "Business not found"});
    })

})
module.exports = router;
