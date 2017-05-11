'use strict'

const _ = require('lodash')
const async = require('async')
const GrBase = require('grenache-nodejs-base')
const GrWs = require('grenache-nodejs-ws')
const GrHttp = require('grenache-nodejs-http')
const Facility = require('./base/base')

class GrcFacility extends Facility {

  constructor(caller, opts, ctx) {
    super(caller, opts, ctx)
    
    this.name = 'grc'
    this._hasConf = true

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

  _start(cb) {
    async.series([
      next => { super._start(next) },
      next => {
        this.link = new GrBase.Link({
          grape: this.conf.grape
        })

        this.link.start()

        this.peer = null

        switch (this.conf.transport) {
          case 'ws':
            this.peer = new GrWs.PeerRPC(this.link, {})
            break
          case 'http':
            this.peer = new GrHttp.PeerRPC(this.link, {})
            break
        }

        this._tickItv = setInterval(() => {
          this.tick()
        }, 2500)

        next()
      }
    ], cb)
  }

  tick() {
    const services_pub = _.isArray(this.opts.services) && this.opts.services.length ? this.opts.services : null
    if (this.service && !services_pub) {
      this.service.stop()
      this.service.removeListener('request', this.onRequest.bind(this))
      delete this.service
      return
    }
   
    if (!services_pub || !this.opts.svc_port) return
    
    const port = this.opts.svc_port

    if (!this.service) {
      this.service = this.peer.transport('server')
      this.service.listen(port || 0)
      this.service.on('request', this.onRequest.bind(this))
    }

    _.each(services_pub, srv => {
      this.link.announce(srv, port, {}, (err) => {
        //console.log('grc:announce', srv, port, err)
      })
    })
  }

  _stop(cb) {
    async.series([
      next => { super._stop(next) },
      next => {
        clearInterval(this._announceItv)

        if (this.service) {
          this.service.stop()
          this.service.removeListener('request', this.onRequest.bind(this))
        }

        next()
      }
    ], cb)
  }

  setServices(ss) {
    this.opts.services = ss
  }

  addServices(ss) {
    if (!_.isArray(this.opts.services)) {
      this.opts.services = []
    }

    this.opts.services = _.union(this.opts.services, ss)
  }

  delServices(ss) {
     if (!_.isArray(this.opts.services)) {
      this.opts.servies = []
    }

    this.opts.services = _.difference(this.opts.services, ss)
  }

  req(service, action, args, _cb) {
    if (!_.isString(action)) throw new Error('ERR_GRC_REQ_ACTION_INVALID')
    if (!_.isArray(args)) throw new Error('ERR_GRC_REQ_ARGS_INVALID')
    if (!_.isFunction(_cb)) throw new Error('ERR_GRC_REQ_CB_INVALID')

    let isExecuted = false

    const cb = (err, res) => {
      if (isExecuted) {
        console.error('ERR_DOUBLE_CB', service, action, JSON.stringify(args))
        return
      }
      isExecuted = true
      _cb(err, res)
    }

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
