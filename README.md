### NFL APP

This is based off Udemy 'The Complete Guide to Build Serverless Applications on AWS' by Manoj Fernando

![alt text](./images/App%20Overview.png)

### Commit Breakdown

This doc is broken down by. Each commit represents one step in the building of this project. This way, if things go bad, you can step back to the last commit.

commit 1 : basic CRUD set up (Section 4: vid 27 - 33)

- At this point the AWS Gateway with four API endpoints and Four Lambdas (on for each API endpoint) has been created. (They are all in handler.js file. Some create file for each.)

commit 2 : dyanmoDB setup (Section 4: vid. 34)

### Docs

docs.serverless.com

### -------------------------------

### Commit 1 'basic CRUD set up'

### ------------------------------

### 1. 'Basic API Setup'

This code run on Servelress Framework will create a basic API Gateway with four CRUD operations.

#### File Setup

1. download file from github and place it where you want to work on it
2. change name of file to what you want the project called
3. connect project back to a new repo in github (can do later)
4. cd into project folder for next part of setup

#### set up serverless and AWS Credential config

1. install serverless
   https://www.serverless.com/framework/docs/getting-started

```
npm install -g serverless
```

2. Configure CLI
   https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html

- requires a AWS Users (got to IAM and crate user)
- get access Id and secret key
- in within project folder, enter

```
aws configure
AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: us-west-2
Default output format [None]: json
```

#### Create Proper Files

NOTE: The files created here have already been created in this repo, but if you are starting from scratch, using this as instructions, do the below.

1. craate serverless project
   general creation (I found this to create boilerplate that is hard to manipulate)

```
sls
```

or custom (This repo was created usign this command)

```
serverless create -t awsnodejs
```

2. create package.json file

```
npm init -y
```

3. create .gitignore (if missing) by adding file named .gitignore to top project folder

### Serverless Config File Setup

In serverless.yml delete everythign except below. Note the name of my project is 'crud-api-nfl'. Change this to what you want

```
service: crud-api-nfl
frameworkVersion: '3'

provider:
  name: aws
  runtime: nodejs12.x
  stage: dev
  region: us-east-1

# you can add CloudFormation resource templates here
#resources:
#  Resources:
#    NewResource:
#      Type: AWS::S3::Bucket
#      Properties:
#        BucketName: my-new-bucket
#  Outputs:
#     NewOutput:
#       Description: "Description for the output"
#       Value: "Some output value"
```

### Add lambda functions to config file

```
service: crud-api-nfl
frameworkVersion: '3'

provider:
  name: aws
  runtime: nodejs12.x
  stage: dev
  region: us-east-1

functions:
  createGame:
    handler: handler.createGame
    events:
      - http:
          method: post
          path: games
  updateGame:
    handler: handler.updateGame
    events:
      - http:
          method: put
          path: games/{id}
  deleteGame:
    handler: handler.deleteGame
    events:
      - http:
          method: delete
          path: games/{id}
  getAllNotes:
    handler: handler.getAllGames
    events:
      - http:
          method: get
          path: games
# you can add CloudFormation resource templates here
#resources:
#  Resources:
#    NewResource:
#      Type: AWS::S3::Bucket
#      Properties:
#        BucketName: my-new-bucket
#  Outputs:
#     NewOutput:
#       Description: "Description for the output"
#       Value: "Some output value"
```

### create functions in the handler.js file

```
'use strict';

module.exports.createGame = async (event) => {
  return {
    statusCode: 201,
    body: JSON.stringify("A game has been created."),
  };
};

module.exports.updateGame = async (event) => {
  let gameId = event.pathParameters.id
  return {
    statusCode: 200,
    body: JSON.stringify(`Game with id ${gameId} has been updated.`),
  };
};

module.exports.deleteGame = async (event) => {
  let gameId = event.pathParameters.id
  return {
    statusCode: 200,
    body: JSON.stringify(`Game with id ${gameId} has been deleted.`),
  };
};

module.exports.getAllGames = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(`All games are returned.`),
  };
};


#### Commit 1 overview
At this point you should have API Gateway and four almbdas.

```

![alt text](./images/basiclambda.png)
Notice in the Integration Reques the type reades LAMBDA_PROXY. This means the gateway doesn't do any processing and passes that on to the Lambda.

### -------------------------------

### Commit 2 dyanmoDB setup

### ------------------------------

This is where we add resources to the configuration file. We use CloudFormation to setup a DynamoDB

Docs
https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-dynamodb-table.html

```
resources:
  Resources:
    gamesTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: allGames
        BillingMode: PAY_PER_REQUEST
        AttributeDefinitions:
          - AttributeName: gameId
            AttributeType: S
        KeySchema:
          - AttributeName: gameId
            KeyType: HASH
```

### -------------------------------

### Commit 3 connect POST Lambda to DynamoDB, add IAM permission

### ------------------------------

