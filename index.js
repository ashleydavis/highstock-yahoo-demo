var path = require('path');
var express = require('express');
var request = require('request-promise');
var E = require('linq');

var yahooBaseUrl = 'http://ichart.yahoo.com/table.csv';

//
// Start the server and return it.
// Call server.close() to kill the server.
//
var startServer = function (done) {
	var app = express();

	var staticPath = path.join(__dirname, 'client');
	console.log(staticPath);
	app.use(express.static(staticPath));

	process.on('uncaughtException', function (err) {
	    console.error('Uncaught Exception: ' + err.message + '\r\n' + err.stack);
	});

	app.get('/is-alive', function (req, res) {
		res.status(200).end();
	});

	app.get('/yahoo', function (req, res) {

		console.log(req.query);

		var queryParams = E.from(Object.keys(req.query))
			.select(function (paramName) {
				return paramName + '=' + req.query[paramName];
			})
			.toArray()
			.join('&');

		var url = yahooBaseUrl + '?' + queryParams;
		console.log('Proxying: ' + url);

		request(url)
			.then(result => {
				res.set('Content-Type', 'text/csv');
				res.send(result).end();
			})
			.catch(e => console.error(e));

	});

	var server = app.listen(3000, function () {

		var host = server.address().address
		var port = server.address().port

		console.log('Example app listening at http://%s:%s', host, port)

		if (done) {
			done();
		}
	});

	return server;
};

module.exports = startServer;

if (require.main === module) {
	startServer();
}