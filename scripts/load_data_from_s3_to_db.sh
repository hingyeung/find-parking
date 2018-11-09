#!/bin/bash
set -e

EVENT=$1
CF_TEMPLATE=dist/find-parking.cfn
ENV_VARS=data/env-vars.json
DOCKER_NETWORK=find-parking_default
SAM_TEMPLATE=deploy/template.yaml

# use --skip-pull-image when offline
sam local invoke \
    --template ${CF_TEMPLATE} UploadParkingSensorDataToDB \
    --env-vars ${ENV_VARS} \
    --docker-network ${DOCKER_NETWORK} \
    --skip-pull-image \
    -t ${SAM_TEMPLATE} \
    -e ${EVENT}
