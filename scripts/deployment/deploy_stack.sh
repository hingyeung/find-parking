#!/usr/bin/env bash

source `dirname $0`/../commons.sh

CF_TEMPLATE=${PROJECT_ROOT}/tmp/find_parking_cfn.yaml
STACK_NAME=$1
ARTEFACT_S3_BUCKET=$2
PARKING_DATA_DOWNLOAD_DESTINATION_S3_PREFIX=$3

aws cloudformation deploy \
    --template-file ${CF_TEMPLATE} \
    --stack-name ${STACK_NAME} \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides \
        dataBucket=${ARTEFACT_S3_BUCKET} \
        downloadDestPrefix=${PARKING_DATA_DOWNLOAD_DESTINATION_S3_PREFIX}

# aws --profile deployer  cloudformation deploy --template-file /Users/samli/dev/find-parking/tmp/find_parking_cfn.yaml --stack-name find-parking-dev-stack --capabilities CAPABILITY_IAM --parameter-overrides dataBucket=build-artefacts.samuelli.net downloadDestPrefix=find-parking/data