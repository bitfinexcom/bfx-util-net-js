/* eslint-env mocha */

'use strict'

const assert = require('assert')
const path = require('path')

const createGrapes = require('bfx-svc-test-helper/grapes')
const createWorker = require('bfx-svc-test-helper/worker')
const createClient = require('bfx-svc-test-helper/client')

let grapes, worker, client
describe('RPC integration', () => {
  before(async function () {
    this.timeout(20000)

    grapes = createGrapes()
    await grapes.start()

    worker = createWorker({
      env: 'development',
      wtype: 'wrk-util-net-api',
      apiPort: 8721,
      serviceRoot: path.join(__dirname, '..')
    }, grapes)

    await worker.start()

    client = createClient(worker)
  })

  after(async function () {
    this.timeout(5000)

    await client.stop()
    await worker.stop()
    await grapes.stop()
  })

  it('geo-ip: retrieves ips', (done) => {
    const query = {
      action: 'getIpGeo',
      args: ['53.1.34.21']
    }

    client.request(query, (err, data) => {
      try {
        if (err) throw err

        assert.strictEqual(
          data[0], '53.1.34.21', 'result contains queried ip'
        )

        const res = data[1]
        assert.strictEqual(res.country, 'DE')
        done()
      } catch (err) {
        done(err)
      }
    })
  }).timeout(7000)

  it('geo-ip: supports batch lookups', (done) => {
    const batch = ['53.1.34.21', '53.2.34.21']
    const query = {
      action: 'getIpGeoBatch',
      args: [batch]
    }

    client.request(query, (err, data) => {
      try {
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
      } catch (err) {
        done(err)
      }
    })
  }).timeout(7000)

  it('reverse dns: retrieves ips (external)', (done) => {
    const query = {
      action: 'getReverseDns',
      args: ['8.8.8.8']
    }

    client.request(query, (err, data) => {
      try {
        if (err) throw err

        assert.strictEqual(data[0], '8.8.8.8')
        assert.strictEqual(
          data[1][0], 'dns.google'
        )

        done()
      } catch (err) {
        done(err)
      }
    })
  }).timeout(7000)

  it('getIpInfo: all ip info endpoint (external)', (done) => {
    const query = {
      action: 'getIpInfo',
      args: ['8.8.8.8']
    }

    client.request(query, (err, data) => {
      try {
        if (err) throw err

        assert.strictEqual(data[0], '8.8.8.8')
        assert.ok(data[1].geo)
        assert.ok(data[1].dns)
        assert.ok(data[1].asn)

        done()
      } catch (err) {
        done(err)
      }
    })
  }).timeout(7000)

  it('getIpInfoCached: all ip info endpoint (external)', (done) => {
    const query = {
      action: 'getIpInfoCached',
      args: ['8.8.8.8']
    }

    client.request(query, (err, data) => {
      try {
        if (err) throw err

        assert.strictEqual(data[0], '8.8.8.8')
        assert.ok(data[1].geo)
        assert.ok(data[1].dns)
        assert.ok(data[1].asn)

        done()
      } catch (err) {
        done(err)
      }
    })
  }).timeout(7000)

  it('getIpInfoCached: second call gets all ip info endpoint (cached)', (done) => {
    const query = {
      action: 'getIpInfoCached',
      args: ['8.8.8.8']
    }

    client.request(query, (err, data) => {
      try {
        if (err) throw err

        assert.strictEqual(data[0], '8.8.8.8')
        assert.ok(data[1].geo)
        assert.ok(data[1].dns)
        assert.ok(data[1].asn)

        done()
      } catch (err) {
        done(err)
      }
    })
  }).timeout(7000)

  it('getIpAsn: retrieves asn info', (done) => {
    const query = {
      action: 'getIpAsn',
      args: ['8.8.8.8']
    }

    client.request(query, (err, data) => {
      try {
        if (err) throw err

        const [ip, asnData] = data
        assert.strictEqual(ip, '8.8.8.8')
        assert.ok(
          /google/.test(asnData.autonomous_system_organization.toLowerCase()),
          'owned by google'
        )

        done()
      } catch (err) {
        done(err)
      }
    })
  }).timeout(7000)
})