We use AWS-SDK to communicate from Lambda to DynamoDB
Dynamodb javascript sdk docs
https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html

- 1. create dynamoDB class instance

- 2. use dyanmoDB instance to execute daynamoDB methods (CRUD methods)

DynamoDB Document Client has simpler syntax (Defined Under Namespace)
https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html

PUT (WITH Document Client)
https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property

#### 1. install sdk, then import sdk for client and create instance

Note - versin 3 is stable (but tutorial uses v. 2), also check package.json to make sure dependency installed.

```
npm install aws-sdk@2
```

```
const DynamoDB = require("aws-sdk/clients/dynamodb")
const documentClient = new DynamoDB.DocumentClient({region: 'us-east-1'});
```

### 2 Add IAM access that allows lambda to access table

Becuase the IAM permission is added at the Provider level, it is available to all lambdas.

```
provider:
  name: aws
  runtime: nodejs12.x
  stage: dev
  region: us-east-1
  iamRoleStatements:
    - Effect: Allow
      Action:
        - dynamodb:PutItem
      Resource: !GetAtt gamesTable.Arn
```

### 3 Add Code for lambda post

```
module.exports.createGame = async (event, context, callback) => {
  let data = JSON.parse(event.body);
  try {
    const params = {
      TableName: "allGames",
      Item: {
        gameId: data.id,
        title: data.title,
        body: data.body
      },
      ConditionExpression: "attribute_not_exists(gameId)"
    }
    await documentClient.put(params).promise();
    callback(null,{
      statusCode: 201,
      body: JSON.stringify(data),
    })
  } catch(err) {
    callback(null,{
      statusCode: 500,
      body: JSON.stringify(err.message),
    })
  }
};
```

### -------------------------------

### Commit 4 plugin to change IAM permision from global to per Lambda

### ------------------------------

1. install plugin as a dev dependency
   https://www.npmjs.com/package/serverless-iam-roles-per-function

```
npm install --save-dev serverless-iam-roles-per-function
```

./package.json you should see

```
  "devDependencies": {
    "serverless-iam-roles-per-function": "^3.2.0"
  }
```

2. add plugins block in config file

```
plugins:
  - serverless-iam-roles-per-function
```

3. move IAM permsion from Provider to Lambda function block
   // serverles.yml > functions:

```
  createGame:
    handler: handler.createGame
    iamRoleStatements:
      - Effect: Allow
        Action:
          - dynamodb:PutItem
        Resource: !GetAtt gamesTable.Arn
    events:
      - http:
          method: post
          path: games
```

At this point only createGame() should have access to dynamoDB

### -------------------------------

### Commit 5 implement PUT (update) Call and Env. Variabale

### ------------------------------

- implement PUT (update) Call
- dynamically retrieve table name with env variable

/serverless.yml
placed int create and update function blocks

```
  updateGame:
    handler: handler.updateGame
    environment:
      GAMES_TABLE_NAME: !Ref gamesTable
      ...
```

import into handler
/handler.js

```
const GAMES_TABLE_NAME = process.env.GAMES_TABLE_NAME;
```

use it in function params
/handler.createNotes

```
module.exports.createGame = async (event, context, callback) => {
  let data = JSON.parse(event.body);
  try {
    const params = {
      TableName: GAMES_TABLE_NAME,
      Item: {
        gameId: data.id,
        title: data.title,
        body: data.body
      },
```

At this point the Create Lambda and Update Lambda are working. We also installed a plugin that allowed us to put the IAM permission within each lambda. We also created an enviroment variable fot the table's name, which is passed to the handler the lambda function.

### -------------------------------

### Commit 6 send() refactor to make callback more readable

### ------------------------------

A refactor to make callback more readable.

/ handler.js

```
const send = (statusCode, data) => {
  return {
    statusCode: statusCode,
    body: JSON.stringify(data)
  }
}
```

```await documentClient.put(params).promise();
    callback(null, send(201, data))
```

### -------------------------------

### Commit 7 implement DELETE call

### ------------------------------

/serverless.yml

```
  deleteGame:
    handler: handler.deleteGame
    environment:
      GAMES_TABLE_NAME: !Ref gamesTable
    iamRoleStatements:
      - Effect: Allow
        Action:
          - dynamodb:DeleteItem
        Resource: !GetAtt gamesTable.Arn
    events:
      - http:
          method: delete
          path: games/{id}
```

/handler.js
Note: all lambdas include a conditional expressin in params to make the API Call Idempotent

```
module.exports.deleteGame = async (event, context, callback) => {
  let gameId = event.pathParameters.id
  try {
    const params = {
      TableName: GAMES_TABLE_NAME,
      Key: {
        gameId: gameId
      },
      ConditionExpression: 'attribute_exists(gameId)'
    }
    await documentClient.delete(params).promise();
    callback(null,send(200,gameId))
  } catch(err) {
    callback(null, send(500, err.message))
  }
};
```
