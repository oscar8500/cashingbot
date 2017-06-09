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

    if(message>0){

    var apu=3;
    var apuAcumUsr=(session.get('apuAcumUsr') || 0);
    var apuAcumOng=(session.get('apuAcumOng') || 0);

    var numRand=parseInt(Math.floor(Math.round(10000*(Math.random())))+1);
    sendMessage(session, 'Your Number is: '+numRand);

    console.log("Apuesta  "+apu);
    console.log("Random  "+numRand);
    console.log("Acumulado Usuario Antes  "+apuAcumUsr);
    console.log("Acumulado ONG Antes  "+apuAcumOng);

    if(numRand<=2000){

        //Gana Ong
        sendMessage(session, 'Gana Ong: '+apu);
        session.set('apuAcumOng',(session.get('apuAcumOng') || 0)+apu);

    }else if(numRand>=2001 && numRand<=4000){

        //Gana Usr x2
        sendMessage(session, 'Valor Ganado: '+(apu*2));
        session.set('apuAcumUsr',(session.get('apuAcumUsr') || 0)+(apu*2));

    }else if(numRand>=4001 && numRand<=6000){

        //Mitad Usuario / Mitad ONG
        sendMessage(session, 'Gana Ong: '+(apu/2));
        sendMessage(session, 'Valor Ganado: '+(apu/2));
        session.set('apuAcumUsr',(session.get('apuAcumUsr') || 0)+(apu/2));
        session.set('apuAcumOng',(session.get('apuAcumOng') || 0)+(apu/2));


    }else if(numRand>=6001 && numRand<=8000){

        //Gana Ong
        sendMessage(session, 'Gana Ong: '+apu);
        session.set('apuAcumOng',(session.get('apuAcumOng') || 0)+apu);

    }else if(numRand>=8001 && numRand<=10000){

        //Gana Usr x3
        sendMessage(session, 'Valor Ganado: '+(apu*3));
        session.set('apuAcumUsr',(session.get('apuAcumUsr') || 0)+(apu*3));

    }

    console.log("Acumulado Usuario Despues  "+(session.get('apuAcumUsr') || 0));
    console.log("Acumulado ONG Despues  "+(session.get('apuAcumOng') || 0));

    }else{
        sendMessage(session, 'Invalid Bet');
    }
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

    sendMessage(session, 'Hello, Im '+wmsj+', I will guide you');
    sendMessage(session, 'Game rules, We will generate a random number');

    sendMessage(session, '0000 -  2000  -   ONG Win');
    sendMessage(session, '2001 -  4000  -   You Win x 2');
    sendMessage(session, '4001 -  6000  -   You win half / ONG win half');
    sendMessage(session, '6001 -  8000  -   ONG Win');
    sendMessage(session, '8001 -10000  -   You Win x 3');

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
