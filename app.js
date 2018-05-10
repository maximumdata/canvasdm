var express = require('express');
var exphbs  = require('express-handlebars');
const path = require('path');
const session = require('express-session');
const sassMiddleware = require('node-sass-middleware');
var app = express();

app.engine('.hbs', exphbs({extname: '.hbs', defaultLayout: 'main'}));
app.set('view engine', '.hbs');

app.get('/', function (req, res) {
    res.redirect('/dm');
});

app.get('/player/:name', (req, res) => {
    res.render('home', {user: req.params.name, type: 'player'});
});

app.get('/dm', (req, res) => {
    res.render('home', {user: 'dm'});
});

app.use(session({ secret: 'keyboard cat', saveUninitialized: true, resave: false}));
app.use(sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    debug: true,
    indentedSyntax: true,
    outputStyle: 'compressed'
}));

app.use(express.static(path.join(__dirname, 'public')));
app.listen(3000);
