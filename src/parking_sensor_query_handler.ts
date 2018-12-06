import { APIGatewayEvent, APIGatewayProxyHandler, APIGatewayProxyResult, Callback, Context } from 'aws-lambda';
import ParkingSensorDataRepo from './services/parking_sensor_data_repo';
import { DynamoDB } from 'aws-sdk';
import 'source-map-support/register';

const buildAPIGWProxyResult = (statusCode: number, body: string): APIGatewayProxyResult => {
  return {
    statusCode: Number.isInteger(statusCode) ? statusCode : 500,
    body: body
  };
};

const handler: APIGatewayProxyHandler = (event: APIGatewayEvent, context: Context, callback: Callback<APIGatewayProxyResult>) => {
  const psdr = new ParkingSensorDataRepo(),
    lat = parseFloat(event.queryStringParameters['lat']) || undefined,
    lng = parseFloat(event.queryStringParameters['lng']) || undefined,
    radiusInMeter = parseFloat(event.queryStringParameters['radiusInMeter']) || undefined;
  if (!lat || !lng || !radiusInMeter) {

    callback(undefined, buildAPIGWProxyResult(400, 'Bad Request'));
  }
  psdr.findUnoccupiedParkingWithinRadius(lat, lng, radiusInMeter)
    .then((matchedPoints: DynamoDB.ItemList) => {
      console.log(`Found ${matchedPoints.length} unoccupied parking spaces`);
      matchedPoints.forEach(matched => {
        const location = JSON.parse(matched.geoJson.S);
        console.log(location.coordinates[1], location.coordinates[0]);
      });
      callback(undefined, buildAPIGWProxyResult(200, 'OK'));
    })
    .catch((err) => {
      callback(err);
    });
};

export { handler };