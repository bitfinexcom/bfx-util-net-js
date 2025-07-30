#!/bin/bash

trap '[[ -f "${TMPFILE}" ]] && rm --force "${TMPFILE}"' 'EXIT'

readonly DESTDIR="${DESTDIR:-mmdb}"
readonly ARCHIVE="${DESTDIR}/GeoLite2-ASN.tar.gz"
readonly LOCAL_TIMESTAMP="$(date +'%s' --reference="${ARCHIVE}" 2>/dev/null)"
readonly MAXMIND_LICENSE="${MAXMIND_LICENSE:-$(head --quiet --lines=1 'MAXMIND_KEY' 2>/dev/null)}"

[[ "${MAXMIND_LICENSE:-}" =~ ^[[:alnum:]]+$ ]] || {
  echo "${BASH_SOURCE[0]##*/}: fatal error: license key has not been provided." >&2
  exit 1
}

[[ -d "${DESTDIR}" ]] \
  || mkdir --parents "${DESTDIR}"

curl --silent --fail --output "${ARCHIVE}" --time-cond "${ARCHIVE}" --location "https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-ASN&license_key=${MAXMIND_LICENSE}&suffix=tar.gz" || {
  echo "${BASH_SOURCE[0]##*/}: fatal error: download failed." >&2
  exit 1
}

[[ "${LOCAL_TIMESTAMP}" = "$(date +'%s' --reference="${ARCHIVE}" 2>/dev/null)" ]] || {
  readonly TMPFILE="$(mktemp -p "${DESTDIR}" -t 'GeoLite2-ASN.mmdb.XXXXXXXXXXXXXXXX')"

  tar --extract --directory "${DESTDIR}" --strip-components=1 --wildcards '*.mmdb' \
    --transform='flags=rSH;s|GeoLite2-ASN\.mmdb$|'"${TMPFILE##*/}"'|g' --file "${ARCHIVE}" || exit 1

  cat "${TMPFILE}" >"${DESTDIR}/GeoLite2-ASN.mmdb"
}
