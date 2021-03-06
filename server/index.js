var pg = require('pg');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
io.set('log level', 1);

var KEEP_TIME_SECONDS = 15*60;   // How many seconds to store messages for
var GRAFFITI_KEEP_TIME_SECONDS = 60*24*60;  // Same, for graffiti

pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if(err) {
        return -1;
    }

    io.sockets.on('connection', function (socket) {
        // User joined page.
        socket.on('subscribe', function(data) {
            var chatURL = data.url.split('/')[2];

            socket.join(chatURL);
            console.log("Subscribed ", data.sender + " to ", chatURL);

            socket.broadcast.to(chatURL).emit('userjoined', {
                user: data.sender,
                num_users: io.sockets.clients(chatURL).length
            });

            client.query("SELECT * FROM graffiti WHERE url=$1 ORDER BY time_sent DESC LIMIT 3", [chatURL], function(err, result) {
                if(err) {
                    return socket.emit('error', 'Graffiti not found');
                }
                socket.emit('subscriberesult', result.rows);
            });
        });

        // User left page.
        socket.on('unsubscribe', function(data) {
            var chatURL = data.url.split('/')[2];

            console.log("Unsubscribed ", data.sender, " from ", chatURL);
            socket.broadcast.to(chatURL).emit('userleft', {
                user: data.sender,
                num_users: io.sockets.clients(chatURL).length
            });
            socket.leave(chatURL);
        });

        // Someone sent a message!
        socket.on('sendmessage', function(data) {
            var chatURL = data.url.split('/')[2];

            console.log("Server received message:", data, "from client");

            client.query("INSERT INTO message(sender, url, body) VALUES ($1, $2, $3)", [data.sender, chatURL, data.body], function(err, result) {
                if(err) {
                    return console.error('error inserting graffiti into database', err);
                }
                console.log('Successfully inserted new graffiti!');
            });

            socket.broadcast.to(chatURL).emit('newmessage', data);
            console.log("Now broadcasting message:", data, "to URL group:", chatURL);
            deleteOldMessages(client, chatURL, data.sender);

            socket.emit('numusers', {
                num_users: io.sockets.clients(chatURL).length
            });
        });

        socket.on('sendgraffiti', function(data) {
            var chatURL = data.url.split('/')[2];

            console.log("Server received graffiti:", data, "from client");

            data.body = data.body.replace(/^:leave /, "");
            client.query("INSERT INTO graffiti(sender, url, body) VALUES ($1, $2, $3)", [data.sender, chatURL, data.body], function(err, result) {
                if(err) {
                    return console.error('error inserting graffiti into database', err);
                }
                console.log('Successfully inserted new graffiti!');
            });

            socket.broadcast.to(chatURL).emit('newgraffiti', data);
            console.log("Now broadcasting graffiti:", data, "to URL group:", chatURL);
            deleteOldMessages(client, chatURL, data.sender);

            socket.emit('numusers', {
                num_users: io.sockets.clients(chatURL).length
            });
        });
    });

});

var port = Number(process.env.PORT || 5000);
server.listen(port, function() {
  console.log("Listening on ", port);
});

function deleteOldMessages(client, url, sender) {
    client.query("DELETE FROM message WHERE time_sent<TO_TIMESTAMP($1)", [Math.round(+new Date()/1000) - KEEP_TIME_SECONDS], function(err, result) {
        if(err) {
            return console.error('error deleting old messages from database', err);
        }
        console.log('Successfully deleted old rows!');
    });

    client.query("DELETE FROM graffiti WHERE time_sent<TO_TIMESTAMP($1)", [Math.round(+new Date()/1000) - GRAFFITI_KEEP_TIME_SECONDS], function(err, result) {
        if(err) {
            return console.error('error deleting old graffiti from database', err);
        }
        console.log('Successfully deleted old graffiti rows!');
    });

    client.query("DELETE FROM graffiti WHERE url=$1 AND sender=$2 AND time_sent<(SELECT time_sent FROM graffiti WHERE url=$1 AND sender=$2 ORDER BY time_sent DESC LIMIT 1)",
            [url, sender], function(err, result) {
        if(err) {
            return console.error('error deleting old user-specific graffiti from database', err);
        }
        console.log('Successfully deleted old user-specific graffiti rows!');
    });
}
