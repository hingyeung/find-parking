import { Handler } from 'aws-lambda';
import { parseS3Url } from './helpers/s3_helper';

const handler: Handler = async (event, context, callback) => {
  try {
    console.log(event);
    const s3Src = parseS3Url(event.parkingRestrictionsDataFile);
    console.log(s3Src);
  } catch (err) {
    console.log(`failed to load S3 ${event.parkingRestrictionsDataFile} into DB`);
    callback(err);
  }
};

exports.handler = handler;
