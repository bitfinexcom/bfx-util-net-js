'use strict'

const EventEmitter = require('events')
const _ = require('lodash')
const async = require('async')
const lutils = require('./../utils')

class Facility extends EventEmitter {
  
  constructor(caller, opts, ctx) {
    super()

    this.name = 'facility'
    this.caller = caller
    this.opts = _.extend({ ns: this.name }, opts)
    this.ctx = ctx
  }

  init() {
    const conf = lutils.get_conf_json(
      this.ctx.env, null, 
      `${__dirname}/../config/${this.name}.fac.json`
    )
    this.conf = conf[this.opts.ns]
  }

  set(k, v) {
    this[k] = v
  }

  start(cb) {
    const aseries = []

    aseries.push(next => {
      if (this._start) this._start(next)
      else next()
    })

    aseries.push(next => {
      this.active = 1
      next()
    })

    async.series(aseries, cb)
  }

  stop(cb) {
    const aseries = []

    aseries.push(next => {
      this.active = 0
      if (!this.working) return next()
      
      let itv = setInterval(() => {
        if (this.working) return
        clearInterval(itv)
        next()
      }, 1000)
    })

    aseries.push(next => {
      if (this._stop) this._stop(next)
      else next()
    })

    async.series(aseries, cb)
  }
}

module.exports = Facility
