# dhttp

[![TRAVIS](https://secure.travis-ci.org/dcousens/dhttp.png)](http://travis-ci.org/dcousens/dhttp)
[![NPM](http://img.shields.io/npm/v/dhttp.svg)](https://www.npmjs.org/package/dhttp)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

Just another biased browserify-compatible HTTP/HTTPS/XHR wrapper.
No compatability with IE.

Automatically parses `application/json`, `text/(plain|html)` and `application/octet-stream`,  use overrides for others.

## Example

``` javascript
var dhttp = require('dhttp')

// ...
dhttp({
	method: 'GET',
	url: 'http://localhost:8000'
}, function (err, res) {
	// err is only provided if the connection failed in some way
	// OR if the content body parsing failed in some way
	if (err) return
	if (res.statusCode !== 200) return
	if (res.headers['content-type'] !== 'application/json') return

	// if `content-type` was not supported, expect body to be `null` (unless an override is given).
	console.log(res.body)
	// => { foo: 'bar' }, a parsed JSON object
	
	// ...
})
```

Use optional overrides to force a `content-type`.

``` javascript
var dhttp = require('dhttp')

// ...
dhttp({
	method: 'GET',
	url: 'http://localhost:8000',
	json: true, // optional, `true` parses `body` as a JSON object
	text: false, // optional, `true` parses `body` as UTF8 text
	raw: false, // optional, `true` returns `body` as a `Buffer`
}, function (err, res) {
	if (err) return
	if (res.statusCode !== 200) return
	
	// the content-type was actually an octet-stream!
	if (res.headers['content-type'] !== 'application/octet-stream') return

	// no fear
	console.log(res.body)
	// => { foo: 'bar' }, a [force] parsed JSON object
	
	// ...
})
```

To bypass `statusCode` handling, you can use `dhttp/200` which throws a descriptive error for any `statusCode` other than 200.

``` javascript
var dhttp = require('dhttp/200')
// ...
```

## LICENSE [MIT](LICENSE)
