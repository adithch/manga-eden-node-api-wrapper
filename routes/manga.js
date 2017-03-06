// Gathering of required modules:
// Express as web server
// Restler as rest client
// He for HTML entities decoding
var express = require('express');
var mangaRouter = express.Router();
var rest = require('restler');
var he = require('he');
var httpError = require('./httpError');

// Definition of the endpoints to retrieve the manga info and the manga's image download
var mangaUrl = 'https://www.mangaeden.com/api/manga/';
var downloadUrl = 'https://cdn.mangaeden.com/mangasimg/';

// Defition of the manga Router -- Only the GET function
mangaRouter.route('/api/v1/manga/:id')

    .get(function (req, res, next) {

        var chapterUrl = req.protocol + '://' + req.get('host') + '/api/v1/chapter/';

        var mangaId = req.params.id;

        if (mangaId == null) {
            var mangaIdNullErrorDescription = 'The manga id cannot be null.';
            return httpError.error400(mangaIdNullErrorDescription, res);
        }

        var url = mangaUrl + mangaId;
        var options = {
            parsers: 'parsers.json'
        };

        rest.get(url, options)

            .on('success', function (result, response) {

                var data = {};

                data.title = he.decode(result.title);
                data.author = result.author.split(' ').map(capitalizeOnlyFirstLetter).join(' ');
                data.artist = result.artist.split(' ').map(capitalizeOnlyFirstLetter).join(' ');
                data.aka = result.aka.map(he.decode); // array
                data.alias = result.alias;
                data.categories = result.categories; // array
                data.chapters_number = result['chapters_len'];
                data.creation_date = result['creation_date'];
                data.last_chapter_date = result['last_chapter_date'];
                data.hits = result.hits;
                data.description = he.decode(result.description);
                data.image_link = downloadUrl + result.image;
                data.release_year = result.released;

                if (result.language = 0) {
                    data.language = 'en';
                } else if (result.language = 1) {
                    data.language = 'it';
                }

                var chapters = result.chapters;
                data.chapters = [];

                for (var i = 0; i < chapters.length; i++) {

                    data.chapters[i] = {};

                    data.chapters[i].number = chapters[i][0];
                    data.chapters[i].release_date = chapters[i][1];
                    data.chapters[i].title = chapters[i][2];
                    data.chapters[i].id = chapters[i][3];
                    data.chapters[i].link = chapterUrl + data.chapters[i].id + '/';

                }

                return sendResponse(data, res);

            })

            .on('fail', function (result, response) {

                if (response.statusCode = 404) {

                    var idErrorDescription = 'Manga not found. Make sure you searched for a valid manga id.';
                    return httpError.error404(idErrorDescription, res);

                } else {

                    var genericErrorDescription = 'Some unknown error occurred in calling Manga Eden API; the site returned: ' + response.statusCode + ' ' + response.statusMessage;
                    return httpError.error500(genericErrorDescription, res);

                }
            });

    });

function sendResponse(data, res) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200);
    res.send(JSON.stringify(data));
}

function capitalizeOnlyFirstLetter(x) {
    return x.charAt(0).toUpperCase() + x.slice(1).toLowerCase()
}

module.exports = mangaRouter;
