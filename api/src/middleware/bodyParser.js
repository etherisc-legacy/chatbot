var bodyParser = require('body-parser');

module.exports = function setup(app) {
	app.use(bodyParser.json({type: 'application/json'}));
	app.use(bodyParser.urlencoded({extended: true, type: 'application/x-www-form-urlencoded'}));
	//app.use(bodyParser.text({ type: 'text/html' }));
};
