define(function(require) {
    
    // Include the dependencies
    var $    = require('jquery');
    var Chat = require('class/Chat');
    
    // Main class
    var Welcome = function(e) {

        // Maintain the current object
        var self = this; 
        
        /*
         * Name: initialize()
         * Purpose: Initializes the view by importing our HTML
         * Arguments: None
         * Returns: Void
         */
        this.initialize = function() {
            
            // Retrieve the HTML from our view directory
            $.get("views/welcome.html", function(html) {
                
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
                        $("#welcome_window #error_text").fadeIn();
                    } else {
                        $("#welcome").hide();
                        var chat = new Chat();
                        chat.initialize();    
                    }
                });
            });
            
        };
    
    };
    
    return Welcome;
});