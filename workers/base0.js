'use strict'

const os = require('os')
const fs = require('fs')
const _ = require('lodash')
const async = require('async')
const util = require('util')
const lutils = require('./../utils.js')

class Base0 {

  constructor(conf, ctx) {
    this.conf = conf
    this.ctx = ctx
    this.wtype = ctx.wtype
    this.prefix = this.wtype    
  }

  init() {
    this.status = {}

    this.conf.init = {
      facilities: [
        ['fac', 'intervals', '0', '0', {}]
      ]
    }

    this.mem = {}

    this.loadStatus()
  }

  loadConf(c, n = null) {
    _.merge(
      this.conf,
      lutils.get_conf_json(this.ctx.env, n, `${__dirname}/../config/${c}.json`)
    )
  }

  facility(type, name, ns, opts) {
    let fmod = null
    let rdir = null

    switch (type) {
      case 'plg':
        rdir = 'plugins'
      break
      default:
        rdir = 'facilities'
      break
    }
    
    try {
      fmod = require(`${__dirname}/../${rdir}/${name}.js`)
    } catch(e) {
      console.log(e)
    }

    if (!fmod) {
      return null
    }

    return (new fmod(this, _.extend({ ns: ns }, opts), _.pick(this.ctx, ['env'])))
  }

  fac_add(type, name, ns, label, opts, cb) {
    const fns = `${name}_${label}`
    opts.label = label

    const fac = this.facility(type, name, ns, opts)
    this[fns] = fac
    fac.start(cb)
  }

  fac_del(name, label, cb) {
    const fns = `${name}_${label}`
    const fac = this[fns]
    
    if (!fac) return cb()
    
    delete this[fns]
    fac.stop(cb)
  }

  facs(dir, list, cb) {
    const aseries = []

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
        `${__dirname}/../status/${this.prefix}.json`, 'UTF-8')
      ))
    } catch(e) {}
  }

  saveStatus() {
    try {
      fs.writeFile(`${__dirname}/../status/${this.prefix}.json`, JSON.stringify(this.status), () => {})
    } catch(e) {
      console.error(e)
    }
  }

  start(cb) {
    const aseries = []
    
    aseries.push(next => {
      this.facs('fac_add', this.conf.init.facilities, next)
    })

    aseries.push(next => {
      this._start0(next)
    })

    aseries.push(next => {
      this.active = 1
      next()
    })

    aseries.push(next => {
      this._start(next)
    })

    async.series(aseries, cb)
  }

  _start0(cb) { cb() }
  _start(cb) { cb() }

  stop(cb) {
    const aseries = []
      
    aseries.push(next => {
      this._stop(next) 
    })

    aseries.push(next => {
      this.facs('fac_del', _.map(this.conf.init.facilities, f => {
        return [f[1], f[3]]
      }), next)
    })

    aseries.push(next => {
      this.active = 0
      next()
    })

    aseries.push(next => {
      this._stop9(next) 
    })

    async.series(aseries, cb)
  }
  
  _stop(cb) { cb() }
  _stop9(cb) { cb() }

  getPluginCtx() {
    return {}
  }
}

module.exports = Base0
