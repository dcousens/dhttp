# dhttp

[![TRAVIS](https://secure.travis-ci.org/dcousens/dhttp.png)](http://travis-ci.org/dcousens/dhttp)
[![NPM](http://img.shields.io/npm/v/dhttp.svg)](https://www.npmjs.org/package/dhttp)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

Just another biased browserify-compatible HTTP/HTTPS wrapper


## Example

``` javascript
var dhttp = require('dhttp')
var http = require('http')

// ...
dhttp(http, {
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
