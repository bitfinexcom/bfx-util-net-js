#!/bin/bash
set -e

for file in $(find config -type f -name "*.example"); do
  new_name=$(echo "$file" | sed -E -e 's/.example//')
  echo "$file -> $new_name"
  cp "$file" "$new_name"
done
