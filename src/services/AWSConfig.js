// AWSConfig.js
import AWS from 'aws-sdk';

AWS.config.update({
  accessKeyId: 'AKIASAHHYXZDGGYMQIEG',
  secretAccessKey: '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',
  region: 'us-east-1',
});

export const s3 = new AWS.S3();
