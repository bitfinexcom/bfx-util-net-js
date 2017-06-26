'use strict'

const fs = require('fs')
const async = require('async')
const LokiDb = require('lokijs')
const LokiFsAdapter = require('lokijs/src/loki-fs-structured-adapter')

const Facility = require('./base/base')

class Loki extends Facility {
  constructor (caller, opts, ctx) {
    super(caller, opts, ctx)

    this.name = 'loki'
    this.opts.dbPath = `${__dirname}/../db/${this.name}_${this.opts.name}_${this.opts.label}.db.json`

    this.init()
  }

  init () {
    super.init()

    const adapter = new LokiFsAdapter()

    this.db = new LokiDb(
      this.opts.dbPath,
      { adapter: adapter }
    )
  }

  _start (cb) {
    async.series([
      next => { super._start(next) },
      next => {
        if (this.opts.persist) {
          try {
            fs.statSync(this.opts.dbPath)
            this.db.loadDatabase({}, next)
          } catch (e) {
            next()
          }
        } else next()
      },
      next => {
        if (this.opts.persist) {
          this._saveItv = setInterval(() => {
            this.db.saveDatabase()
          }, 60000)
        }
        next()
      }
    ], cb)
  }

  _stop (cb) {
    async.series([
      next => { super._stop(next) },
      next => {
        if (this.opts.persist) {
          clearInterval(this._saveItv)
          this.db.saveDatabase(next)
        } else next()
      }
    ], cb)
  }
}

module.exports = Loki
