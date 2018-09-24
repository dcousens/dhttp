const dhttp = require('../')
const express = require('express')
const tape = require('tape')

const app = express()
const http = require('http')

const TENS = Buffer.alloc(99, 10) // 99x 10's
const vectors = [
  { path: '/text', value: 'foobar' },
  { path: '/json', value: { 'foo': 'bar' } },
  { path: '/buffer', value: TENS },
  { path: '/echo', method: 'POST', body: { foo: 1 }, value: { foo: 1 } },
  { path: '/echo', method: 'POST', body: [ 1 ], value: [ 1 ] },
  { path: '/echo/raw', method: 'POST', body: TENS, value: TENS },
  { path: '/echo', method: 'POST', body: '{"foo":1}', headers: { 'content-type': 'application/json' }, value: { foo: 1 } },
  { path: '/echo', method: 'POST', body: { foo: 1 }, headers: { 'content-type': 'application/json' }, value: { foo: 1 } }
]

app.get('/text', function (req, res) {
  res.status(200).send('foobar')
})

app.get('/json', function (req, res) {
  res.status(200).send({ 'foo': 'bar' })
})

app.get('/bad/json', function (req, res) {
  res.status(200)
  res.setHeader('Content-Type', 'application/json')
  res.write('{ foo: bad }')
  res.end()
})

app.get('/bad/content', function (req, res) {
  res.status(200)
  res.setHeader('Content-Type', 'ohno')
  res.write('foobar')
  res.end()
})

app.get('/buffer', function (req, res) {
  res.status(200).send(TENS)
})

app.post('/echo/raw', require('body-parser').raw(), function (req, res) {
  res.status(200).send(req.body)
})

app.post('/echo', require('body-parser').json(), function (req, res) {
  res.status(200).send(req.body)
})

const server = http.createServer(app)
server.listen(8080)

tape('dhttp', function (t) {
  t.plan(3 * vectors.length + 2 + 3 + 3 + 1)

  vectors.forEach((v) => {
    dhttp({
      method: v.method || 'GET',
      url: 'http://localhost:8080' + v.path,
      headers: v.headers,
      body: v.body
    }, function (err, res) {
      t.error(err)
      t.equal(res.statusCode, 200)
      t.deepEqual(res.body, v.value)
    })
  })

  dhttp({
    method: 'GET',
    url: 'http://localhost:8080/missing'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 404)
  })

  dhttp({
    method: 'GET',
    url: 'http://localhost:8080/bad/json'
  }, function (err, res) {
    t.ok(err)
    t.throws(() => {
      throw err
    }, /Unexpected token f/)
    t.equal(res, undefined)
  })

  dhttp({
    method: 'GET',
    url: 'http://localhost:8080/bad/content'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.equal(res.body, null)
  })

  dhttp({
    method: 'GET',
    url: 'http://255.255.255.0/',
    timeout: 500
  }, function (err, res) {
    t.throws(() => {
      throw err
    }, /ETIMEDOUT/)
  })
})

tape.onFinish(function () {
  server.close()
})
