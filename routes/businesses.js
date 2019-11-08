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

router.post('', (req, res) => {

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
            "categories": req.body.categories.join(),
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

router.get('', async (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    const city = req.query.city;
    const event_type = req.query.event_type;
    console.log(`Fetching records based on city = ${city} and event_type = ${event_type}`);
    const business_search_params = {
        TableName: "businesses",
        IndexName: 'city-index',
        KeyConditionExpression: "#city = :city",
        FilterExpression: 'contains (categories, :event_type)',
        ExpressionAttributeNames: {
            '#city': 'city',
        },
        ExpressionAttributeValues: {
            ':city': city,
            ':event_type': event_type
        },
    };
    let business_search_result;
    try {
        business_search_result = await dynamodbDocClient.query(business_search_params).promise();
        console.log("business_search_result  :", business_search_result);
        if (business_search_result && business_search_result.Items && business_search_result.Items.length > 0) {
            console.log("Businesses Query results", business_search_result.Items);
            return res.json(business_search_result.Items);
        } else {
            return res.status(404).json({error: `Businesses matching event type ${event_type} not found`});
        }
    } catch (err) {
        res.status(500).json({error_message: "Error occurred while fetching business", error: err});
    }
})

router.delete('/:business_id', async (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    const user_id = req.query.user_id;
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

        const businesses_params = {
            TableName: "businesses",
            Key: {
                "business_id": business_id
            }
        };
        let businesses_result = await dynamodbDocClient.delete(businesses_params).promise();
        console.log("Businesses delete results", businesses_result);
        return res.json(businesses_result);

    } catch (err) {
        res.status(500).json({error_message: "Error occurred while deleting business", error: err});
    }
})

router.put('/:business_id', async (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    const business_id = req.params.business_id;
    console.log("Updating records based on business_id", business_id);
    try {
        const businesses_params = {
            TableName: "businesses",
            Key: {
                "business_id": business_id
            },
            UpdateExpression: "set #business_name = :business_name, categories=:categories, address=:address, city=:city, #business_state=:state, postal_code=:postal_code",
            ExpressionAttributeNames: {
                '#business_name': 'name',
                '#business_state': 'state'
            },
            ExpressionAttributeValues: {
                ":business_name": req.body.business_name,
                ":categories": req.body.categories,
                ":address": req.body.address,
                ":city": req.body.city,
                ":state": req.body.state,
                ":postal_code": req.body.postal_code,
            },
            ReturnValues: "UPDATED_NEW"
        };
        let businesses_update_result = await dynamodbDocClient.update(businesses_params).promise();
        console.log("Businesses update results", businesses_update_result);
        return res.json(businesses_update_result);

    } catch (err) {
        res.status(500).json({error_message: "Error occurred while updating business", error: err});
    }
})

module.exports = router;