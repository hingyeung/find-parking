# Where the data come from
https://data.melbourne.vic.gov.au/resource/vh2v-4nfs.json?$limit=5000

# Dev Setup
1. Install [AWS SAM Local](https://github.com/awslabs/aws-sam-cli/releases/tag/v0.6.2)
1. Use virtualenv  
  `mkvirtualenv find-parking`, or `workon find-parking` if the virtualenv `find-parking` already exists.
1. Install python dependencies  
  `pip install -r requirements.txt`
1. Start localstack  
  `npm run start_localstack`
1. Create DynamoDB table and populate S3 with data  
  `npm run seed_data`
1. Watch and transpile the `load_data_from_s3` Lambda function  
  `npm run watch_load_data_from_s3`
1. Run the `load_data_from_s3` Lambda function  
  `npm run run_load_data_from_s3`
1. Run the API locally
  `npm run run_parking_sensor_query_api`
1. Visit local API
  `http://127.0.0.1:3001/findAvailableParkings?lat=-37.8147527&lng=144.9647163&radiusInMeter=500`
# Deployment
1. Package the Lambda function  
  `sam package --template-file deploy/template.yaml --s3-bucket <bucket_name> --s3-prefix find-parking/artefacts --output-template-file tmp/find_parking_cfn.yaml`
1. Deploy the stack  
  `aws  cloudformation deploy --template-file /Users/samli/dev/find-parking/tmp/find_parking_cfn.yaml --stack-name <stack_name> --capabilities CAPABILITY_IAM --parameter-overrides dataBucket=<bucket_name> downloadDestPrefix=find-parking/data`  