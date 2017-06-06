require('dotenv').config();
var mongoose = require('mongoose');
mongoose.connect(`mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`);

var db = mongoose.connection;

db.on('error', (err) => {
  console.log(err);
});

db.once('open', () => {
  console.log('✓ Connected to MongoDB');
});

export default db;
