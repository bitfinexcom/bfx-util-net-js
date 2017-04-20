'use strict'

const _ = require('lodash')

class Api {
  
  constructor(cal, opts = {}) {
    this.cal = cal
    this.opts = opts
  }

  ctx(service, msg) {
    return {
      service: service,
      svp: service.split(':')
    }
  }

  handle(service, msg, cb) {
    const action = msg.action

    if (!action || !this[action]) {
      return cb('ERR_ACTION_NOTFOUND')
    }

    let args = _.isArray(msg.args) ? msg.args : []
    args.unshift(this.ctx(service, msg))
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
