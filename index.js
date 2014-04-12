var pg = require('pg');
var express = require('express');
var app = express();
pg.connect(process.env.DATABASE_URL, function(err, client, done) {
  if(err) {
    return console.error('error fetching client from pool', err);
  }
});

app.get('/', function(req, res) {
  res.send('Hello Worlds!');
});
