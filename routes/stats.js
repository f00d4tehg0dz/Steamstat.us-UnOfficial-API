var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	res.locals.connection.query('SELECT * from steamstatustable ORDER BY id ASC', function (error, results, fields) {
		if (error) throw error;
		res.end(JSON.stringify(results));
		// res.send(JSON.stringify(results));
	});
});

module.exports = router;
