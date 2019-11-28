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

router.post('/:user_id/businesses', async (req, res) => {
    console.log("process.env.endpoint ",process.env.endpoint);
    let business_id = uuid(), result_user_business, result_businesses;
    const user_business_params = {
        TableName: "user_business",
        Item: {
            "user_id": req.params.user_id,
            "business_id": business_id
        },
        ConditionExpression: "attribute_not_exists(user_id)"
    };
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
        if(!req.body.name) {
            return res.status(400).json({error: "Business name must be specified"});
        }
        else if(!req.body.categories) {
            return res.status(400).json({error: "Categories must be specified"});
        }
        else if(!req.body.address) {
            return res.status(400).json({error: "Address must be specified"});
        }
        else if(!req.body.city) {
            return res.status(400).json({error: "City must be specified"});
        }
        else if(!req.body.state) {
            return res.status(400).json({error: "State must be specified"});
        }
        else if(!req.body.postal_code) {
            return res.status(400).json({error: "Postal Code must be specified"});
        }



        result_user_business = await dynamodbDocClient.put(user_business_params).promise();
    } catch (err) {
        console.error("Unable to add user to user_business table", JSON.stringify(err));
        return res.status(500).json({error: "Unable to add user. User already has a associated business"});
    }
    try {
        const businesses_params = {
            TableName: "businesses",
            Item: {
                "business_id": business_id,
                "name": req.body.name,
                "categories": req.body.categories.join(),
                "address": req.body.address,
                "city": req.body.city,
                "state": req.body.state,
                "postal_code": req.body.postal_code
            },
            ConditionExpression: "attribute_not_exists(business_id)"
        };
        result_businesses = await dynamodbDocClient.put(businesses_params).promise();
    } catch (err) {
        console.error("Unable to add business to businesses table", JSON.stringify(err));
        return res.status(500).json({error: "Unable to add business to businesses table"});
    }
    res.status(200).json({message: "Business created successfully"});
});

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

router.delete('/:user_id/businesses/:business_id', async (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    const user_id = req.params.user_id;
    const business_id = req.params.business_id;
    console.log(`Deleting records based on user_id = ${user_id} and business_id = ${business_id}`);

    const user_business_params = {
        TableName: "user_business",
        Key: {
            "user_id": user_id
        }
    };

    let user_business_result;
    try {
        user_business_result = await dynamodbDocClient.delete(user_business_params).promise();
        console.log("user_business delete results :", user_business_result);
    } catch (err) {
        console.log(`Error occurred deleting user_business mapping with user_id ${user_id}`);
        res.status(500).json({error_message: "Error occurred while deleting user_business mapping", error: err});
    }
    try {
        const businesses_params = {
            TableName: "businesses",
            Key: {
                "business_id": business_id
            }
        };
        let businesses_result = await dynamodbDocClient.delete(businesses_params).promise();
        console.log("Businesses delete results", businesses_result);
        return res.status(200).json({message: "Business deleted successfully"});

    } catch (err) {
        console.log(`Error occurred deleting business with business_id ${business_id}`);
        res.status(500).json({error_message: "Error occurred while deleting business", error: err});
    }
})


module.exports = router;