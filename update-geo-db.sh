#!/bin/bash

trap '[[ -d "${TEMPDIR}" ]] && rm --recursive --force "${TEMPDIR}"' 'EXIT'

readonly DESTDIR="${DESTDIR:-data}"
readonly TEMPDIR="$(mktemp -d -p '.' -t "${DESTDIR}-XXXXXXXXXXXXXXXX")"
readonly MAXMIND_LICENSE="${MAXMIND_LICENSE:-$(head --quiet --lines=1 'MAXMIND_KEY' 2>/dev/null)}"

[[ "${MAXMIND_LICENSE:-}" =~ ^[[:alnum:]]+$ ]] || {
  echo "${BASH_SOURCE[0]##*/}: fatal error: license key has not been provided." >&2
  exit 1
}

[[ -d "${DESTDIR}" ]] \
  || mkdir --parents "${DESTDIR}"

rsync --archive --include '*.checksum' --exclude '*' "${DESTDIR}/" "${TEMPDIR}" \
  && env node ./scripts/updatedb.js -- license_key="${MAXMIND_LICENSE}" geodatadir="${TEMPDIR}" \
  && rsync --archive "${TEMPDIR}/" "${DESTDIR}"
