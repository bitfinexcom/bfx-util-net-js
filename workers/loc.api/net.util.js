'use strict'

const _ = require('lodash')
const dns = require('dns')
const geoIp = require('geoip-lite')
geoIp.startWatchingDataUpdate()

const { Api } = require('bfx-wrk-api')

class UtilNet extends Api {
  space (service, msg) {
    const space = super.space(service, msg)
    return space
  }

  getIpInfo (space, ip, cb) {
    const geoData = geoIp.lookup(ip)
    const asnData = this.ctx.asn_db.get(ip)

    dns.reverse(ip, (err, dnsData) => {
      if (err) return cb(err)

      const res = [
        ip,
        { geo: geoData, dns: dnsData, asn: asnData }
      ]

      cb(null, res)
    })
  }

  getIpGeo (space, ip, cb) {
    const res = geoIp.lookup(ip)
    cb(null, [ ip, res ])
  }

  getIpAsn (space, ip, cb) {
    const res = this.ctx.asn_db.get(ip)

    cb(null, [ ip, res ])
  }

  getIpGeoBatch (space, ips, cb) {
    if (!_.isArray(ips)) {
      return cb(new Error('ERR_API_INPUT_INVALID'))
    }

    const res = ips.map((ip) => {
      return [ ip, geoIp.lookup(ip) ]
    })

    cb(null, res)
  }

  getReverseDns (space, ip, cb) {
    dns.reverse(ip, (err, data) => {
      if (err) return cb(err)

      cb(null, [ip, data])
    })
  }
}

module.exports = UtilNet
