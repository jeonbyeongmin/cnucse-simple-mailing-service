const AWS = require("aws-sdk");
const itemsToEmails = require("./itemsToEmails");

AWS.config.update({
  region: "ap-northeast-2",
  endpoint: "http://dynamodb.ap-northeast-2.amazonaws.com",
});

const dynamo = new AWS.DynamoDB.DocumentClient();

module.exports = async function getEmails() {
  try {
    const { Items } = await dynamo.scan({ TableName: "csms" }).promise();
    return itemsToEmails(Items);
  } catch (error) {
    throw new Error("Failed during getting item", error);
  }
};
