var socket = io();
var userid;

$('#send_form').submit(function() {
    socket.emit('message', {
        "user" : userid,
        "msg" : $("#send_box").val()
    });
    
	$("#send_box").val('');
	return false;
});

socket.on('leave', function(data) {
    $("#send_button").removeClass().addClass('uk-icon-plus');
    $("#send_box").val('').attr('placeholder', 'Start a new chat').prop('disabled', 'true');
    
    $('#chat_messages ul').eq(0).append($('<li>').addClass('disconnected').html("Your chat partner has disconnected.").fadeIn());  
    $("#send_button").click(function() {
        $("#send_form").fadeOut();
        socket.disconnect();
        socket.connect();  
    });
    
    $("#send_form").fadeIn();
});

socket.on('message', function(data) {
    var prepend = "Stranger";
    var css_class = "them";
    console.log(data);
    if(data["user"] == userid) {
        prepend = "Me";
        css_class = "me"
    }
    $('#chat_messages ul').eq(0).append($('<li>').addClass(css_class).html("<span>" + prepend + ": </span>" + data["msg"]).fadeIn()); 
});

var waitingState = function() {
    $("#chat_messages ul").fadeOut(function() {
        $(this).html('');
        $(this).fadeIn();
    });
    $("#send_button").removeClass().addClass('uk-icon-spin uk-icon-circle-o-notch');
    $("#send_box").attr('placeholder', 'Waiting for a chat partner...').prop('disabled', true);   
    $("#send_form").fadeIn();
}

socket.on('assign', function(data) {
    userid = data["user"];
    socket.emit('request');
    waitingState();
});

socket.on('enter', function(data) {
    console.log("Currently in chat with user");
                           
    $("#send_button").removeClass().addClass('uk-icon-send');
    $("#send_box").attr('placeholder', 'Click here to start typing').prop('disabled', false);
    
    $("#send_button").click(function() {
        $("#send_form").submit();
    });
    
    $("#send_form").fadeIn();
});