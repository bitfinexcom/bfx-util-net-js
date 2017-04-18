const fs = require('fs')
const _ = require('lodash')
const crypto = require('crypto')

var get_conf_json = (env, type, path) => {
  const conf = JSON.parse(fs.readFileSync(path, 'utf8'));
  if (!_.isObject(conf)) {
    return {}
  }
  
  let res = {}

  if (type) {
    res[type] = conf[env] ? conf[env] : conf
  } else {
    res = conf
  }
  return res
}

function ring_id(val, dim) {
  return val && dim ? val % dim : 0
}

function elapsed(t) {
  var precision = 3
  var elapsed = process.hrtime(t)[1] / 1000000; // divide by a million to get nano to milli
  return process.hrtime(t)[0] + "s," + elapsed.toFixed(precision) + "ms"
}

module.exports = {
  ring_id : ring_id,
  get_conf_json: get_conf_json,
  elapsed: elapsed
}
