var parseHeaders = require('parse-headers')
var url = require('url')
var CONTENT_TYPE_MAP = {
  'object': 'application/json',
  'string': 'text/plain'
}

module.exports = function (options, callback) {
  function done (err, res) {
    if (callback) callback(err, res)
    callback = undefined
  }

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
  function ready () {
    if (this.readyState < 2) return

    var headers = xhr.getAllResponseHeaders()
    headers = parseHeaders(headers)

    var length = headers['content-length']
    if (options.limit && length > options.limit) return done(new Error('Content-Length exceeded limit'))

    if (this.readyState !== 4) return

    var result = {
      statusCode: xhr.status,
      headers: headers,
      body: xhr.response
    }

    if (timeout) {
      clearTimeout(timeout)
    }

    var contentType = headers['content-type']
    if (contentType) {
      if (/application\/json/.test(contentType)) {
        try {
          result.body = JSON.parse(result.body)
        } catch (e) { return done(e) }
      }
      if (/application\/octet-stream/.test(contentType)) {
        result.body = new Buffer(result.body, 'utf-8')
      }
    }

    callback(null, result)
  }

  if (options.timeout) {
    timeout = setTimeout(function () {
      xhr.abort()

      done(new Error('ETIMEDOUT'))
    }, options.timeout)
  }

  var xhr = new window.XMLHttpRequest()
  xhr.open(options.method, options.url, true)

  if (options.header !== undefined && xhr.setRequestHeader) {
    for (var key in options.headers) {
      xhr.setRequestHeader(key, options.headers[key])
    }
  }

  xhr.onreadystatechange = ready
  xhr.onerror = done
  xhr.send(options.body)
}
