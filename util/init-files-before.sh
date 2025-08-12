#!/bin/bash
# prepares files needed immediately upon starting the repo

cd ${UTIL_DIR}/..

[ ! -f .env ] && cp .env.sample .env

[ ! -f config.json ] && cp config.json.sample config.json

# only minimum package.json required for time to first interaction
cp package.json package.original.json
cp package.minimum.json package.json
