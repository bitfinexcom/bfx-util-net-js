#!/bin/bash

DESTDIR='./mmdb'
ME="${BASH_SOURCE[0]}"

if [ -z ${MAXMIND_LICENSE+x} ]
then
  echo "Error, MAXMIND_LICENSE env must be set"
fi

env LICENSE_KEY="$MAXMIND_LICENSE" node ./scripts/updatedb.js

exit 0
