#!/bin/bash
echo "## Setup"

UTIL_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
export UTIL_DIR

bash ${UTIL_DIR}/init-files.sh

node ${UTIL_DIR}/start-logger.js

bash ${UTIL_DIR}/install-dependencies.sh

node ${UTIL_DIR}/prompt-values.js
