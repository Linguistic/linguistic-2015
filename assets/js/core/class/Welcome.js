define(function(require) {
    
    // Include the dependencies
    var $    = require('jquery');
    var Chat = require('class/Chat');
    var Map = require('class/Map');
    
    // Main class
    var Welcome = function(e) {

        // Maintain the current object
        var self = this; 
        
        /*
         * Name: displayError()
         * Purpose: Prints an error with selection validation
         * Arguments:
                - String text: The error text to print
         * Returns: Void
         */
        var displayError = function(text) {
            $("#welcome_window #error_text").fadeOut(function() {
                $(this).html(text);
                $(this).fadeIn();
            });
        }
        
        /*
         * Name: initialize()
         * Purpose: Initializes the view by importing our HTML
         * Arguments: None
         * Returns: Void
         */
        this.initialize = function() {
            
            // Retrieve the HTML from our view directory
            $.get("views/welcome.html", function(html) {
                //Fade out the main window first
                $("#welcome").fadeOut(function() {
                    // Load the HTML into the chat DIV
                    $("#welcome").html(html);
                    $("#welcome_window #error_text").hide();

                    $(".lang_list li").click(function() {
                        $(this.parentNode).eq(0).find("li").removeClass("selected");
                        $(this).addClass("selected");
                    });

                    $("#start_button").click(function() {
                        var source = $("#welcome_window #native").find(".selected");
                        var dest   = $("#welcome_window #studying").find(".selected");
                        if(source.length == 0 || dest.length == 0) {
                            displayError("Please select a language for each category first.");
                        } else if(source.eq(0).attr("data-lang") == dest.eq(0).attr("data-lang")) {
                            displayError("You cannot learn your native language.");
                        } else {
                            $("#welcome").hide();
                            var source_lang = source.eq(0).attr("data-lang");
                            var dest_lang = dest.eq(0).attr("data-lang");
                            var chat = new Chat(source_lang, dest_lang);
                            chat.initialize();    
                        }
                    }); 
                    
                    map = new Map();
                    map.initialize();
                    
                    $("#welcome").fadeIn();
                });
            });
        };
    };
    
    return Welcome;
});