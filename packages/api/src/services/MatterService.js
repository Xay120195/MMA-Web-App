const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const {  GetObjectCommand } = require('@aws-sdk/client-s3');
const client = require('../lib/s3-client')

const MATTER_BUCKET_NAME = 'matter-files-bucket'

exports.generatePresignedUrl = async (Key) => {

    const command = new GetObjectCommand({
         Bucket: MATTER_BUCKET_NAME,
         Key,
    });

    /**
     * Generate Pre-signed url using getSignedUrl
     */
    return getSignedUrl(client, command, { expiresIn: 3600 });
}