require('dotenv').config();

import flights from './flights.js';

var Web3 = require('web3');
var web3 = new Web3();
console.log('ATTEMPT CONNECT', `http://${process.env.WEB3_RPC_HOST}:${process.env.WEB3_RPC_PORT}`);
web3.setProvider(new web3.providers.HttpProvider(`http://${process.env.WEB3_RPC_HOST}:${process.env.WEB3_RPC_PORT}`));

const whisperProxy = {};

whisperProxy.id = '';
whisperProxy.pubKey = '';

whisperProxy.topicGet = '0x61965e62';
whisperProxy.topicAnswer = '0xd38554c7';
whisperProxy.topic3 = '0xc8c64923';
whisperProxy.topic4 = '0x4a3621bb';

whisperProxy.respondToPub = (pubKey, payload) => {

  var messageSend = {
    type: "asym",
    key: pubKey,
    topic: whisperProxy.topicAnswer,
    powTarget: 2.01,
    powTime: 2,
    ttl: 20,
    payload: web3.toHex(payload)
  };

  console.log('RESPONSE', web3.shh.post(messageSend) === null, messageSend);

}

whisperProxy.parseRequest = (msg) => {
  console.log('Received message...');

  var asciiPayload = web3.toAscii(msg.payload);
  if (!isJson(asciiPayload)) whisperProxy.respondToPub(jsonPayload.pubKey, '{"error":"Not valid JSON"}');
  var jsonPayload = JSON.parse(web3.toAscii(msg.payload));

  console.log('JSON', jsonPayload);

  var req = { body: jsonPayload };

  var Ajv = require('ajv');
  var ajv = Ajv({allErrors: true});

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

  //Check if the search is valid
  if (!valid) whisperProxy.respondToPub(jsonPayload.pubKey, '{"error":"Not a valid search"}');

  // Do the search for flights
  flights.getFlights(req.body.origin, req.body.destination, req.body.departure).then((flightList) => {
    console.log("GOT Flightlist");
    // Answer the public key that asked
    whisperProxy.respondToPub(jsonPayload.pubKey, flightList);
  });
}

whisperProxy.listen = () => {

  var filterAsync = web3.shh.subscribe({
    type: "asym",
    key: whisperProxy.id,
    topics: [whisperProxy.topicGet]
  });

  console.log('ID',whisperProxy.id);
  console.log('PUBKEY', whisperProxy.pubKey);
  console.log('FILTERID: '+filterAsync);

  var messages = web3.shh.getFloatingMessages(filterAsync);
  if(messages.length){
    console.log(messages);
    whisperProxy.parseRequest(messages[0]);
  }else{
    console.log('No floating messages');
  }

  console.log('Polling network every half second.');

  // Poll for messages
  whisperProxy.timerInterval = setInterval(function(){
    var messages = web3.shh.getNewSubscriptionMessages(filterAsync);
      if(messages.length){
        console.log(messages);
        whisperProxy.parseRequest(messages[0]);
      }
  },500);
}

whisperProxy.init = () => {
  //whisperProxy.genKeys(function(){
    whisperProxy.id = 'b8edda1f28f228bd91437eac994fd4b1055c82be246b5deaf31b4f865d4fc39d';
    whisperProxy.pubKey = '0x042f3c78c8964ac8893d1df0bd053b1bd677ca56b7f7d6d14aad94c683e38c4258ca585592a5c4cb400f6a72a0b562ff92d79c62222fbb0b2bb28df86e3080c91e';
    whisperProxy.listen();
  //})
}

whisperProxy.genKeys = (cb) => {
  web3.shh.newKeyPair(function(err, id){
    whisperProxy.id = id;
    web3.shh.getPublicKey(id, function(err, pub){
      whisperProxy.pubKey = pub;
      cb();
    });
  });
}

whisperProxy.timerInterval = false;

var isJson = function (str) {
    try {
        return !!JSON.parse(str);
    } catch (e) {
        return false;
    }
};

export default whisperProxy;
