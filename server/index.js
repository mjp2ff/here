var pg = require('pg');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

// TODO: Check if we need this or not.
io.configure(function() {
    io.set("transports", ["xhr-polling"]);
    io.set("polling duration", 10);
});

var KEEP_TIME_SECONDS = 15*60;   // How many seconds to store messages for

io.sockets.on('connection', function (socket) {
    // User joined page.
    socket.on('subscribe', function(data) {
        socket.join(data.url);
        console.log("Subscribed ", data.sender + " to ", data.url);

        socket.broadcast.to(data.url).emit('userjoined', {
            user: data.sender, 
            num_left: io.sockets.clients(data.url).length
        });

        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            if(err) {
                return socket.emit('error', 'DB connection error');
            }
            client.query("SELECT * FROM message WHERE url=$1", [data.url], function(err, result) {
                if(err) {
                    return socket.emit('error', 'Messages not found');
                }
                socket.emit('messages', result.rows);
            });
        });
    });

    // User left page.
    socket.on('unsubscribe', function(data) {
        console.log("Unsubscribed ", data.sender, " from ", data.url);
        socket.broadcast.to(data.url).emit('userleft', {
            user: data.sender, 
            num_left: io.sockets.clients(data.url).length
        });
        socket.leave(data.url);
    });

    // Someone sent a message!
    socket.on('sendmessage', function(data) {
        console.log("Server received message:", data, "from client");
        socket.broadcast.to(data.url).emit('newmessage', data);
        console.log("Now broadcasting message:", data, "to URL: ", data.url);
        var sender = data.sender;
        var url = data.url;
        var body = data.body;

        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            if(err) {
                return console.error('error fetching client from pool', err);
            }

            client.query("INSERT INTO message(sender, url, body) VALUES ($1, $2, $3)", [sender, data.url, body], function(err, result) {
                if(err) {
                    return console.error('error inserting message into database', err);
                }
                console.log('Successfully inserted new message!');
            });

            deleteOldMessages(client, data.url);
        });
        socket.emit('numusers', io.sockets.clients(data.url).length);
    });
});

var port = Number(process.env.PORT || 5000);
server.listen(port, function() {
  console.log("Listening on ", port);
});

function deleteOldMessages(client, url) {
    client.query("SELECT * FROM message WHERE url=$1 ORDER BY time_sent ASC", [url], function(err, result) {
        if(err) {
            return console.error('error getting messages from database', err);
        }
        var numRows = result.rows.length;
        client.query("DELETE FROM message WHERE url=$1 AND time_sent<$2", [url, Math.round(+new Date()/1000) - KEEP_TIME_SECONDS], function(err, result) {
            if(err) {
                return console.error('error deleting old messages from database', err);
            }
            console.log('Succesfully deleted old rows!');
        });
    });
}
