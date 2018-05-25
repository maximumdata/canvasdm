const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const session = require('express-session');
const sassMiddleware = require('node-sass-middleware');
const bodyParser = require('body-parser');
const io = require('socket.io');
const socketstuff = require('./socketstuff.js');
const app = express();

app.engine('.hbs', exphbs({ extname: '.hbs', defaultLayout: 'main' }));
app.set('view engine', '.hbs');
app.use(
    session({ secret: 'keyboard cat', saveUninitialized: true, resave: false })
);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(
    sassMiddleware({
        src: path.join(__dirname, 'public'),
        dest: path.join(__dirname, 'public'),
        debug: false,
        indentedSyntax: true,
        outputStyle: 'compressed'
    })
);

app.use(express.static(path.join(__dirname, 'public')));

let requireLogin = (req, res, next) => {
    if (req.session.isAuth) {
        next();
    } else {
        res.redirect('login');
    }
};

app.get('/', function(req, res) {
    res.render('home', { js: 'anon' });
});

app.get('/player', (req, res) => {
    res.redirect('/');
});

app.get('/player/:name', (req, res) => {
    res.render('home', { user: req.params.name, js: 'player' });
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

app.all('/logout', (req, res) => {
    if (req.session.isAuth) {
        req.session.isAuth = false;
    }
    res.redirect('/login');
});

app.all('/dm/*', requireLogin, (req, res, next) => next());

app.get('/dm', requireLogin, (req, res) => {
    res.render('home', { user: 'dm', js: 'dm', dm: true });
});

let server = app.listen(3001);
let socketio = io.listen(server);
socketstuff.bindEvents(socketio);
