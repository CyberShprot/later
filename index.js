const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const Article = require('./db').Article; 
const read = require('node-readability');
const url = 'https://habr.com/ru/post/463165/';
read(url, (err, result)=> { 
    Article.create(
        {title: result.title, content: result.content },
        (err, article) => { // статья сохраняется в бд
        }
    )
});

app.set('port', process.env.PORT || 3000); // задаю порт

app.use(bodyParser.json()); // поддержа тела запросов, закодированных в формате JSON
app.use(bodyParser.urlencoded({ extended: true})) // поддержка тела запросов в кодировке формы
app.use(
    '/css/bootstrap.css',
    express.static('node_modules/bootstrap.dist/css/bootstrap.css')
);

app.get('/artices', (req, res, next) => { // получаю все статьи
    Article.all((err, articles) => { // дб получает все статьи
        if (err) return next(err);
        res.send(articles);
    });
});

app.post('/articles', (req, res, next) => { // создаю статью
    const url = req.body.url; // получаю URL из тела POST

read(url, (err, result) => { // использую режим удобочитаемости от выборки URL
    if (err || !result) res.status(500).send('Error downloading article');
        Article.create(
            { title: result.title, content: result.content },
            (err, article) => {
                if (err) return next(err);
                res.send('OK'); // после сохранения статьи возвращаю код 200
            }
        );
    });
});

app.get('/articles', (req, res, next) => { // получаю одну статью
    const id = req.params.id;
    Article.find(id, (err, article) => { // находит конкретню статью
        if (err) return next(err);
        res,send(article);
    });
});

app.delete('/articles/:id', (req, res, next) => { // удаляю статью
    const id = req.params.id;
    Article.delete(id, (err) => { // удаляет статью
        if (err) return next(err);
        res.send({ message: 'Deleted'})
    })
});

app.listen(app.get('port'), () => { // запускаю сервер
    console.log('App started on port', app.get('port'));
});

module.exports = app;