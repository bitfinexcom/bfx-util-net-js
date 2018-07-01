const Grenache = require('grenache-nodejs-http')
const Link = require('grenache-nodejs-link')
const fs = require('fs')
const path = require('path')

const Peer = Grenache.PeerRPCClient

const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

let secure = false
const serviceName = 'rest:util:net'

// ssl / fingerprint
// const serviceName = 'sec:rest:util:net'
// secure = {
//   key: fs.readFileSync(path.join(__dirname, 'sec', 'client-key.pem')),
//   cert: fs.readFileSync(path.join(__dirname, 'sec', 'client-crt.pem')),
//   ca: fs.readFileSync(path.join(__dirname, 'sec', 'ca-crt.pem')),
//   rejectUnauthorized: false // take care, can be dangerous in production!
// }
//

let opts = {}
if (secure) {
  opts.secure = secure
}

const peer = new Peer(link, )
peer.init()

const geoQuery = {
  action: 'getIpGeo',
  args: [ '8.8.8.8' ]
}

peer.request(serviceName, geoQuery, { timeout: 10000 }, (err, data) => {
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
  args: [ '8.8.8.8' ]
}

peer.request(serviceName, asnQuery, { timeout: 10000 }, (err, data) => {
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
  args: [ '8.8.8.8' ]
}
peer.request(serviceName, generalQuery, { timeout: 10000 }, (err, data) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  console.log('getIpInfo data:')
  console.log(JSON.stringify(data, null, '  '))
  console.log('---')
})
