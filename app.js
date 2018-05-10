var express = require('express');
var exphbs  = require('express-handlebars');
const path = require('path');
const session = require('express-session');
const sassMiddleware = require('node-sass-middleware');
const bodyParser = require('body-parser');
var app = express();

app.engine('.hbs', exphbs({extname: '.hbs', defaultLayout: 'main'}));
app.set('view engine', '.hbs');
app.use(session({ secret: 'keyboard cat', saveUninitialized: true, resave: false}));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    debug: true,
    indentedSyntax: true,
    outputStyle: 'compressed'
}));

app.use(express.static(path.join(__dirname, 'public')));


let requireLogin = (req, res, next) => {
    if (req.session.isAuth) {
        next();
    } else {
        res.redirect('login');
    }
}



app.get('/', function (req, res) {
    res.redirect('/dm');
});

app.get('/player/:name', (req, res) => {
    res.render('home', {user: req.params.name, type: 'player'});
});


app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    if (req.body.username == 'mike' && req.body.password == 'pass') {
        req.session.isAuth = true;
        res.redirect('/dm');
    } else {
        res.redirect('/login');
    }
});

app.all('/dm/*', requireLogin, (req, res, next) => next());

app.get('/dm', requireLogin, (req, res) => {
    res.render('home', {user: 'dm'});
});


app.listen(3000);
