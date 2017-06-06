var mongoose = require("mongoose");

var AccountSchema = new mongoose.Schema({
  name: {
    type: String,
    index: true
  },
});

var Account = mongoose.model('Account', AccountSchema);

export default Account;
