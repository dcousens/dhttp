var http = require('http')
var dhttp = require('../')
var tape = require('tape')

tape('dhttp', function (t) {
  t.plan(2)

  dhttp(http, {
    method: 'GET',
    url: 'http://localhost:8000',
    body: { a: 1 }
  }, function (err, res) {
    if (err) return t.error(err)
    if (res.statusCode !== 200) return t.error(new Error('Expected 200'))

    t.pass()
  })

  dhttp(http, {
    method: 'GET',
    url: 'http://localhost:8000'
  }, function (err, res) {
    if (err) return t.error(err)
    if (res.statusCode !== 200) return t.error(new Error('Expected 200'))

    t.pass()
  })
})
