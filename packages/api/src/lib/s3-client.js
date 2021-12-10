const {
    S3Client
  } = require('@aws-sdk/client-s3');

const config =  process.env.IS_OFFLINE ? {region: 'localhost',
endpoint: 'http://localhost:8000'}: {}

const client = new S3Client({});

module.exports = client