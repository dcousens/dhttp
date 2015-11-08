/* global describe, it */

// var assert = require('assert')
var http = require('http')
var dhttp = require('../')

describe('dhttp', function () {
  it('it works', function (done) {
    dhttp(http, {
      method: 'GET',
      url: 'http://localhost:8000',
      body: { a: 1 }
    }, function (err, res) {
      if (err) return done(err)
      if (res.statusCode !== 200) return done(new Error('Expected 200'))

      done()
    })
  })
})
