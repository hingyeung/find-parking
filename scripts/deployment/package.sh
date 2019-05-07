#!/usr/bin/env bash

source `dirname $0`/../commons.sh
OUTPUT_CF_DIR=${PROJECT_ROOT}/tmp
mkdir -p ${OUTPUT_CF_DIR}

SAM_TEMPLATE=${PROJECT_ROOT}/deploy/template.yaml
OUTPUT_CF_TEMPLATE=${OUTPUT_CF_DIR}/find_parking_cfn.yaml
ARTEFACT_S3_BUCKET=$1
ARTEFACT_S3_PREFIX=$2

sam package \
    --template-file ${SAM_TEMPLATE} \
    --s3-bucket ${ARTEFACT_S3_BUCKET} \
    --s3-prefix ${ARTEFACT_S3_PREFIX} \
    --output-template-file ${OUTPUT_CF_TEMPLATE}
