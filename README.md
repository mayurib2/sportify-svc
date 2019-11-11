# FinalCloudProject-NodeJS


**Create a business**
----
  Register a new business for a given user based on user_id which is the emailId .

* **URL**

  /users/{:user_id}/businesses

* **Method:**

  `POST`
  
*  **Request Body**

   **Required:**
   ```json 
   {
     "name": "string",
     "categories": [
       "string",
       "string"
     ],
     "address": "string",
     "city": "string",
     "state": "string",
     "postal_code": "string"
   }
   ```
* **Success Response:**

  * **Code:** 200 <br />
    **Response Body:** `"message": "Business created successfully"`
 
* **Error Response:**

  * **Code:** 500  <br />
    **Response Body:** `{error: "Unable to add user. User already has a associated business"}`

  OR

  * **Code:** 500  <br />
    **Response Body:** `{error: "Unable to add business to businesses table"}`

**Get business by user_id (emailId)**
----
  Get a business for a given user based on user_id which is the emailId .

* **URL**

  /users/{:user_id}/businesses

* **Method:**

  `GET`

* **Success Response:**

  * **Code:** 200 <br />
    **Response Body:** 

   ```json 
    {
        "address": "string",
        "city": "string",
        "name": "string",
        "categories": "string (comma separated categories)",
        "state": "string",
        "postal_code": "string",
        "business_id": "string"
    }
   ```
* **Error Response:**

  * **Code:** 404  <br />
    **Response Body:** `{error: "User not found"}`

  OR

  * **Code:** 404  <br />
    **Response Body:** `{error: "Businesses not found"}`
    
**Search a business by event type (alias for category in db) and city**
----
  
* **URL**

  /businesses

* **Method:**

  `GET`
  
*  **URL Params**

   **Required:**
   
   `event_type="string"`<br/>
   `city="string"`
   
   **Optional:**
   
   `last_key_city="string"`<br/>
   `last_key_business_id="string"`

* **Success Response:**

  * **Code:** 200 <br />
    **Response Body:** 
    ```json
    {
      "businesses": [
        {
          "address": "string",
          "city": "string",
          "name": "string",
          "categories": "string (comma separated categories)",
          "state": "string",
          "postal_code": "string",
          "business_id": "string"
        },
        {
          "address": "string",
          "city": "string",
          "name": "string",
          "categories": "string (comma separated categories)",
          "state": "string",
          "postal_code": "string",
          "business_id": "string"
        }
      ],
    
        "LastEvaluatedKey": {
            "city": "string",
            "business_id": "string"
        }
    }
    ```
 `LastEvaluatedKey will be present in response only if there are more records left in DB to be matched. 
 So if UI sees LastEvaluatedKey in response then it can use these values for the optional query parameters
  which are last_key_city and last_key_business_id and and send it back to the backend to fetch more matching 
  results`
* **Error Response:**

  * **Code:** 404 NOT FOUND <br />
    **Content:** `{error: "Businesses matching event type {event_type} not found"}`

  OR

  * **Code:** 500  <br />
    **Content:** `"{error_message: "Error occurred while fetching business", error: err }"`

**Update a business**
----
  Update a existing business based on business_id.

* **URL**

  /businesses/{:business_id}

* **Method:**

  `PU   T`
  
*  **Request Body**

   **Required:**
   ```json 
   {
     "name": "string",
     "categories": [
       "string",
       "string"
     ],
     "address": "string",
     "city": "string",
     "state": "string",
     "postal_code": "string"
   }
   ```
* **Success Response:**

  * **Code:** 200 <br />
    **Response Body:** `"message": "Business updated successfully"`
 
* **Error Response:**

  * **Code:** 500  <br />
    **Response Body:** `{error: "Unable to add business to businesses table"}`

**AWS DYNAMODB CLI**
----
Start Local DynamoDB from location where dynamo jar file is present
	java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb

aws dynamodb list-tables --endpoint-url http://localhost:8000

aws dynamodb describe-table --table-name businesses --endpoint-url http://localhost:8000
aws dynamodb describe-table --table-name user_business --endpoint-url http://localhost:8000
aws dynamodb describe-table --table-name reviews-merged-data --endpoint-url http://localhost:8000

aws dynamodb scan --table-name businesses --endpoint-url http://localhost:8000
aws dynamodb scan --table-name businesses --index-name city-index --endpoint-url http://localhost:8000
aws dynamodb scan --table-name user_business --endpoint-url http://localhost:8000
aws dynamodb scan --table-name reviews-merged-data --endpoint-url http://localhost:8000

aws dynamodb delete-table --table-name businesses --endpoint-url http://localhost:8000
aws dynamodb delete-table --table-name user_business --endpoint-url http://localhost:8000
aws dynamodb delete-table --table-name reviews-merged-data --endpoint-url http://localhost:8000

aws dynamodb create-table \
    --table-name businesses \
    --attribute-definitions \
        AttributeName=business_id,AttributeType=S \
    --key-schema AttributeName=business_id,KeyType=HASH  \
    --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
   --endpoint-url http://localhost:8000

aws dynamodb create-table \
    --table-name user_business \
    --attribute-definitions \
        AttributeName=user_id,AttributeType=S \
    --key-schema AttributeName=user_id,KeyType=HASH  \
    --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
   --endpoint-url http://localhost:8000

aws dynamodb create-table \
    --table-name reviews-merged-data \
    --attribute-definitions \
        AttributeName=review_id,AttributeType=S \
    --key-schema AttributeName=review_id,KeyType=HASH  \
    --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
   --endpoint-url http://localhost:8000

/* Create Global Secondary Index */
aws dynamodb update-table \
    --table-name businesses \
    --attribute-definitions AttributeName=city,AttributeType=S \
    --global-secondary-index-updates \
    "[{\"Create\":{\"IndexName\": \"city-index\",\"KeySchema\":[{\"AttributeName\":\"city\",\"KeyType\":\"HASH\"}], \
    \"ProvisionedThroughput\": {\"ReadCapacityUnits\": 10, \"WriteCapacityUnits\": 5      },\"Projection\":{\"ProjectionType\":\"ALL\"}}}]" \
--endpoint-url http://localhost:8000 
    
/* Check Status of Global Secondary Index */
 aws dynamodb describe-table --table-name businesses --endpoint-url http://localhost:8000 | grep IndexStatus 

/* Delete Index */
aws dynamodb update-table \
    --table-name businesses \
    --attribute-definitions AttributeName=city,AttributeType=S \
    --global-secondary-index-updates \
    "[{\"Delete\":{\"IndexName\":\"city-index\"}}]" \
--endpoint-url http://localhost:8000