var pg = require('pg');

pg.connect(process.env.DATABASE_URL, function(err, client, done) {
  if(err) {
    return console.error('error fetching client from pool', err);
  }
});
