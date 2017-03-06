

var express = require('express');
var chapterRouter = express.Router();
var rest = require('restler');
var httpError = require('./httpError');

var chapterUrl = 'https://www.mangaeden.com/api/chapter/';
var downloadUrl = 'https://cdn.mangaeden.com/mangasimg/';

chapterRouter.route('/api/v1/chapter/:id')

    .get(function (req, res, next) {

        // var chapterUrl = req.protocol + '://' + req.get('host') + '/api/v1/chapter/';

        var chapterId = req.params.id;

        if (chapterId == null) {
            var chapterIdNullErrorDescription = 'The chapter id cannot be null.';
            return httpError.error400(chapterIdNullErrorDescription, res);
        }

        var url = chapterUrl + chapterId;
        var options = {
            parsers: 'parsers.json'
        };

        rest.get(url, options)

            .on('success', function (result, response) {

                var data = {};

                var pages = result.images;
                data.chapter_pages = [];

                for (var i = 0; i < pages.length; i++) {

                    data.chapter_pages[i] = {};

                    data.chapter_pages[i].page_number = pages[i][0];
                    data.chapter_pages[i].id = pages[i][1];
                    data.chapter_pages[i].link = downloadUrl + data.chapter_pages[i].id;

                }

                return sendResponse(data, res);

            })

            .on('fail', function (result, response) {

                if (response.statusCode = 404) {

                    var idErrorDescription = 'Chapter not found. Make sure you searched for a valid chapter id.';
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

module.exports = chapterRouter;

