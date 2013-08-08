/**
 * dependencies
 */
var path = require('path'),
    // FIXME
    mkdir = require('mkdirp').sync,
    glob = require('glob'),
    fs = require('fs-extra');

/**
 * @name Server
 * @constructor
 * @param {function(Server)} logic
 * @param {({name: string, hostname: string, overmind: Object, inMenu: boolean}|undefined)} params
 */
function Storage(name, commonPath) {
    this.name = name;
    this.path = path.join(commonPath, name);
    mkdir(this.path);
}

/**
 * Writing file into file
 * @param {string} filepath absolute path to file (unrelated to storage path)
 * for example:
 * ```
 * stroge.write('/pics/mypic.jpg', somedata);
 * ```
 * will be actually stored in /path/to/storage/pics/mypic.jpg
 * @param {*} data stored data
 * @param {function} callback is called with error or null
 * @param {string='utf8'} encoding encoding of saved file
 */
Storage.prototype.write = function(filepath, data, callback, encoding) {
    var options = encoding ? encoding : '';

    filepath = this.resolve(filepath);
    mkdir(path.dirname(filepath));
    fs.writeFile(filepath, data, options, function(err) {
        if (err)
            return callback(err);

        callback(null);
    });
};

Storage.prototype.glob = function(pattern, callback) {
    glob(pattern, {
        cwd: this.resolve(),
        root: this.resolve(),
        silent: true
    }, function(err, result) {
        if (err)
            return callback(err);

        callback(null, result);
    });
};

/**
 * Writing file into file
 * @param {string} filepath absolute path to file (unrelated to storage path)
 * for example:
 * ```
 * stroge.writeSync('/pics/mypic.jpg', somedata);
 * ```
 * will be actually stored in /path/to/storage/pics/mypic.jpg
 * @param {*} data stored data
 * @param {string='utf8'} encoding encoding of saved file
 * @returns {error|null} error or null if success
 */
Storage.prototype.writeSync = function(filepath, data, encoding) {
    var done = false,
        result = null,
        callback = function(err) {
            if (err)
                result = err;

            done = true;
        };

    this.write(filepath, data, callback, encoding);
    while (!done) {}

    return result;
};

/**
 * Resolving relative path to storage
 * @param {string} filepath relative path
 * @returns {string} absolute path to storage
 */
Storage.prototype.resolve = function(filepath) {
    return path.resolve(path.join(this.path, '/', filepath || ''));
};

/**
 * Read file
 * @param {string} filepath relative path to file
 * @param {function} callback
 */
Storage.prototype.read = function (filepath, callback) {
    filepath = this.resolve(filepath);
    fs.readFile(filepath, 'utf8', function(err, file) {
        if (err)
            return callback(err);

        callback(null, file);
    });
};

/**
 * Remove file
 * @param {string} filepath relative path to file
 * @param {function} callback
 */
Storage.prototype.remove = function(filepath, callback) {
    filepath = this.resolve(filepath);
    fs.remove(filepath, callback);
};

module.exports = Storage;
