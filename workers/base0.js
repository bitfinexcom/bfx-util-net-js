'use strict'

const fs = require('fs')
const _ = require('lodash')
const async = require('async')
const lutils = require('./../utils.js')

class Base0 {
  constructor (conf, ctx) {
    this.conf = conf
    this.ctx = ctx
    this.wtype = ctx.wtype
    this.prefix = this.wtype
  }

  init () {
    this.status = {}

    this.conf.init = {
      facilities: [
        ['fac', 'intervals', '0', '0', {}]
      ]
    }

    this.mem = {}

    this.loadStatus()
  }

  loadConf (c, n = null) {
    _.merge(
      this.conf,
      lutils.get_conf_json(this.ctx.env, n, `${__dirname}/../config/${c}.json`)
    )
  }

  facility (type, name, ns, opts) {
    let Fmod = null
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
      Fmod = require(`${__dirname}/../${rdir}/${name}.js`)
    } catch (e) {
      console.log(e)
    }

    if (!Fmod) {
      return null
    }

    return (new Fmod(this, _.extend({ ns: ns }, opts), _.pick(this.ctx, ['env'])))
  }

  nameFac (name) {
    return _.camelCase(_.uniq(_.snakeCase(name).split('_')))
  }

  addFac (type, name, ns, label, opts, cb) {
    opts.label = label

    const fac = this.facility(type, name, ns, opts)

    const fns = `${this.nameFac(name)}_${label}`
    this[fns] = fac
    fac.start(cb)
  }

  delFac (name, label, cb) {
    const fns = `${this.nameFac(name)}_${label}`
    const fac = this[fns]

    if (!fac) return cb()

    delete this[fns]
    fac.stop(cb)
  }

  facs (dir, list, cb) {
    const aseries = []

    _.each(list, p => {
      aseries.push(next => {
        this[dir].apply(this, p.concat([next]))
      })
    })

    async.series(aseries, cb)
  }

  loadStatus () {
    try {
      const status = JSON.parse(fs.readFileSync(
        `${__dirname}/../status/${this.prefix}.json`, 'UTF-8')
      )
      _.extend(this.status, _.isObject(status) ? status : {})
    } catch (e) {}
  }

  saveStatus () {
    try {
      console.log('saving status', this.status)
      fs.writeFile(`${__dirname}/../status/${this.prefix}.json`, JSON.stringify(this.status), () => {})
    } catch (e) {
      console.error(e)
    }
  }

  start (cb) {
    const aseries = []

    aseries.push(next => {
      this.facs('addFac', this.conf.init.facilities, (err) => {
        // crash early to avoid silent fails in facilities
        if (err) {
          console.trace()
          throw err
        }
        next()
      })
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

  _start0 (cb) { cb() }
  _start (cb) { cb() }

  stop (cb) {
    const aseries = []

    aseries.push(next => {
      this._stop(next)
    })

    aseries.push(next => {
      this.facs('delFac', _.map(this.conf.init.facilities, f => {
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

  _stop (cb) { cb() }
  _stop9 (cb) { cb() }

  getPluginCtx () {
    return {}
  }
}

module.exports = Base0
