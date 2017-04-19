'use strict'

const fs = require('fs')
const _ = require('lodash')
const lutils = require('./utils.js')

process.env.TZ = 'UTC'

const cmd = require('yargs')
  .option('wtype', {
    demand: true,
    type: 'string'
  })
  .option('env', {
    choices: ['production', 'development'],
    demand: true,
    type: 'string'
  })
  .option('debug', {
    default: false,
    type: 'boolean'
  })
  .help('help')
  .argv

const wtype = cmd.wtype
const env = cmd.env

const conf = _.merge(
  {},
  lutils.get_conf_json(env, null, __dirname + '/config/common.json')
)

const wref = wtype.split('-').reverse()
const ctx = { 
  wtype: wtype,
  env: env 
}

_.each(cmd, (v, k) => {
  ctx[k] = v  
})

const pname = [wtype]
pname.push(process.pid)
process.title = pname.join('-')

const handlerClass = require(__dirname + '/workers/' + wref.join('.'))
const hnd = new handlerClass(conf, ctx)

let shutdown = 0

process.on('SIGINT', () => {
  if (shutdown) {
    return
  }
  shutdown = 1

  if (!hnd.active) {
    return
  }
  console.log('BKW', pname, 'shutting down')
  hnd.stop(() => {
    process.exit()
  }) 
})
