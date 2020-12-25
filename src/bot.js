const tmi = require("tmi.js");
const moment = require("moment");
var fs = require('fs');
var curl = require('curlrequest');
const querystring = require('querystring');
var parseArgs = require('minimist')

// Dont know any better way to do this...
let prefix = ">";
let bot_start_time = moment();
var bot_uptime_text;
var duration_bot_uptime;
let _channels = ["#wanductbot", "#quinndt"]; // backup channels
let pings;
let send_eval_value = false;
let invis_char = "󠀀";

_channels = JSON.parse(fs.readFileSync('channels-to-join.json'));
pings = JSON.parse(fs.readFileSync("pings.json"))[0]

let options = {
    options: {
        debug: true
    },
    connection: {
        reconnect: true,
        secure: true
    },
    // dont open this
    identity: { 
        username: "wanductbot", 
        password: JSON.parse(fs.readFileSync("oauth.json"))[0]
    },  
    channels: _channels
};

console.log(`Channels: ${options.channels.join(", ")}`)

let client = new tmi.client(options);
// handle messages
client.on("message", onMessageHandler);
client.on("emoteonly", onEmoteonlyHandler);

function onEmoteonlyHandler (channel, enabled) {
    /* pepelaugh */
};

function onMessageHandler(channel, tags, message, self) {
    // Dont respond to messages from yourself
    if (self) return;
    let args = message.split(" ");

    if( args[0].charAt(0).toLowerCase() == prefix) {
        // commands go here.

        // Eval command to send js to chat, only I can use it (might remove this)
        if ( args[0].toLowerCase() == prefix + "eval" && tags.username.toLowerCase() == "quinndt") {
            if (message.endsWith(invis_char)) {
                message = message.slice(0, -1)
                args = message.split(" ");
            }
            try {evel_result = eval(`(() => {${args.slice(1).join(" ")}})();`)} catch (e) {
                client.say(channel, `${e}`)
                return;
            } 
            if (send_eval_value) {
                client.say(channel, `${evel_result}`)
            } 
        } else if (args[0].toLowerCase() == prefix + "eval") {
            client.say(channel, "/me Not public");
        };
        // jsontest to see how args are parsed
        if ( args[0].toLowerCase() == prefix + "jsontest" && tags.username.toLowerCase() == "quinndt") {
            parsed_args = parseArgs(args.slice(1))
            client.say(channel, JSON.stringify(parsed_args))
        };
        // Google command to link a google search with your query, because im lazy
        if ( args[0].toLowerCase() == prefix + "google") {
            if (!args[1]) {client.say(channel, "Please provide something to google :)");return;};
            google_url = querystring.escape(args.join(" ").slice(prefix.length + "google ".length))
            google_url = `https://google.com/search?q=${google_url}`
            client.say(channel, `Here is your google search: ${google_url} :)`)
        };
        // 8ball command can bring some fun to chats
        if ( args[0].toLowerCase() == prefix + "8ball") {
            if (!args[1]) {client.say(channel, "/me No question privided! ⚠ ⚠ ");return;};
            ball8_question = querystring.escape(args.join(" ").slice(prefix.length + "8ball ".length))
            curl.request({url: `https://8ball.delegator.com/magic/JSON/${ball8_question}`}, (err, responce) => {
                    if (err) {
                        client.say(channel, `/me Failed to get answer ⚠ ⚠ error: ${err}`);
                        console.log(err);
                    } else {
                        client.say(channel, `/me ${JSON.parse(responce)['magic']['answer']} :z ...`);
                    };
            });
        };
        // I always find thes interesting
        if ( args[0].toLowerCase() == prefix + "fact") {
            client.say(channel, "...")
            curl.request({url: "https://uselessfacts.jsph.pl/random.json?language=en"}, (err, data) => {
                if (err) {
                    client.say(channel, `/me Failed to get fact ⚠ ⚠ error: ${err}`)
                    console.log(err)
                } else {
                    client.say(channel, `/me ${JSON.parse(data)['text']} :z ...`)
                };
            });
        };
        // I need to finish this command, but I am putting it off because I will have to update it as a develop
        if ( args[0].toLowerCase() == prefix + "help" || args[0].toLowerCase() == prefix + "commands") {
            client.say(channel, `BroBalt Commands list: ${prefix}commands ${prefix}help ${prefix}ping ${prefix}google <query> ${prefix}fact ${prefix}8ball <question> ${prefix}bot`)
            if (tags.username.toLowerCase() == "quinndt") 
                client.say(channel, `BroBalt Your admin commands: ${prefix}eval <js> ${prefix}bot (join|part) <channel> ${prefix}set <type> <value> ${prefix}jsontest <args>`);
        };
        // bot command to tell the user about the bot
        if ( args[0].toLowerCase() == prefix + "bot" && tags.username.toLowerCase() !== "quinndt") {
            client.say(channel, "I am a bot running NodeJS. If you want me in your chat ask @QuinnDT, he'll get you hooked up. ;) Repo: https://github.com/NotNotQuinn/WanductBot-JS");
        };
        // seperate bot command to join and part channels
        if ( args[0].toLowerCase() == prefix + "bot" && tags.username.toLowerCase() == "quinndt" ) {
            switch (args[1]) {
                case "join":
                    if (!/(#|)[a-z0-9_]/gi.test(args[2])) {
                        client.say(channel, "That doesn't seem like a username... TPFufun");
                    } else {
                        _channels = _channels.concat([`${args[2]}`]);
                        fs.writeFile('channels-to-join.json', JSON.stringify(_channels), (err) => {
                            if (err) throw err;
                            client.join(`${args[2]}`)
                            client.say(channel, `I've joined the channel: [ ${args[2]} ]. monkaS 👉 ${client.channels.length + 1} channels total.`) // the channel length doesnt update in time, so I add one to it.
                        });
                    };
                    break;
                // THIS DOESNT WORK 
                case "part":
                    if (!/(#|)[a-z0-9_]/gi.test(args[2])) {
                        client.say(channel, "That doesn't seem like a username... TPFufun");
                        return;
                    } else if (!args[2] in client.channels) {
                        _channels = _channels.concat([`${args[2]}`]);
                        fs.writeFile('channels-to-join.json', JSON.stringify(_channels), (err) => {
                            if (err) throw err;
                            client.join(`${args[2]}`)
                            client.say(channel, `I've joined the channel: [ ${args[2]} ]. monkaS 👉 ${client.channels.length + 1} channels total.`) // the channel length doesnt update in time, so I add one to it.
                        });
                    };
                    break;
                case undefined:
                    client.say(channel, "You know what I am LUL");
                    return;
                default:
                    client.say(channel, "/me Invalid subcommand ⚠ ⚠");
                    
                    
            };
        };
        // not used much, used to set the prefix & eval return
        if ( args[0].toLowerCase() == prefix + "set" && tags.username.toLowerCase() == "quinndt") {
            switch (args[1]) {
                case "prefix":
                    if ( !/([\w.\/]|..)/gi.test(args[2]) )  {
                        prefix = args[2];
                        client.say(channel, `Prefix changed to [ ${args[2]} ]. :z`);
                    } else {
                        client.say(channel, `SirSad Thats not a valid prefix, sorry. (only 1 character, no letters/numbers)`);
                    }
                    break;
                case "eval_return":
                    if (args[2] == undefined) {
                        client.say(channel, "/me No value provided. ⚠ ⚠ ")
                    } else if (args[2].toLowerCase() == "true") {
                        send_eval_value = true;
                        client.say(channel, ":) eval_return set to true")
                    } else if (args[2].toLowerCase() == "false") {
                        send_eval_value = false;
                        client.say(channel, ":) eval_return set to false")
                    } else {
                        client.say(channel, `The only valid values for type "eval_return" are "true" and "false"`)
                    };
                    break;
                case undefined:
                    client.say(channel, "/me No subcommand provided. ⚠ ⚠ ");
                    break;
                default:
                    client.say(channel, "/me Invalid subcommand. ⚠ ⚠ ");
            }
        };
        if ( args[0].toLowerCase() == prefix + "echo" && tags.username.toLowerCase() === "quinndt" ) {
            client.say(channel, args.slice(1).join(" "))
        };
    };
    // "test" replies with "icles" its a little silly, but I like it
    if (args[0] === "test" && tags.username.toLowerCase() !== "turtoise" && tags.username.toLowerCase() !== "snappingbot" && tags.username.toLowerCase() != "nimbot0") {client.say(channel, "icles");};
    // theres basicaly 2 ping  commands because im lazy
    if ((args[0].toLowerCase() == ">ping" || args[0].toLowerCase() == prefix + "ping") && (tags.username.toLowerCase() !== "turtoise" && tags.username.toLowerCase() !== "snappingbot")) {
        duration_bot_uptime = moment.duration(moment().diff(bot_start_time));
        bot_uptime_text = duration_bot_uptime.seconds() + " seconds"
        pings = pings + 1;
        if (duration_bot_uptime.minutes()) {
            bot_uptime_text = duration_bot_uptime.minutes() + " minute(s) and " + bot_uptime_text
        };
        if (duration_bot_uptime.hours()) {
            bot_uptime_text = duration_bot_uptime.hours() + " hour(s), " + bot_uptime_text
        };
        if (duration_bot_uptime.days()) {
            bot_uptime_text = duration_bot_uptime.days() + " day(s), " + bot_uptime_text
        };
        client.say(channel, `${pings} Pongs! B) PowerUpR Current prefix: [ ${prefix} ]. ${client.channels.length} channels joined. Bot online for ${bot_uptime_text}.`);
        fs.writeFile('pings.json', JSON.stringify([pings]), (err) => {if (err) throw err;});
    } else /* this is because I dont want turt to spam the ping just to get the number up */ 
    if ((args[0].toLowerCase() == ">ping" || args[0].toLowerCase() == prefix + "ping") && (tags.username.toLowerCase() == "turtoise" || tags.username.toLowerCase() == "snappingbot")) {
        duration_bot_uptime = moment.duration(moment().diff(bot_start_time));
        bot_uptime_text = duration_bot_uptime.seconds() + " seconds"
        if (duration_bot_uptime.minutes()) {
            bot_uptime_text = duration_bot_uptime.minutes() + " minute(s) and " + bot_uptime_text
        };
        if (duration_bot_uptime.hours()) {
            bot_uptime_text = duration_bot_uptime.hours() + " hour(s), " + bot_uptime_text
        };
        if (duration_bot_uptime.days()) {
            bot_uptime_text = duration_bot_uptime.days() + " day(s), " + bot_uptime_text
        };
        client.say(channel, `Pong! B) PowerUpR Current prefix: [ ${prefix} ]. ${client.channels.length} channels joined. Bot online for ${bot_uptime_text}.`);
    };
};

// Connect the client to the server..
client.connect().catch(); // no idea if this .catch() actualy does anything
