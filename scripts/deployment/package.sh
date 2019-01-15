#!/usr/bin/env bash

source `dirname $0`/../commons.sh

SAM_TEMPLATE=${PROJECT_ROOT}/deploy/template.yaml
OUTPUT_CF_TEMPLATE=${PROJECT_ROOT}/tmp/find_parking_cfn.yaml
ARTEFACT_S3_BUCKET=$1
ARTEFACT_S3_PREFIX=$2

sam package \
    --template-file ${SAM_TEMPLATE} \
    --s3-bucket ${ARTEFACT_S3_BUCKET} \
    --s3-prefix ${ARTEFACT_S3_PREFIX} \
    --output-template-file ${OUTPUT_CF_TEMPLATE}
