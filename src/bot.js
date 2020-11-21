const tmi = require("tmi.js");
const moment = require("moment");
var fs = require('fs');
var Promise = require('promise');
var curl = require('curlrequest');
const querystring = require('querystring');

console.log("Thanks to @Nimmy0 on twitch for helping me out.");
// He's a cool dude.

// Dont know any better way to do this...
let prefix = ">";
let bot_start_time = moment();
var bot_uptime_text;
var duration_bot_uptime;
let _channels = ["#wanductbot", "#quinndt"]; // backup channels
let pings;

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
console.log(`channels: ${options.channels.join(", ")}`)

let client = new tmi.client(options);

// 
client.on("emoteonly", (channel, enabled) => {
    if (enabled) {
        client.say(channel, "TriHard")
    };
});

// handle messages
client.on("message", (channel, tags, message, self) => {
    // Dont respond to messages from yourself
    if (self) return;
    let args = message.split(" ");

    if( args[0].charAt(0).toLowerCase() == prefix) {
        // commands go here.
        if ( args[0].toLowerCase() == prefix + "google") {
            google_url = querystring.escape(args.join(" ").slice(prefix.length + "google ".length))
            google_url = `https://google.com/search?q=${google_url}`
            client.say(channel, `Here is your google search: ${google_url} :)`)
        };
        if ( args[0].toLowerCase() == prefix + "8ball") {
            if (!args[1]) {client.say(channel, "/me No question privided! ⚠ ⚠ ");return;};
            client.say(channel, ":z loading...")
            curl.request({url: "https://aidenwallis.co.uk/twitch/8ball.php"}, (err, responce) => {
                    if (err) {
                        client.say(channel, `/me Failed to get answer ⚠ ⚠ error: ${err}`)
                        console.log(err)
                    } else {
                        client.say(channel, `/me ${responce} :z ...`)
                    };
            });
        };
        if ( args[0].toLowerCase() == prefix + "randomfact") {
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
        if ( args[0].toLowerCase() == prefix + "help" || args[0].toLowerCase() == prefix + "commands") {client.say(channel, "help command coming soon BroBalt")}
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
                default:
                    client.say(channel, "/me Invalid subcommand. ⚠ ⚠ ")
            };
        };
        if ( args[0].toLowerCase() == prefix + "set") {
            switch (args[1]) {
                case "prefix":
                    if ( !/([\w.\/]|..)/gi.test(args[2]) )  {
                        prefix = args[2];
                        client.say(channel, `Prefix changed to [ ${args[2]} ]. :z`);
                    } else {
                        client.say(channel, `SirSad Thats not a valid prefix, sorry. (only 1 character, no letters/numbers)`);
                    }
                    break;
                case undefined:
                    client.say(channel, "/me No subcommand provided. ⚠ ⚠ ");
                    break;
                default:
                    client.say(channel, "/me Invalid subcommand. ⚠ ⚠ ");
            }
        };
        if ( args[0].toLowerCase() == prefix + "echo" && tags.username.toLowerCase() === "quinndt" ) {
            client.say(channel, args.join(" ").slice(prefix.length + 5)) // shit implemtation (maybe not?)
        };
    };
    // These are special commands.
    if (args[0] === "test" && tags.username.toLowerCase() !== "turtoise" && tags.username.toLowerCase() !== "snappingbot") {client.say(channel, "icles");};
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
    } else if ((args[0].toLowerCase() == ">ping" || args[0].toLowerCase() == prefix + "ping") && (tags.username.toLowerCase() == "turtoise" || tags.username.toLowerCase() == "snappingbot")) {
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
});

// Connect the client to the server..
client.connect().catch();
