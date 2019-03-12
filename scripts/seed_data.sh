#!/usr/bin/env bash

aws --endpoint-url=http://localhost:4572 s3 mb s3://melb-city-parking-data
aws --endpoint-url=http://localhost:4572 s3 cp data/melb-3000_parking-sensor.json s3://melb-city-parking-data/parking-sensor/
aws --endpoint-url=http://localhost:4572 s3 cp data/melb-3000_parking-restrictions.json s3://melb-city-parking-data/parking-restrictions/

aws --endpoint-url=http://localhost:4583 ssm put-parameter --name '/find-parking/parking-restriction/data/s3-bucket' --value 'melb-city-parking-data' --type String
aws --endpoint-url=http://localhost:4583 ssm put-parameter --name '/find-parking/parking-restriction/data/s3-key' --value 'parking-restrictions/melb-3000_parking-restrictions.json' --type String