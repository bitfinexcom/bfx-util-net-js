'use strict'

const _ = require('lodash')
const GrBase = require('grenache-nodejs-base')
const GrWs = require('grenache-nodejs-ws')
const GrHttp = require('grenache-nodejs-http')
const Facility = require('./base')

class GrcFacility extends Facility {

  constructor(caller, opts, ctx) {
    super(caller, opts, ctx)
    
    this.name = 'grc'

    this.init()
  }

  onRequest(rid, type, payload, handler) {
    this.emit('request', rid, type, payload, handler)
  }

  start(cb) {
    this.link = new GrBase.Link({
      grape: this.conf.grape
    })

    this.link.start()

    this.peer = null

    switch (this.conf.transport) {
      case 'ws':
        this.peer = new GrWs.Peer(this.link, {})
        break
      case 'http':
        this.peer = new GrHttp.Peer(this.link, {})
        break
    }

    if (this.opts.service) {
      this.service = this.peer.listen('req', this.opts.svc_port || 0)
      this.peer.on('request', this.onRequest.bind(this))

      this._announceItv = setInterval(() => {
        const port = this.service.port
        this.peer.announce(`bfx:${this.opts.service}`, port, {}, () => {
          //console.log('announced', this.opts.service, port)
        })
      }, 2000)
    }

    cb()
  }

  stop(cb) {
    clearInterval(this._announceItv)
    this.peer.removeListener('request', this.onRequest.bind(this))
    cb()
  }
}

module.exports = GrcFacility 
