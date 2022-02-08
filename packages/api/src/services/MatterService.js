const { PutItemCommand, GetItemCommand } = require("@aws-sdk/client-dynamodb");
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
const { v4 } = require("uuid");
import ddbClient from "../lib/dynamodb-client";

const {  GetObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = require('../lib/s3-client')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const MATTER_BUCKET_NAME = 'mma-webapp-dev-bucket'

export async function generatePresignedUrl(Key) {

    const command = new GetObjectCommand({
         Bucket: MATTER_BUCKET_NAME,
         Key,
    });

    /**
     * Generate Pre-signed url using getSignedUrl expires after 1 hour
     */
    return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function getMatterFile(data) {
    console.log("getMatterFile()");
    let response = {};
    try {
      const params = {
        TableName: "MatterFileTable",
        Key: marshall({
          id: data.id,
        }),
      };
  
      const command = new GetItemCommand(params);
      const { Item } = await ddbClient.send(command);
      response = Item ? unmarshall(Item) : {};
    } catch (e) {
      response = {
        error: e.message,
        errorStack: e.stack,
        statusCode: 500,
      };
    }
  
    return response;
  }

  export async function createMatterFile(data) {
      console.log("createMatterFile: ", data)
    let response = {};
    try {
      const rawParams = {
          id: v4(),
        matterId: data.matterId,
        s3ObjectKey: "public/" + data.s3ObjectKey,
        size: data.size,
        type: data.type,
        createdAt: new Date().toISOString(),
      };
  
      console.log(rawParams);
      const params = marshall(rawParams);
      const command = new PutItemCommand({
        TableName: "MatterFileTable",
        Item: params,
      });
  
      const request = await ddbClient.send(command);
      response = request ? unmarshall(params) : {};
    } catch (e) {
      response = {
        error: e.message,
        errorStack: e.stack,
        statusCode: 500,
      };
    }
    return response;
  }
  