var parsers = require('./parsers')
var augment = require('./augment')

var PROTOCOLS = {
  'http:': require('http'),
  'https:': require('https')
}

module.exports = function request (options, callback) {
  var timeout
  function done (err, res) {
    if (timeout) clearTimeout(timeout)
    if (callback) callback(err, res)
    callback = undefined
  }

  options = augment(options)

  var protocol
  if (options.protocol !== undefined) {
    protocol = PROTOCOLS[options.protocol]
  }

  var request = protocol.request(options, function (response) {
    var length = response.headers['content-length']
    if (options.limit && length > options.limit) return done(new Error('Content-Length exceeded limit'))

    function handle (err, body) {
      if (err) return done(err)

      var result = {
        statusCode: response.statusCode,
        headers: response.headers,
        body: body || null
      }

      done(null, result)
    }

    // override
    if (options.json) return parsers.json(response, length, handle)
    if (options.text) return parsers.text(response, length, handle)
    if (options.raw) return parsers.raw(response, length, handle)

    var contentType = response.headers['content-type']
    if (contentType) {
      if (/application\/json/.test(contentType)) return parsers.json(response, length, handle)
      if (/text\/(plain|html)/.test(contentType)) return parsers.text(response, length, handle)
      if (/application\/octet-stream/.test(contentType)) return parsers.raw(response, length, handle)
    }

    handle()
  })

  request.on('error', done)

  if (options.timeout) {
    timeout = setTimeout(function () {
      request.abort()

      done(new Error('ETIMEDOUT'))
    }, options.timeout)
  }

  request.end(options.body)
}
