'use strict'

const _ = require('lodash')
const async = require('async')
const Facility = require('./base/base')

class Intervals extends Facility {
  constructor (caller, opts, ctx) {
    super(caller, opts, ctx)

    this.name = 'intervals'

    this.init()
  }

  init () {
    this.mem = new Map()
  }

  add (k, f, w) {
    this.mem.set(k, setInterval(() => {
      if (!this.caller.active) return
      f() 
    }, w))
  }

  del (k) {
    const itv = this.mem.get(k)
    clearInterval(itv)
    this.mem.delete(k)
  }

  _stop (cb) {
    async.series([
      next => { super._stop(next) },
      next => {
        _.each(Array.from(this.mem.keys()), k => this.del(k))
        next()
      }
    ], cb)
  }
}

module.exports = Intervals
