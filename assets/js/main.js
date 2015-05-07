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

$("#send_button").click(function() {
	$("#send_form").submit();
});

socket.on('boot', function(data) {
    $('#chat_messages ul').eq(0).append($('<li>').html("Your chat partner has disconnected.").fadeIn());  
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

socket.on('assign', function(data) {
    userid = data["user"];
    socket.emit('request');
    $("#send_box").attr('placeholder', 'Waiting for a chat partner...').prop('disabled', true);   
});

socket.on('connected', function(data) {
   console.log("Currently in chat with user");
   $("#send_box").attr('placeholder', 'Click here to start typing').prop('disabled', false);
   $("#send_button").removeClass('uk-icon-spin uk-icon-circle-o-notch').addClass('uk-icon-send');
});