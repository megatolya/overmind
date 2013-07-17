var Server = require('./server'),
    logger = require('./logger')(10);

/**
 * Default port
 * @const
 * @type {number}
 */
var DEFAULT_PORT = 3000;

/**
 * @name Overmind
 * @constructor
 * @this {Overmind}
 * @return @this
 */
function Overmind() {
    var path = require('path');

    this._servers = [];
    this.headerFile = path.join(__dirname, 'header.jade');
    this._cache = {};
    /**
     * logging level
     * levels :
     *   10 - trace,
     *   20 - debug,
     *   30 - info,
     *   40 - warn,
     *   50 - errors
     * @type {number}
     */
    this._logLevel = 10;
    this.logger = require('./logger')(this._logLevel);

    return this;
}

/**
 * Start all servers
 * @this {Overmind}
 * @return @this
 */
Overmind.prototype.start = function() {
    var _this = this,
        server = require('express')(),
        evh = require('express-vhost');

    server.use(evh.vhost());
    server.listen(this._port || DEFAULT_PORT);
    this.logger.trace('starting servers');
    this._servers.forEach(function(server) {
        _this.logger.info('starting server ' + server.name.underline);
        server.start(evh);
    });

    return this;
};

/**
 * Get declarated servers
 * @return {Array.<Server>}
 */
Overmind.prototype.getServers = function() {
    return this._servers;
};

/**
 * Declare server
 * @param {function(Server)} logic (see server's constructor)
 * @param {(Object|undefined)} params (see Server's constructor)
 * @this {Overmind}
 * @return @this
 */
Overmind.prototype.addServer = function(logic, params) {
    params = params || {};
    params.overmind = this;

    var server = new Server(logic, params);

    this._servers.push(server);
    return this;
};

/**
 * Generate header html
 * @param {function( (Error|null), (string|undefined) )} callback
 *    callback is called with error (if any) and html string
 */
Overmind.prototype.getHeader = function(callback) {
    var servers = this.getServers().filter(function (server) {
            if (server.inMenu) return server;
        }),
        cache = this._cache,
        _this = this;

    this.logger.trace('getting header');
    if (cache.header) {
        this.logger.trace('getting header from cache');
        return callback(null, cache.header);
    }

    this.logger.info('generating new header');
    require('fs').readFile(this.headerFile, function(err, data) {
        if (err)
            return callback(err);

        var html = require('jade').compile(data)({servers: servers});
        cache.header = html;
        _this.logger.trace('header compiled');
        callback(null, html);
    });
};

/**
 * Overriding default port for servers
 * @param {number} port new port
 * @this {Overmind}
 * @return @this
 */
Overmind.prototype.port = function(port) {
    this._port = port;

    return this;
};

/**
 * Change logging level
 * @this {Overmind}
 * @return @this
 */
Overmind.prototype.loglevel = function(logLevel) {
    this._logLevel = logLevel;
    this.logger = require('./logger')(this._logLevel);
    return this;
};

module.exports = new Overmind();
