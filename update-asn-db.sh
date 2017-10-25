#!/bin/bash

wget http://geolite.maxmind.com/download/geoip/database/GeoLite2-ASN.tar.gz -O ./mmdb/GeoLite2-ASN.tar.gz
cd mmdb && tar -zxvf GeoLite2-ASN.tar.gz --strip 1
