'use strict'

const _ = require('lodash')

class Api {
  
  constructor(caller, opts = {}) {
    this.caller = caller
    this.opts = opts
  }

  space(service, msg) {
    return {
      service: service,
      svp: service.split(':')
    }
  }

  isCtxReady() {
    return true
  }

  handle(service, msg, cb) {
    const action = msg.action

    this.ctx = this.caller.getCtx()

    if (!this.isCtxReady()) {
      return cb('ERR_READY')
    }

    if (!action || !this[action]) {
      return cb('ERR_ACTION_NOTFOUND')
    }

    let args = _.isArray(msg.args) ? msg.args : []
    args.unshift(this.space(service, msg))
    args = args.concat(cb)

    try {
      this[action].apply(this, args)
    } catch(e) {
      console.error(e)
      cb('ERR_ACTION')
    }
  }
}

module.exports = Api
