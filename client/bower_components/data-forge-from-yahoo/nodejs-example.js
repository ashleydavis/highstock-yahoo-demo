var dataForge = require('data-forge')
dataForge.use(require('data-forge-from-yahoo'));

dataForge.fromYahoo('ABC.AX')
	.then(function (dataFrame) {
		console.log(dataFrame.toString());
	})
	.catch(function (err) {
		console.log(err.stack);
	});