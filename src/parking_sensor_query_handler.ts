import { APIGatewayEvent, APIGatewayProxyHandler, APIGatewayProxyResult, Callback, Context } from 'aws-lambda';
import ParkingSensorDataRepo from './services/parking_sensor_data_repo';
import 'source-map-support/register';
import { ParkingSensorData } from './models/parking_sensor_data';
import ConfigRepo from './services/config_repo';

const buildAPIGWProxyResult = (statusCode: number, body: string): APIGatewayProxyResult => {
  let respHeaders = {'Content-Type': 'application/json'};
  const corsResponseValue = ConfigRepo.getCORSResponseValue();
  if (corsResponseValue) {
    respHeaders = Object.assign(respHeaders, {'Access-Control-Allow-Origin': corsResponseValue});
  }
  return {
    statusCode: Number.isInteger(statusCode) ? statusCode : 500,
    headers: respHeaders,
    body: body
  };
};

const handler: APIGatewayProxyHandler = (event: APIGatewayEvent, context: Context, callback: Callback<APIGatewayProxyResult>) => {
  // lambda does not exit if there is an open connection to mongodb
  context.callbackWaitsForEmptyEventLoop = false;

  const psdr = new ParkingSensorDataRepo(),
    lat = parseFloat(event.queryStringParameters['lat']) || undefined,
    lng = parseFloat(event.queryStringParameters['lng']) || undefined,
    radiusInMeter = parseFloat(event.queryStringParameters['radiusInMeter']) || undefined;
  if (!lat || !lng || !radiusInMeter) {
    callback(undefined, buildAPIGWProxyResult(400, 'Bad Request'));
  }
  psdr.findUnoccupiedParkingWithinRadius(lat, lng, radiusInMeter)
    .then((matchedPoints: ParkingSensorData[]) => {
      console.log(`Found ${matchedPoints.length} matching parking bays`);
      callback(undefined, buildAPIGWProxyResult(200, JSON.stringify(matchedPoints)));
    })
    .catch(err => {
      callback(err);
    });
};

export { handler };