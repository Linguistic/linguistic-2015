// Main requirements
var
express = require('express'),
app = express(),
http = require('http'),
server = http.Server(app),
io = require('socket.io')(server),
path = require('path'),
i18n = require('i18n-abide'),
ChatServer = require('./chat');

// Preconfig

app.set('views', path.join(__dirname, '../public'));
app.set('view engine', 'jade');

app.use('/', express.static(path.join(__dirname, '../public')));

app.use('/locale', express.static(path.join(__dirname, '../locale')));
app.use('/static', express.static(path.join(__dirname, '../static')));

app.use(i18n.abide({
    supported_languages: ['en-US', 'zh', 'fr', 'es'],
    default_lang: 'en-US',
    translation_directory: 'locale'
}));

// Set up basic URL routing
app.get('/', function (req, res) {
    res.render('index');
});

app.get('/require.js', function(req, res) {
    res.sendFile(__dirname + '/node_modules/requirejs/require.js');
});

// Start the node server
server.listen(4000, function () {
    console.log('Linguist is now running on http://127.0.0.1:4000');
});

// Start the chat server
new ChatServer(http, io).init();
