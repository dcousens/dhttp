var parseHeaders = require('parse-headers')
var url = require('url')
var CONTENT_TYPE_MAP = {
  'object': 'application/json',
  'string': 'text/plain'
}

function returnJSON (result, body, callback) {
  try {
    body = Buffer.from(body).toString('utf8')
    result.body = JSON.parse(body)
  } catch (e) {
    return callback(e)
  }

  callback(null, result)
}

function returnUTF8 (result, body, callback) {
  result.body = body.toString('utf8')
  return callback(null, result)
}

function returnRaw (result, body, callback) {
  result.body = body
  return callback(null, result)
}

module.exports = function request (options, callback) {
  var timeout
  function done (err, res) {
    if (timeout) clearTimeout(timeout)
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

  var xhr
  function ready () {
    if (this.readyState < 2) return

    var headers = xhr.getAllResponseHeaders()
    headers = parseHeaders(headers)

    var length = headers['content-length']
    if (options.limit && length > options.limit) return done(new Error('Content-Length exceeded limit'))

    if (this.readyState !== 4) return

    var body = Buffer.from(xhr.response || '')
    var result = {
      body: null,
      headers: headers,
      statusCode: xhr.status
    }

    if (result.statusCode === 0) return done(new Error('Timeout'))

    // override
    if (options.json) return returnJSON(result, body, done)
    else if (options.text) return returnUTF8(result, body, done)
    else if (options.raw) return returnRaw(result, body, done)

    var contentType = headers['content-type']
    if (contentType) {
      if (/application\/json/.test(contentType)) return returnJSON(result, body, done)
      if (/text\/(plain|html)/.test(contentType)) return returnUTF8(result, body, done)
      if (/application\/octet-stream/.test(contentType)) return returnRaw(result, body, done)
    }

    done(null, result)
  }

  if (options.timeout) {
    timeout = setTimeout(function () {
      xhr.abort()

      done(new Error('ETIMEDOUT'))
    }, options.timeout)
  }

  xhr = new window.XMLHttpRequest()
  xhr.onreadystatechange = ready
  xhr.onerror = done
  xhr.responseType = 'arraybuffer'

  xhr.open(options.method, options.url, true)

  if (options.headers !== undefined && xhr.setRequestHeader) {
    for (var key in options.headers) {
      xhr.setRequestHeader(key, options.headers[key])
    }
  }

  xhr.send(options.body)
}
