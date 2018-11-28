var dhttp = require('./')
var httpStatus = require('statuses/codes')

module.exports = function only200 (options, callback) {
  dhttp(options, function (err, result) {
    if (err) return callback(err)
    if (result.statusCode < 200 || result.statusCode >= 300) {
      var message = result.body
      if (!message) message = httpStatus[result.statusCode]

      return callback(new Error(message))
    }

    callback(null, result.body)
  })
}
