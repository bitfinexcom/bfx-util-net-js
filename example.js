const Grenache = require('grenache-nodejs-http')
const Link = require('grenache-nodejs-link')

const Peer = Grenache.PeerRPCClient

const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

const peer = new Peer(link, {})
peer.init()

const geoQuery = {
  action: 'getIpGeo',
  'args': [ '8.8.8.8' ]
}

peer.request('rest:util:net', geoQuery, { timeout: 10000 }, (err, data) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  console.log('getGeoIp data:')
  console.log(data)
  console.log('---')
})

const asnQuery = {
  action: 'getIpAsn',
  'args': [ '8.8.8.8' ]
}

peer.request('rest:util:net', asnQuery, { timeout: 10000 }, (err, data) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  console.log('getIpAsn data:')
  console.log(data)
  console.log('---')
})

const generalQuery = {
  action: 'getIpInfo',
  'args': [ '8.8.8.8' ]
}
peer.request('rest:util:net', generalQuery, { timeout: 10000 }, (err, data) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  console.log('getIpInfo data:')
  console.log(JSON.stringify(data, null, '  '))
  console.log('---')
})
