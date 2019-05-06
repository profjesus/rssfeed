const express = require('express');
const bodyParser = require('body-parser');
const Pool = require('pg').Pool;
var RSS = require('rss');
var fs = require('fs');

// Create DB pool
const pool = new Pool({
  user: 'newsuser',
  host: 'localhost',
  database: 'newsdb',
  password: 'newspass',
  port: 5432,
});

/* Create RSS feed */
var feed = new RSS({
    title: 'Novas sobre nada',
    description: 'Unha descricion',
    language: 'gl',
    ttl: '60'
});

const rssPath = __dirname + "/public/rss/rssfeed.xml";

pool.query('SELECT * FROM news;', (error, results) => {
    if (error) {
      throw error;
    }
    results.rows.forEach(function(element) {
        feed.item({
            title: element.title,
            description: element.body,
            author: 'Suso'
        });
    });
    fs.writeFile(rssPath, feed.xml(), (err) => {
        if (err) console.log(err);
    });
});

// Express server
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/news', function (req, res) {
    pool.query('SELECT * FROM news;', (error, results) => {
        if (error) {
          throw error;
        }
        res.status(200).json(results.rows)
    });
});

app.post('/new', function (req, res) {
    pool.query('INSERT INTO news (title, body) VALUES ($1, $2)', [req.body.title, req.body.body], (error, result) => {
        if (error) {
          throw error;
        }
        res.status(201).send(`New added with ID: ${result}`);
      })
});

app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});