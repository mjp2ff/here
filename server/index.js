var pg = require('pg');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var KEEP_TIME_SECONDS = 15*60;   // How many seconds to store messages for
var GRAFFITI_KEEP_TIME_SECONDS = 60*24*60;  // Same, for graffiti

io.sockets.on('connection', function (socket) {
    // User joined page.
    socket.on('subscribe', function(data) {
        var chatURL = data.url.split('/')[2];

        socket.join(chatURL);
        console.log("Subscribed ", data.sender + " to ", chatURL);

        socket.broadcast.to(chatURL).emit('userjoined', {
            user: data.sender, 
            num_left: io.sockets.clients(chatURL).length
        });

        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            if(err) {
                return socket.emit('error', 'DB connection error');
            }
            client.query("SELECT * FROM graffiti WHERE url=$1", [chatURL], function(err, result) {
                if(err) {
                    return socket.emit('error', 'Graffiti not found');
                }

                socket.emit('graffiti', result.rows);
            });
        });
    });

    // User left page.
    socket.on('unsubscribe', function(data) {
        var chatURL = data.url.split('/')[2];
        
        console.log("Unsubscribed ", data.sender, " from ", chatURL);
        socket.broadcast.to(chatURL).emit('userleft', {
            user: data.sender, 
            num_left: io.sockets.clients(chatURL).length
        });
        socket.leave(chatURL);
    });

    // Someone sent a message!
    socket.on('sendmessage', function(data) {
        var chatURL = data.url.split('/')[2];

        console.log("Server received message:", data, "from client");
        socket.broadcast.to(chatURL).emit('newmessage', data);
        console.log("Now broadcasting message:", data, "to URL group:", chatURL);

        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            if(err) {
                return console.error('error fetching client from pool', err);
            }

            client.query("INSERT INTO message(sender, url, body) VALUES ($1, $2, $3)", [data.sender, chatURL, data.body], function(err, result) {
                if(err) {
                    return console.error('error inserting message into database', err);
                }
                console.log('Successfully inserted new message!');
            });

            deleteOldMessages(client, chatURL);
        });
        socket.emit('numusers', io.sockets.clients(chatURL).length);
    });

    socket.on('sendgraffiti', function(data) {
        var chatURL = data.url.split('/')[2];

        console.log("Server received graffiti:", data, "from client");
        socket.broadcast.to(chatURL).emit('newgraffiti', data);
        console.log("Now broadcasting graffiti:", data, "to URL group:", chatURL);

        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            if(err) {
                return console.error('error fetching client from pool', err);
            }

            client.query("INSERT INTO graffiti(sender, url, body) VALUES ($1, $2, $3)", [data.sender, chatURL, data.body], function(err, result) {
                if(err) {
                    return console.error('error inserting graffiti into database', err);
                }
                console.log('Successfully inserted new graffiti!');
            });

            deleteOldMessages(client, chatURL);
        });
        socket.emit('numusers', io.sockets.clients(chatURL).length);
    });
});

var port = Number(process.env.PORT || 5000);
server.listen(port, function() {
  console.log("Listening on ", port);
});

function deleteOldMessages(client, url) {
    client.query("DELETE FROM message WHERE url=$1 AND time_sent<$2", [url, Math.round(+new Date()/1000) - KEEP_TIME_SECONDS], function(err, result) {
        if(err) {
            return console.error('error deleting old messages from database', err);
        }
        console.log('Succesfully deleted old rows!');
    });

    client.query("DELETE FROM graffiti WHERE url=$1 AND time_sent<$2", [url, Math.round(+new Date()/1000) - GRAFFITI_KEEP_TIME_SECONDS], function(err, result) {
        if(err) {
            return console.error('error deleting old graffiti from database', err);
        }
        console.log('Succesfully deleted old graffiti rows!');
    });
}
