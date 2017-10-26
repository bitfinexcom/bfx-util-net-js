/* eslint-env mocha */

'use strict'

const assert = require('assert')
const spawn = require('child_process').spawn
const path = require('path')

const Grenache = require('grenache-nodejs-http')
const Link = require('grenache-nodejs-link')
const Peer = Grenache.PeerRPCClient

const { bootTwoGrapes, killGrapes } = require('./helper')

let rpc, grapes
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
    })
  })

  after(function (done) {
    this.timeout(5000)
    rpc.on('close', () => {
      killGrapes(grapes, done)
    })
    rpc.kill()
  })

  it('geo-ip: retrieves ips', (done) => {
    const link = new Link({
      grape: 'http://127.0.0.1:30001'
    })
    link.start()

    const peer = new Peer(link, {})
    peer.init()

    const query = {
      action: 'getIpGeo',
      'args': [ '53.1.34.21' ]
    }

    peer.request('rest:util:net', query, { timeout: 10000 }, (err, data) => {
      if (err) throw err

      assert.equal(
        data[0], '53.1.34.21', 'result contains queried ip'
      )

      const res = data[1]
      assert.equal(res.country, 'DE')
      done()
    })
  }).timeout(7000)

  it('geo-ip: errors if no ip given', (done) => {
    const link = new Link({
      grape: 'http://127.0.0.1:30001'
    })
    link.start()

    const peer = new Peer(link, {})
    peer.init()

    const query = {
      action: 'getIpGeo',
      'args': []
    }

    peer.request('rest:util:net', query, { timeout: 10000 }, (err, data) => {
      assert.ok(err)
      done()
    })
  }).timeout(7000)

  it('geo-ip: supports batch lookups', (done) => {
    const link = new Link({
      grape: 'http://127.0.0.1:30001'
    })
    link.start()

    const peer = new Peer(link, {})
    peer.init()

    const batch = ['53.1.34.21', '53.2.34.21']
    const query = {
      action: 'getIpGeoBatch',
      'args': [ batch ]
    }

    peer.request('rest:util:net', query, { timeout: 10000 }, (err, data) => {
      if (err) throw err
      assert.equal(
        data[0][0], '53.1.34.21', 'result contains queried ip'
      )
      assert.equal(
        data[1][0], '53.2.34.21', 'result contains queried ip'
      )

      assert.equal(data[0][1].country, 'DE')
      assert.equal(data[1][1].country, 'DE')
      done()
    })
  }).timeout(7000)

  it('reverse dns: retrieves ips (external)', (done) => {
    const link = new Link({
      grape: 'http://127.0.0.1:30001'
    })
    link.start()

    const peer = new Peer(link, {})
    peer.init()

    const query = {
      action: 'getReverseDns',
      'args': [ '8.8.8.8' ]
    }

    peer.request('rest:util:net', query, { timeout: 10000 }, (err, data) => {
      if (err) throw err

      assert.equal(data[0], '8.8.8.8')
      assert.equal(
        data[1][0], 'google-public-dns-a.google.com'
      )

      done()
    })
  }).timeout(7000)

  it('getIpInfo: all ip info endpoint (external)', (done) => {
    const link = new Link({
      grape: 'http://127.0.0.1:30001'
    })
    link.start()

    const peer = new Peer(link, {})
    peer.init()

    const query = {
      action: 'getIpInfo',
      'args': [ '8.8.8.8' ]
    }

    peer.request('rest:util:net', query, { timeout: 10000 }, (err, data) => {
      if (err) throw err

      assert.equal(data[0], '8.8.8.8')
      assert.ok(data[1].geo)
      assert.ok(data[1].dns)
      assert.ok(data[1].asn)

      done()
    })
  }).timeout(7000)

  it('getIpAsn: retrieves asn info', (done) => {
    const link = new Link({
      grape: 'http://127.0.0.1:30001'
    })
    link.start()

    const peer = new Peer(link, {})
    peer.init()

    const query = {
      action: 'getIpAsn',
      'args': [ '8.8.8.8' ]
    }

    peer.request('rest:util:net', query, { timeout: 10000 }, (err, data) => {
      if (err) throw err

      const [ ip, asnData ] = data
      assert.equal(ip, '8.8.8.8')
      assert.equal(asnData.autonomous_system_organization, 'Google Inc.')

      done()
    })
  }).timeout(7000)
})
