const express = require('express');
const AWS = require('aws-sdk');
const router = new express.Router();


AWS.config.update({
    region: process.env.region,
    endpoint: process.env.endpoint,
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey
});
const dynamodbDocClient = new AWS.DynamoDB.DocumentClient();

router.get('/:user_id/businesses', async (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    const user_id = req.params.user_id;
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
    let user_business_result;
    try {
        user_business_result = await dynamodbDocClient.query(user_business_params).promise();
        console.log("user_business query results :", user_business_result);
        if (user_business_result && user_business_result.Items && user_business_result.Items.length > 0) {
            const businesses_params = {
                TableName: "businesses",
                KeyConditionExpression: "#business_id = :business_id",
                ExpressionAttributeNames: {
                    '#business_id': 'business_id'
                },
                ExpressionAttributeValues: {
                    ':business_id': user_business_result.Items[0].business_id
                },
            };
            let businesses_result = await dynamodbDocClient.query(businesses_params).promise();
            if (businesses_result && businesses_result.Items && businesses_result.Items.length > 0) {
                console.log("Businesses Query results", businesses_result.Items[0]);
                return res.json(businesses_result.Items[0]);
            } else {
                return res.status(404).json({error: "Businesses not found"});
            }
        } else {
            return res.status(404).json({error: "User not found"});
        }
    } catch (err) {
        res.status(500).json({error_message: "Error occurred while fetching business", error: err});
    }
})

module.exports = router;