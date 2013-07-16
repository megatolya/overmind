var Server = require('./server'),
    logger = require('./logger')(10);

/**
 * @name Overmind
 * @constructor
 */
function Overmind() {
    var path = require('path');

    this._servers = [];
    this._menuButtons = [];
    this.headerFile = path.join(__dirname, 'header.jade');
    this._cache = {};
    this._logLevel = 10;
}

Overmind.prototype.start = function() {
    this._servers.forEach(function(server) {
        server.start();
    });
    this.logger = require('./logger')(this._logLevel);
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
 * @param {Function} logic (see server's constructor)
 * @param {Object|Undefined} params (see server's constructor)
 * @this {Overmind}
 * @return @this
 */
Overmind.prototype.addServer = function(logic, params) {
    params = params || {};
    params.overmind = this;

    var server = new Server(logic, params);

    this._servers.push(server);
    if (server.global && server.global.menuButton) {
        this._menuButtons.push(server);
    }
    return this;
};

/**
 * Generate header html
 * @param {Function} callback
 *    callback is called with error (if any) and html string
 */
Overmind.prototype.getHeader = function(callback) {
    var servers = this.getServers(),
        cache = this._cache;

    if (cache.header)
        return callback(null, cache.header);

    require('fs').readFile(this.headerFile, function(err, data) {
        if (err)
            return callback(err);

        var html = require('jade').compile(data)({servers: servers});
        cache.header = html;
        callback(null, html);
    });
};

/**
 * Change logging level
 */
Overmind.prototype.loglevel = function(logLevel) {
    /**
     * logging level
     * @type {Number}
     */
    this._logLevel = logLevel;
    this.logger = require('./logger')(this._logLevel);
};

module.exports = new Overmind;
