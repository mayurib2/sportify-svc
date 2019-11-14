# Sportify-svc #


**Create a business**
----
  Register a new business for a given user based on user_id which is the emailId .

* **URL**

  `/users/{:user_id}/businesses`
  
  Sample Url
  
  `http://{hostname}/users/email_2@gmail.com/businesses`
* **Method:**

  `POST`
  
*  **Request Body**

   **Required:**
   ``` 
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
   **Sample Request Body**
      ``` 
        {
          "name": "Maria Maria",
          "categories": [
            "mexican food",
            "restaurant"
          ],
          "address": "710 Camino Ramon",
          "city": "Danville",
          "state": "CA",
          "postal_code": "94526"
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

  `/users/{:user_id}/businesses`
  
  Sample Url
  `http://{hostname}/users/email_2@gmail.com/businesses`

* **Method:**

  `GET`

* **Success Response:**

  * **Code:** 200 <br />
    **Response Body:** 

   ``` 
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
  
     **Sample Response Body**
     ```
          {
            "name": "Maria Maria",
            "categories": [
              "mexican food",
              "restaurant"
            ],
            "address": "710 Camino Ramon",
            "city": "Danville",
            "state": "CA",
            "postal_code": "94526"
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

  `/businesses`

* **Method:**

  `GET`
  
*  **URL Params**

   **Required:**
   
   `event_type="string"`<br/>
   `city="string"`
   
   Sample Url with mandatory parameters
   `http://{hostname}/businesses?event_type=restaurant&city=Danville`
   
   **Optional:**
   
   `last_key_city="string"`<br/>
   `last_key_business_id="string"`

   **Sample Url with mandatory and optional parameters**
   `http://{hostname}/businesses?event_type=restaurant&city=Danville&last_key_business_id=e9a7c61e-3f16-4ce6-a99b-3ab9cbf13970&last_key_city=Danville`

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
    ***LastEvaluatedKey will be present in response only if there are more records left in DB to be matched. 
 So if UI sees LastEvaluatedKey in response then it can use these values for the optional query parameters
  which are last_key_city and last_key_business_id and and send it back to the backend to fetch more matching 
  results***
  
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

  `/businesses/{:business_id}`

* **Method:**

  `PUT`
  
*  **Request Body**

   **Required:**
   ``` 
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
   
      **Sample Request Body**
 
        {
          "name": "Maria Maria NEW",
          "categories": [
            "mexican food",
            "restaurant"
          ],
          "address": "710 Camino Ramon",
          "city": "Danville",
          "state": "CA",
          "postal_code": "94526"
        }
         

* **Success Response:**

  * **Code:** 200 <br />
    **Response Body:** 
    ```
    {
        "Attributes": {
            "city": "Danville",
            "address": "710 Camino Ramon",
            "name": "Maria Maria NEW",
            "categories": [
                "mexican food",
                "restaurant"
            ],
            "postal_code": "94526",
            "state": "CA"
        }
    }
    ```
    
* **Error Response:**

  * **Code:** 500  <br />
    **Response Body:** <br />
     `{error_message: "Error occurred while updating business", error: err}`

**Delete a business**
----
  Delete a existing business based on business_id.

* **URL**

  `/users/{:user_id}/businesses/{:business_id}`

  Sample Url
  
  `http://{hostname}/users/email_2@gmail.com/businesses/5b2aeb36-520a-4859-a05d-d74570886ea7`  
  

* **Method:**

  `DELETE`

* **Success Response:**

  * **Code:** 200 <br />
    **Response Body:** <br />
    `{message: "Business deleted successfully"}`
    
* **Error Response:**

  * **Code:** 500  <br />
    **Response Body:** <br />
     `{error_message: "Error occurred while updating business", error: err}`

AWS DYNAMODB CLI
============= 
***Start Local DynamoDB from location where dynamo jar file is present*** <br />
	`java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb`

***List Tables*** <br />
`aws dynamodb list-tables --endpoint-url http://localhost:8000`

***Describe Tables*** <br />
`aws dynamodb describe-table --table-name businesses --endpoint-url http://localhost:8000`<br />
`aws dynamodb describe-table --table-name user_business --endpoint-url http://localhost:8000`<br />
`aws dynamodb describe-table --table-name reviews-merged-data --endpoint-url http://localhost:8000`<br />

***Scan Table to see all items***<br />
`aws dynamodb scan --table-name businesses --endpoint-url http://localhost:8000`<br />
`aws dynamodb scan --table-name businesses --index-name city-index --endpoint-url http://localhost:8000`<br />
`aws dynamodb scan --table-name user_business --endpoint-url http://localhost:8000`<br />
`aws dynamodb scan --table-name reviews-merged-data --endpoint-url http://localhost:8000`<br />

***Delete Table*** <br />
`aws dynamodb delete-table --table-name businesses --endpoint-url http://localhost:8000`<br />
`aws dynamodb delete-table --table-name user_business --endpoint-url http://localhost:8000`<br />
`aws dynamodb delete-table --table-name reviews-merged-data --endpoint-url http://localhost:8000`<br />

***Create businesses table*** <br />
```
aws dynamodb create-table \
    --table-name businesses \
    --attribute-definitions \
        AttributeName=business_id,AttributeType=S \
    --key-schema AttributeName=business_id,KeyType=HASH  \
    --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=10 \
   --endpoint-url http://localhost:8000
```
***Create user_business mapping table*** <br />
```
aws dynamodb create-table \
    --table-name user_business \
    --attribute-definitions \
        AttributeName=user_id,AttributeType=S \
    --key-schema AttributeName=user_id,KeyType=HASH  \
    --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=10 \
   --endpoint-url http://localhost:8000
```
***Create Review Table***
```
aws dynamodb create-table \
    --table-name reviews-merged-data \
    --attribute-definitions \
        AttributeName=review_id,AttributeType=S \
    --key-schema AttributeName=review_id,KeyType=HASH  \
    --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=10 \
   --endpoint-url http://localhost:8000
```

***Create city-index Global Secondary Index on businesses table***
```
aws dynamodb update-table \
    --table-name businesses \
    --attribute-definitions AttributeName=city,AttributeType=S \
    --global-secondary-index-updates \
    "[{\"Create\":{\"IndexName\": \"city-index\",\"KeySchema\":[{\"AttributeName\":\"city\",\"KeyType\":\"HASH\"}], \
    \"ProvisionedThroughput\": {\"ReadCapacityUnits\": 10, \"WriteCapacityUnits\": 5},\"Projection\":{\"ProjectionType\":\"ALL\"}}}]" \
--endpoint-url http://localhost:8000 
```
    
***Check Status of Global Secondary Index***
 `aws dynamodb describe-table --table-name businesses --endpoint-url http://localhost:8000 | grep IndexStatus`

***Delete GSI city-index***
```
aws dynamodb update-table \
    --table-name businesses \
    --attribute-definitions AttributeName=city,AttributeType=S \
    --global-secondary-index-updates \
    "[{\"Delete\":{\"IndexName\":\"city-index\"}}]" \
--endpoint-url http://localhost:8000
```

***Create User Details Table***
```
aws dynamodb create-table \
    --table-name user_details \
    --attribute-definitions \
        AttributeName=user_id,AttributeType=S \
    --key-schema AttributeName=user_id,KeyType=HASH  \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5

```