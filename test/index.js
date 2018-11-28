const dhttp = require('../')
const tape = require('tape')
const tf = require('typeforce')

const JSON_TYPE = tf.compile({
  slideshow: {
    slides: tf.arrayOf({ title: tf.String }, { length: 2 })
  }
})

function echo (back) {
  return tf.compile(Object.assign({
    args: tf.Object,
    data: tf.String,
    files: tf.Object,
    form: tf.Object,
    headers: tf.Object,
    origin: tf.String,
    url: tf.String
  }, back))
}

const v = tf.value
const vectors = [
  { path: '/status/200', statusCode: 200, type: v('') },
  { path: '/status/300', statusCode: 300, type: v('') },
  { path: '/status/404', statusCode: 404, type: v('') },
  { path: '/anything', method: 'POST', type: echo({ data: v('text') }), body: 'text' },
  { path: '/anything', method: 'POST', type: echo({ json: { foo: v(1) } }), body: { foo: 1 } },
  { path: '/anything', method: 'POST', type: echo({ json: { foo: v(1) } }), body: { foo: 1 }, headers: { 'content-type': 'application/json' } },
  { path: '/anything', method: 'POST', type: echo({ json: { foo: v(1) } }), body: '{"foo":1}', headers: { 'content-type': 'application/json' } },
  { path: '/json', type: JSON_TYPE },
  { path: '/bytes/4', type: tf.BufferN(4) },
  { path: '/bytes/30', type: tf.BufferN(30) },
  { path: '/stream-bytes/40', type: tf.BufferN(40) },
  { path: '/stream/3', errorRegex: /Unexpected token {/ },
  { path: '/delay/9', statusCode: 200, type: echo() }
]

vectors.forEach((v) => {
  let { method, errorRegex, statusCode, path, headers, body, type } = v
  method = method || 'GET'
  statusCode = statusCode || 200

  tape(`${path} OK`, function (t) {
    dhttp({
      method,
      url: `http://httpbin.org/${path}`,
      headers,
      body
    }, function (err, res) {
      if (err) {
        if (errorRegex) {
          t.throws(function () {
            throw err
          }, errorRegex)
        } else {
          t.error(err)
        }

        return t.end()
      }

      t.equal(res.statusCode, statusCode, `status ${statusCode}`)
      if (type) {
        t.ok(tf(v.type, res.body), 'matches expected type')
      }

      t.end()
    })
  })
})

tape('timeout', (t) => {
  dhttp({
    method: 'GET',
    url: 'http://255.255.255.0/',
    timeout: 500
  }, function (err, res) {
    t.throws(() => {
      throw err
    }, /ETIMEDOUT/)
    t.end()
  })
})
