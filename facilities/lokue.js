'use strict'

const async = require('async')
const Lokue = require('lokue')
const Facility = require('./base/base')

class LokueFacility extends Facility {
  constructor (caller, opts, ctx) {
    super(caller, opts, ctx)

    this.name = 'lokue'

    this.init()
  }

  init () {
    super.init()

    this.q = new Lokue({
      name: `${__dirname}/../db/${this.name}_${this.opts.name}_${this.opts.label}.db.json`,
      persist: this.opts.persist
    })
  }

  _start (cb) {
    async.series([
      next => { super._start(next) },
      next => {
        this.q.init(next)
      },
      next => {
        this._clearItv = setInterval(() => {
          if (!this.q.isReady()) return
          this.q.clearCompletedJobs()
          this.q.clearErrorJobs()
        }, 60000)
        next()
      }
    ], cb)
  }

  _stop (cb) {
    async.series([
      next => { super._stop(next) },
      next => {
        this.q.stop(next)
      }
    ], cb)
  }
}

module.exports = LokueFacility
