# Where the data come from
https://data.melbourne.vic.gov.au/resource/vh2v-4nfs.json?$limit=5000

# Dev Setup
1. Use virtualenv  
  `mkvirtualenv find-parking`, or `workon find-parking` if the virtualenv `find-parking` already exists.
1. Install python dependencies  
  `pip install -r requirements.txt`
1. Copy parking sensor data file to localstack s3  
  `aws --endpoint-url=http://localhost:4572 s3 mb s3://melb-city-parking-sensor-data`  
  `aws --endpoint-url=http://localhost:4572 s3 cp data/melb-3000_parking-sensor.json s3://melb-city-parking-sensor-data/`
1. Start localstack  
  `./scripts/start_localstack.sh`
1. Create DynamoDB table and populate S3 with data  
  `npm run seed_data`
1. Watch and transpile the `load_data_from_s3` Lambda function  
  `npm run watch_load_data_from_s3`
1. Run the `load_data_from_s3` Lambda function  
  `npm run run_load_data_from_s3`
