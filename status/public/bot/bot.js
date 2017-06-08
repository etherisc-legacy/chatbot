
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
var topicGet = '0x61965e62';
var topicAnswer = '0xd38554c7';
var topic3 = '0xc8c64923';
var topic4 = '0x4a3621bb';

var pubKey1 = '';
var pubKey2 = '0x0486d025fc71ed281163971c91cbc4d1592273d67d5c1a3b2315b6d67c666d2a8829b5ed3fa62fb50070bba94988d9dfd565b581db318711040d37c5fcb6b418ae'; //copy from gulp in api

var watchFilter = function (filter, done) {
        var messageReceived = false;
        filter.watch(function (error, message) {
            if (messageReceived)  return; // avoid double calling
            messageReceived = true; // no need to watch for the filter any more
            filter.stopWatching();
            done(error, message);
        });
};

var sendAsym = function(){

//console.log(web3.shh.getPublicKey());

  web3.shh.newKeyPair(function(err, id){
    //console.log('ID: '+id);
    web3.shh.getPublicKey(id, function(err, pub){
      pubKey1 = pub;

      //web3.shh.getPublicKey(id, function(err, pub){
        //pubKey2 = pub;

        //console.log('pubKey1: '+pubKey1);
        //console.log('pubKey2: '+pubKey2);

        var filterAsync = web3.shh.subscribe({
          type: "asym",
          key: pubKey1,
          topics: [topicAnswer]
        });

        var messageSend = {
          type: "asym",
          key: '0x04dfef76d50dfee940f5669f60243cda5c11df54ee45a559d49c14b5b4335284c78c2e127f44169517602b33af960b422fcaeefb02635b8e28502fec52d38d9c8c',
          sig: pubKey1,
          topic: topicGet,
          powTarget: 30.01,
          powTime: 30,
          ttl: 20,
          payload: '{ "origin": "AMS", "destination":"CDG", "departure":"2017-06-08", "pubKey": "'+pubKey1+'" }'
        };

        //console.log(messageSend.payload);
        if (web3.shh.post(messageSend) === null){

          console.log('Message sent');

          // Do some timeout magic
          var d = new Date();
          var s = d.getTime();
          var wait = 6000; //Wait 4 seconds for response
          var e = s+wait;
          for(i=0;i<1000000;i++){
            /*Halt script because of lack of timeout */
            d = new Date();
            if(d.getTime() > e){
              break;
            }
          }

          //Get message (API response)
          var messages = web3.shh.getFloatingMessages(filterAsync);

          if(messages.length){
            console.log(web3.toAscii(messages[0].payload));
            //var apiResponse = getJsonFromPayload(messages[0].payload);
            //console.log(apiResponse);
            //return apiResponse;
          }else{
            console.log('Response took to long');
          }
          /*for(i=0;i<10;i++){
            messages = web3.shh.getNewSubscriptionMessages(filterAsync);
            if(messages.length){
              console.log(web3.toAscii(messages[0].payload));
            }
          }*/

        }else{
          console.log('Sending failed');
        }

        /*var filterAsync = web3.shh.subscribe({
          type: "asym",
          //key: pubKey1,
          topics: [topicAnswer]
        });
        console.log('FILTERID: '+filterAsync);
        var messages = web3.shh.getFloatingMessages(filterAsync);
        console.log(web3.toAscii(messages[0].payload));*/
        /*setTimeout(function(){
          console.log(a);
        },1000);

        var fltr = web3.shh.filter({
          type: "asym",
          key: pubKey1,
          topics: [topicAnswer]
        }, function(err,msg){
          console.log(err,msg);
        }, function(err){
          console.log(err);
        });

        fltr.watch(function(err,msg){
          console.log(err, msg);
        });
        console.log('Finished');*/

      //});
    });
  });
}


/*var sendSym = function(){
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
}*/

function sendWhisperMsg() {
    var result = {
      err: null,
      data: null,
      messages: []
    };

    console.log('Sending to API');

    var apiCallWhisper = sendAsym();

    console.log(apiCallWhisper);

    //if(result.length > 1){
      //return suggestions(['a','b']);
    //}

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

var getJsonFromPayload = function(hexPayload){
  var asciiPayload = web3.toAscii(hexPayload);
  if(!isJson(asciiPayload)) return asciiPayload;
  return JSON.parse(asciiPayload);
}

var isJson = function (str) {
    try {
        return !!JSON.parse(str);
    } catch (e) {
        return false;
    }
};

function suggestions(strings) {
    var suggestions = strings.map(function(entry) {
        return status.components.touchable(
            {onPress: status.components.dispatch([status.events.SET_VALUE, entry])},
            status.components.view(
                suggestionsContainerStyle,
                [status.components.view(
                    suggestionSubContainerStyle,
                    [
                        status.components.text(
                            {style: valueStyle},
                            entry
                        )
                    ]
                )]
            )
        );
    });
    return suggestionsInScrollView(suggestions)
}

function suggestionsInScrollView(suggestions) {
    // Let's wrap those buttons in a scrollView
    var view = status.components.scrollView(suggestionsContainerStyle(suggestions.count), suggestions);
    return {markup: view}
}

function suggestionsContainerStyle(suggestionsCount) {
    return {
        marginVertical: 1,
        marginHorizontal: 0,
        keyboardShouldPersistTaps: "always",
        height: Math.min(56, (56 * suggestionsCount)),
        backgroundColor: "white",
        borderRadius: 5,
        flexGrow: 1
    };
}
var suggestionSubContainerStyle = {
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: "#0000001f"
};

var valueStyle = {
    paddingTop: 9,
    fontSize: 18,
    fontFamily: "font",
    color: "#000000de"
};
