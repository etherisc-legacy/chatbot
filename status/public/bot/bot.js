status.addListener("init",
 function (params, context) {
    return {"text-message": "Hi, this is Lisa from Etherisc. How may I help you?"};
});
status.addListener("on-message-input-change",
 function (params, context) {
    return helloSuggestions;
});
status.command({
     name: "menu",
     title: "Start app",
     description: "Helps you use Etherisc",
     color: "#0000ff",
     params: [{
              name: "greet",
              type: status.types.TEXT,
              suggestions: helloSuggestions
             }]
 })

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

var timert = false;

function helloSuggestions() {

    /*web3.shh.newKeyPair(function(err, id){
      web3.shh.getPublicKey(id, function(err, pub){
        status.sendMessage(pub);
      });
      status.sendMessage(id);//;web3.version.api);
    });*/
    if(timert){
      web3.shh.getMessages(a, function(err,b){
        if(!err){
          status.sendMessage(b);
        }
      });
    }else{

    web3.shh.newKeyPair(function(err, id){
      web3.shh.getPublicKey(id, function(err, pub){
        web3.shh.subscribe({type: 'asym', pow: 2, topics:['0x00000000'], key:pub}, function(e,a){
          status.sendMessage('subscribing');
          if (e) { status.sendMessage(e); } else { status.sendMessage(a); }
          timert = a;

        });
      });
    });
  }

    //f = shh.subscribe({type: 'asym', key: id})
    /*var filter = web3.shh.filter({topics:['0x68656c6c6f207768697370657220776f726c6421']});
    // watch for changes
    filter.watch(function(error, result){
      if (error) {status.sendMessage(error);}
        status.sendMessage(result);
    });*/

    var suggestions = [{name:"Apply for policy", msg:"/apply"}, {name:"Show my policies", msg:"/listpolicies"}, {name:"Show Dapp", msg:"@browse http://192.168.178.12:3000"}].map(function(entry) {
        return status.components.touchable(
            {onPress: status.components.dispatch([status.events.SET_VALUE, entry.msg])},
            status.components.view(
                suggestionsContainerStyle,
                [status.components.view(
                    suggestionSubContainerStyle,
                    [
                        status.components.text(
                            {style: valueStyle},
                            entry.name
                        )
                    ]
                )]
            )
        );
    });

    // Let's wrap those two touchable buttons in a scrollView
    var view = status.components.scrollView(
        suggestionsContainerStyle(2),
        suggestions
    );

    // Give back the whole thing inside an object.
    return {markup: view};
}

status.addListener("on-message-send", function (params, context) {
    var result = {
            err: null,
            data: null,
            messages: []
        };

    try {
        result["text-message"] = "You're amazing, master!";
    } catch (e) {
        result.err = e;
    }

    return result;
});
