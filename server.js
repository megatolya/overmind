var portIterator = 3000,
    usedPorts = [];

function handleError(err) {
    throw err;
}

function getPort() {
    portIterator++;
    if (usedPorts.indexOf(portIterator) > -1)
        return getPort();

    usedPorts.push(portIterator);
    return portIterator;
}

/**
 * @name Server
 * @constructor
 * @param {function(Server)} logic
 * @param {({name: string, hostname: string, overmind: Object, inMenu: boolean}|undefined)} params
 * @api private
 */
function Server(logic, params) {
    params = params || {};

    /**
     * server's name
     * @type {string}
     */
    this.name = params.name;

    /**
     * server's hostname
     * @type {string}
     * for example: "test.localhost", "ololo.ololo.com"
     * TODO @type {Array}
     */
    this.hostname = params.hostname;

    /**
     * server's bussiness logic
     * @type {function(server)}
     */
    this.logic = logic;

    /**
     * will be in menu or not`
     * @type {boolean}
     */
    this.inMenu = (params.inMenu !== false);

    /**
     * link to overmind
     * @type {Object}
     */
    this.overmind = params.overmind;

    this.logger = this.overmind.logger;

    params.views && this.views(params.views);

    var port = params.port;
    if (port) {
        if (usedPorts.indexOf(port) > -1) {
            port = getPort();
        } else {
            usedPorts.push(port);
        }
    } else {
        port = getPort();
    }
    this._port = port;
    // TODO view path
}

/**
 * Starting server
 * @api private
 */
Server.prototype.start = function() {
    if (this.__started)
        return;

    this.__started = true;

    var express = require('express'),
        view = require('express/lib/view'),
        _this = this;

    // replace render fn
    view.prototype.render = function(options, fn) {
        this.engine(this.path, options, function(err, html) {
            if (err) {
                handleError(err);
                return;
            }
            _this.overmind.getHeader(function(err, header) {
                if (err) {
                    handleError(err);
                    return;
                }
                html = header + html;
                fn(err, html);
            });
        });
    };

    this.express = express();
    this.express.set('view', view);

    // TODO more engines
    this.express.set('view engine', 'jade');

    // calling server's logic
    this.logic(this);

    // creating http server
    require('http').createServer(this.express).listen(this._port);
};

/**
 * Declare server's view path
 * @param {string} path
 * @api public
 */
Server.prototype.views = function(path) {
    this.express.set('views', path);
};

/**
 * Middleware
 * @extends Express.get
 * @api public
 */
Server.prototype.get = function() {
    this.express.get.apply(this.express, arguments);
};

/**
 * Middleware
 * @extends Express.post
 * @api public
 */
Server.prototype.post = function() {
    this.express.post.apply(this.express, arguments);
};

/**
 * Server's port
 * @return {number} port
 * @api public
 */
Server.prototype.port = function() {
    return this._port;
};

module.exports = Server;
