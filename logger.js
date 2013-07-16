require('colors');

module.exports = function(logLevel) {
    return {
        error: function() {
            return log(50, arguments);
        },
        warn: function() {
            return log(40, arguments);
        },
        info: function() {
            return log(30, arguments);
        },
        debug: function() {
            return log(20, arguments);
        },
        trace: function() {
            return log(10, arguments);
        }
    };

    function log(level, arguments) {
        if (level >= logLevel) {
            var color,
                msg;
            switch (level) {
                case 10:
                    color = 'grey';
                    msg = 'trace';
                    break;
                case 20:
                    color = 'blue';
                    msg = 'debug';
                    break;
                case 30:
                    color = 'green';
                    msg = 'info';
                    break;
                case 40: 
                    color = 'yellow';
                    msg = 'warn';
                    break;
                case 50: 
                    color = 'red';
                    msg = 'error';
                    break;
            }
            for (var key in arguments) {
                key = parseInt(key, 10);
                arguments[key + 1] = arguments[key];
                arguments[0] = msg[color];
            }
            arguments.length++;
            console.log.apply(null, arguments);
        }
    }
};
