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

  onRequest(rid, service, payload, handler) {
    if (this.api) {
      const api = this.api
      api.handle(service, payload, (err, res) => {
        handler.reply([err, res])
      }) 
    } else {
      this.emit('request', rid, service, payload, handler)
    }
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

    this._tickItv = setInterval(() => {
      this.tick()
    }, 2000)

    cb()
  }

  tick() {
    if (this.service && !_.isArray(this.opts.services)) {
      this.peer.unlisten(req, this.service.port)
      this.peer.removeListener('request', this.onRequest.bind(this))
      return
    }
   
    if (!_.isArray(this.opts.services) || !this.opts.svc_port) return
    
    const port = this.opts.svc_port

    if (!this.service) {
      this.service = this.peer.listen('req', port || 0)
      this.peer.on('request', this.onRequest.bind(this))
    }

    _.each(this.opts.services, srv => {
      this.peer.announce(srv, port, {}, () => {
        //console.log('grc:announce', srv, port)
      })
    })
  }

  stop(cb) {
    clearInterval(this._announceItv)
    if (this.service) {
      this.peer.unlisten('req', this.service.port)
      this.peer.removeListener('request', this.onRequest.bind(this))
    }
    cb()
  }

  addService(s) {
    if (!_.isArray(this.opts.services)) {
      this.opts.servies = []
    }

    this.opts.services = _.union(this.opts.services, [s])
  }

  delService(s) {
     if (!_.isArray(this.opts.services)) {
      this.opts.servies = []
    }

    this.opts.services = _.difference(this.opts.services, [s])
  }

  req(service, action, args, cb) {
    this.peer.request(service, {
      action: action,
      args: args 
    }, {}, (err, res) => {
      if (err) return cb(err)
      err = res[0]
      res = res[1]
      cb(err, res)
    })
  }
}

module.exports = GrcFacility 
