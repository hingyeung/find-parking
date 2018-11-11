# Where the data come from
https://data.melbourne.vic.gov.au/resource/vh2v-4nfs.json?$limit=5000

# Dev Setup
1. Use virtualenv  
  `mkvirtualenv find-parking`, or `workon find-parking`
1. Install python dependencies  
  `pip install -r requirements.txt`
1. Copy parking sensor data file to localstack s3  
  `aws --endpoint-url=http://localhost:4572 s3 mb s3://melb-city-parking-sensor-data`  
  `aws --endpoint-url=http://localhost:4572 s3 cp data/melb-3000_parking-sensor.json s3://melb-city-parking-sensor-data/`
1. Start localstack  
  `./scripts/start_localstack.sh`
1. Create DynamoDB table  
  `NODE_ENV=dev node scripts/create_parking_sensor_table.js`
1. Copy code and dependencies to dist/  
  TODO: Don't need this rsync step anymore for source code, but still need something similar for config files.
  `rsync -avz ./src/*  dist/ && rsync -avz ./node_modules dist/`
1. Run lambda function  
  `./scripts/load_data_from_s3_to_db.sh data/events/sensor_data_file_updated.json`
