import http from 'http';
import express from 'express';
var cors = require('cors');
require('dotenv').config();

let app = express();

app.use(cors());

require('./middleware/bodyParser')(app);

const routes = require('./api/routes.js');
app.use('/', routes);

app.listen(process.env.API_PORT, function (err) {
	if (err) {
		console.error(err);
	} else {
		console.log(`Api listening on http://${process.env.API_HOST}:${process.env.API_PORT}`);
	}
});
