'use strict'

const _ = require('lodash')
const dns = require('dns')

const { Api } = require('bfx-wrk-api')

class UtilNet extends Api {
  space (service, msg) {
    const space = super.space(service, msg)
    return space
  }

  getIpInfo (space, ip, cb) {
    const geoData = this._getGeoIp(ip)
    const asnData = this.ctx.asnDb.get(ip)
    const ispData = this.ctx.ispDb.get(ip)
    const connectionTypeData = this.ctx.connectionTypeDb.get(ip)

    dns.reverse(ip, (err, dnsData) => {
      if (err) return cb(err)

      const res = [
        ip,
        { geo: geoData, dns: dnsData, asn: asnData, isp: ispData, connectionType: connectionTypeData }
      ]

      cb(null, res)
    })
  }

  getIpInfoCached (space, ip, cb) {
    const key = `getIpInfo:${ip}`
    const res = this.ctx.lru_0.get(key)

    if (res) return cb(null, res)

    this.getIpInfo(space, ip, (err, ipInfo) => {
      if (err) return cb(err)

      if (!ipInfo) return cb(null, null)

      this.ctx.lru_0.set(key, ipInfo)
      cb(null, ipInfo)
    })
  }

  getIpGeo (space, ip, cb) {
    const res = this._getGeoIp(ip)
    cb(null, [ip, res])
  }

  getIpAsn (space, ip, cb) {
    const res = this.ctx.asnDb.get(ip)

    cb(null, [ip, res])
  }

  getIpIsp (space, ip, cb) {
    const res = this.ctx.ispDb.get(ip)

    cb(null, [ip, res])
  }

  getIpConnectionType (space, ip, cb) {
    const res = this.ctx.connectionTypeDb.get(ip)

    cb(null, [ip, res])
  }

  getIpGeoBatch (space, ips, cb) {
    if (!_.isArray(ips)) {
      return cb(new Error('ERR_API_INPUT_INVALID'))
    }

    const res = ips.map((ip) => {
      return [ip, this._getGeoIp(ip)]
    })

    cb(null, res)
  }

  getReverseDns (space, ip, cb) {
    dns.reverse(ip, (err, data) => {
      if (err) return cb(err)

      cb(null, [ip, data])
    })
  }

  _getGeoIp (ip) {
    const res = this.ctx.geoIp.lookup(ip)
    const { maxAccuracyRadius } = this.ctx.conf

    const confidenceScore = this._calculateConfidenceScore(res, maxAccuracyRadius)
    return { ...res, confidenceScore }
  }

  _calculateConfidenceScore (geo, maxAccuracyRadius) {
    if (!geo || geo.area == null) {
      return 0
    }
    const accuracyRadius = geo.area

    // Simple linear mapping of radius to confidence score
    const confidence = Math.max(0, Math.min(1, 1 - (accuracyRadius / maxAccuracyRadius)))

    return confidence
  }
}

module.exports = UtilNet
