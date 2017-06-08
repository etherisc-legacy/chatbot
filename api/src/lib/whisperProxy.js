require('dotenv').config();

import flights from './flights.js';

var Web3 = require('web3');
var web3 = new Web3();
console.log('ATTEMPT CONNECT', `http://${process.env.WEB3_RPC_HOST}:${process.env.WEB3_RPC_PORT}`);
web3.setProvider(new web3.providers.HttpProvider(`http://${process.env.WEB3_RPC_HOST}:${process.env.WEB3_RPC_PORT}`));

const whisperProxy = {};

whisperProxy.id = 'bbbe42ac562486525bc0ddbbafb2628bc24fe7b661bc1a519e813681cc79ff2a';
whisperProxy.pubKey = '0x0494de0c937afb001e52a6056f692e46f6f916852365bef598114eac1b99f1708d79f2c97af4e85d2f0828db023be76a138b1c585faccea6562a844d3427e8fe05';

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

  //console.log('RESPONDED:', );

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

  console.log('API Public key: ', whisperProxy.pubKey);
  console.log('FILTERID: '+filterAsync);

  var messages = web3.shh.getFloatingMessages(filterAsync);
  if(messages.length){
    console.log(messages);
    whisperProxy.parseRequest(messages[0]);
  }else{
    console.log('No floating messages');
  }

  // Poll for messages
  whisperProxy.timerInterval = setInterval(function(){
    var messages = web3.shh.getNewSubscriptionMessages(filterAsync);
      if(messages.length){
        console.log(messages);
        whisperProxy.parseRequest(messages[0]);
      }else{
        console.log('No new messages');
      }
  },500);
}

whisperProxy.init = () => {
  whisperProxy.genKeys(function(){
    whisperProxy.listen();
  })
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


/*var makeTopic = function () {
        var min = 1;
        var max = Math.pow(16, 8);
        var randInt = Math.floor(Math.random() * (max - min + 1)) + min;
        return web3.toHex(randInt);
};
for(let i = 0; i < 10; i++){
  console.log(makeTopic());
}*/

/*web3.shh.newKeyPair(function(err, id){
  whisperProxy.id = id;
  web3.shh.getPublicKey(id, function(err, pub){
    whisperProxy.pubKey = pub;*/

    /*var filterAsync = web3.shh.subscribe({
      type: "asym",
      key: whisperProxy.id,
      topics: [whisperProxy.topicGet]
    });
    console.log(whisperProxy);

    console.log('FILTERID: '+filterAsync);

    var messages = web3.shh.getFloatingMessages(filterAsync);
    if(messages.length){
      console.log(web3.toAscii(messages[0].payload));
    } else {
      console.log('No floating messages');
    }

    setInterval(function(){
      var messages = web3.shh.getNewSubscriptionMessages(filterAsync);
        if(messages.length){
          console.log('Received message. parsing...');
          whisperProxy.parseRequest(messages[0]);
          //console.log(web3.toAscii(messages[0].payload));
          //console.log(messages);
        }else{
          //console.log('No new messages');
        }
    },500);*/

  /*});
});*/
//var pubKey1 = web3.shh.getPublicKey(whisperProxy.id);

//console.log(pubKey1, whisperProxy.pubKey);




/*web3.shh.newKeyPair(function(err, id){
  web3.shh.getPublicKey(id, function(err, pub){

    console.log(pub);
    //web3.shh.post({ttl: '7', topic: '0x07678231', powTarget: 2.01, powTime: 2, payload: '0x68656c6c6f', key: '0x045823b9d65726cf83b8bfdb504d56142faccd89c46fbc3094e4ec47e3820f12758c0611aa611f68b7dfe88c90a4232e1a34d747169b26cd9284357b7869b06b0f'});
    //var identity = web3.shh.newIdentity();
    var topic = web3.toHex('');
    var payload = 'hello whisper world!';

    var message = {
      type:'asym',
      //from: pub,
      topics: topic,
      payload: web3.toHex(payload),
      ttl: 100,
      powTime:100,
      powTarget:10,
      key: pub,
    };
    console.log(message);
    web3.shh.post(message);

    web3.shh.info(function(err, info){
      console.log(err, info);
    });

    web3.shh.subscribe({type: 'asym', minPow: 1, topics:[''], key:pub}, function(error,a) {
      if (error) console.log(error);

      console.log('NEW sub:'+a);
      web3.shh.getFloatingMessages(a, function(err,b){
        console.log(err, b);
        //status.sendMessage(typeof err[]);
      });
    });

  });
  console.log(id);//;web3.version.api);
});*/

/*web3.shh.subscribe({type: 'asym', key:'abc'}, function(err, res) {
  console.log(err, res);
});*/

/*var identity = web3.shh.newIdentity();
var result = web3.shh.hasIdentity(identity);
console.log(result); // true*/

/*var result2 = web3.shh.newKeyPair((error, res) => {
  console.log(error, res);
})*/


/*var shh = web3.shh;
var appName = "My silly app!";
var myName = "Gav Would";
var myIdentity = shh.newIdentity();

shh.post({
  "from": myIdentity,
  "topics": [ web3.fromAscii(appName) ],
  "payload": [ web3.fromAscii(myName), web3.fromAscii("What is your name?") ],
  "ttl": 100,
  "priority": 1000
});*/

/*var replyWatch = shh.watch({
  "topics": [ web3.fromAscii(appName), myIdentity ],
  "to": myIdentity
});*/
// could be "topic": [ web3.fromAscii(appName), null ] if we wanted to filter all such
// messages for this app, but we'd be unable to read the contents.

/*replyWatch.arrived(function(m)
{
	// new message m
	console.log("Reply from " + web3.toAscii(m.payload) + " whose address is " + m.from);
});

var broadcastWatch = shh.watch({ "topic": [ web3.fromAscii(appName) ] });
broadcastWatch.arrived(function(m)
{
  if (m.from != myIdentity)
  {
    // new message m: someone's asking for our name. Let's tell them.
    var broadcaster = web3.toAscii(m.payload).substr(0, 32);
    console.log("Broadcast from " + broadcaster + "; replying to tell them our name.");
    shh.post({
      "from": eth.key,
      "to": m.from,
      "topics": [ eth.fromAscii(appName), m.from ],
      "payload": [ eth.fromAscii(myName) ],
      "ttl": 2,
      "priority": 500
    });
  }
});*/

export default whisperProxy;
