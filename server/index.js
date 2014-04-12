var pg = require('pg');
var express = require('express');
var app = express();
var io = require('socket.io').listen(80);

var sockets = {};

var MAX_ROWS = 3;

app.configure(function() {
    app.use(express.bodyParser());
    app.use(app.router);
});

app.get('/', function(req, res) {
  res.send('Hello Worlds!');
});

app.post('/newmessage', function(req, res) {
    var sender = req.body.sender;
    var url = req.body.url;
    var body = req.body.body;

    var chatURL = '/' + url.split('/')[0].replace('.', '_');

    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        if(err) {
            res.send(500);
            return console.error('error fetching client from pool', err);
        }

        client.query("INSERT INTO message(sender, url, body) VALUES ($1, $2, $3)", [sender, chatURL, body], function(err, result) {
            if(err) {
                res.send(500);
                return console.error('error inserting message into database', err);
            }
            console.log('Successfully inserted new message!');
            res.send(200);
        });

        deleteOldMessages(client, chatURL, res);
    });
});

app.get('/getmessages', function(req, res) {
    var url = req.body.url;
    var chatURL = '/' + url.split('/')[0].replace('.', '_');

    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        if(err) {
            res.send(500);
            return console.error('error fetching client from pool', err);
        }
        client.query("SELECT * FROM message WHERE url=$1", [chatURL], function(err, result) {
            if(err) {
                res.send(500);
                return console.error('error getting messages from database', err);
            }
            console.log('Successfully got messages!');
            res.send(200, result.rows);
        });
    });
});

io.sockets.on('connection', function (socket) {
    socket.on('subscribe', function(data) {
        socket.join(data.url);
        console.log("Subscribed " + data.sender + " to " + data.url);

        socket.broadcast.to(data.url).emit('userjoined', data.sender);

        var chatURL = '/' + url.split('/')[0].replace('.', '_');

        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            if(err) {
                return socket.emit('error', 'DB connection error');
            }
            client.query("SELECT * FROM message WHERE url=$1", [chatURL], function(err, result) {
                if(err) {
                    return socket.emit('error', 'Messages not found');
                }
                socket.emit('messages', result.rows);
            });
        });
    });

    socket.on('unsubscribe', function(data) {
        console.log("Unsubscribed " + data.sender + " from " + data.url);
        socket.broadcast.to(data.url).emit('userleft', data.sender);
        socket.leave(data.url);
    });

    socket.on('sendmessage', function(data) {
        console.log("Got message " + data);
        socket.broadcast.to(data.url).emit('newmessage', data);
        var sender = data.sender;
        var url = data.url;
        var body = data.body;

        var chatURL = '/' + url.split('/')[0].replace('.', '_');

        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            if(err) {
                return console.error('error fetching client from pool', err);
            }

            client.query("INSERT INTO message(sender, url, body) VALUES ($1, $2, $3)", [sender, chatURL, body], function(err, result) {
                if(err) {
                    return console.error('error inserting message into database', err);
                }
                console.log('Successfully inserted new message!');
            });

            deleteOldMessages(client, chatURL);
        });
    });
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});

function deleteOldMessages(client, url) {
    client.query("SELECT * FROM message WHERE url=$1 ORDER BY time_sent ASC", [url], function(err, result) {
        if(err) {
            return console.error('error getting messages from database', err);
        }
        var numRows = result.rows.length;
        if (numRows > MAX_ROWS) {
            client.query("DELETE FROM message WHERE url=$1 AND time_sent<$2", [url, result.rows[numRows-MAX_ROWS].time_sent], function(err, result) {
                if(err) {
                    return console.error('error deleting old messages from database', err);
                }
                console.log('Succesfully deleted old rows!');
            });
        }
    });
}
