
var httpError = {};

httpError.error400 = function(description, res) {
    var err = {};
    err.status = 400;
    err.message = 'Bad Request';
    err.description = description;
    res.setHeader('Content-Type','application/json; charset=utf-8');
    res.status(400);
    res.send(JSON.stringify(err));
};

httpError.error404 = function(description, res) {
    var err = {};
    err.status = 404;
    err.message = 'Not Found';
    err.description = description;
    res.setHeader('Content-Type','application/json; charset=utf-8');
    res.status(404);
    res.send(JSON.stringify(err));
};

httpError.error500 = function(description, res) {
    var err = {};
    err.status = 500;
    err.message = 'Internal Server Error';
    err.description = description;
    res.setHeader('Content-Type','application/json; charset=utf-8');
    res.status(500);
    res.send(JSON.stringify(err));
};

module.exports = httpError;