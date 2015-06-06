define(function (require) {

    'use strict';

    // Variable imports
    var $ = require('jquery');
    var Dictionary = require('class/Dictionary');
    var ContextMenu = require('class/ContextMenu');

    /*
     * Name: Chat()
     * Purpose: Main class constructor
     * Arguments:
            String source: the language code of the language the user speaks natively
            String dest: the language code of the language the user is learning
     * Returns: Chat
     */
    var Chat = function (source, dest, user, sock) {

        // Basic variables
        var self = this, // Used to maintain object state
            socket = sock,
            userID = user,
            map = null; // The Google Maps background

        this.source = source; // The language known
        this.dest = dest; // The language learned

        // Constants
        var WAITING = 0,
            CHATTING = 1,
            ENDED = 2,
            DEFAULT_TIMEOUT = 400; // milliseconds

        /*
         * Name: pushMessage()
         * Purpose: Appends a new message to the chat panel
         * Arguments:
         *      - String message: The content of the message to post
         *      - String css_class: CSS class of the new list tag
         * Returns: Void
         */
        this.pushMessage = function (message, css_class, id) {

            var $message_bullet = $('<li>').addClass(css_class).html(message),
                $prepends = $('#chat_messages ul .prepend');

            /* Create the element */
            if (id !== undefined && id !== null) {
                if (jQuery.trim(id).length !== 0) {
                    $message_bullet.attr('id', id);
                }
            }

            /*  Post text above any special text (such as 'user is typing')
                Otherwise, post regularly */
            if ($prepends.length !== 0) {
                $prepends.eq($prepends.length - 1).before($message_bullet.fadeIn());
            } else {
                $('#chat_messages ul').eq(0).append($message_bullet.fadeIn());
            }
        };

        /*
         * Name: updateState()
         * Purpose: Updates the state of the UI to reflect the status of the chat
         * Arguments: None
         * Returns: Void
         */
        this.updateState = function (state) {
            switch (state) {
            case WAITING:
                $('#send_button').hide();
                $('#disconnect_button').hide();
                $('#wait_preloader').show();
                $('#send_box').attr('placeholder', Dictionary.Messages().MSG_WAIT).prop('disabled', true);
                $('#chat_messages ul').fadeOut(DEFAULT_TIMEOUT, function () {
                    $(this).html('');
                });
                $("#chat_tooltip").hide();
                break;

            case CHATTING:

                // Fade in the chat messages
                $('#chat_messages ul').fadeIn(DEFAULT_TIMEOUT, function () {

                    // Timer to determine when user is typing
                    var timer, contextMenu;

                    // Disconnects if the user hits 'esc'
                    $(document.body).keyup(function (e) {
                        if (e.which === 27) {
                            self.disconnect();
                        }
                    });

                    // Initialize the context menu
                    // contextMenu = new ContextMenu($("#chat_tooltip"));
                    // contextMenu.initialize($("#chat_window #chat_messages"));

                    // Send a message when the chat form is submitted
                    $('#send_form').submit(function () {
                        clearTimeout(timer);
                        socket.emit('typing_stop', {
                            method: 'hard'
                        });
                        self.sendMessage($('#send_box').val());
                        $('#send_box').val('');
                        return false;
                    });

                    // Format textbox and write hooks to determine when user is typing
                    $('#send_box').attr('placeholder', Dictionary.Messages().MSG_CHAT_PLACEHOLDER).prop('disabled', false);
                    $('#send_box').keyup(function () {
                        clearTimeout(timer);
                        timer = setTimeout(function () {
                            socket.emit('typing_stop', {
                                method: 'soft'
                            });
                        }, 1000);
                    });
                    $('#send_box').keydown(function (e) {
                        if (e.which > 32) {
                            clearTimeout(timer);
                            socket.emit('typing_start');
                        }
                    });

                    $("#wait_preloader").hide();
                    $("#new_button").hide();

                    // Allow disconnect button to disconnect
                    $("#disconnect_button").show().click(self.disconnect);

                    // Enable the send message button
                    $('#send_button').show().click(function () {
                        $('#send_form').submit();
                    });

                });
                break;

            case ENDED:
                $('#send_box').val('').attr('placeholder', Dictionary.Messages().MSG_NEW).prop('disabled', 'true');
                $('#send_button').hide();
                $("#disconnect_button").hide();
                $('#new_button').show().click(function () {
                    $('#send_form').fadeOut(DEFAULT_TIMEOUT, function () {
                        self.requestPartner();
                    });
                });
                break;
            }

            $('#send_form').fadeIn();
        };


        /*
         * Name: disconnect()
         * Purpose: Disconnects from the current chat
         * Arguments: None
         * Returns: Void
         */
        this.disconnect = function () {
            socket.emit('leave');
            self.pushMessage(Dictionary.Messages().MSG_YOU_DISCONNECT, 'disconnected');
            self.updateState(ENDED);
        };

        /*
         * Name: requestPartner()
         * Purpose: Requests a new chat partner
         * Arguments: None
         * Returns: Void
         */
        this.requestPartner = function () {
            var message_data = {
                source: self.source,
                dest: self.dest
            };
            socket.emit('request', message_data);
            self.updateState(WAITING);
        };

        /*
         * Name: sendMessage()
         * Purpose: Sends a message from the current user ID
         * Arguments:
         *      - String message: The message to be sent
         * Returns: Void
         */
        this.sendMessage = function (message) {

            if (jQuery.trim(message).length !== 0) {
                socket.emit('message', {
                    'user': userID,
                    'message': message
                });
            }
        };

        /*
         * Name: initialize()
         * Purpose: Initializes the view by importing our HTML
         * Arguments: None
         * Returns: Void
         */
        this.initialize = function (map) {

            this.map = map;

            // Retrieve the HTML from our view directory
            $.get('views/chat', function (html) {

                // Load the HTML into the chat DIV
                $('#chat').html(html);

                // Request a partner
                self.requestPartner();
            });

            /* * * SOCKET FUNCTIONS * * */

            // Occurs when the user enters a chat with another user
            socket.on('enter', function (data) {
                self.updateState(CHATTING);

                // Give so leeway to allow any waiting function to finish
                setTimeout(function () {

                    self.pushMessage(Dictionary.Messages().MSG_RAND_USER, 'status_text', 'location_tag');
                    $('#location_tag').hide();

                    // Change the map accordingly
                    if (data.hasOwnProperty('loc') && data.hasOwnProperty('city') && data.hasOwnProperty('region')) {
                        if (data.city !== null && data.region !== null) {
                            var p_loc = data.loc.split(','),
                                p_lat = p_loc[0],
                                p_lng = p_loc[1],
                                p_city = data.city,
                                p_region = data.region;

                            map.setCenter(p_lat, p_lng);
                            $('#location_tag').html('You are now talking to a native speaker from ' + p_city + ', ' + p_region);
                        }
                    }

                    $('#location_tag').show();

                }, DEFAULT_TIMEOUT + 100);
            });

            // Occurs when the partner begins to type
            socket.on('typing_start', function (data) {
                if ($('#typing_tag').length === 0) {
                    self.pushMessage(Dictionary.Messages().MSG_PARTNER_TYPING, 'status_text prepend', 'typing_tag');
                }
            });

            // Occurs when the partner stops typing
            socket.on('typing_stop', function (data) {
                if (data.hasOwnProperty('method')) {
                    if ($('#typing_tag').length !== 0) {
                        if (data.method === 'soft') {
                            $('#typing_tag').fadeOut(function () {
                                $(this).remove();
                            });
                        } else if (data.method === 'hard') {
                            $('#typing_tag').remove();
                        }
                    }
                }
            });

            // Occurs when a user's partner disconnects from the chat
            socket.on('ended', function (data) {
                self.pushMessage(Dictionary.Messages().MSG_PARTNER_DISCONNECT, 'disconnected');
                self.updateState(ENDED);
            });

            // Occurs when a message is received
            socket.on('message', function (data) {

                var prepend = Dictionary.Labels().LBL_STRANGER,
                    css_class = 'stranger';

                // If we are the ones posting the message, make it clear
                if (data.user === userID) {
                    prepend = Dictionary.Labels().LBL_ME;
                    css_class = 'me';
                }

                self.pushMessage('<span>' + prepend + ': </span>' + data.message, css_class);
            });

        };

    };

    return Chat;
});
