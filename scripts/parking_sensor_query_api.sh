#!/usr/bin/env bash

sam local start-api \
    --skip-pull-image \
    --docker-network find-parking_default \
    -t deploy/template.yaml \
    --env-vars data/env-vars.json