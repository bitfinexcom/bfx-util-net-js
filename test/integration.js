/* eslint-env mocha */

'use strict'

const assert = require('assert')
const spawn = require('child_process').spawn
const path = require('path')

const { bootTwoGrapes, killGrapes, peerRequest } = require('./helper')

let rpc, grapes, request, stopPeer
describe('RPC integration', () => {
  before(function (done) {
    this.timeout(20000)

    bootTwoGrapes((err, g) => {
      if (err) throw err

      grapes = g
      grapes[0].once('announce', (msg) => {
        done()
      })

      const f = path.join(__dirname, '..', 'worker.js')
      rpc = spawn('node', [ f, '--env=development', '--wtype=wrk-util-net-api', '--apiPort=8721' ])
      rpc.stdout.on('data', (d) => {
        console.log(d.toString())
      })
      rpc.stderr.on('data', (d) => {
        console.log(d.toString())
      })

      const rh = peerRequest('rest:util:net')
      request = rh.request
      stopPeer = rh.stop
    })
  })

  after(function (done) {
    this.timeout(5000)
    rpc.on('close', () => {
      killGrapes(grapes, done)
    })
    rpc.kill()
    stopPeer()
  })

  it('geo-ip: retrieves ips', (done) => {
    const query = {
      action: 'getIpGeo',
      'args': [ '53.1.34.21' ]
    }

    request(query, (err, data) => {
      if (err) throw err

      assert.strictEqual(
        data[0], '53.1.34.21', 'result contains queried ip'
      )

      const res = data[1]
      assert.strictEqual(res.country, 'DE')

      done()
    })
  }).timeout(7000)

  it('geo-ip: errors if no ip given', (done) => {
    const query = {
      action: 'getIpGeo',
      'args': []
    }

    request(query, (err, data) => {
      assert.ok(err)
      done()
    })
  }).timeout(7000)

  it('geo-ip: supports batch lookups', (done) => {
    const batch = ['53.1.34.21', '53.2.34.21']
    const query = {
      action: 'getIpGeoBatch',
      'args': [ batch ]
    }

    request(query, (err, data) => {
      if (err) throw err
      assert.strictEqual(
        data[0][0], '53.1.34.21', 'result contains queried ip'
      )
      assert.strictEqual(
        data[1][0], '53.2.34.21', 'result contains queried ip'
      )

      assert.strictEqual(data[0][1].country, 'DE')
      assert.strictEqual(data[1][1].country, 'DE')

      done()
    })
  }).timeout(7000)

  it('reverse dns: retrieves ips (external)', (done) => {
    const query = {
      action: 'getReverseDns',
      'args': [ '8.8.8.8' ]
    }

    request(query, (err, data) => {
      if (err) throw err

      assert.strictEqual(data[0], '8.8.8.8')
      assert.strictEqual(
        data[1][0], 'google-public-dns-a.google.com'
      )

      done()
    })
  }).timeout(7000)

  it('getIpInfo: all ip info endpoint (external)', (done) => {
    const query = {
      action: 'getIpInfo',
      'args': [ '8.8.8.8' ]
    }

    request(query, (err, data) => {
      if (err) throw err

      assert.strictEqual(data[0], '8.8.8.8')
      assert.ok(data[1].geo)
      assert.ok(data[1].dns)
      assert.ok(data[1].asn)

      done()
    })
  }).timeout(7000)

  it('getIpAsn: retrieves asn info', (done) => {
    const query = {
      action: 'getIpAsn',
      'args': [ '8.8.8.8' ]
    }

    request(query, (err, data) => {
      if (err) throw err

      const [ ip, asnData ] = data
      assert.strictEqual(ip, '8.8.8.8')
      assert.ok(
        /Google/.test(asnData.autonomous_system_organization),
        'owned by google'
      )

      done()
    })
  }).timeout(7000)
})
