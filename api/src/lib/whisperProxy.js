require('dotenv').config();

var Web3 = require('web3');
var web3 = new Web3();
console.log('ATTEMPT CONNECT', `http://${process.env.WEB3_RPC_HOST}:${process.env.WEB3_RPC_PORT}`);
web3.setProvider(new web3.providers.HttpProvider(`http://${process.env.WEB3_RPC_HOST}:${process.env.WEB3_RPC_PORT}`));

const whisperProxy = {};

var version = web3.version;
console.log(web3.shh);

web3.shh.newKeyPair(function(err, id){
  web3.shh.getPublicKey(id, function(err, pub){
    console.log(pub);
    //web3.shh.post({ttl: '7', topic: '0x07678231', powTarget: 2.01, powTime: 2, payload: '0x68656c6c6f', key: '0x045823b9d65726cf83b8bfdb504d56142faccd89c46fbc3094e4ec47e3820f12758c0611aa611f68b7dfe88c90a4232e1a34d747169b26cd9284357b7869b06b0f'});
    //var identity = web3.shh.newIdentity();
    var topic = '0x00000000';
    var payload = 'hello whisper world!';

    var message = {
      type:'asym',
      from: pub,
      topics: [topic],
      payload: payload,
      ttl: 100,
      powTime:2,
      powTarget:2,
      key: pub,
    };

    web3.shh.post(message);
  });
  console.log(id);//;web3.version.api);
});

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
