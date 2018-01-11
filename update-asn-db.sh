#!/bin/bash

DESTDIR='./mmdb'
ME="${BASH_SOURCE[0]}"
TS="$(date +'%s' --reference="${DESTDIR}/GeoLite2-ASN.tar.gz" 2>/dev/null)"

wget --quiet --timestamping --directory-prefix="${DESTDIR}" 'http://geolite.maxmind.com/download/geoip/database/GeoLite2-ASN.tar.gz' || {
  echo "${ME##*/}: fatal error: download failed." >&2
  exit 1
}

[[ "${TS}" = "$(date +'%s' --reference="${DESTDIR}/GeoLite2-ASN.tar.gz" 2>/dev/null)" ]] || {
  tar --extract --directory "${DESTDIR}" --strip-components=1 \
    --wildcards '*.mmdb' --file "${DESTDIR}/GeoLite2-ASN.tar.gz" || exit 1
}

exit 0
