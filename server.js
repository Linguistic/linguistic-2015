var $ 	 	= require('jquery');
var express = require('express');
var app  	= express();
var http 	= require('http').Server(app);
var io	 	= require('socket.io')(http);

app.use('/css', express.static(__dirname + '/assets/css/core'));
app.use('/js', express.static(__dirname + '/assets/js/core'));
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
};

io.on('connection', function(socket) {
    var new_user = guid();
    io.emit('enter', { user : new_user });
    
	socket.on('message', function(data) {
		io.emit('message', data);
	});
    
    socket.on('request', function(data) {
        if(data.hasOwnProperty("uid")) {
            homeless.push(data["uid"]);
            if(homeless.length > 1) {
                console.log(homeless.length);
                matchUser(data["uid"]);
            }
        }
	});
    

});

http.listen(3000, function() {
	console.log('listening on *:3000');
});
