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
        
        // Constants
        var WAITING  = 0;
        var CHATTING = 1;
        var ENDED    = 2;
        var DEFAULT_TIMEOUT = 400; // milliseconds
        
        // Global strings
        var CHAT_PLACEHOLDER = gettext('Click here to start typing (press \'Esc\' to disconnect)');
        var WAIT_TEXT        = gettext('Waiting for a chat partner...');
        var NEW_TEXT         = gettext('Start a new chat');
        
        // The Google location map
        var map = null;
        
        /*
         * Name: pushMessage()
         * Purpose: Appends a new message to the chat panel
         * Arguments:
         *      - String message: The content of the message to post
         *      - String css_class: CSS class of the new list tag
         * Returns: Void
         */
        var pushMessage = function(message, css_class, id) {
            
            // Create the element
            var $message_bullet = $('<li>').addClass(css_class).html(message);
            if(id !== undefined && id !== null) {
                if(jQuery.trim(id).length != 0) {
                    $message_bullet.attr('id', id);
                }    
            }
            
            // Post text above any special text (such as 'user is typing')
            // Otherwise, post regularly
            var prepends = $("#chat_messages ul .prepend");
            if(prepends.length != 0) {
                var last_prepend = prepends.eq(prepends.length - 1);    
                last_prepend.before($message_bullet.fadeIn());
            } else {
                $('#chat_messages ul').eq(0).append($message_bullet.fadeIn());    
            }
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
                    $("#send_button").click(function() {});
                    $("#send_box").attr('placeholder', WAIT_TEXT).prop('disabled', true);
                    $("#chat_messages ul").fadeOut(DEFAULT_TIMEOUT, function() {
                        $(this).html('');
                    });
                    break;
                    
                case CHATTING:
                    
                    // Fade in the chat messages
                    $("#chat_messages ul").fadeIn(DEFAULT_TIMEOUT, function() {
                        
                        // Timer to determine when user is typing
                        var timer;
                        
                        // Disconnects if the user hits 'esc'
                        $(document.body).keyup(function(e) {
                            if(e.which == 27) {
                                socket.emit('leave');
                                pushMessage('You have disconnected', 'disconnected');
                                updateState(ENDED);
                            }
                        });
                
                        // Send a message when the chat form is submitted
                        $('#send_form').submit(function() {
                            clearTimeout(timer);
                            socket.emit("typing_stop", { method: 'hard' });
                            self.sendMessage($("#send_box").val());
                            $("#send_box").val('');
                            return false;
                        });
                    
                        // Format textbox and write hooks to determine when user is typing
                        $("#send_box").attr('placeholder', CHAT_PLACEHOLDER).prop('disabled', false);
                        $("#send_box").keyup(function() {
                            clearTimeout(timer);
                            timer = setTimeout(function() {
                                socket.emit("typing_stop", { method: 'soft' });
                            }, 1000);
                        });
                        $("#send_box").keydown(function(e) {
                            if(e.which > 32) {
                                clearTimeout(timer); 
                                socket.emit("typing_start");   
                            }
                        });
                        
                        // Enable the send message button
                        $("#send_button").removeClass().addClass('uk-icon-send send clickable');
                        $("#send_button").click(function() {
                            $("#send_form").submit();
                        });
                        
                    });
                    break;
                    
                case ENDED:
                    $("#send_box").val('').attr('placeholder', NEW_TEXT).prop('disabled', 'true');
                    $("#send_button").removeClass().addClass('uk-icon-plus new clickable');
                    $("#send_button").click(function() {
                        $("#send_form").fadeOut(DEFAULT_TIMEOUT, function() {
                            self.requestPartner();  
                        });
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
            $.get("views/chat", function(html) {
                // Load the HTML into the chat DIV
                $("#chat").html(html);
                
                // Request a partner
                self.requestPartner();  
            });
            
            /* * * SOCKET FUNCTIONS * * */
            
            // Occurs when the user enters a chat with another user
            socket.on('enter', function(data) {
                updateState(CHATTING);
                
                // Give so leeway to allow any waiting function to finish
                setTimeout(function() {
                
                    pushMessage("You are now talking to a native speaker somewhere in the world", "status_text", "location_tag");
                    $("#location_tag").hide();
                    
                    // Change the map accordingly
                    if(data.hasOwnProperty("loc") && data.hasOwnProperty("city") && data.hasOwnProperty('region')) {
                      if(data.city != null && data.region != null) {
                            var p_loc    = data.loc.split(",");
    
                            var p_lat    = p_loc[0];
                            var p_lng    = p_loc[1];
    
                            var p_city   = data.city; 
                            var p_region = data.region;
    
                            map.setCenter(p_lat, p_lng); 
                            $("#location_tag").html("You are now talking to a native speaker from " + p_city + ", " + p_region);
                        }
                    } else { console.log(data); }
                    $("#location_tag").show();
                    
                }, DEFAULT_TIMEOUT + 100);
            });
            
            // Occurs when the partner begins to type
            socket.on('typing_start', function(data) {
                if($("#typing_tag").length == 0) {
                    pushMessage("Your partner is typing...", "status_text prepend", "typing_tag");   
                }
            });
            
            // Occurs when the partner stops typing
            socket.on('typing_stop', function(data) {
                if(data.hasOwnProperty('method')) {
                    if($("#typing_tag").length != 0) {
                        if(data.method == 'soft') {
                            $("#typing_tag").fadeOut(function() {
                                $(this).remove();    
                            });     
                        } else if (data.method == 'hard') {
                            $("#typing_tag").remove();
                        }
                    }    
                }
            });
            
            // Occurs when a user's partner disconnects from the chat
            socket.on('ended', function(data) {
                pushMessage("Your chat partner has disconnected.", 'disconnected');  
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
                
                pushMessage("<span>" + prepend + ": </span>" + data["msg"], css_class);
            });
            
        };
    
    };
    
    return Chat;
});