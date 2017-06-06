status.addListener("init",
 function (params, context) {
    return {"text-message": "Hi, this is Lisa from Etherisc. How may I help you?"};
});

status.command({
     name: "start",
     title: "Start app",
     description: "Helps you use Etherisc",
     color: "#0000ff",
     params: [{
              name: "greet",
              type: status.types.TEXT,
              suggestions: helloSuggestions
             }]
 });

 status.command({
     name: "apply",
     title: "Apply for a policy",
     description: "Options for applying",
     color: "#0000ff",
     params: [{
              name: "greet",
              type: status.types.TEXT,
              suggestions: applySuggestions
             }]
 });

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

function helloSuggestions() {
    return suggestions(["Apply for policy", "Show my policies"]);
}

function applySuggestions() {
    return suggestions(["Please select your origin."]);
}

status.addListener("on-message-send", function (params, context) {
    var result = {
            err: null,
            data: null,
            messages: []
        };

    try {
        if (params.message == "Apply for policy") {
            result["text-message"] = "Please select your origin.";
        } else {
            result["text-message"] = "You're amazing, master!";
        }
    } catch (e) {
        result.err = e;
    }

    return result;
});

/*status.command({
     name: "hello",
     title: "HelloBot",
     description: "Helps you say hello",
     color: "#CCCCCC",
     preview: function (params) {
             var text = status.components.text(
                 {
                     style: {
                         marginTop: 5,
                         marginHorizontal: 0,
                         fontSize: 14,
                         fontFamily: "font",
                         color: "black"
                     }
                 }, "Hello from the other side!");
             return {markup: status.components.view({}, [text])};
         }
 });
*/


/** Helpers */

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
    // Let's wrap those two touchable buttons in a scrollView
    var view = status.components.scrollView(
        suggestionsContainerStyle(2),
        suggestions
    );
    return {markup: view}
}