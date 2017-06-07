
status.command({
     name: "menu",
     title: "Start app",
     description: "Helps you use Etherisc",
     color: "#0000ff",
     params: [{
              name: "greet",
              type: status.types.TEXT,
              suggestions: sendWhisperMsg
             }]
 });

// some common vars
var topic1 = '0xdeadbeef';
var pubKey1 = '';
var pubKey2 = '0x0486d025fc71ed281163971c91cbc4d1592273d67d5c1a3b2315b6d67c666d2a8829b5ed3fa62fb50070bba94988d9dfd565b581db318711040d37c5fcb6b418ae'; //copy from gulp in api

var sendAsym = function(){
  web3.shh.newKeyPair(function(err, id){
    //console.log('ID: '+id);
    web3.shh.getPublicKey(id, function(err, pub){
      pubKey1 = pub;
      web3.shh.getPublicKey(id, function(err, pub){
        pubKey2 = pub;

        //console.log('pubKey1: '+pubKey1);
        //console.log('pubKey2: '+pubKey2);

        var messageSend = {
          type: "asym",
          key: '0x04cf1512483bd50e99dd7f43f11628c13d0b337aca9a9d2343f8b73c4c190b3c396fd536a252482c8536cc97be2144e28c7d9e892d16715d950ce4143601d63544',
          topic: topic1,
          powTarget: 2.01,
          powTime: 2,
          ttl: 20,
          payload: 'MSG FROM STATUS'
        };

        console.log(messageSend.payload);
        console.log('SEND: '+web3.shh.post(messageSend));

        /*var filterAsync = web3.shh.subscribe({
          type: "asym",
          key: pubKey2,
          topics: [topic1]
        });
        console.log('FILTERID: '+filterAsync);
        var messages = web3.shh.getFloatingMessages(filterAsync);
        console.log(web3.toAscii(messages[0].payload));*/

      });
    });
  });
}

var watchFilter = function (filter, done) {
        var messageReceived = false;
        filter.watch(function (error, message) {
            if (messageReceived)  return; // avoid double calling
            messageReceived = true; // no need to watch for the filter any more
            filter.stopWatching();
            console.log(error, message);
        });
};

var sendSym = function(){
  web3.shh.newKeyPair(function(err, id){
    console.log('ID: '+id);
    web3.shh.getPublicKey(id, function(err, pub){
      pubKey1 = pub;
      console.log('pubKey1: '+pubKey1);

      var keyId = web3.shh.generateSymmetricKey();
      console.log('keyId '+keyId);

       //var keyVal = web3.shh.getSymmetricKey(keyId);
       //console.log('keyVal '+keyVal);
       //var keyVal = web3.shh.getSymmetricKey(keyId);
       //console.log('keyVal '+keyVal);

       watchFilter(web3.shh.filter({
         type: "sym",
         key: keyId,
         topics: [topic1]
       }), function (err, message) {
           console.log(err);
      });

      var messageSend = {
        type: "sym",
        key: keyId,
        topic: topic1
      };

      console.log('SEND: '+web3.shh.post(messageSend));
    });
  });
}

function sendWhisperMsg() {
    var result = {
      err: null,
      data: null,
      messages: []
    };

    console.log('starting');

    sendAsym();

    /*if(subId){
      status.sendMessage('existing sub:'+subId.substr(0,10));
      m1 = web3.shh.getFloatingMessages(subId);
      m2 = web3.shh.getNewSubscriptionMessages(subId);
      status.sendMessage(JSON.stringify(m1));
      status.sendMessage(JSON.stringify(m2));
    }else{
      web3.shh.newKeyPair(function(err, id){
        web3.shh.getPublicKey(id, function(err, pub){
          web3.shh.subscribe({type: 'asym', minPow: 1, topics:['1'], key:pub}, function(e,a){
            status.sendMessage('subscribing');
            if (e) { status.sendMessage(e); } else { status.sendMessage(a); }
            subId = a;
            status.sendMessage('NEW sub:'+subId.substr(0,10));
            m1 = web3.shh.getFloatingMessages(subId);
            m2 = web3.shh.getNewSubscriptionMessages(subId);
            status.sendMessage(JSON.stringify(m1));
            status.sendMessage(JSON.stringify(m2));
          });
        });
      });
    }*/

    return result;
}
