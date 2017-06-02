'use strict'

const _ = require('lodash')
const async = require('async')
const GrBase = require('grenache-nodejs-base')
const GrWs = require('grenache-nodejs-ws')
const GrHttp = require('grenache-nodejs-http')
const Facility = require('./base/base')

class GrcFacility extends Facility {
  constructor (caller, opts, ctx) {
    super(caller, opts, ctx)

    this.name = 'grc'
    this._hasConf = true

    this.init()
  }

  onRequest (rid, service, payload, handler) {
    if (this.api) {
      const api = this.api
      api.handle(service, payload, (err, res) => {
        handler.reply(err, res)
      })
    } else {
      this.emit('request', rid, service, payload, handler)
    }
  }

  _start (cb) {
    async.series([
      next => { super._start(next) },
      next => {
        this.link = new GrBase.Link({
          grape: this.conf.grape,
          lruMaxAgeLookup: this.opts.lruMaxAgeLookup || 10000
        })

        this.link.start()

        this.peer = null
        this.peer_srv = null

        switch (this.conf.transport) {
          case 'http':
            this.peer = new GrHttp.PeerRPCClient(this.link, {})
            this.peer_srv = new GrHttp.PeerRPCServer(this.link, {})
            break
          case 'ws':
            this.peer = new GrWs.PeerRPCClient(this.link, {})
            this.peer_srv = new GrWs.PeerRPCServer(this.link, {})
            break
        }

        if (this.peer) {
          this.peer.init()
          this.peer_srv.init()

          this._tickItv = setInterval(() => {
            this.tick()
          }, 7500)
        }

        next()
      }
    ], cb)
  }

  tick () {
    const pubServices = _.isArray(this.opts.services) && this.opts.services.length ? this.opts.services : null
    if (this.service && !pubServices) {
      this.service.stop()
      this.service.removeListener('request', this.onRequest.bind(this))
      delete this.service
      return
    }

    if (!pubServices || !this.opts.svc_port) return

    const port = this.opts.svc_port

    if (!this.service) {
      this.service = this.peer_srv.transport('server')
      this.service.listen(port || 0)
      this.service.on('request', this.onRequest.bind(this))
    }

    _.each(pubServices, srv => {
      this.link.announce(srv, port, {}, (err) => {
        if (err) console.error(err)
        // console.log('grc:announce', srv, port, err)
      })
    })
  }

  _stop (cb) {
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

  setServices (ss) {
    this.opts.services = ss
  }

  addServices (ss) {
    if (!_.isArray(this.opts.services)) {
      this.opts.services = []
    }

    this.opts.services = _.union(this.opts.services, ss)
  }

  delServices (ss) {
    if (!_.isArray(this.opts.services)) {
      this.opts.servies = []
    }

    this.opts.services = _.difference(this.opts.services, ss)
  }

  req (service, action, args, opts = {}, _cb) {
    if (!_.isString(action)) return _cb(new Error('ERR_GRC_REQ_ACTION_INVALID'))
    if (!_.isArray(args)) return _cb(new Error('ERR_GRC_REQ_ARGS_INVALID'))
    if (!_.isFunction(_cb)) return _cb(new Error('ERR_GRC_REQ_CB_INVALID'))

    let isExecuted = false

    const cb = (err, res) => {
      if (isExecuted) {
        console.error('ERR_DOUBLE_CB', service, action, JSON.stringify(args))
        return
      }
      isExecuted = true
      if (err === 'ERR_TIMEOUT') {
        console.error('ERR_TIMEOUT received', service, action)
      }
      _cb(err ? new Error(err) : null, res)
    }

    this.peer.request(service, {
      action: action,
      args: args
    }, _.defaults({
      timeout: 120000
    }, opts), cb)
  }

  map (service, action, args, opts = {}, _cb) {
    if (!_.isString(action)) return _cb(new Error('ERR_GRC_REQ_ACTION_INVALID'))
    if (!_.isArray(args)) return _cb(new Error('ERR_GRC_REQ_ARGS_INVALID'))
    if (!_.isFunction(_cb)) return _cb(new Error('ERR_GRC_REQ_CB_INVALID'))

    let isExecuted = false

    const cb = (err, res) => {
      if (isExecuted) {
        console.error('ERR_DOUBLE_CB', service, action, JSON.stringify(args))
        return
      }
      isExecuted = true
      if (err === 'ERR_TIMEOUT') {
        console.error('ERR_TIMEOUT received', service, action)
      }
      _cb(err ? new Error(err) : null, res)
    }

    this.peer.map(service, {
      action: action,
      args: args
    }, _.defaults({
      timeout: 120000
    }, opts), cb)
  }
}

module.exports = GrcFacility
