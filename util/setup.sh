#!/bin/bash
echo "## Setup"

UTIL_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
export UTIL_DIR

bash ${UTIL_DIR}/init-files-before.sh

node ${UTIL_DIR}/start-logger.js

bash ${UTIL_DIR}/install-dependencies.sh

bash ${UTIL_DIR}/init-files-after.sh

# nohup so that installation runs in the background
nohup ${UTIL_DIR}/install-dependencies.sh &
node ${UTIL_DIR}/prompt-values.js
