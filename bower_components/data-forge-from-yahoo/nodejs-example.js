var dataForge = require('data-forge')
require('data-forge-from-yahoo')(dataForge); //todo: change to dataForge.use.

dataForge.fromYahoo('ABC.AX')
	.then(function (dataFrame) {
		console.log(dataFrame.toString());
	})
	.catch(function (err) {
		console.log(err.stack);
	});