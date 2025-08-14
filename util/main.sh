#!/bin/bash
echo "## Main"

UTIL_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
export UTIL_DIR

node ${UTIL_DIR}/setup-complete.js
