'use strict'

const path = require('path')

// It looks like in the next release of geoip-lite
// we can use GEODATADIR env instead of this gloabl env var,
// but w/out it maxmind reads old data from in node_modules
global.geodatadir = path.join(__dirname, '../data')
const maxmind = require('maxmind')

const { WrkApi } = require('bfx-wrk-api')
const geoIp = require('geoip-lite')
const fs = require('fs')

const newDb = path.join(__dirname, '..', 'mmdb', 'GeoLite2-ASN.mmdb')

class WrkUtilNetApi extends WrkApi {
  constructor (conf, ctx) {
    super(conf, ctx)

    this.loadConf('net.util', 'util')

    this.init()
    this.start()
  }

  getPluginCtx (type) {
    const ctx = super.getPluginCtx(type)

    switch (type) {
      case 'api_bfx':
        ctx.lru_0 = this.lru_0
        ctx.asn_db = this.asnDb
        ctx.geoIp = this.geoIp
        break
    }

    return ctx
  }

  init () {
    super.init()

    this.setInitFacs([
      ['fac', 'bfx-facs-lru', '0', '0', { maxAge: 86400 * 30 * 1000 }]
    ])

    this.geoIp = geoIp
    this.testIfDbExists()
    this.asnDb = maxmind.openSync(newDb, {
      watchForUpdates: true,
      watchForUpdatesNonPersistent: true
    })

    geoIp.startWatchingDataUpdate()
  }

  stop (cb = () => {}) {
    super.stop(() => {
      this.geoIp.stopWatchingDataUpdate()
      cb(null)
    })
  }

  testIfDbExists () {
    if (!fs.existsSync(newDb)) {
      throw new Error('GEO_DB_NOT_INSTALLED - run `npm run update-asn-data`')
    }
  }
}

module.exports = WrkUtilNetApi
