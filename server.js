
function handleError(err) {
    throw err;
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
     * will be in menu or not
     * @type {boolean}
     */
    this.inMenu = (typeof params.inMenu !== 'boolean') || params.inMenu;

    /**
     * link to overmind
     * @type {Overmind}
     */
    this.overmind = params.overmind;

    /**
     * alias for this.overmind.logger
     * @type {Object}
     */
    this.logger = this.overmind.logger;

    params.views && this.views(params.views);
}

/**
 * Starting server
 * @param {Vhost} evh - joins express's app with hostname
 * @api private
 */
Server.prototype.start = function(evh) {
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

                var match,
                    i18nReg= /%{2}([a-zA-Z0-9]+)%{2}/g,
                    placeholdersReg = /%{2}\$(.*)%{2}/g;

                // TODO i18n storage
                function translate(str) {
                    _this.logger.debug('translating ' + str.underline);
                    return str;
                }

                // TODO placeholder storage?
                function getPlaceholder(placeholder) {
                    _this.logger.debug('replacing placeholder ' + placeholder.underline);
                    switch (placeholder) {
                        case 'header_menu':
                            return header;
                        default:
                            return '<b>placeholder not found</b>';
                    }
                }

                while(match = i18nReg.exec(html)) {
                    html = html.replace(new RegExp(match[0], 'g'), translate(match[1]));
                }

                while(match = placeholdersReg.exec(html)) {
                    html = html.replace(match[0], getPlaceholder(match[1]));
                }
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

    evh.register(this.hostname, this.express);
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

module.exports = Server;
