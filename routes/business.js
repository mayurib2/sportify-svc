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

    let business_id = uuid();
    const user_business_params = {
        TableName: "user_business",
        Item: {
            "user_id": req.body.user_id,
            "business_id": business_id
        }
    };
    const businesses_params = {
        TableName: "businesses",
        Item: {
            "business_id": business_id,
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

    dynamodbDocClient.put(user_business_params, (err, result_user_business) => {
        if (err) {
            console.error("Unable to add item to user_business table Error JSON:", JSON.stringify(err));
            return res.status(500).json({error: "Unable to add item to user_business table"});
        } else {
            console.log("Result of adding to user_business table ", result_user_business);
            dynamodbDocClient.put(businesses_params, function (err, result_businesses) {
                if (err) {
                    console.error("Unable to add item to businesses table Error JSON:", JSON.stringify(err));
                    return res.status(500).json({error: "Unable to add item to businesses table"});
                } else {
                    console.log("Result of adding to businesses table ", result_businesses);
                    res.status(200).json(result_businesses);
                }
            });
        }
    });
});
router.get('', async (req, res, next) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    const user_id = req.query.user_id;
    console.log("Fetching records based on userid", user_id);
    const user_business_params = {
        TableName: "user_business",
        KeyConditionExpression: "#user_id = :user_id",
        ExpressionAttributeNames: {
            '#user_id': 'user_id',
        },
        ExpressionAttributeValues: {
            ':user_id': user_id,
        },
    };
    dynamodbDocClient.query(user_business_params, function (err, user_business_result) {
        if (err) {
            console.error("Unable to query user_business. Error:", JSON.stringify(err, null, 2));
        } else {
            console.log("user_business Query succeeded.", user_business_result);

            user_business_result.Items.forEach(function (item) {
                console.log(" -", item.user_id + ": " + item.business_id);
                const businesses_params = {
                    TableName: "businesses",
                    KeyConditionExpression: "#business_id = :business_id",
                    ExpressionAttributeNames: {
                        '#business_id': 'business_id',
                    },
                    ExpressionAttributeValues: {
                        ':business_id': item.business_id,
                    },
                };
                dynamodbDocClient.query(businesses_params, function (err, businesses_result) {
                    if (err) {
                        console.error("Unable to query businesses. Error:", JSON.stringify(err, null, 2));
                    } else {
                        console.log("Businesses Query succeeded.", businesses_result.Items[0]);
                        return res.json(businesses_result.Items[0]);
                    }
                });
            });

        }
    });
})

module.exports = router;