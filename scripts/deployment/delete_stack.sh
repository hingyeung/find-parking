#!/usr/bin/env bash

STACK_NAME=$1

aws cloudformation delete-stack \
    --region ap-southeast-2 \
    --stack-name ${STACK_NAME}