const {
    S3Client
  } = require('@aws-sdk/client-s3');

const client = new S3Client({});

module.exports = client
