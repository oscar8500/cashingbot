const Bot = require('./lib/Bot')
const SOFA = require('sofa-js')
const Fiat = require('./lib/Fiat')

let bot = new Bot()

// ROUTING

bot.onEvent = function (session, message) {
    switch (message.type) {
        case 'Init':
            welcome(session)
            break
        case 'Message':
            onMessage(session, message)
            break
        case 'Command':
            onCommand(session, message)
            break
        case 'Payment':
            onPayment(session, message)
            break
        case 'PaymentRequest':
            noPayments(session)
            break
    }
}

function onMessage(session, message) {
    welcome(session)
}

function onCommand(session, command) {
    switch (command.content.value) {
        case 'ping':
            pong(session)
            break
        case 'count':
            count(session)
            break
        case 'donate':
            donate(session)
            break
        case 'help':
            help(session)
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
function noPayments(session) {
    sendMessage(session, `Not accepting requests`)
}

function welcome(session) {

    var wmsj='';
    var nu=parseInt(Math.floor(Math.round(100*(Math.random())))+1);

    if(nu<30){
        wmsj='Luis';
    }else if(nu>=30&&nu<60){
        wmsj='Oscar';
    }else{
        wmsj='Carlos';
    }

    sendMessage(session, 'Hello, Im '+wmsj+', I will guide you')


}

function pong(session) {
    sendMessage(session, `Pong`)
}

// example of how to store state on each user
function count(session) {
    let count = (session.get('count') || 0) + 1
    session.set('count', count)
    sendMessage(session, `${count}`)
}

function donate(session) {
    // request $1 USD at current exchange rates
    Fiat.fetch().then((toEth) => {
        session.requestEth(toEth.USD(2))
    })
}

function help(session) {
    // request $1 USD at current exchange rates
    Fiat.fetch().then((toEth) => {
        session.requestEth(toEth.USD(20))
    })
}
// HELPERS

function sendMessage(session, message) {
    let controls = [
        {type: 'button', label: 'Ping', value: 'ping'},
        {type: 'button', label: 'Count', value: 'count'},
        {type: 'button', label: 'Donate', value: 'donate'},
        {type: 'button', label: 'Request Help', value: 'help'}
    ]
    session.reply(SOFA.Message({
        body: message,
        controls: controls,
        showKeyboard: false,
    }))
}
