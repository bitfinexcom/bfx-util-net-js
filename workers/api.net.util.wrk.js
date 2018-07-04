'use strict'

const { WrkApi } = require('bfx-wrk-api')
const maxmind = require('maxmind')
const path = require('path')
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
        ctx.asn_db = this.asnDb
        break
    }

    return ctx
  }

  init () {
    super.init()

    this.testIfDbExists()
    this.asnDb = maxmind.openSync(newDb, { watchForUpdates: true })
  }

  testIfDbExists () {
    if (!fs.existsSync(newDb)) {
      throw new Error('GEO_DB_NOT_INSTALLED - run `npm run update-asn-data`')
    }
  }
}

module.exports = WrkUtilNetApi
