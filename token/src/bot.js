const request = require('request');
const Bot = require('./lib/Bot')
const SOFA = require('sofa-js')
const Fiat = require('./lib/Fiat')

let bot = new Bot()

// ROUTING
const ProcessStepEnum = {
  ORIGIN: 1,
  DESTINATION: 2,
  DATE: 3,
  FLIGHT: 4,
  PREMIUM: 5,
  CONFIRM: 6
}

bot.onEvent = function(session, message) {
  //clearSession(session);
  switch (message.type) {
    case 'Init':
      console.log('Message type: INIT')
      welcome(session)
      break
    case 'Message':
      console.log('Message type: MESSAGE')
      onMessage(session, message)
      break
    case 'Command':
      console.log('Message type: COMMAND')
      onCommand(session, message)
      break
    case 'Payment':
      console.log('Message type: PAYMENT')
      welcome(session)
      break
    case 'PaymentRequest':
      console.log('Message type: PAYMENT REQUEST')
      welcome(session)
      break
  }
}

function onMessage(session, message) {
  const processStep = getProcessStep(session)
  console.log('VALUE IS', processStep)
  switch(processStep) {
    case ProcessStepEnum.ORIGIN:
      console.log('PROCESS STEP: ORIGIN')
      validateOrigin(session, message)
      break;
    case ProcessStepEnum.DESTINATION:
      console.log('PROCESS STEP: DESTINATION')
      validateDestination(session, message)          
      break;
    case ProcessStepEnum.DATE:
      console.log('PROCESS STEP: DATE')
      validateDate(session , message)
      break;
    case ProcessStepEnum.FLIGHT:
      console.log('PROCESS STEP: FLIGHT')
      requestPremium(session, message)
      break;
    case ProcessStepEnum.PREMIUM:
      console.log('PROCESS STEP: PREMIUM')
      validatePremium(session, message)      
      break;
    default:
      console.log('PROCESS STEP: DEFAULT')
      welcome(session)
  }
}

function onCommand(session, command) {
  console.log('COMMAND', command.content.value)
  const valueJSON = JSON.parse(command.content.value)
  console.log('VALUEJSON', valueJSON)
  switch (valueJSON.command) {
    case 'applyPolicy':
      applyPolicy(session)
      break
    case 'showPolicies':
      showPolicies(session)
      break
    case 'chooseFlight':
      saveChosenFlight(session, valueJSON.extraInfo, command.content.body)
      requestPremium(session)
      break
    case 'acceptPremium':
      applicationConfirmed(session)
      break
    case 'changePremium':
      requestNewPremium(session)
      break
    case 'cancel':
      cancel(session)
      break
    case 'test':
      test(session, command, valueJSON.extraInfo)
      break
    }
}

// STATES

function test(session, command, valueJSON) {
  //console.log(`http://${process.env.API_HOST}:${process.env.API_PORT}/getFlightList`)
}

function welcome(session) {
  sendMessageSimple(session, `Hi, this is Lisa from Etherisc.`)
  sendMessageAction(session, 'How can I help you?')
}

function applyPolicy(session) {
  console.log('FUNCTION: applyPolicy')
  setProcessStep(session, ProcessStepEnum.ORIGIN)
  sendMessageWithCancel(session, 'Please enter your origin. (IATA-Code, e.g. JFK)')
}

function isValidAirportCode(airportCode) {
  //Regex to validate whether airport code format (ABZ) is correct  
  return /^[A-Z]{3}$/.test(airportCode)
}

function validateOrigin(session, message) {
  const origin = message.body.toUpperCase()
  const hasCorrectFormat = isValidAirportCode(origin)
  if (hasCorrectFormat) {
    requestDestination(session, origin)
  } else {
    sendMessageWithCancel(session, 'Format incorrect. Please enter the IATA-code (e.g. JFK) of your origin')
  }
}

function requestDestination(session, message) {
  setProcessStep(session, ProcessStepEnum.DESTINATION)
  session.set('Origin', message)
  sendMessageWithCancel(session, 'Please enter your destination. (IATA-Code, e.g. AMS)')
}

function validateDestination(session, message) {
  const destination = message.body.toUpperCase()
  const hasCorrectFormat = isValidAirportCode(destination)
  if (hasCorrectFormat) {
    requestDate(session, destination)
  } else {
    sendMessageWithCancel(session, 'Format incorrect. Please enter the IATA-code (e.g. AMS) of your destination')  
  }
}

function requestDate(session, message) {
  setProcessStep(session, ProcessStepEnum.DATE)
  session.set('Destination', message)  
  sendMessageWithCancel(session, 'Please enter the flight date in a YYYY-MM-DD format')
}

function validateDate(session, message) {
  const dateInMilliseconds = Date.parse(message.body)
  console.log('DATE IN MILLISECONDS', dateInMilliseconds)
  if(isNaN(dateInMilliseconds) || (typeof dateInMilliseconds !== 'number')) {
    sendMessageWithCancel(session, 'Invalid date. Please enter the flight date in a YYYY-MM-DD format')
  } else if (dateInMilliseconds - Date.now() <= (24*60*60*1000)) {
    sendMessageSimple(session, 'Cannot insure flights with a departure time of within 24 hours.')
    sendMessageWithCancel(session, 'Please enter the flight date in a YYYY-MM-DD format')
  } else {
    showFlights(session, message.body)
  }
}

