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

router.get('', async (req, res) => {
    let city, event_type;
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.query.city && req.query.event_type) {
        city = req.query.city;
        event_type = req.query.event_type;
    } else {
        return res.status(400).json({error: `city and event_type must be specified in query parameter`});
    }
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
        }
    };
    if (req.query.last_key_city && req.query.last_key_business_id) {
        business_search_params.ExclusiveStartKey = {
            city: req.query.last_key_city,
            business_id: req.query.last_key_business_id
        };
    }

    let business_search_result, all_business_search_result = [], response = {};
    let search_result_length = 0;
    try {
        do {
            console.log("business_search_params ", business_search_params);
            business_search_result = await dynamodbDocClient.query(business_search_params).promise();
            console.log("business_search_result = ", business_search_result);
            if (business_search_result && business_search_result.Items && business_search_result.Items.length > 0) {
                all_business_search_result.push(...business_search_result.Items);
                search_result_length = all_business_search_result.length;
            }
            if (business_search_result.LastEvaluatedKey) {
                if (search_result_length > 10) {
                    response.businesses = all_business_search_result;
                    response.LastEvaluatedKey = business_search_result.LastEvaluatedKey;
                    return res.json(response);
                }
                business_search_params.ExclusiveStartKey = business_search_result.LastEvaluatedKey;
            }
        } while (business_search_result.LastEvaluatedKey);

        if (search_result_length > 0) {
            response.businesses = all_business_search_result;
            return res.json(response);
        } else
            return res.status(404).json({error: `Businesses matching event type ${event_type} not found`});

    } catch (err) {
        res.status(500).json({error_message: "Error occurred while fetching business", error: err});
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
                ":business_name": req.body.name,
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

router.post('/:business_id/reviews', (req, res) => {
    const review_params = {
        TableName: "reviews-merged-data",
        Item: {
            "review_id": uuid(),
            "business_id": req.params.business_id,
            "cool": req.body.cool,
            "funny": req.body.funny,
            "stars": req.body.stars,
            "text": req.body.text,
            "useful": req.body.useful,
            "user_id": req.body.user_id,
            "username": req.body.username
        }
    };

    console.log("Adding a new review...");
    res.setHeader('Access-Control-Allow-Origin', '*');

    dynamodbDocClient.put(review_params, (err, result_reviews) => {
        if (err) {
            console.error("Unable to add review to reviews-merged-data table Error JSON:", JSON.stringify(err));
            return res.status(500).json({error: "Unable to add review to reviews-merged-data table"});
        } else {
            console.log("Result of adding to review to reviews-merged-data table ", result_reviews);
            return res.status(200).json(result_reviews);
        }
    });
});

module.exports = router;