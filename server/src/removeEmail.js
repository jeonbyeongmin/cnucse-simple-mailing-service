const AWS = require("aws-sdk");

AWS.config.update({
  region: "ap-northeast-2",
  endpoint: "http://dynamodb.ap-northeast-2.amazonaws.com",
});

const dynamo = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event, context) => {
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  const reqEmail = event?.queryStringParameters?.email;

  try {
    body = await dynamo
      .delete({
        TableName: "csms",
        Key: {
          email: reqEmail,
        },
      })
      .promise();
  } catch (error) {
    statusCode = 400;
    body = error.message;
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers,
  };
};
