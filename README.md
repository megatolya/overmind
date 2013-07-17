#overmind
Еще один node.js фреймворк.
###Для чего?
Для простого создания связанных между собой сайтов, например, какие-то интернет-ресурсы, админки, домашние странички и пр., связанные вместе единым апи, единой базой. То есть это такой "сервер серверов", под капотом которого все тот же express.

###Пример
```javascript

// создаем "сервер серверов"
var mind = require('overmind');

// создаем новый сервер
// первый аргумент логика сервера
// второй - опции
mind.addServer(
    function(server) {
        server.get('*', function(req, res) {
            server.overmind.logger.info('get');
            res.render('wiki');
        });
        // эту строку можно передать в опция сервера через ключ views
        server.views(require('path').join(__dirname, '/views'));
    }, {
    // название (любая строка)
    name: 'miniwiki',
    // реальный веб-адрес сервера
    hostname: 'miniwiki.localhost',
    // можно задать порт самому, но зачем?
    port: 2000,
    // там, где нужно, можно выводить меню доступных серверов
    // этим флагом мы показываем, что данный сервер в меню не должен содержаться
    // по умолчанию - содержится
    menuButton: false
});

// еще один сервер
mind.addServer(require('./servers/hello.js'), {
    name: 'helloworld',
    hostname: 'localhost'
});

// единое логгирование
mind.loglevel(10);
// единый старт (вау!)
mind.start();

```

Сама логика работы сервера практически ничем не отличается от express:
```javascript
// ./servers/hello.js

module.exports = function(server) {
    server.overmind.logger.trace('ololo');
    server.get('/', function(req, res) { res.render('index', {some: 'data'}); });
};
```
