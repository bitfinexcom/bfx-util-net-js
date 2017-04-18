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

var str_to_bin = (s) => {
  return new Buffer(s).toString('binary')
} 

const IV = '1234567890123456'

var crypto_key_parse = (key) => {
  return key.substr(0, 32)
}

var crypto_decrypt = (cryptkey, _iv, encryptdata) => {
  if (!encryptdata) return ''

  const iv = _iv || IV
  encryptdata = new Buffer(encryptdata, 'base64').toString('binary')

  const decipher = crypto.createDecipheriv('aes-256-cbc', crypto_key_parse(cryptkey), iv)
  let decoded  = decipher.update(encryptdata, 'binary', 'utf8')

  decoded += decipher.final('utf8')
  return decoded
}

var crypto_encrypt = (cryptkey, _iv, cleardata) => {
  if (!cleardata) return ''

  const iv = _iv || IV
  const encipher = crypto.createCipheriv('aes-256-cbc', crypto_key_parse(cryptkey), iv)
  let encryptdata  = encipher.update(cleardata, 'utf8', 'binary')

  encryptdata += encipher.final('binary')
  return new Buffer(encryptdata, 'binary').toString('base64')
}

function ring_id(val, dim) {
  return val && dim ? val % dim : 0
}

module.exports = {
  ring_id : ring_id,
  decrypt: crypto_decrypt,
  encrypt: crypto_encrypt,
  get_conf_json: get_conf_json
}
