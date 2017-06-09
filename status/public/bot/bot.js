
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
var pubKey2 = ''; //copy from gulp in api

// Fill in the codes of the airports and a departure date YYYY-MM-DD
// AMS, CDG, 2017-08-09
var getFlightList = function(origin, destination, departure, cb){

  web3.shh.newKeyPair(function(err, id){
    web3.shh.getPublicKey(id, function(err, pub){
      pubKey1 = pub;

        var filterAsync = web3.shh.subscribe({
          type: "asym",
          key: pubKey1,
          topics: [topicAnswer]
        });

        var messageSend = {
          type: "asym",
          key: '0x044fb60526fc31be147b7c462cad4cd0c6d2c80c37799c05c8480c4a20868c2284293eb5cec06ab364df740bdc8c75c6cd88a1aba7cbc1f7edb839ab0219df8007', //Public key of API
          sig: pubKey1,
          topic: topicGet, //Topic for getting flights
          powTarget: 30.01,
          powTime: 30,
          ttl: 20,
          payload: '{ "origin": "'+origin+'", "destination":"'+destination+'", "departure":"'+departure+'", "pubKey": "'+pubKey1+'" }'
        };

        //console.log(messageSend.payload);
        if (web3.shh.post(messageSend) === null){

          console.log('Message sent');

          // Do some timeout magic
          var d = new Date();
          var s = d.getTime();
          var wait = 4000; //Wait 4 seconds for response
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
            //console.log(web3.toAscii(messages[0].payload));
            var apiResponse = getJsonFromPayload(messages[0].payload);
            console.log(apiResponse);
            //localStorage.setItem("cnt", cnt);
            //return apiResponse;
          }else{
            console.log('Response took to long');
          }
        }else{
          console.log('Sending failed');
        }
    });
  });
}

function sendWhisperMsg() {
    var result = {
      err: null,
      data: null,
      messages: []
    };

    console.log('Sending to API');

    var apiCallWhisper = getFlightList('AMS', 'CDG', '2017-09-09');

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
