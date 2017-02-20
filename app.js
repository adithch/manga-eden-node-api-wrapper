
// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// Add routes
var listRouter = require('./routes/list');
var mangaRouter = require('./routes/manga');
var chapterRouter = require('./routes/chapter');

// Create a new express server
var app = express();

// Intercept and modify all requests's query parameters to lowercase
app.use(function(req, res, next) {
    for (var key in req.query) {
        req.query[key.toLowerCase()] = req.query[key];
    }
    next();
});

// serve the files out of ./public
app.use(express.static(__dirname + '/public'));
app.use(listRouter);
app.use(mangaRouter);
app.use(chapterRouter);

// start server on the specified port and binding host
app.listen(3000, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log('server starting on port 3000');

});



