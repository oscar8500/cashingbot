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

    session.reply(SOFA.Message({
        body: "Hello, Im " + wmsj + ", and Im ready to bet you can help an NGO :). Wanna bet?",
        controls: [
            {type: "button", label: "Yes", value: "yes"},
            {type: "button", label: "No, I want to know more", value: "no"},
            {type: "button", label: "Rules", value: "rules"},
        ]
    }));


}

function onMessage(session, message) {

    session.reply(SOFA.Message({
        body: "Hello, Wanna bet?",
        controls: [
            {type: "button", label: "Yes", value: "yes"},
            {type: "button", label: "No, I want to know more", value: "no"},
            {type: "button", label: "Rules", value: "rules"},
        ]
    }));
}

function onCommand(session, command) {
    switch (command.content.value) {

        case 'yes':
            yes(session)
            break

        case 'no':
            no(session)
            break

        case 'rules':
            rules(session)
            break

        case 'getBetAmount':
            getBetAmount(session)
            break
        case 'bet1':
            bet(session,1,'manual')
            break
        case 'bet2':
            bet(session,2,'manual')
            break
        case 'bet3':
            bet(session,3,'manual')
            break
        case 'bet5':
            bet(session,5,'manual')
            break
        case 'bet10':
            bet(session,10,'manual')
            break

        case 'randBet':
            randBet(session)
            break

        case 'goBack':
            welcome(session)
            break
    }
}

function yes(session) {
    session.reply(SOFA.Message({
        body: "That's the attitude. So first thing first. Choose the amount you want to bet",
        controls: [
            {type: "button", label: "Bet amount", value: "getBetAmount"},
            {type: "button", label: "Random Bet (1-10)", value: "randBet"}
        ]
    }));
}

function no(session) {

    session.reply(SOFA.Message({
        body:"What? Look, here's the deal. Worst case scenrio you help a NGO. If no, you get some Ether. So What do you say?",
        controls: [
            {type: "button", label: "Ok Ok Let's help some NGOs", value: "yes"},
            {type: "button", label: "No.. I Lost my interest", value: "-1"},
        ]
    }));
}

function rules(session) {
    session.reply('Game rules, We will generate a random number');
    session.reply('0000 -  2000  -   NGO Win');
    session.reply('2001 -  4000  -   You Win x 2');
    session.reply('4001 -  6000  -   You win half / NGO win half');
    session.reply('6001 -  8000  -   NGO Win');
    session.reply('8001 -10000  -   You Win x 3');

    session.reply(SOFA.Message({
        body: "Wanna bet?",
        controls: [
            {type: "button", label: "Yes", value: "yes"},
            {type: "button", label: "No, I want to know more", value: "no"},
        ]
    }));
}

function getBetAmount(session) {

    session.reply(SOFA.Message({
        body: "Select the Bet Amount",
        controls: [
            {type: "button", label: "1", value: "bet1"},
            {type: "button", label: "2", value: "bet2"},
            {type: "button", label: "3", value: "bet3"},
            {type: "button", label: "5", value: "bet5"},
            {type: "button", label: "10", value: "bet10"}
        ]
    }));

}

function randBet(session) {
    var rbet=parseInt(Math.floor(Math.round(10*(Math.random())))+1);
    bet(session,rbet,'auto');
}


function bet(session,apu,tipoApu) {

    //hacer la validacion de si la persona tiene dicho dinero en cuenta
    session.requestEth(apu, "For Bet");

     var apuAcumUsr=(session.get('apuAcumUsr') || 0);
     var apuAcumNgo=(session.get('apuAcumNgo') || 0);

     var numRand=parseInt(Math.floor(Math.round(10000*(Math.random())))+1);
     session.reply('Your Bet :'+apu+' . . . Your Number is: '+numRand);

     console.log("Apuesta  "+apu);
     console.log("Random  "+numRand);
     console.log("Acumulado Usuario Antes  "+apuAcumUsr);
     console.log("Acumulado NGO Antes  "+apuAcumNgo);

     if(numRand<=2000){

     //Gana Ngo
     session.reply('Ngo wins: '+apu);
     session.set('apuAcumNgo',(session.get('apuAcumNgo') || 0)+apu);

     }else if(numRand>=2001 && numRand<=4000){

     //Gana Usr x2
     session.reply('You win: '+(apu*2));
     session.set('apuAcumUsr',(session.get('apuAcumUsr') || 0)+(apu*2));


         session.sendEth(apu*2, function(session, error, result) {
             console.log(error)
         });


     }else if(numRand>=4001 && numRand<=6000){

     //Mitad Usuario / Mitad NGO
     session.reply('Ngo wins: '+(apu/2));
     session.reply('You win: '+(apu/2));
     session.set('apuAcumUsr',(session.get('apuAcumUsr') || 0)+(apu/2));
     session.set('apuAcumNgo',(session.get('apuAcumNgo') || 0)+(apu/2));


         session.sendEth(apu/2, function(session, error, result) {
             console.log(error)
         });


     }else if(numRand>=6001 && numRand<=8000){

     //Gana Ngo
     session.reply('Ngo wins: '+apu);
     session.set('apuAcumNgo',(session.get('apuAcumNgo') || 0)+apu);

     }else if(numRand>=8001 && numRand<=10000){

     //Gana Usr x3
     session.reply('You win: '+(apu*3));
     session.set('apuAcumUsr',(session.get('apuAcumUsr') || 0)+(apu*3));


         session.sendEth(apu*3, function(session, error, result) {
             console.log(error)
         });


     }

     console.log("Acumulado Usuario Despues  "+(session.get('apuAcumUsr') || 0));
     console.log("Acumulado NGO Despues  "+(session.get('apuAcumNgo') || 0));


     if(tipoApu=='auto'){
         session.reply(SOFA.Message({
             body: "Are you having fun?",
             controls: [
                 {type: "button", label: "Continue", value: "randBet"},
                 {type: "button", label: "Go Back", value: "goBack"}
             ]
         }));
     }else{
         session.reply(SOFA.Message({
             body: "Select the Bet Amount",
             controls: [
                 {type: "button", label: "1", value: "bet1"},
                 {type: "button", label: "2", value: "bet2"},
                 {type: "button", label: "3", value: "bet3"},
                 {type: "button", label: "5", value: "bet5"},
                 {type: "button", label: "10", value: "bet10"},
                 {type: "button", label: "Go Back", value: "goBack"}
             ]
         }));
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

function noPayments(session) {
    sendMessage(session, `Not accepting requests`)
}
