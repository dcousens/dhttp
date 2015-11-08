var parsers = require('./parsers')
var url = require('url')

const CONTENT_TYPE_MAP = {
  'object': 'application/json',
  'string': 'text/plain'
}

function request (http, options, callback) {
  // don't mutate
  options = Object.assign({}, options)

  if (options.url) {
    Object.assign(options, url.parse(options.url))
  }

  options.headers = options.headers || {}
  if (options.body && !options.headers['content-type']) {
    // don't mutate
    options.headers = Object.assign({}, options.headers)
    options.headers['content-type'] = CONTENT_TYPE_MAP[typeof options.body]
  }

  if (typeof options.body === 'object') {
    options.body = JSON.stringify(options.body)
  }

  var timeout
  var request = http.request(options, function (response) {
    var length = response.headers['content-length']
    if (options.limit && length > options.limit) return callback(new Error('Content-Length exceeded limit'))

    function fin (err) {
      if (err) return callback(err)

      var result = {
        headers: response.headers,
        statusCode: response.statusCode
      }

      if (response.body) {
        result.body = response.body
      }

      if (timeout) {
        clearTimeout(timeout)
      }

      callback(null, result)
    }

    var contentType = response.headers['content-type']
    if (contentType) {
      if (/application\/json/.test(contentType)) return parsers.json(response, length, fin)
      if (/text\/plain/.test(contentType)) return parsers.json(response, length, fin)
      if (/application\/octet-stream/.test(contentType)) return parsers.json(response, length, fin)
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
