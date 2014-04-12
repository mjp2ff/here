var pg = require('pg');
var logfmt = require("logfmt");
var express = require('express');
var app = express();
pg.connect(process.env.DATABASE_URL, function(err, client, done) {
  if(err) {
    return console.error('error fetching client from pool', err);
  }
});

app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
  res.send('Hello Worlds!');
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