function showFlights(session, message) {
  session.set('Date', message)
  setProcessStep(session, ProcessStepEnum.FLIGHT)
  getFlights(session, function(flights) {
    console.log('callback')
    if(flights.length > 0) {
      sendMessageFlights(session, 'Please select your flight', flights)
    }
    else {
      sendMessageStartOver(session, 'No flights were found. Please try again')
    }
  });
}

function getFlights(session, callback) {
  console.log('GET FLIGHTS')
  const origin = session.get('Origin')
  const destination = session.get('Destination')
  const date = session.get('Date')

  const flights = [];

  request.post({
    headers: {'content-type' : 'application/x-www-form-urlencoded'},
    url: `http://78.46.104.19:3003/getFlightList`,
    body: `origin=${origin}&destination=${destination}&departure=${date}`
  }, function(error, response, body) {
    console.log('ERROR', error)
    var jsonData = JSON.parse(body);
    console.log('AMOUNT OF FLIGHTS:', jsonData.length)
    for(var i = 0 ; i < jsonData.length; i++) {
      if(jsonData[i].flightId === undefined || jsonData[i].flightId.length != 7) {
        console.log('FLIGHT ID UNDEFINED')
        continue
      }

      const flightInfo = jsonData[i].flightId + ' - ' + new Date(jsonData[i].departureTime).toTimeString();
      const flight = {
        flightId: jsonData[i].flightId,
        departureYearMonthDay: jsonData[i].departureYearMonthDay,
        departureTime: jsonData[i].departureTime,
        arrivalTime: jsonData[i].arrivalTime,
        flightInfo: flightInfo
      }
      //console.log(flight)
      flights.push(flight)
      console.log('Adding flight:' + flight.flightId)
    }
    callback(flights)
  })
}

function saveChosenFlight(session, extraInfo, flightInfo) {
  console.log('SAVE CHOSEN FLIGHT', extraInfo, flightInfo)
  session.set('FlightId', extraInfo.flightId)
  session.set('DepartureTime', extraInfo.departureTime)
  session.set('ArrivalTime', extraInfo.arrivalTime)
  session.set('DepartureYearMonthDay', extraInfo.departureYearMonthDay)
  session.set('FlightInfo', flightInfo)
}

function requestPremium(session) {
  setProcessStep(session, ProcessStepEnum.PREMIUM)
  const origin = session.get('Origin');
  const destination = session.get('Destination')
  const flightInfo = session.get('FlightInfo');
  const date = session.get('Date');
  console.log('Origin', origin, 'Destination', destination, 'flightInfo', flightInfo, 'date', date)
  const message = `You selected flight ${flightInfo} from ${origin} to ${destination} on ${date}.
  Please enter the desired premium in ETH (e.g. 0.5 or 2)` 
  sendMessageWithCancel(session, message)
}

function validatePremium(session, message) {
  const isNumber = !isNaN(parseFloat(message.body)) && isFinite(message.body);
  if(isNumber && message.body > 0) {
    requestConfirmation(session, message.body)
  } else {
    sendMessageWithCancel(session, 'Invalid premium. Please enter a premium in ETH')
  }
}

function requestConfirmation(session, message) {
  session.set('Premium', message)
  setProcessStep(session, ProcessStepEnum.CONFIRM)
  const confirmMessage =  `Depending on the delay, you will get the following payouts. You can alter the premium or apply for the policy now.
  15 - 29 mins 1.58 ETH
  30 - 44 mins 2.37 ETH
  45+ mins 4.75 ETH
  Canceled 7.98 ETH`
  sendMessagePremiumConfirm(session, confirmMessage)
}

function requestNewPremium(session) {
  setProcessStep(session, ProcessStepEnum.PREMIUM)  
  const premiumMessage = 'Please enter the desired premium'
  sendMessageWithCancel(session, premiumMessage)
}

function applicationConfirmed(session) {
  printSession(session)
  savePolicyInSession(session)
  const confirmedMessage = 'Congratulations! You have successfully applied for a FlightDelay Policy. The transaction hash is 0xdeadbeef. Have a safe flight!'
  sendMessageAction(session, confirmedMessage)
}

function savePolicyInSession(session) {
  let policies = session.get('MyPolicies')
  console.log('POLICY SESSION', policies, typeof policies)
  if(policies === undefined) {
    policies = []
  }
  const origin = session.get('Origin');
  const destination = session.get('Destination')
  const flightInfo = session.get('FlightInfo');
  const date = session.get('Date');
  const premium = session.get('Premium')
  const newPolicy = `You have a policy for flight ${flightInfo} from ${origin} to ${destination} on ${date} for ${premium} ETH!`

  policies.push(newPolicy)
  session.set('MyPolicies', policies)
}

