// Imports
  const tmi      =   require("tmi.js");
  const moment   =   require("moment");
  const fs       =   require('fs');

// Config Declarations (maybe move to annother file?)
  let config = {
    prefix: '>',
    start_time: moment(), // the moment this code is executed
    /**
     * I use readFileSync because its easier, and this will only run on startup, 
     * making speed not a concern as well as if this was async, the values may
     * still be undefined when the client tries to connect.
     */
    channels: ["#quinndt", "#wanductbot"], // JSON.parse(fs.readFileSync('channels-to-join.json')),
    pings: pings = JSON.parse(fs.readFileSync("pings.json"))[0],
    client_options: {
      options: {
        debug: true
      },
      connection: {
        reconnect: true,
        secure: true
      },
      identity: { 
        username: "wanductbot", 
        password: JSON.parse(fs.readFileSync("oauth.json"))[0]
      },  
      channels: undefined
    }
  };
  // to avoid getting the value twice
    config.client_options.channels = config.channels;
  let bot_uptime_text;
  let duration_bot_uptime;

  
// Bot init
  let client = new tmi.client(config.client_options);
  
/*
  Handlers cant be in annother file (they wouldnt be able to use client), but we can move 
  the command parsing to annother file, and have them return an object with a responce, like
  supibot does https://github.com/supinic/supibot & https://github.com/supinic/spm <-- useful link
*/// Handlers
let handlers = {
    onMessageHandler:  (_dont_use_this_channel, 
                        _dont_use_this_tags, 
                        _dont_use_this_message,
                        _dont_use_this_self) => {
      // make all initial variables constants so I dont accidently overwrite them making me spend an extra 3 hours debugging
      const message = _dont_use_this_message;
      const tags = _dont_use_this_tags;
      const channel = _dont_use_this_channel;
      const self = _dont_use_this_self;
      const msgArgs = message.split(' ');
      // defalt stuffs
      let usrLvl = 100;
      let reply_to_message = true;
      if (self) {
        reply_to_message = false;
        usrLvl = 0; // change this?
      };
      console.log(tags)
      if (message.startsWith(config.prefix)) {
        // Commmands go here
      };
    }
  };

// Event lisceners
  client.on('message', handlers.onMessageHandler)

// Connect
  console.log(`Channels joining:\n  ${config.channels.join('\n  ')}`);
  client.connect();
