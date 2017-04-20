'use strict'

const os = require('os')
const fs = require('fs')
const _ = require('lodash')
const async = require('async')
const util = require('util')
const lutils = require('./utils.js')

class Base0 {

  constructor(conf, ctx) {
    this.conf = conf
    this.ctx = ctx
    this.wtype = ctx.wtype
    this.prefix = this.wtype
    
    this.status = {}

    this.conf.init = {
      facilities: []
    }

    this.mem = {}
  }

  facility(type, name, ns, opts) {
    var fmod = null
    var rdir = null

    switch (type) {
      case 'plg':
        rdir = 'plugins'
      break
      default:
        rdir = 'facilities'
      break
    }
    
    try {
      fmod = require(__dirname + '/' + rdir + '/' + name + '.js')
    } catch(e) {
      console.log(e)
    }

    if (!fmod) {
      return null
    }

    return (new fmod(this, _.extend({ ns: ns }, opts), _.pick(this.ctx, ['env'])))
  }

  fac_add(type, name, ns, label, opts, cb) {
    var fns = name + '_' + label
    var fac = this.facility(type, name, ns, opts)
    this[fns] = fac
    fac.start(cb)
  }

  fac_del(name, label, cb) {
    var fns = name + '_' + label
    var fac = this[fns]
    
    if (!fac) return cb()
    
    delete this[fns]
    fac.stop(cb)
  }

  facs(dir, list, cb) {
    var aseries = []

    _.each(list, p => {
      aseries.push(next => {
        this[dir].apply(this, p.concat([next]))
      })     
    })
 
    async.series(aseries, cb)
  }

  loadStatus() {
    try {
      _.extend(this.status, JSON.parse(fs.readFileSync(
        `${__dirname}/status/${this.prefix}.json`, 'UTF-8')
      ))
    } catch(e) {}
  }

  saveStatus() {
    try {
      fs.writeFile(`${__dirname}/status/${this.prefix}.json`, JSON.stringify(this.status), () => {})
    } catch(e) {}
  }

  start(cb) {
    const aseries = []
    
    aseries.push(next => {
      this.facs('fac_add', this.conf.init.facilities, next)
    })

    if (this._start) {
      aseries.push(next => {
        this._start(next) 
      })
    }

    aseries.push(next => {
      this.active = 1
      next()
    })

    async.series(aseries, cb)
  }

  stop(cb) {
    const aseries = []

    if (this._stop) {
      aseries.push(next => {
        this._stop(next) 
      })
    }

    aseries.push(next => {
      this.facs('fac_del', _.map(this.conf.init.facilities, f => {
        return [f[1], f[3]]
      }), next)
    })

    aseries.push(next => {
      this.active = 0
      next()
    })

    async.series(aseries, cb)
  }
}

module.exports = Base0
