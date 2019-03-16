#!/usr/bin/env bash

docker-compose \
    --file deploy/localstack-docker-compose.yml \
    --project-name find-parking \
    logs -f