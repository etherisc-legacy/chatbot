require('dotenv').config();

var Web3 = require('web3');
var web3 = new Web3();
console.log('ATTEMPT CONNECT', `http://${process.env.WEB3_RPC_HOST}:${process.env.WEB3_RPC_PORT}`);
web3.setProvider(new web3.providers.HttpProvider(`http://${process.env.WEB3_RPC_HOST}:${process.env.WEB3_RPC_PORT}`));

const whisperProxy = {};

whisperProxy.id = 'ff5f320449f4eef7010c12578ad257e4aa78284176296a9e5e0433e471727f65';
whisperProxy.pubKey = '0x0432d418b527d221dfc19a0dae18b63e8781b57c7d0a35ba0120f0e18c00fabc37c7f95f6eeba031c54f4e39a10fc42e3dd541a9189cf32aa246c5563805408f62';

web3.shh.newKeyPair(function(err, id){
  whisperProxy.id = id;
  web3.shh.getPublicKey(id, function(err, pub){
    whisperProxy.pubKey = pub;
    var topic1 = '0xdeadbeef';

    var filterAsync = web3.shh.subscribe({
      type: "asym",
      key: whisperProxy.id,
      topics: [topic1]
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
          console.log(web3.toAscii(messages[0].payload));
        }else{
          console.log('No new messages');
        }
    },5000);

  });
});
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
