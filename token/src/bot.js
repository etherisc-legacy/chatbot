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
      onPayment(session, message)
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
      requestDestination(session, message)
      break;
    case ProcessStepEnum.DESTINATION:
      console.log('PROCESS STEP: DESTINATION')
      requestDate(session, message)          
      break;
    case ProcessStepEnum.DATE:
      console.log('PROCESS STEP: DATE')
      showFlights(session , message)
      break;
    case ProcessStepEnum.FLIGHT:
      console.log('PROCESS STEP: FLIGHT')
      requestPremium(session, message)
      break;
    case ProcessStepEnum.PREMIUM:
      console.log('PROCESS STEP: PREMIUM')
      requestConfirmation(session, message)
      break;
    default:
      console.log('PROCESS STEP: DEFAULT')
      welcome(session)
  }
}

function onCommand(session, command) {
  console.log('COMMAND', command.content.value)
  switch (command.content.value) {
    case 'applyPolicy':
      applyPolicy(session)
      break
    case 'showPolicies':
      showPolicies(session)
      break
    case 'cancel':
      cancel(session)
      break
    case 'chooseFlight':
      saveChosenFlight(session, command)
      requestPremium(session)
      break
    case 'acceptPremium':
      applicationConfirmed(session)
      break
    case 'changePremium':
      requestNewPremium(session)
      break
    }
}

function onPayment(session, message) {
  if (message.fromAddress == session.config.paymentAddress) {
    // handle payments sent by the bot
    if (message.status == 'confirmed') {
      // perform special action once the payment has been confirmed
      // on the network
    } else if (message.status == 'error') {
      // oops, something went wrong with a payment we tried to send!
    }
  } else {
    // handle payments sent to the bot
    if (message.status == 'unconfirmed') {
      // payment has been sent to the ethereum network, but is not yet confirmed
      sendMessage(session, `Thanks for the payment! 🙏`);
    } else if (message.status == 'confirmed') {
      // handle when the payment is actually confirmed!
    } else if (message.status == 'error') {
      sendMessage(session, `There was an error with your payment!🚫`);
    }
  }
}

// STATES

function welcome(session) {
  sendMessageSimple(session, `Hi, this is Lisa from Etherisc.`)
  sendMessageAction(session, 'How can I help you?')
}

function applyPolicy(session) {
  console.log('FUNCTION: applyPolicy')
  setProcessStep(session, ProcessStepEnum.ORIGIN)
  sendMessageWithCancel(session, 'Please enter your origin.')
}

function requestDestination(session, message) {
  session.set('Origin', message.content.body)
  setProcessStep(session, ProcessStepEnum.DESTINATION)
  sendMessageWithCancel(session, 'Please enter your destination.')
}

function requestDate(session, message) {
  session.set('Destination', message.content.body)
  setProcessStep(session, ProcessStepEnum.DATE)
  sendMessageWithCancel(session, 'Please enter the flight date in a DD/MM/YY format')
  //TODO ask for date
}

function showFlights(session, message) {
  session.set('Date', message.content.body)
  setProcessStep(session, ProcessStepEnum.FLIGHT)
  sendMessageFlights(session, 'Please select your flight')
  //TODO show flights
}

function saveChosenFlight(session, command) {
  //console.log('COMMAND DATA', command)
  const flightId = command.content.body
  console.log('FLIGHT ID', flightId)
  session.set('Flight', flightId)
}

function requestPremium(session) {
  setProcessStep(session, ProcessStepEnum.PREMIUM)
  const origin = session.get('Origin');
  const destination = session.get('Destination')
  const flightId = session.get('Flight');
  const date = session.get('Date');
  console.log('Origin', origin, 'Destination', destination, 'flightId', flightId, 'date', date)
  const message = `You selected flight ${flightId} from ${origin} to ${destination} on ${date}.
                    Please enter the desired premium`
  sendMessageWithCancel(session, message)
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
  clearSession();
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
    {type: 'button', label: 'Apply for policy', value: 'applyPolicy'},
    {type: 'button', label: 'Show my policies', value: 'showPolicies'},
  ]
  session.reply(SOFA.Message({
    body: message,
    controls: controls,
    showKeyboard: false,
  }))
}

function sendMessageWithCancel(session, message) {
  let controls = [
    {type: 'button', label: 'Cancel', value: 'cancel'},
  ]
  session.reply(SOFA.Message({
    body: message,
    controls: controls,
    showKeyboard: false,
  }))
}

function sendMessageFlights(session, message) {
  let controls = [
    {type: 'group', label: 'View flights', controls: [
      {type: 'button', label: '09:30 - Vueling VY4567', value: 'chooseFlight'},
      {type: 'button', label: '12:30 - Transavia TK3439', value: 'chooseFlight'},
      {type: 'button', label: '15:00 - KLM KM9980', value: 'chooseFlight'}
    ]},
  ]
  session.reply(SOFA.Message({
    body: message,
    controls: controls,
    showKeyboard: false,
  }))
}

function sendMessagePremiumConfirm(session, message) {
  let controls = [
    {type: 'button', label: 'Accept', value: 'acceptPremium'},
    {type: 'button', label: 'Change premium', value: 'changePremium'},
  ]
  session.reply(SOFA.Message({
    body: message,
    controls: controls,
    showKeyboard: false,
  }))
}

function sendMessage(session, message) {
  let controls = [
    {type: 'button', label: 'Ping', value: 'ping'},
    {type: 'button', label: 'Count', value: 'count'},
    {type: 'button', label: 'Donate', value: 'donate'}
  ]
  session.reply(SOFA.Message({
    body: message,
    controls: controls,
    showKeyboard: false,
  }))
}
