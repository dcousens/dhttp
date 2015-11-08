var bodyParser = require('body-parser')
var url = require('url')

const CONTENT_TYPE_PARSERS = {
  'application/json': bodyParser.json,
  'application/x-www-form-urlencoded': bodyParser.urlencoded,
  'text/plain': bodyParser.text
}

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

  if (options.body && !options.headers['content-type']) {
    options.headers = Object.assign({}, options.headers)
    options.headers['content-type'] = CONTENT_TYPE_MAP[typeof options.body]
  }

  if (typeof options.body === 'object') {
    options.body = JSON.stringify(options.body)
  }

  var timeout
  var request = http.request(options, function (response) {
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

    var parser = CONTENT_TYPE_PARSERS[response.headers['content-type']]

    if (parser) {
      parser(options.parser)(response, {}, fin)
    } else {
      fin()
    }
  })

  if (options.body) {
    request.end(options.body)
  }

  if (options.timeout) {
    timeout = setTimeout(function () {
      request.abort()

      callback(new Error('ETIMEDOUT'))
    }, options.timeout)
  }
}

module.exports = request
