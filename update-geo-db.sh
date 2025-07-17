#!/bin/bash

if [ -z "$MAXMIND_KEY" ]; then
  echo "Error: MAXMIND_KEY environment variable must be set"
  echo "Usage: export MAXMIND_KEY=license_key"
  exit 1
fi

LICENSE_KEY="$MAXMIND_KEY" node ./scripts/updatedb.js


