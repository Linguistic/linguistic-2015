define(function(require) {
    
    // Include the dependencies
    var $  = require('jquery');
    
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
            
            });
            
        };
    
    };
    
    return Welcome;
});