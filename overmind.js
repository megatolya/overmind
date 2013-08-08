/**
 * dependencies
 */
var Server = require('./server'),
    Storage = require('./storage'),
    logger = require('./logger')(10),
    path = require('path');

/**
 * Default port
 * @const
 * @type {number}
 */
var DEFAULT_PORT = 3000;

/**
 * Default storages' path
 * @const
 * @type {string}
 */
var DEFAULT_STORAGE_PATH = path.resolve(path.join(__dirname, './storage'));

/**
 * @name Overmind
 * @constructor
 * @return {Overmind}
 */
function Overmind() {
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
    this._port = DEFAULT_PORT;
    this._storagePath = DEFAULT_STORAGE_PATH;

    return this;
}

/**
 * Start all servers
 * @return {Overmind}
 */
Overmind.prototype.start = function() {
    var _this = this,
        server = require('express')(),
        evh = require('express-vhost');

    server.use(evh.vhost());
    server.listen(this._port);
    // creating new storage
    this.storage = new Storage('overmind', this._storagePath);
    // creating servers
    this.logger.trace('starting servers');
    this._servers.forEach(function(server) {
        _this.logger.info('starting server ' + server.name.underline);
        server.start(evh);
        _this.logger.info(
            server.name.underline +
            ' can be reached by address '+
            ('http://' + server.hostname + ':' + _this.port()).underline.bold
        );
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
 * @return {Overmind}
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
 * @return {Overmind}
 */
Overmind.prototype.port = function(port) {
    if (!port)
        return this._port;

    this._port = port;

    return this;
};

/**
 * Overriding default path for servers's storage
 */
Overmind.prototype.storagePath = function(path) {
    if (!arguments.length)
        return this._storagePath;

    // TODO check old storage and replace it
    this._storagePath = path;
};

/**
 * Change logging level
 * @param {number} logLevel new log level value (10-50)
 * @return {Overmind}
 */
Overmind.prototype.loglevel = function(logLevel) {
    if (!logLevel)
        return this.logLevel;

    this._logLevel = logLevel;
    this.logger = require('./logger')(this._logLevel);
    return this;
};

/**
 * Overmind options
 * @param {object} options port, logLevel, storagePath, etc
 * @return {Overmind}
 */
Overmind.prototype.setOptions = function(options) {
    if (typeof options === 'object' && !(options instanceof Array)) {
        for (var key in options) {
            var opt = options[key];

            if (this[key] && (typeof this[key] === 'function'))
                this[key](opt);
            else
                this.logger.error('no method found for key ' + key.underline);
        }
    } else {
        this.logger.error('setOptions\'s param should be object');
    }
    return this;
};

module.exports = new Overmind();
