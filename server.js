var express = require('express');
var app  	= express();
var http    = require('http');
var server 	= http.Server(app);
var io	 	= require('socket.io')(server);

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
        var user_socket = homeless[i]
        if((user_socket.source == socket.dest) &&
           (user_socket.dest   == socket.source)) {
            removeElement(homeless, user_socket);
            return user_socket;
        }
    }
    return null;
}

var extractLocation = function(data) {
    var data_json   = JSON.parse(data);
    var data_loc    = data_json.loc.split(',');
    var data_city   = data_json.city;
    var data_region = data_json.region;
    return {"loc":data_loc, "city":data_city, "region":data_region};
}

io.on('connection', function(socket) {

    var options = {
        host: 'ipinfo.io',
        port: 80,
        path: '/' + socket.request.connection.remoteAddress,
        method: 'GET'
    };
                    
    var req_socket = http.get(options, function(res_socket) {
        res_socket.setEncoding('utf8');
        res_socket.on('data', function (data) {
            var new_user = chance.guid();
            socket.location = JSON.parse(data);;
            socket.username = new_user;
            socket.emit('assign', { "user" : new_user });
            console.log("User " + socket.username + " has logged on with IP " + socket.handshake.headers.host);
        });    
    });
    
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
                    socket.emit('enter', next.location);

                    next.join(chat);
                    next.room = chat;
                    next.emit('enter', socket.location);

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

server.listen(4000, function() {
	console.log('listening on *:4000');
});
