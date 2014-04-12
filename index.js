var pg = require('pg');
// var logfmt = require("logfmt");
var express = require('express');
var app = express();

// app.use(logfmt.requestLogger());

app.configure(function() {
    app.use(express.bodyParser());
    app.use(app.router);
});

app.get('/', function(req, res) {
  res.send('Hello Worlds!');
});

app.post('/newmessage', function(req, res) {
    sender = req.body.sender;
    url = req.body.url;
    body = req.body.body;
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        if(err) {
            res.send(500);
            return console.error('error fetching client from pool', err);
        }
        client.query("INSERT INTO message(sender, url, body) VALUES ($1, $2, $3)", [sender, url, body], function(err, result) {
            if(err) {
                res.send(500);
                return console.error('error inserting message into database', err);
            }
            console.log('Successfully inserted new message!');
            res.send(200);
        });
    });
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
