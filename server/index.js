const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const request = require("request");
const cheerio = require("cheerio");

const url = "http://www.schnaeppchenfuchs.de";
let searchTerm = false;
let delay = "20"


searchTerm = "MARKT";

const app = express();

app.use(morgan('dev'));
app.use(cors());

let array = [];

function isTitle(el) {
    return el.title.toLowerCase().includes(searchTerm.toLowerCase());
}

function outputToFrontend(array) {
    if (searchTerm) {
        return array.filter(isTitle);
    } else {
        return array;
    }
}
app.get('/', (req, res) => {
    res.json(outputToFrontend(array));
});

function scrape() {
    var day = new Date(); 
    console.log(day.toString("dddd, MMMM ,yyyy") + " >> " + "Start Scraping");
    array = []; 
    request(url, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(body);
        let parsedResults = [];
        
        $(".post__title a").each(function(i, element) {
          var $t = $(this);
          var title = $t.text();
          var href = $t.attr("href");
          href = url + href;
          let metadata = { title: title, url: href };
        //   console.log(metadata);
          array.push(metadata);
        });
      }
    });

}


scrape();

function setFnInterval() {
    
    setInterval(function () { 
        scrape();
    }, delay*1000);
}
setFnInterval();

function notFound(req, res, next) {
    res.status(404);
    const error = new Error('Not Found - ' + req.originalUrl);
    next(error);
}

function errorHandler(err, req, res, next) {
    res.status(res.statusCode || 500);
    res.json({
        message: err.message,
        stack: err.stack
    });
}

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log('Listening on port', port);
});