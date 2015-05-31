// Main requirements
var express = require('express');
var app = express();
var http = require('http');
var server = http.Server(app);
var io = require('socket.io')(server);
var i18n = require('i18n-abide');

var Chance = require('chance'),
    chance = new Chance();

// Preconfig
app.use('/', express.static(__dirname));
app.use(i18n.abide({
    supported_languages: ['en-US', 'fr', 'zh'],
    default_lang: 'en-US',
    translation_directory: 'locale',
}));

app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');

// Set up basic URL routing
app.get('/', function (req, res) {
    res.render('index');
});

app.get('/views/welcome', function (req, res) {
    res.render('welcome');
});

app.get('/views/chat', function (req, res) {
    res.render('chat');
});

// The number of users online
var user_count = 0;

// Used to store users who are currently available to chat
var available = [];

/*
 * Name: takeUser()
 * Purpose: Removes a user from the available users array
 * Arguments:
 *      - Socket user: A socket that contains user information
 * Returns: void
 */
var takeUser = function (user) {
    for (var i = 0; i < available.length; i++) {
        if (available[i].username == user.username) {
            available.splice(i, 1);
        }
    }
};

/*
 * Name: tryMatch()
 * Purpose: Attempts to match a user with another user to chat with
 * Arguments:
 *      - Socket user: A socket that contains user information
 * Returns: The socket of the matched user
 */
var tryMatch = function (user) {
    for (var i = 0; i < available.length; i++) {
        var available_user = available[i]
        if ((available_user.source == user.dest) &&
            (available_user.dest == user.source)) {
            takeUser(available_user);
            return available_user;
        }
    }
    return null;
}

/*
 * Name: extractLocation()
 * Purpose: Extracts the location data from a ipinfo.io JSON object
 * Arguments:
 *      - String data: A JSON string
 * Returns: An array of the location, city, and region data from the original object
 */
var extractLocation = function (data) {
    var data_json = JSON.parse(data);
    var data_loc = data_json.loc.split(',');
    var data_city = data_json.city;
    var data_region = data_json.region;
    return {
        "loc": data_loc,
        "city": data_city,
        "region": data_region
    };
}

/*
 * Name: leaveRoom()
 * Purpose: Disconnects a socket from its current room
 * Arguments:
 *      - Socket socket: The socket to disconnect
 * Returns: Void
 */
var leaveRoom = function (socket) {

    if ((socket.room !== undefined) &&
        (socket.partner !== undefined) &&
        (socket.partner.room == socket.room)) {

        var room = socket.room;

        // Leave the room and tell the partner you left
        socket.leave(room);
        io.in(room).emit('ended');
        socket.partner.leave(room);

        socket.room == undefined;
        socket.partner.room = undefined;

        return true;

    } else {

        // Return false if the socket isn't in a room
        return false;
    }
}

io.on('connection', function (socket) {

    // Find the new user's location based on their IP address
    var ip = socket.request.headers['x-forwarded-for'] || socket.request.connection.remoteAddress;
    var options = {
        host: 'ipinfo.io',
        port: 80,
        path: '/' + ip,
        method: 'GET'
    };
    var req_socket = http.get(options, function (res_socket) {
        res_socket.setEncoding('utf8');
        res_socket.on('data', function (data) {
            var new_user = chance.guid();
            socket.location = JSON.parse(data);;
            socket.username = new_user;
            user_count++; // Increment the user count
            socket.emit('assign', {
                "user": new_user
            });
            io.emit('update_count', user_count);
            console.log("User " + socket.username + " has logged on");
        });
    });

    // When a message has been received
    socket.on('message', function (data) {
        io.in(socket.room).emit('message', data);
    });

    // When the user desires a new chat partner
    socket.on('request', function (data) {

        if (data.hasOwnProperty('source') && data.hasOwnProperty('dest')) {
            // Set the known and desired language of choice
            socket.source = data.source;
            socket.dest = data.dest;

            // Tell the world the user is available to chat
            available.push(socket);

            console.log("User " + socket.username + " is currently available to chat");
            console.log("User " + socket.username + " is looking to speak " + data.dest + " and knows " + data.source);

            // If there is someone to talk to
            if (available.length > 1) {

                var next = tryMatch(socket);

                // If that person is a valid person to talk to
                if (next != null) {

                    takeUser(socket);

                    var chat = chance.guid();

                    socket.join(chat);
                    socket.room = chat;
                    socket.partner = next;
                    socket.emit('enter', next.location);

                    next.join(chat);
                    next.room = chat;
                    next.partner = socket;
                    next.emit('enter', socket.location);

                    console.log("User " + socket.username + " has entered a chat with " + next.username + " in room " + socket.room);
                }
            }
        }
    });

    // When a user starts typing
    socket.on('typing_start', function (data) {
        socket.broadcast.emit('typing_start');
    });

    // When a user stops typing
    socket.on('typing_stop', function (data) {
        socket.broadcast.emit('typing_stop', data);
    });

    // When a user requests to leave a chat
    socket.on('leave', function (data) {
        leaveRoom(socket);
    });

    // When the user disconnects completely
    socket.on('disconnect', function (data) {
        if (!leaveRoom(socket)) {
            takeUser(socket);
        }
        user_count--;
        io.emit('update_count', user_count);
        console.log("User " + socket.username + " has logged off");
    });
});

// Entry point of the application
server.listen(4000, function () {
    console.log('Linguist is now running on http://127.0.0.1:4000');
});