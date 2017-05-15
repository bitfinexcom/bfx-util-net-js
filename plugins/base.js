'use strict'

const EventEmitter = require('events')
const _ = require('lodash')

class Plugin extends EventEmitter {
  constructor (caller, opts, ctx) {
    super()

    this.name = 'plugin'
    this.caller = caller
    this.opts = _.extend({ ns: this.name }, opts)
    this.ctx = ctx
  }

  start (cb) {
    this.active = 1
    cb()
  }

  stop (cb) {
    this.active = 0

    let itv = setInterval(() => {
      if (this.working) return
      clearInterval(itv)
      cb()
    }, 1000)
  }
}

module.exports = Plugin
