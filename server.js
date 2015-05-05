var $ 	 	= require('jquery');
var express = require('express');
var app  	= express();
var http 	= require('http').Server(app);
var io	 	= require('socket.io')(http);

app.use('/css', express.static(__dirname + '/assets/css/core'));
app.use('/js', express.static(__dirname + '/assets/js/'));
app.use('/images', express.static(__dirname + '/assets/img'));
app.use('/uikit', express.static(__dirname + '/bower_components/uikit/css'));
app.use('/jquery', express.static(__dirname + '/bower_components/jquery/dist'));
app.use('/fonts/vegur', express.static(__dirname + '/assets/css/fonts/vegur'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

var homeless = [];

var guid = (function() {
    
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
    }
    
    return function() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    };
    
})();

var removeElement = function(array, element) {
    for(var i = 0; i < array.length; i++) {
        if(array[i] == element) {
            array.splice(i, 1);
        }
    }
};

var matchUser = function(user) {

    removeElement(homeless, user);
    
    var next = homeless.shift();
    var chat = guid();
    
    io.emit('assign', { 
        user : user, 
        chat : chat, 
        partner : next 
    });

    io.emit('assign', { 
        user : next, 
        chat : chat, 
        partner : user
    });
    
    console.log("User " + user + " has entered a chat with " + next);
};

io.on('connection', function(socket) {
    var new_user = guid();
    io.emit('enter', { user : new_user });
    console.log("User " + new_user + " has logged on");
    
	socket.on('message', function(data) {
		io.emit('message', data);
	});
    
    socket.on('request', function(data) {
        if(data.hasOwnProperty("uid")) {
            console.log("User " + data["uid"] + " is currently available to chat");
            homeless.push(data["uid"]);
            if(homeless.length > 1) {
                matchUser(data["uid"]);
            }
        }
	});
    
    socket.on('leave', function(data) {
        if(data.hasOwnProperty("uid")) {
            var uid = data["user"];
            console.log("User " + uid + " has left");
        }
    });
});

http.listen(4000, function() {
	console.log('listening on *:3000');
});
