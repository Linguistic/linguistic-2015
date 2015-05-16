define(function(require) {
    
    // Include the dependencies
    var $   = require('jquery');
    
    /*
     * Name: Chat()
     * Purpose: Main class constructor
     * Arguments:
            String source: the language code of the language the user speaks natively
            String dest: the language code of the language the user is learning
     * Returns: Chat
     */
    var Chat = function(source, dest, user, sock) {
        
        //Assign the language variables
        this.source = source;
        this.dest   = dest;
        
        // Our primary socket
        var socket = sock;
                
        // The GUID of the user
        var userid = user;
        
        // Maintain the current object
        var self = this; 
        
        // Variables 'constants'
        var WAITING  = 0;
        var CHATTING = 1;
        var ENDED    = 2;
        var DEFAULT_TIMEOUT = 400; // milliseconds
        
        // The Google location map
        var map = null;
        
        /*
         * Name: postMessage()
         * Purpose: Appends a new message to the chat panel
         * Arguments:
         *      - String message: The content of the message to post
         *      - String css_class: CSS class of the new list tag
         * Returns: Void
         */
        var postMessage = function(message, css_class) {
            
                console.log("locating");
            $('#chat_messages ul').eq(0).append($('<li>').addClass(css_class).html(message).fadeIn());
        }
            
        /*
         * Name: updateState()
         * Purpose: Updates the state of the UI to reflect the status of the chat
         * Arguments: None
         * Returns: Void
         */
        var updateState = function(state) {
            switch(state) {
                case WAITING:
                    $("#send_button").removeClass().addClass('uk-icon-spin uk-icon-circle-o-notch');
                    $("#send_box").attr('placeholder', 'Waiting for a chat partner...').prop('disabled', true);
                    $("#chat_messages ul").fadeOut(DEFAULT_TIMEOUT, function() {
                        $(this).html('');
                    });
                    break;
                    
                case CHATTING:
                    $("#chat_messages ul").fadeIn(DEFAULT_TIMEOUT, function() {
                        $("#send_box").attr('placeholder', 'Click here to start typing').prop('disabled', false);
                        $("#send_button").removeClass().addClass('uk-icon-send');
                        $("#send_button").click(function() {
                            $("#send_form").submit();
                        });
                    });
                    console.log("chatting");
                    break;
                    
                case ENDED:
                    $('#chat_messages ul').eq(0).append($('<li>').addClass('disconnected').html("Your chat partner has disconnected.").fadeIn());  
                    $("#send_box").val('').attr('placeholder', 'Start a new chat').prop('disabled', 'true');
                    $("#send_button").removeClass().addClass('uk-icon-plus');
                    $("#send_button").click(function() {
                        $("#send_form").fadeOut();
                        self.requestPartner(); 
                    });
                    break;
            }
            
            $("#send_form").fadeIn();
        }
        
        /*
         * Name: requestPartner()
         * Purpose: Requests a new chat partner
         * Arguments: None
         * Returns: Void
         */
        this.requestPartner = function() {
            var message_data = {
                source: self.source,
                dest: self.dest
            };
            socket.emit('request', message_data);
            updateState(WAITING);
        };
        
        /*
         * Name: sendMessage()
         * Purpose: Sends a message from the current user ID
         * Arguments:
         *      - String message: The message to be sent
         * Returns: Void
         */
        this.sendMessage = function(message) {
            
            if(jQuery.trim(message).length != 0) {
                socket.emit('message', {
                    "user" : userid,
                    "msg"  : message
                });
            }
        };
        
        /*
         * Name: initialize()
         * Purpose: Initializes the view by importing our HTML
         * Arguments: None
         * Returns: Void
         */
        this.initialize = function(map) {
            
            this.map = map;
                
            // Retrieve the HTML from our view directory
            $.get("views/chat.html", function(html) {
               // Load the HTML into the chat DIV
                $("#chat").html(html);
                
                // Send a message when the chat form is submitted
                $('#send_form').submit(function() {
                    self.sendMessage($("#send_box").val());
                    $("#send_box").val('');
        	        return false;
                });
                
                self.requestPartner();  
            });
            
            /* * * SOCKET FUNCTIONS * * */
            
            // Occurs when the user enters a chat with another user
            socket.on('enter', function(data) {
                
                // Give so leeway to allow any waiting function to finish
                setTimeout(function() {
                    updateState(CHATTING);
                
                    postMessage("You are now talking to a native speaker somewhere in the world", "location_text");
                    $(".location_text").hide();
                    
                    // Change the map accordingly
                    if(data.hasOwnProperty("loc") && data.hasOwnProperty("city") && data.hasOwnProperty('region')) {
                      if(data.city != null && data.region != null) {
                            var p_loc    = data.loc.split(",");
    
                            var p_lat    = p_loc[0];
                            var p_lng    = p_loc[1];
    
                            var p_city   = data.city; 
                            var p_region = data.region;
    
                            map.setCenter(p_lat, p_lng); 
                            $(".location_text").html("You are now talking to a native speaker from " + p_city + ", " + p_region);
                        }
                    } else { console.log(data); }
                    $(".location_text").show();
                    
                }, DEFAULT_TIMEOUT + 100);
            });
            
            // Occurs when a user's partner disconnects from the chat
            socket.on('leave', function(data) {
                updateState(ENDED);
            });
            
            // Occurs when a message is received
            socket.on('message', function(data) {
                
                var prepend = "Stranger";
                var css_class = "them";
                
                // If we are the ones posting the message, make it clear
                if(data["user"] == userid) {
                    prepend = "Me";
                    css_class = "me"
                }
                
                postMessage("<span>" + prepend + ": </span>" + data["msg"], css_class);
            });
            
        };
    
    };
    
    return Chat;
});