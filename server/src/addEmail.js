const AWS = require("aws-sdk");
const getEmails = require("./common/getEmails");

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
    const emails = await getEmails();

    if (emails.length >= 500) {
      throw new Error("ERR1");
    }

    if (emails.find((item) => item === reqEmail)) {
      throw new Error("ERR2");
    }

    body = await dynamo
      .put({
        TableName: "csms",
        Item: {
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
