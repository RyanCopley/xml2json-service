var express = require('express');
var app = express();

var logger = require('morgan');
var xmlParser = require('xml2json');
var requestify = require('requestify');

app.use(logger('dev'));
app.use(app.router);

//Routes
app.get("/:path", function (req, res) {

    requestify
        .request(req.params.path, {
            method: 'GET',
            timeout: 10000
        })
        .then(function (response) {
            var rx = response.body;

            var options = {
                object: true,
                reversible: false,
                coerce: true,
                sanitize: true,
                trim: true,
                arrayNotation: false
            };

            var json = xmlParser.toJson(rx, options);
            res.json(json);
        }).fail(function (err) {
            res.json({
                "error": err,
                "code": "3",
            });

        });
});

//If the router can't find a route, it falls through to the error handler. 
/// catch 404 and forwarding to error handler
app.use(function (req, res, next) {
    res.json({
        "error": "xml2json service failed",
        "code": "404"
    });
});

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.json({
        "error": "xml2json service failed",
        "code": "1"
    });
});

//Start listening on port 8000. We reverse proxy (via nginx) to port 80.
var server = app.listen(8000, function () {
    console.log('Listening on port %d', server.address().port);
});