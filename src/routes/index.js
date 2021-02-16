var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(rq, res, next) {
	res.send('express + typescript')
});

module.exports = router;
