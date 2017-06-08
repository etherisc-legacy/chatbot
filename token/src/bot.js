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
      test(session)
      break
    }
}

// STATES

function test(session) {
  //TODO call API
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
  console.log('MESSAGE', message)
  const hasCorrectFormat = isValidAirportCode(message.body)
  if (hasCorrectFormat) {
    requestDestination(session, message.body)
  } else {
    sendMessageWithCancel(session, 'Format incorrect. Please enter the IATA-code (e.g. JFK) of your origin')
  }
}

function requestDestination(session, message) {
  session.set('Origin', message)
  setProcessStep(session, ProcessStepEnum.DESTINATION)
  sendMessageWithCancel(session, 'Please enter your destination. (IATA-Code, e.g. JFK)')
}

function validateDestination(session, message) {
  console.log('MESSAGE', message)
  const hasCorrectFormat = isValidAirportCode(message.body)
  if (hasCorrectFormat) {
    requestDate(session, message.body)
  } else {
    sendMessageWithCancel(session, 'Format incorrect. Please enter the IATA-code (e.g. JFK) of your destination')  
  }
}

function requestDate(session, message) {
  session.set('Destination', message)
  setProcessStep(session, ProcessStepEnum.DATE)
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
  sendMessageFlights(session, 'Please select your flight')
  //TODO DO AN API CALL
}

function saveChosenFlight(session, flightId, flightInfo) {
  console.log('SAVE CHOSEN FLIGHT', flightId, flightInfo)
  session.set('FlightId', flightId)
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
  const confirmMessage = `Depending on the delay, you will get the following payouts.
                          You can alter the premium or apply for the policy now.
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
  const confirmedMessage = 'Congratulations! You have successfully applied for a FlightDelay Policy. The transaction hash is 0xdeadbeef'
  sendMessageAction(session, confirmedMessage)
}

function showPolicies(session) {
  sendMessageWithCancel(session, 'You have no policy yet')
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
  session.set('processStep', null);
}

// MESSAGES

//Send a message without buttons
function sendMessageSimple(session, message) {
  session.reply(SOFA.Message({
    body: message,
  }))
}

function sendMessageAction(session, message) {
  let controls = [
    {type: 'button', label: 'Apply for policy', value: createValueComposite('applyPolicy', '')},
    {type: 'button', label: 'Show my policies', value: createValueComposite('showPolicies', '')},
    {type: 'button', label: 'Test', value: createValueComposite('test', 'flowers')},
  ]
  session.reply(SOFA.Message({
    body: message,
    controls: controls,
    showKeyboard: false,
  }))
}

function sendMessageWithCancel(session, message) {
  let controls = [
    {type: 'button', label: 'Cancel', value: createValueComposite('cancel', '')},
  ]
  session.reply(SOFA.Message({
    body: message,
    controls: controls,
    showKeyboard: false,
  }))
}

//TODO Create this dynamically based on the flights we get from the API
function sendMessageFlights(session, message) {
  let controls = [
    {type: 'group', label: 'View flights', controls: [
      {type: 'button', label: '09:30 - Vueling VY4567', value: createValueComposite('chooseFlight', 'VY4567')},
      {type: 'button', label: '12:30 - Transavia TK3439', value: createValueComposite('chooseFlight', 'TK3439')},
      {type: 'button', label: '15:00 - KLM KM9980', value: createValueComposite('chooseFlight', 'KM9980')}
    ]},
    {type: 'button', label: 'Cancel', value: createValueComposite('cancel', '')},
  ]
  session.reply(SOFA.Message({
    body: message,
    controls: controls,
    showKeyboard: false,
  }))
}

function sendMessagePremiumConfirm(session, message) {
  let controls = [
    {type: 'button', label: 'Accept', value: createValueComposite('acceptPremium', '')},
    {type: 'button', label: 'Change premium', value: createValueComposite('changePremium', '')},
  ]
  session.reply(SOFA.Message({
    body: message,
    controls: controls,
    showKeyboard: false,
  }))
}

function createValueComposite(value, extraInfo) {
  return `{"command": "${value}", "extraInfo": "${extraInfo}"}`
}