# dhttp

[![TRAVIS](https://secure.travis-ci.org/dcousens/dhttp.png)](http://travis-ci.org/dcousens/dhttp)
[![NPM](http://img.shields.io/npm/v/dhttp.svg)](https://www.npmjs.org/package/dhttp)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

Just another biased browserify-compatible HTTP/HTTPS/XHR wrapper.
No compatability with IE.

`err` is only provided if the connection died.
Check `statusCode` otherwise.

If `body` was not parsed, it will be `null`.

Set `raw: true` to return `body` as a `Buffer`.
Set `text: true` to parse `body` as `UTF8` text.
Set `json: true` to parse `body` as a JSON object.

## Example

``` javascript
var dhttp = require('dhttp')

// ...
dhttp({
	method: 'GET',
	url: 'http://localhost:8000'
}, function (err, res) {
	if (err) return
	if (res.statusCode !== 200) return
	if (res.headers['content-type'] !== 'application/json') return

	console.log(res.body)
	// => { foo: 'bar' }, a parsed JSON object
	
	// ...
})
```

## LICENSE [MIT](LICENSE)
