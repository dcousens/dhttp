var url = require('url')
var CONTENT_TYPE_MAP = {
  'buffer': 'application/octet-stream',
  'object': 'application/json',
  'number': 'application/json',
  'string': 'text/plain'
}

module.exports = function augment (options) {
  // don't mutate
  options = Object.assign({}, options)

  if (options.url) {
    Object.assign(options, url.parse(options.url))
  }

  if (options.body === undefined) return options

  var typeOf = typeof options.body
  if (Buffer.isBuffer(options.body)) typeOf = 'buffer'

  options.headers = options.headers || {}
  if (!options.headers['content-type']) {
    // don't mutate
    options.headers = Object.assign({}, options.headers)
    options.headers['content-type'] = CONTENT_TYPE_MAP[typeOf]
  }

  if (typeOf === 'object' || typeOf === 'number') {
    options.body = JSON.stringify(options.body)
  }

  return options
}
