status.addListener("init",
 function (params, context) {
    return {"text-message": "Hi, this is Lisa from Etherisc. How may I help you? \nDEMO: Apply for policy"};
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
    return suggestions(["Go back"]);
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
                message = "I see that you are near Schiphol Airport. Do you intend to start there? \nDEMO: Yes";
                break;
            }
            case MESSAGE.YES: {
                message = "Please select your Destination. \nDEMO: Barcelona";
                break;
            }
            case MESSAGE.DESTINATION: {
                message = "When will the flight depart? \nDEMO: Today";
                break;
            }
            case MESSAGE.DEPART_DATE: {
                message = "I found some flights for you. Please select your flight. \nDEMO: 14.50 KLM 1665";
                break;
            }
            case MESSAGE.FLIGHT: {
                message = "You selected flight 14.50 KLM 1665 from Schiphol Airport to Barcelona today. Please enter the desired premium. \nDEMO: 0.16 ETH";
                break;
            }
            case MESSAGE.PREMIUM: {
                message = "Depending on the delay, you'll get the following payouts: \n15 - 29 min  1.58 ETH\n30 - 44 min  2.37 ETH\n      45+ min  4.75 ETH\n  Cancelled  7.89 ETH. \n\nYou can alter the premium or apply for the policy now. \nDEMO: Accept";
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
                message = "How can I help you? \nDEMO: Apply for policy";
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