'use strict'

const Facility = require('./base/base')

class Api extends Facility {
  constructor (caller, opts, ctx) {
    super(caller, opts, ctx)

    this.name = 'api'

    this.init()
  }

  init () {
    super.init()

    const ApiClass = this.getApi(this.opts.path)

    this.api = new ApiClass({
      getCtx: () => {
        return this.caller.getPluginCtx(`api_${this.opts.label}`)
      }
    })
  }

  getApi (name) {
    return require(`${__dirname}/../workers/api/${name}`)
  }
}

module.exports = Api
