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
    powTarget: 30.01,
    powTime: 30,
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
    whisperProxy.id = '8ef89ff008e801911307c95696f2a5e2fa6e14652fda6e00f463754e31ee6512';
    whisperProxy.pubKey = '0x04bbdd623c0cfa13a838e2dd7f85da6094a0967531c7b99d6c01ec2c35202507d2ceccbd553890c2ae21d902bf9a20de078963367f9c171cccb2c253b0fcbf7a48';
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
