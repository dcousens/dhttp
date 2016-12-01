var dhttp = require('../')
var tape = require('tape')
var url = 'http://localhost:8080'

tape('dhttp', function (t) {
  t.plan(2)

  dhttp({
    method: 'GET',
    url: url,
    body: { a: 1 }
  }, function (err, res) {
    if (err) return t.error(err)
    if (res.statusCode !== 200) return t.error(new Error('Expected 200'))

    t.pass()
  })

  dhttp({
    method: 'GET',
    url: url
  }, function (err, res) {
    if (err) return t.error(err)
    if (res.statusCode !== 200) return t.error(new Error('Expected 200'))

    t.pass()
  })
})
