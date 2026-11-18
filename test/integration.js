'use strict'

const test = require('brittle')
const createGrapes = require('@bitfinex/bfx-svc-test-helper/grapes')
const createWorker = require('@bitfinex/bfx-svc-test-helper/worker')
const createClient = require('@bitfinex/bfx-svc-test-helper/client')
const path = require('path')

let grapes, worker, client

const before = async () => {
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
}

const after = async () => {
  if (client) await client.stop()
  if (worker) await worker.stop()
  if (grapes) await grapes.stop()
}

const testCase = (testBlock) => async (t) => {
  try {
    await before()
    await testBlock(t)
  } finally {
    await after()
  }
}

test('RPC integration', testCase(async (t) => {
  await t.test('geo-ip: retrieves ips', async (t) => {
    const query = {
      action: 'getIpGeo',
      args: ['53.1.34.21']
    }
    const data = await client.request(query)

    t.is(data[0], '53.1.34.21', 'result contains queried ip')
    const res = data[1]
    t.is(res.country, 'DE')
  })

  await t.test('geo-ip: supports batch lookups', async (t) => {
    const batch = ['53.1.34.21', '53.2.34.21']
    const query = {
      action: 'getIpGeoBatch',
      args: [batch]
    }
    const data = await client.request(query)

    t.is(data[0][0], '53.1.34.21', 'result contains queried ip')
    t.is(data[1][0], '53.2.34.21', 'result contains queried ip')
    t.is(data[0][1].country, 'DE')
    t.is(data[1][1].country, 'DE')
  })

  await t.test('reverse dns: retrieves ips (external)', async (t) => {
    const query = {
      action: 'getReverseDns',
      args: ['8.8.8.8']
    }
    const data = await client.request(query)

    t.is(data[0], '8.8.8.8')
    t.is(data[1][0], 'dns.google')
  })

  await t.test('getIpInfo: all ip info endpoint (external)', async (t) => {
    const query = {
      action: 'getIpInfo',
      args: ['8.8.8.8']
    }
    const data = await client.request(query)

    t.is(data[0], '8.8.8.8')
    t.ok(data[1].geo)
    t.ok(data[1].dns)
    t.ok(data[1].asn)
    t.ok(data[1].isp)
    t.ok(data[1].connectionType)
  })

  await t.test('getIpInfoCached: all ip info endpoint (external)', async (t) => {
    const query = {
      action: 'getIpInfoCached',
      args: ['8.8.8.8']
    }
    const data = await client.request(query)

    t.is(data[0], '8.8.8.8')
    t.ok(data[1].geo)
    t.ok(data[1].dns)
    t.ok(data[1].asn)
    t.ok(data[1].isp)
    t.ok(data[1].connectionType)
  })

  await t.test('getIpInfoCached: second call gets all ip info endpoint (cached)', async (t) => {
    const query = {
      action: 'getIpInfoCached',
      args: ['8.8.8.8']
    }
    const data = await client.request(query)

    t.is(data[0], '8.8.8.8')
    t.ok(data[1].geo)
    t.ok(data[1].dns)
    t.ok(data[1].asn)
    t.ok(data[1].isp)
    t.ok(data[1].connectionType)
  })

  await t.test('getIpAsn: retrieves asn info', async (t) => {
    const query = {
      action: 'getIpAsn',
      args: ['8.8.8.8']
    }
    const data = await client.request(query)

    const [ip, asnData] = data
    t.is(ip, '8.8.8.8')
    t.ok(
      /google/.test(asnData.autonomous_system_organization.toLowerCase()),
      'owned by google'
    )
  })

  await t.test('geo-isp: retrieves ips ISP', async (t) => {
    const query = {
      action: 'getIpIsp',
      args: ['53.1.34.21']
    }
    const data = await client.request(query)

    t.is(data[0], '53.1.34.21', 'result contains queried ip')
    const res = data[1]
    t.is(res.isp, 'Mercedes-Benz Group')
  })

  await t.test('getIpConnectionType: retrieves ips connection type', async (t) => {
    const query = {
      action: 'getIpConnectionType',
      args: ['53.1.34.21']
    }
    const data = await client.request(query)

    t.is(data[0], '53.1.34.21', 'result contains queried ip')
    const res = data[1]
    t.is(res.connection_type, 'Cable/DSL')
  })

  await t.test('geo-ip: retrieves ips with accuracy_radius < 500km has confidence score > 0', async (t) => {
    const query = {
      action: 'getIpGeo',
      args: ['2.125.160.216']
    }
    const data = await client.request(query)

    t.is(data[0], '2.125.160.216', 'result contains queried ip')
    const res = data[1]
    t.ok(res.area < 500)
    t.ok(res.confidenceScore > 0 && res.confidenceScore < 1)
    t.is(res.country, 'GB')
  })

  await t.test('geo-ip: retrieves ips with accuracy_radius > 500km has confidence score=0', async (t) => {
    const query = {
      action: 'getIpGeo',
      args: ['8.8.8.8']
    }
    const data = await client.request(query)

    t.is(data[0], '8.8.8.8', 'result contains queried ip')
    const res = data[1]
    t.ok(res.area > 500)
    t.is(res.confidenceScore, 0)
    t.is(res.country, 'US')
  })
}))
