#!/bin/bash

DESTDIR='./mmdb'
ME="${BASH_SOURCE[0]}"

if [ -z ${MAXMIND_LICENSE+x} ]
then
  echo "Error, MAXMIND_LICENSE env must be set"
fi


wget --quiet --output-document="${DESTDIR}/GeoLite2-ASN.tar.gz" "https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-ASN&license_key=$MAXMIND_LICENSE&suffix=tar.gz" || {
  echo "${ME##*/}: fatal error: download failed." >&2
  exit 1
}

tar --extract --directory "${DESTDIR}" --strip-components=1 \
  --wildcards '*.mmdb' --file "${DESTDIR}/GeoLite2-ASN.tar.gz" || exit 1

rm "${DESTDIR}/GeoLite2-ASN.tar.gz"

exit 0
