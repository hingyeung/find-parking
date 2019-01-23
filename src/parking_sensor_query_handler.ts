import { APIGatewayEvent, APIGatewayProxyHandler, APIGatewayProxyResult, Callback, Context } from 'aws-lambda';
import ParkingSensorDataRepo from './services/parking_sensor_data_repo';
import { DynamoDB } from 'aws-sdk';
import 'source-map-support/register';
import { ParkingSpace } from './types';

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
      const unoccupiedParkingSpaces: ParkingSpace[] = [];
      matchedPoints.forEach(matched => {
        const location = JSON.parse(matched.geoJson.S);
        const parkingSpace: ParkingSpace = {
          coordinate: {lat: location.coordinates[1], lng: location.coordinates[0]},
          bay_id: matched.bay_id.S
        };
        unoccupiedParkingSpaces.push(parkingSpace);
      });
      callback(undefined, buildAPIGWProxyResult(200, JSON.stringify(unoccupiedParkingSpaces)));
    })
    .catch((err) => {
      callback(err);
    });
};

export { handler };