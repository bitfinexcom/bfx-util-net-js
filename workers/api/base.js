'use strict'

const _ = require('lodash')

class Api {
  
  constructor(cal, opts = {}) {
    this.cal = cal
    this.opts = opts
  }

  ctx(msg) {
    const channel = msg.channel || 'unk'

    return {
      channel: channel,
      chp: channel.split(':')
    }
  }

  handle(msg, cb) {
    const action = msg.action

    if (!action || !this[action]) {
      return cb('ERR_ACTION_NOTFOUND')
    }

    let args = _.isArray(msg.args) ? msg.args : []
    args.unshift(this.ctx(msg))
    args = args.concat(cb)

    try {
      this[action].apply(this, args)
    } catch(e) {
      console.error(e)
      cb('ERR_ACTION')
    }
  }

  bfxRequest(service, action, args, cb) {
    this.cal.grc_bfx.peer.request(service, {
      action: action,
      args: args
    }, {}, cb)
  }
}

module.exports = Api
