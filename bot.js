const tmi = require("tmi.js");
const moment = require("moment");
var fs = require('fs');
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

client.on("message", (channel, user, message, self) => {
    if (self) return;
    let args = message.split(" ");
    console.log(`args:${args}`)

    if( args[0].charAt(0).toLowerCase() == prefix) {
        // commands go here.
        if ( args[0].toLowerCase() == prefix + "help")
        if ( args[0].toLowerCase() == prefix + "botjoin" && user.username.toLowerCase() == "quinndt" ) {
            if (!/(#|)[a-z0-9_]/gi.test(args[1])) {
                client.say(channel, "That doesn't seem like a username... TPFufun");
                return;
            };
            _channels = _channels.concat([`${args[1]}`])
            fs.writeFile('channels-to-join.json', JSON.stringify(_channels), (err) => {
                if (err) throw err;
                client.join(`${args[1]}`)
                client.say(channel, `I've joined the channel: [ ${args[1]} ]. monkaS 👉 ${client.channels.length + 1} channels total.`) // the channel length doesnt update in time, so I add one to it.
            });
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
                    client.say(channel, "WubTF I dont see anything to set..."); // no type provided
                    break;
                default:
                    client.say(channel, ":z I cant do that..."); // invalid type provided
            }
        };
        if ( args[0].toLowerCase() == prefix + "echo" && user.username.toLowerCase() === "quinndt" ) {
            client.say(channel, args.join(" ").slice(prefix.length + 5)) // shit implemtation (maybe not?)
        };
    };
    // These are special commands.
    if (args[0] === "test" && user.username.toLowerCase() !== "turtoise" && user.username.toLowerCase() !== "snappingbot") {client.say(channel, "icles");};
    if (args[0].toLowerCase() == ">ping" || args[0].toLowerCase() == prefix + "ping") {
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
    };
});

// Connect the client to the server..
client.connect();
