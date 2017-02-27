// Gathering of required modules:
// Express as web server
// Restler as rest client
// He for HTML entities decoding
var express = require('express');
var mangaListRouter = express.Router();
var rest = require('restler');
var he = require('he');

// Definition of the endpoints to retrieve the manga list and the download URL
var mangaListUrl = 'https://www.mangaeden.com/api/list/';
var downloadUrl = 'https://cdn.mangaeden.com/mangasimg/';

// Defition of the list Router -- Only the GET function
mangaListRouter.route('/api/v1/list/:language')

    .get(function (req, res, next) {

        // Definition of the endpoint to retrieve a specific manga information
        var mangaUrl = req.protocol + '://' + req.get('host') + '/api/v1/manga/';

        // Gathering of the request's language param
        var requestLanguage = req.params.language.toLowerCase();

        // Check that the language isn't either Italian or English
        if (!(requestLanguage == 'it'.toLowerCase()) && !(requestLanguage == 'en'.toLowerCase())) {

            // Throw an error in case
            var languageErrorDescription = '[' + requestLanguage + '] is not a supported language; use [en] or [it] instead.';
            return error400(languageErrorDescription, res);

        }

        // Map the language for Manga Eden API's consumption
        var language = (requestLanguage == 'it') ? '1/' : '0/';

        // Gathering of the request's page param
        var page = req.query.page;

        // Check that the param is not negative -- In case, throw an error
        if (page < 0) {

            var pageErrorDescription = 'The page number should be equal or greater than 0.';
            return error400(pageErrorDescription, res);

        }

        // Gathering of the request's size param (to define the number of mangas per page)
        var listSize = req.query.size;

        // Check that the size param is not null and same for page (you can't define the mangas per page without page number) -- In case, throw an error
        if (listSize != null && page == null) {
            var pageNotSpecifiedErrorDescription = 'The number of mangas per page should be specified together with the page number.';
            return error400(pageNotSpecifiedErrorDescription, res);
        }

        // Check that the size param is inside the range provided by Manga Eden, found empirically -- If it's not the case, throw an error
        if (listSize < 25 || listSize > 2000) {

            var listSizeErrorDescription = 'The number of mangas per page should be enclosed in the interval [25;2000].';
            return error400(listSizeErrorDescription, res);

        }

        // Map the request params so that they can be used for the consumption of Manga Eden APis
        var pageQuery =  (page != null) ? '?p=' + page : '';
        var listSizeQuery = (listSize != null) ? '&l=' + listSize : '';

        // Build URL for Manda Eden API call and define the parser in the options
        var url = mangaListUrl + language + pageQuery + listSizeQuery;
        var options = {
            parsers: 'parsers.json'
        };

        // Make API call to Manga Eden, defining thw winning case (on 'success') and loosing case (on 'fail')
        rest.get(url, options)

            .on('success', function (result,response) {

                // Define output data variable
                var data = {};

                // Define variable which contains the mangas list output array
                var mangaList = result.manga;

                // Check that the mangas list is not empty -- In case, throw an error
                if (mangaList.length < 1) {

                    var combinationErrorDescription =
                        'The manga list is empty; ' +
                        'you chose a page number too large for the page size (if not specified, the default is 500 mangas per page). ' +
                        'The total number of mangas available is: ' + data.total + '.';
                    return error400(combinationErrorDescription, res);

                }


                if (page != null) {
                    data.page_number = result.page;
                    data.manga_start_number = result.start;
                    data.manga_end_number = result.end;
                }

                // Define mangas list as array in output variable
                data.manga = [];

                // Iterate over the mangas list and update the output variable's properties
                for (var i = 0; i < mangaList.length; i++) {

                    data.manga[i] = {};

                    data.manga[i].title = he.decode(mangaList[i].t);
                    data.manga[i].alias = mangaList[i].a;
                    data.manga[i].categories = mangaList[i].c;
                    data.manga[i].status = mangaList[i].s;
                    data.manga[i].image_link = downloadUrl + mangaList[i].im;
                    data.manga[i].id = mangaList[i].i;
                    data.manga[i].link = mangaUrl + data.manga[i].id + '/';
                    data.manga[i].last_chapter_date = mangaList[i].ld;
                    data.manga[i].hits = mangaList[i].h;

                }

                data.manga_total_number = result.total;

                // Send the response
                return sendResponse(data, res);

            })

            .on('fail', function (result, response) {

                // Throw a generic error
                var genericErrorDescription = 'Some unknown error occurred in calling Manga Eden API; the site returned: ' + response.statusCode + ' ' + response.statusMessage + '.';
                return error500(genericErrorDescription, res);

            });

    });

// Definition of helper functions to send the response or appropriate errors

function sendResponse(data, res) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200);
    res.send(JSON.stringify(data));
}

function error400(description, res) {
    var err = {};
    err.status = 400;
    err.message = 'Bad Request';
    err.description = description;
    res.setHeader('Content-Type','application/json; charset=utf-8');
    res.status(400);
    res.send(JSON.stringify(err));
}

function error500(description, res) {
    var err = {};
    err.status = 500;
    err.message = 'Internal Server Error';
    err.description = description;
    res.setHeader('Content-Type','application/json; charset=utf-8');
    res.status(500);
    res.send(JSON.stringify(err));
}

module.exports = mangaListRouter;
