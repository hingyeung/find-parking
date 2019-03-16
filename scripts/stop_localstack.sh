#!/usr/bin/env bash
set -e

# stop localstack Docker containers
docker-compose \
    --file deploy/localstack-docker-compose.yml \
    --project-name find-parking \
    down \
    --remove-orphans
