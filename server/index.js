var http = require('http');
var fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const request = require("request");
const cheerio = require("cheerio");


const app = express();

app.use(morgan('dev'));
app.use(cors());


const url = "http://www.schnaeppchenfuchs.de";
let searchTerm = false;
let delay = "20"

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

// Loading the index file . html displayed to the client
var server = http.createServer(function (req, res) {
    fs.readFile('./public/index.html', 'utf-8', function (error, content) {
        res.writeHead(200, {
            "Content-Type": "text/html"
        });
        res.end(content);
    });
});

// Loading socket.io
var io = require('socket.io').listen(server);


function scrape() {
    var day = new Date();
    console.log(day.toString("dddd, MMMM ,yyyy") + " >> " + "Start Scraping");
    array = [];
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            const $ = cheerio.load(body);
            let parsedResults = [];

            $(".post__title a").each(function (i, element) {
                var $t = $(this);
                var title = $t.text();
                var href = $t.attr("href");
                href = url + href;
                let metadata = {
                    title: title,
                    url: href
                };
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
    }, delay * 1000);
}
setFnInterval();



// When a client connects, we note it in the console
io.sockets.on('connection', function (socket) {
    console.log('A client is connected!');
    socket.emit('message', 'You are connected!');
    socket.on('message', function (message) {
        socket.emit('output', array);
    });

});
server.listen(8080);