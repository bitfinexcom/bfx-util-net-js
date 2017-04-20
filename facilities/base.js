'use strict'

const EventEmitter = require('events')
const _ = require('lodash')
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
    var conf = lutils.get_conf_json(
      this.ctx.env, null, 
      __dirname + '/../config/' + this.name + '.fac.json'
    )
    this.conf = conf[this.opts.ns]
  }

  set(k, v) {
    this[k] = v
  }

  start(cb) {
    this.active = 1
    cb()
  }

  stop(cb) {
    this.active = 0

    let itv = setInterval(() => {
      if (this.working) return
      clearInterval(itv)
      cb()
    }, 1000)
  }
}

module.exports = Facility
