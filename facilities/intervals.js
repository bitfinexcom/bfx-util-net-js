'use strict'

const _ = require('lodash')
const Facility = require('./base')

class Intervals extends Facility {

  constructor(caller, opts, ctx) {
    super(caller, opts, ctx)
    
    this.name = 'intervals'

    this.init()
  }

  init() {
    this.mem = new Map()
  }

  add(k, f, w) {
    this.mem.set(k, setInterval(f, w))
  }

  del(k) {
    const itv = this.mem.get(k)
    clearInterval(itv)
    this.mem.delete(k)
  }

  _stop(cb) {
    _.each(Array.from(this.mem.keys()), k => this.del(k))
    cb()
  }
}

module.exports = Intervals
