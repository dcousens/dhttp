# sane-http

[![TRAVIS](https://secure.travis-ci.org/dcousens/sane-http.png)](http://travis-ci.org/dcousens/sane-http)
[![NPM](http://img.shields.io/npm/v/sane-http.svg)](https://www.npmjs.org/package/sane-http)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

Just another biased browserify-compatible HTTP/HTTPS wrapper


## Example

``` javascript
var saneHttp = require('sane-http')
var http = require('http')

// ...
saneHttp(http, {
	method: 'GET',
	url: 'http://localhost:8000'
}, function (err, res) {
	if (res.statusCode !== 200) return
	if (res.headers['content-type'] !== 'application/json') return

	// ...
})
```

Uses `body-parser` under the hood, use `parser` to pass relevant options through.

## LICENSE [MIT](LICENSE)
