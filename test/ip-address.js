'use strict'

const assert = require('assert')
const { Address4, Address6 } = require('ip-address')
const { aton6 } = require('geoip-lite/lib/utils')

describe('database updater address conversion', () => {
  it('preserves unsigned IPv4 range bytes', () => {
    const range = new Address4('192.0.2.0/24')
    const bytes = Buffer.alloc(8)
    bytes.writeUInt32BE(Number(range.startAddress().bigInt()), 0)
    bytes.writeUInt32BE(Number(range.endAddress().bigInt()), 4)
    assert.strictEqual(bytes.toString('hex'), 'c0000200c00002ff')
    assert.strictEqual(Number(new Address4('255.255.255.255').bigInt()), 4294967295)
  })

  it('preserves IPv6 range word conversion', () => {
    const range = new Address6('2001:db8::/32')
    assert.deepStrictEqual(aton6(range.startAddress().correctForm()), [0x20010db8, 0, 0, 0])
    assert.deepStrictEqual(aton6(range.endAddress().correctForm()), [0x20010db8, 0xffffffff, 0xffffffff, 0xffffffff])
  })
})
