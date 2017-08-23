'use strict'

const async = require('async')
const Base = require('./base')

class WrkApi extends Base {
  init () {
    super.init()

    this.conf.init.facilities.push(
      ['fac', 'grc', 'p0', 'bfx', this.getGrcConf()],
      ['fac', 'api', 'bfx', 'bfx', this.getApiConf()]
    )
  }

  getGrcConf () {
    return {
      svc_port: this.ctx.apiPort || 0,
      services: []
    }
  }

  getApiConf () {
    return {
      path: null
    }
  }

  getPluginCtx (type) {
    const ctx = super.getPluginCtx(type)

    switch (type) {
      case 'api_bfx':
        ctx.grc_bfx = this.grc_bfx
        break
    }

    return ctx
  }

  _start (cb) {
    async.series([ next => { super._start(next) },
      next => {
        if (this.api_bfx) {
          this.grc_bfx.set('api', this.api_bfx.api)
        }

        next()
      }
    ], cb)
  }
}

module.exports = WrkApi
