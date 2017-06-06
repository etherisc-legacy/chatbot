const routes = require('express').Router();
import app from './app.js';

var Ajv = require('ajv');
var ajv = Ajv({allErrors: true});

routes.get('/', (req, res) => {
	res.status(200).json({ message: 'Etherisc API endpoint', routes: {
		'/airports' : 'Get the top airports',
		'/getFlightList' : 'Search for flights',
	} });
});

routes.get('/airports', (req, res) => {
	app.getAirports(req, res);
})

routes.get('/getFlightList', (req, res) => {
	res.status(400).json({ 'message': 'Use $_POST instead of $_GET for this url'});
});

routes.post('/getFlightList', (req, res) => {
	var schema = {
		"properties":{
			body: {
				type: 'object',
				"properties": {
					"origin": { "type": "string", "minLength":3 },
					"destination": { "type": "string", "minLength":3 },
					"departure": { "format": "date"},
				},
				"required": ["origin", "destination", "departure"]
			}
		},
		"required": ["body"]
	};

	var validate = ajv.compile(schema);
	var valid = validate(req);
	if (!valid) res.status(400).json(validate.errors);
	app.getFlightList(req, res);
})

module.exports = routes;
