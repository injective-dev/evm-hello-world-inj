#!/bin/bash
echo "## Setup"

UTIL_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

export UTIL_DIR

bash ${UTIL_DIR}/install-dependencies.sh

bash ${UTIL_DIR}/init-dotenv.sh
node ${UTIL_DIR}/init-dotenv.js
