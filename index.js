var bodyParser = require('body-parser')
var url = require('url')

const CONTENT_PARSER_MAP = {
  'application/json': bodyParser.json,
  'application/x-www-form-urlencoded': bodyParser.urlencoded,
  'text/plain': bodyParser.text
}

const CONTENT_TYPE_MAP = {
  'object': 'application/json',
  'string': 'text/plain'
}

function request (http, options, callback) {
  // copy options
  options = Object.assign({}, options)

  if (options.url) {
    Object.assign(options, url.parse(options.url))
  }

  var headers = Object.assign({}, options.headers)
  if (options.body && !headers['content-type']) {
    headers['content-type'] = CONTENT_TYPE_MAP[typeof options.body]
  }

  if (typeof options.body === 'object') {
    options.body = JSON.stringify(options.body)
  }

  var timeout
  var request = http.request(options, function (response) {
    var result = {
      headers: response.headers,
      statusCode: response.statusCode
    }

    var parser = CONTENT_PARSER_MAP[result.headers['content-type']]

    parser(options.parser)(response, {}, function (err) {
      if (err) return callback(err)
      if (response.body) {
        result.body = response.body`
      }

      if (timeout) {
        clearTimeout(timeout)
      }

      callback(null, result)
    })
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
