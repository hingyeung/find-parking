#!/usr/bin/env bash

aws --endpoint-url=http://localhost:4572 s3 mb s3://melb-city-parking-sensor-data
aws --endpoint-url=http://localhost:4572 s3 cp data/melb-3000_parking-sensor.json s3://melb-city-parking-sensor-data/
aws --endpoint-url=http://localhost:4572 s3 cp data/melb-3000_parking-restrictions.json s3://melb-city-parking-sensor-data/