function showPolicies(session) {
  let policies = session.get('MyPolicies')
  console.log('MY POLICIES', policies)
  if(policies === undefined || policies.length == 0) {
    sendMessageWithCancel(session, 'You have no policy yet')
  } else {
    for(var i = 0 ; i < policies.length; i++) {
      sendMessageSimple(session, policies[i])
    }
    sendMessageApplyPolicy(session, 'These are your current policies')
  }
}

function cancel(session) {
  //TODO Clear session variables
  console.log('CANCEL called')
  clearSession(session);
  sendMessageAction(session, `You canceled the apply process.`)
}

// HELPERS

function setProcessStep(session, processStep) {
  console.log('FUNCTION: setProcessStep')
  session.set('processStep', processStep)
}

function getProcessStep(session) {
  return session.get('processStep')
}

function clearSession(session) {
  //session.reset();
  session.set('processStep', null);
  session.set('Origin', null)
  session.set('Destination', null)
  session.set('Date', null)
  session.set('Premium', null)
  session.set('FlightId', null)
  session.set('DepartureTime', null)
  session.set('ArrivalTime', null)
  session.set('DepartureYearMonthDay', null)
  session.set('FlightInfo', null)
}

function printSession(session) {
  console.log('Origin', session.get('Origin'))
  console.log('Destination', session.get('Destination'))
  console.log('Date', session.get('Date'))
  console.log('ProcessStep', session.get('processStep'))
  console.log('Premium', session.get('Premium'))
  console.log('FlightId', session.get('FlightId'))
  console.log('DepartureTime', session.get('DepartureTime'))
  console.log('ArrivalTime', session.get('ArrivalTime'))
  console.log('DepartureYearMonthDay', session.get('DepartureYearMonthDay'))
  console.log('FlightInfo', session.get('FlightInfo'))
}

// MESSAGES

//Send a message without buttons
function sendMessageSimple(session, message) {
  session.reply(SOFA.Message({
    body: message,
  }))
}

function sendMessageAction(session, message) {
  const testValue = {
      "flightId": "JF9823",
      "departureYearMonthDay": "Today",
      "departureTime": "14:00",
      "arrivalTime": "18:00"
  }
  
  let controls = [
    {type: 'button', label: 'Apply for policy', value: createValueComposite('applyPolicy')},
    {type: 'button', label: 'Show my policies', value: createValueComposite('showPolicies')},
    //{type: 'button', label: 'Test', value: createValueComposite('test', testValue)},
  ]
  session.reply(SOFA.Message({
    body: message,
    controls: controls,
    showKeyboard: false,
  }))
}

function sendMessageWithCancel(session, message) {
  let controls = [
    {type: 'button', label: 'Cancel', value: createValueComposite('cancel')},
  ]
  session.reply(SOFA.Message({
    body: message,
    controls: controls,
    showKeyboard: false,
  }))
}

function sendMessageStartOver(session, message) {
  let controls = [
    {type: 'button', label: 'Start over', value: createValueComposite('applyPolicy')},
  ]
  session.reply(SOFA.Message({
    body: message,
    controls: controls,
    showKeyboard: false,
  }))
}

function sendMessageApplyPolicy(session, message) {
  let controls = [
    {type: 'button', label: 'Apply for a new policy', value: createValueComposite('applyPolicy')},
  ]
  session.reply(SOFA.Message({
    body: message,
    controls: controls,
    showKeyboard: false,
  }))
}

//TODO Create this dynamically based on the flights we get from the API
function sendMessageFlights(session, message, flights) {
  console.log('SEND MESSAGE FLIGHTS')
  const buttons = []
  for(var i = 0 ; i < flights.length; i++) {
    const buttonValue = {
      "flightId": flights[i].flightId, 
      "departureYearMonthDay": flights[i].departureYearMonthDay,
      "departureTime": flights[i].departureTime,
      "arrivalTime": flights[i].arrivalTime
    }
    const button = {type: 'button', label: flights[i].flightInfo, value: createValueComposite('chooseFlight', buttonValue)}
    buttons.push(button)
  }
  console.log('CONTROLS', buttons)
  let controls = [
    {type: 'group', label: 'View flights', controls: buttons},
    {type: 'button', label: 'Cancel', value: createValueComposite('cancel')},
  ]
  session.reply(SOFA.Message({
    body: message,
    controls: controls,
    showKeyboard: false,
  }))
}

function sendMessagePremiumConfirm(session, message) {
  let controls = [
    {type: 'button', label: 'Change premium', value: createValueComposite('changePremium')},
    {type: 'button', label: 'Cancel', value: createValueComposite('cancel')},
    {type: 'button', label: 'Accept policy', value: createValueComposite('acceptPremium')},    
  ]
  session.reply(SOFA.Message({
    body: message,
    controls: controls,
    showKeyboard: false,
  }))
}

function createValueComposite(value, extraInfo) {
  if(extraInfo === undefined) {
    extraInfo = {}
  }
  return `{"command": "${value}", "extraInfo": ${JSON.stringify(extraInfo)}}`
}