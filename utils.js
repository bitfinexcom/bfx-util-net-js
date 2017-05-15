const fs = require('fs')
const _ = require('lodash')

const getJSONConf = (env, type, path) => {
  const conf = JSON.parse(fs.readFileSync(path, 'utf8'))
  if (!_.isObject(conf)) {
    return {}
  }

  let res = {}

  if (type) {
    _.set(res, type, conf[env] ? conf[env] : conf)
  } else {
    res = conf
  }

  return res
}

function elapsed (t) {
  var precision = 3
  var elapsed = process.hrtime(t)[1] / 1000000 // divide by a million to get nano to milli
  return process.hrtime(t)[0] + 's,' + elapsed.toFixed(precision) + 'ms'
}

module.exports = {
  get_conf_json: getJSONConf,
  elapsed: elapsed
}
