var express = require('express');
var app  	= express();
var http 	= require('http').Server(app);
var io	 	= require('socket.io')(http);

var Chance  = require('chance'),
chance = new Chance();

app.use('/css', express.static(__dirname + '/assets/css/core'));
app.use('/js', express.static(__dirname + '/assets/js/'));
app.use('/images', express.static(__dirname + '/assets/img'));
app.use('/uikit/css', express.static(__dirname + '/node_modules/uikit/dist/css'));
app.use('/uikit/js', express.static(__dirname + '/node_modules/uikit/dist/js'));
app.use('/uikit/fonts', express.static(__dirname + '/node_modules/uikit/dist/fonts'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/fonts/vegur', express.static(__dirname + '/assets/css/fonts/vegur'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

var homeless = [];

var removeElement = function(array, element) {
    for(var i = 0; i < array.length; i++) {
        if(array[i].username == element.username) {
            array.splice(i, 1);
        }
    }
};

io.on('connection', function(socket) {
    var new_user = chance.guid();
    socket.username = new_user;
    socket.emit('assign', { "user" : new_user });
    console.log("User " + socket.username + " has logged on");
    
	socket.on('message', function(data) {
        io.in(socket.room).emit('message', data);
	});
    
    socket.on('request', function(data) {
        console.log("User " + socket.username + " is currently available to chat");
        homeless.push(socket);
        if(homeless.length > 1) {
            
            removeElement(homeless, socket);
    
            var next = homeless.shift();
            var chat = chance.guid();
            
            socket.join(chat);
            socket.room = chat;
            socket.emit('connected');
            
            next.join(chat);
            next.room = chat;
            next.emit('connected');
            
            console.log("User " + socket.username + " has entered a chat with " + next.username + " in room " + socket.room);
        }
	});
    
    socket.on('disconnect', function(data) {
        if(socket.room !== undefined) {
            io.in(socket.room).emit('boot');
        } else {
            removeElement(homeless, socket);
        }
        console.log("User " + socket.username + " has logged off");
    });
});

http.listen(4000, function() {
	console.log('listening on *:4000');
});
