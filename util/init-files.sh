#!/bin/bash

cd ${UTIL_DIR}/..

[ ! -f .env ] && cp .env.sample .env

[ ! -f config.json ] && cp config.json.sample config.json
