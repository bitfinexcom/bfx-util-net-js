# bfx-util-net

## Setup

The project inherits code from a base repository.

The base / root project is: https://github.com/bitfinexcom/bfx-util-js

Setup steps:

1. Add base as upstream: `git remote add upstream https://github.com/bitfinexcom/bfx-util-js`

Changes should go through the base project and merged from upstream, if applicable.

Run two Grapes:

```
grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'
grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'
```

### Update Geo/ASN data

```
npm run update-geo-data
npm run update-asn-data
```

### Periodic Updates for Geo/ASN data

Update geo-data at midnight every three days with cron.
Update geo-data at 23:00 every three days with cron.


Let's assume the path to the deployed service is `/opt/var/bfx-util-net`.

```
0 0 */3 * * cd /opt/var/bfx-util-net && /usr/bin/npm run update-geo-data
0 23 */3 * * cd /opt/var/bfx-util-net && /usr/bin/npm run update-asn-data
```

The IP databases are watching the database files for changes and will load
the updated data into the RAM as soon as the data changes.

### Boot worker

```
node worker.js --env=development --wtype=wrk-util-net-api --apiPort 8721
```

## Grenache API

### action: 'getIpInfo'

  - `args`: &lt;Array&gt;
    - `0`: &lt;String&gt; IP to lookup

**Response:**

  - &lt;Array&gt;
    - 0 &lt;String&gt; Ip that was looked up
    - 1 &lt;Object&gt; Result: geo, dns

**Example Response:**

```js
[
  "8.8.8.8",
  {
    "geo": {
      "range": [
        134744064,
        134744319
      ],
      "country": "US",
      "region": "CA",
      "city": "Mountain View",
      "ll": [
        37.386,
        -122.0838
      ],
      "metro": 807,
      "zip": 94035
    },
    "dns": [
      "google-public-dns-a.google.com"
    ],
    "asn": {
      "autonomous_system_number": 15169,
      "autonomous_system_organization": "Google Inc."
    }
  }
]
```

### action: 'getIpAsn'

  - `args`: &lt;Array&gt;
    - `0`: &lt;String&gt; IP to lookup

**Response:**

  - &lt;Array&gt;
    - 0 &lt;String&gt; Ip that was looked up
    - 1 &lt;Object&gt; ASN information

 **Example Response:**

```js
[ '8.8.8.8',
  { autonomous_system_number: 15169,
    autonomous_system_organization: 'Google Inc.' } ]
```

### action: 'getReverseDns'


  - `args`: &lt;Array&gt;
    - `0`: &lt;String&gt; IP to lookup

**Response:**

  - &lt;Array&gt;
    - 0 &lt;String&gt; Ip that was looked up
    - 1 &lt;Array&gt; hostnames

**Example Response:**

```js
[ '8.8.8.8', [ 'google-public-dns-a.google.com' ] ]
```

### action: 'getIpGeo'

  - `args`: &lt;Array&gt;
    - `0`: &lt;String&gt; IP to lookup

**Response:**

  - &lt;Array&gt;
    - 0 &lt;String&gt; Ip that was looked up
    - 1 &lt;Object&gt; Result: range, country, region, city, ll, metro, zip

**Example Response:**

```js
[ '53.1.34.21',
  { range: [ 889192448, 897238054 ],
    country: 'DE',
    region: '',
    city: '',
    ll: [ 51.2993, 9.491 ],
    metro: 0,
    zip: 0 } ]
```

### action: 'getIpGeoBatch'

  - `args`: &lt;Array&gt;
    - `0`: &lt;Array&gt; IPs to lookup

**Response:**

  - &lt;Array&gt;
    - 0 &lt;String&gt; Ip that was looked up
    - 1 &lt;Array&gt; Result array

**Example Response:**

```js
[ '53.1.34.21',
  { range: [ 889192448, 897238054 ],
    country: 'DE',
    region: '',
    city: '',
    ll: [ 51.2993, 9.491 ],
    metro: 0,
    zip: 0 } ]
```

#### Example

```
  const query = {
    action: 'geoIp',
    'args': [ '53.1.34.21' ]
  }

  peer.request('rest:net:util', query, { timeout: 10000 }, (err, data) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }

    console.log(data)
  })
```
