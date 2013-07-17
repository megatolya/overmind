var mind = require('../../overmind');

mind
    // info
    .loglevel(30)
    .port(4000)
    .addServer(function(server) {
        server.get('*', function(req, res) {
            server.overmind.logger.trace('get');
            res.render('index', {some: 'data'});
        });
        server.views(require('path').join(__dirname, '/views'));
    },
    {
        name: 'miniwiki',
        // check your /etc/hosts
        hostname: 'api.localhost',
        inMenu: false
    })
    .addServer(function(server) {
        server.get('*', function(req, res) {
            server.overmind.logger.trace('get');
            res.render('index', {some: 'data'});
        });
        server.views(require('path').join(__dirname, '/views'));
    },
    {
        name: 'helloworld',
        hostname: 'localhost'
    })
    .start();
