## Serverless Backend of Melbourne City On-street Parking Finder

 This is a serverless backend that serves the frontend of Melbourne City On-street Parking Finder. It consists of two components:
 1. An AWS Lambda function that handles queries from UI.
 1. A workflow for ingesting On-street parking sensor data from City of Melbourne Open Data Platform, orchestrated with AWS Step Functions and Lambda functions.

## Dev Setup
1. Install [AWS SAM Local](https://github.com/awslabs/aws-sam-cli/releases/tag/v0.6.2)
1. Use [virtualenv](https://virtualenv.pypa.io/en/latest/).  
  `mkvirtualenv find-parking`, or `workon find-parking` if the virtualenv `find-parking` already exists.
1. Install python dependencies.  
  `pip install -r requirements.txt`
1. Start localstack.  
  `npm run start_localstack`
1. Seed local S3 bucket and SSM with test data.  
  `npm run seed_data`
1. Watch and transpile individual Lambda function.  
  `npm run watch_load_parking_sensor_data_from_s3`
  `npm run watch_download_parking_sensor_data`
  `npm run watch_download_parking_restrictions_data`
  `npm run watch_parking_sensor_query_handler`
1. Run individual Lambda functions.  
  `npm run run_load_parking_sensor_data_from_s3`
  `npm run run_download_parking_sensor_data`
  `npm run run_download_parking_restrictions_data`
  `npm run run_parking_sensor_query_handler`
1. Run the API locally.  
  `npm run run_parking_sensor_query_api`
1. Test the API locally.  
  Visit `http://127.0.0.1:3001/findAvailableParkings?lat=-37.8147527&lng=144.9647163&radiusInMeter=500`

## Deployment
1. Transpile all Typescript code in preparation for packaging.    
  `npm run transpile`
1. Package the Lambda function.  
  `sam package --template-file deploy/template.yaml --s3-bucket <bucket_name> --s3-prefix find-parking/artefacts --output-template-file tmp/find_parking_cfn.yaml`
1. Deploy stack with CloudFormation.  
  `aws cloudformation deploy --template-file /Users/samli/dev/find-parking/tmp/find_parking_cfn.yaml --stack-name <stack_name> --capabilities CAPABILITY_IAM --parameter-overrides dataBucket=<bucket_name> downloadDestPrefix=find-parking/data`  
