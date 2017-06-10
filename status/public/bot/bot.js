var isDemoMode = true;

status.addListener("init",
 function (params, context) {
    return {"text-message": "Hi, this is Lisa from Etherisc. How may I help you?" + ((isDemoMode) ? "\nDEMO: Apply for policy" : "")};
});

status.command({
     name: "start",
     title: "Start app",
     description: "Helps you use Etherisc",
     color: "#0000ff",
     params: [{
              name: "greet",
              type: status.types.TEXT,
              suggestions: startSuggestions
             }]
 });

 status.command({
     name: "cancel",
     title: "Cancel",
     description: "Cancel the current operation",
     color: "#0000ff",
     params: [{
              name: "cancel",
              type: status.types.TEXT,
              suggestions: cancelSuggestions
             }]
 });

 status.command({
     name: "back",
     title: "Back",
     description: "Takes you back",
     color: "#0000ff",
     params: [{
              name: "back",
              type: status.types.TEXT,
              suggestions: backSuggestions
             }]
 });

function startSuggestions() {
    return suggestions(["Apply for policy", "Show my policies"]);
}

function cancelSuggestions() {
    return suggestions(["Cancel"]);
}

function backSuggestions() {
    return suggestions(["Go Back"]);
}

var MESSAGE  = {
    APPLY  : "Apply for policy",
    YES  : "Yes",
    CANCEL : "Cancel",
    BACK   : "Go Back",
    DESTINATION : "Barcelona",
    DEPART_DATE : "Today",
    FLIGHT : "14.50 KLM 1665",
    PREMIUM : "0.16 ETH",
    ACCEPT : "Accept"
};

status.addListener("on-message-send", function (params, context) {
    var result = {
            err: null,
            data: null,
            messages: []
        };

    try {
        var message = "";
        switch(params.message) {
            case MESSAGE.APPLY: {
                message = "I see that you are near Schiphol Airport. Do you intend to start there?" + ((isDemoMode) ? "\nDEMO: Yes" : "");
                break;
            }
            case MESSAGE.YES: {
                message = "Please select your Destination." + ((isDemoMode) ? "\nDEMO: Barcelona" : "");
                break;
            }
            case MESSAGE.DESTINATION: {
                message = "When will the flight depart?" + ((isDemoMode) ? "\nDEMO: Today" : "");
                break;
            }
            case MESSAGE.DEPART_DATE: {
                message = "I found some flights for you. Please select your flight." + ((isDemoMode) ? "\nDEMO: 14.50 KLM 1665" : "");
                break;
            }
            case MESSAGE.FLIGHT: {
                message = "You selected flight 14.50 KLM 1665 from Schiphol Airport to Barcelona today. Please enter the desired premium." + ((isDemoMode) ? "\nDEMO: 0.16 ETH" : "");
                break;
            }
            case MESSAGE.PREMIUM: {
                message = "Depending on the delay, you'll get the following payouts: \n15 - 29 min  1.58 ETH\n30 - 44 min  2.37 ETH\n      45+ min  4.75 ETH\n  Cancelled  7.89 ETH. \n\nYou can alter the premium or apply for the policy now." + ((isDemoMode) ? "\nDEMO: Accept" : "");
                break;
            }
            case MESSAGE.ACCEPT: {
                message = "Congrats! You have successfully applied for a FlightDelay Policy. The Tx Hash is 0xdeadbeef...";
                break;
            }
            case MESSAGE.CANCEL:
                message = "You canceled the transaction. Hope to see you again soon!";
                break;
            case MESSAGE.BACK:
                message = "How can I help you?" + ((isDemoMode) ? "\nDEMO: Apply for policy" : "");
                break;
            default: {
                message = "Sorry, I'm not sure I understand.";
            }
        }
    } catch (e) {
        result.err = e;
    }

    result["text-message"] = message
    return result;
});


/** Suggestion helpers */

status.command({
     name: "1flights",
     title: "Get flights",
     description: "Get flights via whisper",
     color: "#0000ff",
     params: [{
              name: "flights1",
              type: status.types.TEXT,
              suggestions: sendWhisperMsg
             }]
 });

// some common vars
var topicGet = '0x61965e62';
var topicAnswer = '0xd38554c7';
var pubKey1 = '';
var pubKeyBot = '0x042f3c78c8964ac8893d1df0bd053b1bd677ca56b7f7d6d14aad94c683e38c4258ca585592a5c4cb400f6a72a0b562ff92d79c62222fbb0b2bb28df86e3080c91e';

// Fill in the codes of the airports and a departure date YYYY-MM-DD
// AMS, CDG, 2017-08-09
var getFlightList = function(origin, destination, departure, cb){

  //var flightHash = web3.sha3(origin+'|'+destination+'|'+departure);
  //console.log(flightHash);

  //var flightData = localStorage.get(flightHash);
  //console.log(flightData);

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
          key: pubKeyBot, //Public key of API
          sig: pubKey1,
          topic: topicGet, //Topic for getting flights
          powTarget: 2.01,
          powTime: 2,
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
            //nsole.log(apiResponse);
            //localStorage.setItem("cnt", cnt);
            cb(apiResponse);
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

    var apiCallWhisper = getFlightList('AMS', 'CDG', '2017-09-11', function(resultCall){
      //resultCall[0]);
      return suggestions(['a','b']);
    });


    //console.log(web3.net.peerCount);

    //if(result.length > 1){
      //
    //}

    return apiCallWhisper;
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
