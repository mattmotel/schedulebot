/**
 * A Bot for Slack!
 */


/**
 * Define a function for initiating a conversation on installation
 * With custom integrations, we don't have a way to find out who installed us, so we can't message them :(
 */

function onInstallation(bot, installer) {
    if (installer) {
        bot.startPrivateConversation({user: installer}, function (err, convo) {
            if (err) {
                console.log(err);
            } else {
                convo.say('I am a bot that has just joined your team');
                convo.say('You must now /invite me to a channel so that I can be of use!');
            }
        });
    }
}


/**
 * Configure the persistence options
 */

var config = {};
// var Botkit = require('botkit'),
//     firebaseStorage = require('botkit-storage-firebase')({databaseURL: 'https://schedulebot-86f4a.firebaseio.com/'}),
//     controller = Botkit.slackbot({
//         storage: firebaseStorage
//     });


/**
 * Are being run as an app or a custom integration? The initialization will differ, depending
 */

if (process.env.TOKEN || process.env.SLACK_TOKEN) {
    //Treat this as a custom integration
    var customIntegration = require('./lib/custom_integrations');
    var token = (process.env.TOKEN) ? process.env.TOKEN : process.env.SLACK_TOKEN;
    var controller = customIntegration.configure(token, config, onInstallation);
} else if (process.env.CLIENT_ID && process.env.CLIENT_SECRET && process.env.PORT) {
    //Treat this as an app
    var app = require('./lib/apps');
    var controller = app.configure(process.env.PORT, process.env.CLIENT_ID, process.env.CLIENT_SECRET, config, onInstallation);
} else {
    console.log('Error: If this is a custom integration, please specify TOKEN in the environment. If this is an app, please specify CLIENTID, CLIENTSECRET, and PORT in the environment');
    process.exit(1);
}


/**
 * A demonstration for how to handle websocket events. In this case, just log when we have and have not
 * been disconnected from the websocket. In the future, it would be super awesome to be able to specify
 * a reconnect policy, and do reconnections automatically. In the meantime, we aren't going to attempt reconnects,
 * WHICH IS A B0RKED WAY TO HANDLE BEING DISCONNECTED. So we need to fix this.
 *
 * TODO: fixed b0rked reconnect behavior
 */
// Handle events related to the websocket connection to Slack
controller.on('rtm_open', function (bot) {
    console.log('** The RTM api just connected!');
});

controller.on('rtm_close', function (bot) {
    console.log('** The RTM api just closed');
    // you may want to attempt to re-open
});


/**
 * Core bot logic goes here!
 */
// BEGIN EDITING HERE!

controller.on('bot_channel_join', function (bot, message) {
    bot.reply(message, "Schedule bot is here!")
});


const airtable = require("airtable");

airtable.configure({
endpointUrl: "https://api.airtable.com",
apiKey: "keyeMEsu44B5rmyXQ"
});

const base = airtable.base("appbOCUXyYyVplanV");

controller.hears(
    ['Show me everything', 'airtable'],
    ['direct_mention', 'mention', 'direct_message', 'ambient'],
    function(bot,message) {
        let text = message.text;
        let reference = message.reference;
        let user = message.user;

        base("Table 1").select({
          view: 'Yes'
        }).firstPage((err, records) => {
            var airtableRecords = JSON.stringify(records);
            bot.reply(message, ' You ask for it. \n \n \n' + airtableRecords + ' ');
          if (err) {
            console.error(err);
            return;
          }

        });


    }
);

controller.hears(
    ['records?', 'show records'],
    ['direct_mention', 'mention', 'direct_message', 'ambient'],
    function(bot,message) {

        base("Table 1").select({
          view: 'Yes'
        }).firstPage((err, records) => {

          let rec = Object.values(records);

            bot.reply('' + rec  + '\n \n \n hey' );
          if (err) {
            console.error(err);
            return;
          }

        });


    }
);





controller.hears(
    ['I am working', 'I\'m working'],
    ['direct_mention', 'mention', 'direct_message', 'ambient'],
    function(bot,message) {
        let text = message.text;
        let reference = message.reference;
        let user = message.user;




        base(user).create({ User: user, Notes: text }, function(
        err,
        record
        ) {
        if (err) {
          console.error(err);
          return;
        }
        console.log(record.getId());
        });

        text = text.replace("I am", "You are");
        text = text.replace("I\'m", "You are");

        bot.reply(message, '' + text + ' \n Great! I\'ll record that');
    }
);



controller.hears(
    ['the schedule', 'working?'  , 'schedule?'],
    ['direct_mention', 'mention', 'direct_message', 'ambient'],
    function(bot,message) {
      let reference = message.reference;
      let user = message.user;
      let text = message.text;
      let random = Math.floor(Math.random() * 1000000000);
      // let user = message.user;
      // let type = message.type;  var beans = {id: 'cool', beans: ['pinto', 'garbanzo']};
        // controller.storage.save(text);



        bot.reply(message,'Hello! Here\'s everyones schedule today: \n'
        + 'https://api.microlink.io?url=https%3A%2F%2Fmattmotel.github.io%2Fschedulebot%2F&screenshot=true&meta=false&embed=screenshot.url&force&random=' + random);
    }
);



/**
 * AN example of what could be:
 * Any un-handled direct mention gets a reaction and a pat response!
 */
//controller.on('direct_message,mention,direct_mention', function (bot, message) {
//    bot.api.reactions.add({
//        timestamp: message.ts,
//        channel: message.channel,
//        name: 'robot_face',
//    }, function (err) {
//        if (err) {
//            console.log(err)
//        }
//        bot.reply(message, 'I heard you loud and clear boss.');
//    });
//});
