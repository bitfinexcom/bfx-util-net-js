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

const asnMMDB = path.join(__dirname, '..', 'mmdb', 'GeoLite2-ASN.mmdb')
const ispMMDB = path.join(__dirname, '..', 'mmdb', 'GeoIP2-ISP.mmdb')
const connectionTypeMMDB = path.join(__dirname, '..', 'mmdb', 'GeoIP2-Connection-Type.mmdb')

class WrkUtilNetApi extends WrkApi {
  constructor (conf, ctx) {
    super(conf, ctx)

    this.loadConf('net.util', 'util')

    this.init()
    this.start((error) => {
      if (error) {
        process.stderr.write(`failed to start worker: ${error.message}\n`)
        process.exit(1)
      }
    })
  }

  getPluginCtx (type) {
    const ctx = super.getPluginCtx(type)

    switch (type) {
      case 'api_bfx':
        ctx.lru_0 = this.lru_0
        ctx.asnDb = this.asnDb
        ctx.geoIp = this.geoIp
        ctx.ispDb = this.ispDb
        ctx.connectionTypeDb = this.connectionTypeDb
        break
    }

    return ctx
  }

  init () {
    super.init()
    this.testIfDbExists()

    this.setInitFacs([
      ['fac', 'bfx-facs-lru', '0', '0', { maxAge: 86400 * 30 * 1000 }]
    ])
  }

  async _start (cb) {
    try {
      await new Promise((resolve, reject) => super._start((error) => {
        return error
          ? reject(error)
          : resolve()
      }))

      this.geoIp = geoIp

      this.asnDb = await maxmind.open(asnMMDB, {
        watchForUpdates: true,
        watchForUpdatesNonPersistent: true,
        watchForUpdatesHook: () => {
          process.stdout.write('ASN database has been reloaded\n')
        }
      })

      this.ispDb = await maxmind.open(ispMMDB, {
        watchForUpdates: true,
        watchForUpdatesNonPersistent: true,
        watchForUpdatesHook: () => {
          process.stdout.write('ISP database has been reloaded\n')
        }
      })

      this.connectionTypeDb = await maxmind.open(connectionTypeMMDB, {
        watchForUpdates: true,
        watchForUpdatesNonPersistent: true,
        watchForUpdatesHook: () => {
          process.stdout.write('Connection type database has been reloaded\n')
        }
      })

      this.geoIp.startWatchingDataUpdate((err) => {
        if (err instanceof Error) {
          process.stderr.write(`ERR: ${err.message}\n`)
        } else {
          process.stdout.write('GeoIP database has been reloaded\n')
        }
      })

      cb()
    } catch (error) {
      cb(error)
    }
  }

  stop (cb = () => {}) {
    super.stop(() => {
      this.geoIp.stopWatchingDataUpdate()
      cb(null)
    })
  }

  testIfDbExists () {
    if (!fs.existsSync(asnMMDB)) {
      throw new Error('GEO_DB_NOT_INSTALLED - run `npm run update-asn-data`')
    }

    if (!fs.existsSync(ispMMDB)) {
      throw new Error('ISP_DB_NOT_INSTALLED - run `npm run update-isp-data`')
    }

    if (!fs.existsSync(connectionTypeMMDB)) {
      throw new Error('CONNECTION_TYPE_DB_NOT_INSTALLED - run `npm run update-connection-type-data`')
    }
  }
}

module.exports = WrkUtilNetApi
