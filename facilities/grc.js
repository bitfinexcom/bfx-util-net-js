'use strict'

const _ = require('lodash')
const GrBase = require('grenache-nodejs-base')
const GrWs = require('grenache-nodejs-ws')
const GrHttp = require('grenache-nodejs-ws')
const Facility = require('./base')

class GrcFacility extends Facility {

  constructor(caller, opts, ctx) {
    super(caller, opts, ctx)
    
    this.name = 'grc'

    this.init()
  }

  onRequest(rid, type, payload, handler) {
    this.emit('request', type, payload, handler)
  }

  start(cb) {
    this.link = new GrBase.Link({
      grape: this.conf.grape
    })

    this.link.start()

    this.peer = null

    switch (this.opts.transport) {
      case 'ws':
        this.peer = new GrWs.Peer(this.link, {})
        break
      case 'http':
        this.peer = new GrHttp.Peer(this.link, {})
        break
    }

    switch (this.opts.type) {
      case 'worker':
        this.service = this.peer.listen('req', this.opts.port)
        this.peer.on('request', this.onRequest.bind(this))

        this._announceItv = setInterval(() => {
          _.each(this.opts.services, srv => {
            const port = this.service.port
            this.peer.announce(srv, port, {}, () => {
              //console.log('announced', srv, port)
            })
          })
        }, 1000)
        break
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
