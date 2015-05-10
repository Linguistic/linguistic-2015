var express = require('express');
var app  	= express();
var http 	= require('http').Server(app);
var io	 	= require('socket.io')(http);

var Chance  = require('chance'),
chance = new Chance();

app.use('/', express.static(__dirname));
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

var tryMatch = function(socket) {
    for(var i = 0; i < homeless.length; i++) {
        if((homeless[i].source == socket.dest) &&
           (homeless[i].dest   == socket.source)) {
            return homeless[i];
        }
    }
    return null;
}

io.on('connection', function(socket) {
    var new_user = chance.guid();
    socket.username = new_user;
    socket.emit('assign', { "user" : new_user });
    console.log("User " + socket.username + " has logged on");
    
	socket.on('message', function(data) {
        io.in(socket.room).emit('message', data);
	});
    
    socket.on('request', function(data) {
        
        if(data.hasOwnProperty('source') && data.hasOwnProperty('dest')) {
            
            console.log("User " + socket.username + " is currently available to chat");
            
            socket.source = data.source;
            socket.dest   = data.dest;
            
            console.log("User " + socket.username + " is looking to speak " + data.dest + " and knows " + data.source);
            homeless.push(socket);
            
            if(homeless.length > 1) {
                
                var next = tryMatch(socket);
                
                if(next != null) {
                    
                    removeElement(homeless, socket);
                    
                    var chat = chance.guid();

                    socket.join(chat);
                    socket.room = chat;
                    socket.emit('enter');

                    next.join(chat);
                    next.room = chat;
                    next.emit('enter');

                    console.log("User " + socket.username + " has entered a chat with " + next.username + " in room " + socket.room);   
                }
            }
        }
	});
    
    socket.on('disconnect', function(data) {
        if(socket.room !== undefined) {
            io.in(socket.room).emit('leave');
        } else {
            removeElement(homeless, socket);
        }
        console.log("User " + socket.username + " has logged off");
    });
});

http.listen(4000, function() {
	console.log('listening on *:4000');
});
