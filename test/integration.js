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

  it('getIpInfo: all ip info endpoint (external)', async () => {
    const ip = '8.8.8.8'

    const data = await client.request({
      action: 'getIpInfo',
      args: [ip]
    })

    assert.strictEqual(data[0], ip)
    assert.ok(data[1].geo)
    assert.ok(data[1].dns)
    assert.ok(data[1].asn)
    assert.ok(data[1].isp)
    assert.ok(data[1].connectionType)
    assert.deepEqual(data[1].anonymousPlus, {})
  }).timeout(7000)

  it('getIpInfo: for a residential proxy (external)', async () => {
    const ip = '121.43.154.123'

    const data = await client.request({
      action: 'getIpInfo',
      args: [ip]
    })

    assert.deepEqual(data[0], ip)
    assert.deepEqual(data[1].geo, {
      range: [
        2032861184,
        2032926719
      ],
      country: 'CN',
      region: 'ZJ',
      eu: '0',
      timezone: 'Asia/Shanghai',
      city: 'Hangzhou',
      ll: [
        30.2943,
        120.1663
      ],
      metro: 0,
      area: 20,
      confidenceScore: 0.96
    })
    assert.deepEqual(data[1].dns, null)
    assert.deepEqual(data[1].asn, {
      autonomous_system_number: 37963,
      autonomous_system_organization: 'Hangzhou Alibaba Advertising Co.,Ltd.'
    })
    assert.deepEqual(data[1].isp, {
      autonomous_system_number: 37963,
      autonomous_system_organization: 'Hangzhou Alibaba Advertising Co.,Ltd.',
      isp: 'Hangzhou Alibaba Advertising',
      organization: 'Hangzhou Alibaba Advertising'
    })
    assert.deepEqual(data[1].connectionType, {
      connection_type: 'Corporate'
    })
    assert.deepEqual(data[1].anonymousPlus, {
      is_anonymous: true,
      is_public_proxy: true,
      anonymizer_confidence: 1
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
        assert.ok(data[1].isp)
        assert.ok(data[1].connectionType)

        done()
      } catch (err) {
        done(err)
      }
    })
  }).timeout(7000)

  // TODO fix this test using real cached data and proper assertions
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
        assert.ok(data[1].isp)
        assert.ok(data[1].connectionType)

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

  it('geo-isp: retrieves ips ISP', (done) => {
    const query = {
      action: 'getIpIsp',
      args: ['53.1.34.21']
    }

    client.request(query, (err, data) => {
      try {
        if (err) throw err

        assert.strictEqual(
          data[0], '53.1.34.21', 'result contains queried ip'
        )

        const res = data[1]
        assert.strictEqual(res.isp, 'Mercedes-Benz Group')
        done()
      } catch (err) {
        done(err)
      }
    })
  }).timeout(7000)

  it('getIpConnectionType: retrieves ips connection type', (done) => {
    const query = {
      action: 'getIpConnectionType',
      args: ['53.1.34.21']
    }

    client.request(query, (err, data) => {
      try {
        if (err) throw err

        assert.strictEqual(
          data[0], '53.1.34.21', 'result contains queried ip'
        )

        const res = data[1]
        assert.strictEqual(res.connection_type, 'Corporate')
        done()
      } catch (err) {
        done(err)
      }
    })
  }).timeout(7000)

  it('geo-ip: retrieves ips with accuracy_radius < 500km has confidence score > 0', (done) => {
    const query = {
      action: 'getIpGeo',
      args: ['2.125.160.216']
    }

    client.request(query, (err, data) => {
      try {
        if (err) throw err

        assert.strictEqual(
          data[0], '2.125.160.216', 'result contains queried ip'
        )

        const res = data[1]
        assert.ok(res.area < 500)
        assert.ok(res.confidenceScore > 0 && res.confidenceScore < 1)
        assert.strictEqual(res.country, 'GB')
        done()
      } catch (err) {
        done(err)
      }
    })
  }).timeout(7000)

  it('geo-ip: retrieves ips with accuracy_radius > 500km has confidence score=0', (done) => {
    const query2 = {
      action: 'getIpGeo',
      args: ['8.8.8.8']
    }

    client.request(query2, (err, data) => {
      try {
        if (err) throw err

        assert.strictEqual(
          data[0], '8.8.8.8', 'result contains queried ip'
        )

        const res = data[1]
        assert.ok(res.area > 500)
        assert.strictEqual(res.confidenceScore, 0)
        assert.strictEqual(res.country, 'US')
        done()
      } catch (err) {
        done(err)
      }
    })
  }).timeout(7000)

  // TODO getIpAnonymousPlus
})
