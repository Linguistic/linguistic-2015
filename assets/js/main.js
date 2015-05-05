var socket = io();
var userid, chatid;

$(window).bind("beforeunload", function() {
    socket.emit('leave', {
        user: userid
    });
});

$('#send_form').submit(function() {
    socket.emit('message', {
        "uid" : userid,
        "cid" : chatid, 
        "msg" : $("#send_box").val()
    });

	$("#send_box").val('');
	return false;
});

$("#send_button").click(function() {
	$("#send_form").submit();
});

socket.on('message', function(data) {
	if(data["cid"] == chatid) {
        var prepend = "Stranger";
        var css_class = "them";
        if(data["uid"] == userid) {
            prepend = "Me";
            css_class = "me"
        }
        $('#chat_messages ul').eq(0).append($('<li>').addClass(css_class).html("<span>" + prepend + ": </span>" + data["msg"]).fadeIn());   
	}
});

socket.on('enter', function(data) {
    if(userid == undefined) {
        userid = data["user"];
        console.log("Running as user " + userid);
        socket.emit('request', { "uid" : userid });
        $("#send_box").attr('placeholder', 'Waiting for a chat partner...').prop('disabled', true);   
    }
});

socket.on('assign', function(data) {
   if(data["user"] == userid) {
       chatid = data["chat"];
       console.log("Currently in chat " + chatid + " with user " + data["partner"]);
       $("#send_box").attr('placeholder', 'Click here to start typing').prop('disabled', false);
       $("#send_button").removeClass('uk-icon-spin uk-icon-circle-o-notch').addClass('uk-icon-send');
   }
});