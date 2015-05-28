define(function (require) {

    "use strict";

    // Include the dependencies
    var $ = require('jquery'),
        Chat = require('class/Chat'),
        Map = require('class/Map'),
        Dictionary = require('class/Dictionary');

    // Main class
    var Welcome = function (user, sock) {

        // Maintain the current object
        var self = this,
            socket = sock,
            userid = user;

        /*
         * Name: displayError()
         * Purpose: Prints an error with selection validation
         * Arguments:
                - String text: The error text to print
         * Returns: Void
         */
        this.displayError = function (text) {
            $("#welcome_window #error_text").fadeOut(function () {
                $(this).html(text);
                $(this).fadeIn();
            });
        };

        /*
         * Name: initialize()
         * Purpose: Initializes the view by importing our HTML
         * Arguments: None
         * Returns: Void
         */
        this.initialize = function (map) {

            // Retrieve the HTML from our view directory
            $.get("views/welcome", function (html) {
                //Fade out the main window first
                $("#welcome").fadeOut(function () {
                    // Load the HTML into the chat DIV
                    $("#welcome").html(html);
                    $("#welcome_window #error_text").hide();

                    $(".lang_list li").click(function () {
                        $(this.parentNode).eq(0).find("li").removeClass("selected");
                        $(this).addClass("selected");
                    });

                    $("#start_button").click(function () {
                        var source = $("#welcome_window #native").find(".selected"),
                            dest = $("#welcome_window #studying").find(".selected"),
                            source_lang = source.eq(0).attr("data-lang"),
                            dest_lang = dest.eq(0).attr("data-lang"),
                            chat = new Chat(source_lang, dest_lang, userid, socket);

                        if (source.length === 0 || dest.length === 0) {
                            self.displayError(Dictionary.Errors().ERR_SELECTION);
                        } else if (source.eq(0).attr("data-lang") === dest.eq(0).attr("data-lang")) {
                            self.displayError(Dictionary.Errors().ERR_LEARN_OWN_LANG);
                        } else {
                            $("#welcome").hide();
                            chat.initialize(map);
                        }
                    });

                    var map = new Map();
                    map.initialize();

                    $("#welcome").fadeIn();
                });
            });
        };
    };

    return Welcome;
});