#overmind
Еще один node.js фреймворк.
###Для чего?
Для простого создания связанных между собой сайтов, например, какие-то интернет-ресурсы, админки, домашние странички и пр., связанные вместе единым апи, единой базой. То есть это такой "сервер серверов", под капотом которого все тот же express.

###Пример
```javascript

// создаем "сервер серверов"
var mind = require('overmind');

// создаем новый сервер
mind.addServer(/* см. ниже */require('./servers/wiki/wiki.js'), {
    // любая строка
    name: 'miniwiki',
    // реальный веб-адрес сервера
    hostname: 'miniwiki.localhost',
    // можно задать порт самому, но зачем?
    port: 2000,
    // какие-то глобальные настройки, которые будут нужны другим серверам
    global: {
        // там, где нужно, можно выводить меню доступных серверов, этим флагом мы показываем, что данный сервер в меню должен содержаться
        menuButton: true
    }
});

// еще один сервер
mind.addServer(require('./servers/hello.js'), {
    name: 'helloworld',
    hostname: 'localhost',
    global: {
        menuButton: true
    }
});

// единое логгирование
mind.loglevel(10);
// единый старт (вау!)
mind.start();

```

Сама логика работы сервера практически ничем не отличается от express:
```javascript
// ./servers/wiki/wiki.js

module.exports = function(server) {
    server.overmind.logger.trace('ololo');
    server.get('/', function(req, res) { res.render('index', {}); });
    server.views(require('path').join(__dirname, '/views'));
};
```
