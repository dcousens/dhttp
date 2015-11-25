var parsers = require('./parsers')
var url = require('url')
var CONTENT_TYPE_MAP = {
  'object': 'application/json',
  'string': 'text/plain'
}

function request (http, options, callback) {
  // don't mutate
  options = Object.assign({}, options)

  if (options.url) {
    Object.assign(options, url.parse(options.url))
  }

  if (options.body !== undefined) {
    var typeOf = typeof options.body

    options.headers = options.headers || {}
    if (!options.headers['content-type']) {
      // don't mutate
      options.headers = Object.assign({}, options.headers)
      options.headers['content-type'] = CONTENT_TYPE_MAP[typeOf]
    }

    if (typeOf !== 'string') {
      options.body = JSON.stringify(options.body)
    }
  }

  var timeout
  var request = http.request(options, function (response) {
    var length = response.headers['content-length']
    if (options.limit && length > options.limit) return callback(new Error('Content-Length exceeded limit'))

    function fin (err, body) {
      if (err) return callback(err)

      var result = {
        statusCode: response.statusCode,
        headers: response.headers,
        body: body
      }

      if (timeout) {
        clearTimeout(timeout)
      }

      callback(null, result)
    }

    var contentType = response.headers['content-type']
    if (contentType) {
      if (/application\/json/.test(contentType)) return parsers.json(response, length, fin)
      if (/text\/plain/.test(contentType)) return parsers.text(response, length, fin)
      if (/application\/octet-stream/.test(contentType)) return parsers.raw(response, length, fin)
    }

    fin()
  })

  if (options.timeout) {
    timeout = setTimeout(function () {
      request.abort()

      callback(new Error('ETIMEDOUT'))
    }, options.timeout)
  }

  request.end(options.body)
}

module.exports = request
