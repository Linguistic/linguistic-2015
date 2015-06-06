define(function (require) {

    'use strict';

    // Include the dependencies
    var $ = require('jquery'),
        Chat = require('class/Chat'),
        Map = require('class/Map'),
        Dictionary = require('class/Dictionary'),
        Constants = require('class/Constants'),
        Welcome;

    // Main class
    Welcome = function (user, sock) {

        // Maintain the current object
        var self = this,
            socket = sock,
            userid = user;

        this.source = 'en';
        this.dest = 'en';

        /*
         * Name: displayError()
         * Purpose: Prints an error with selection validation
         * Arguments:
                - String text: The error text to print
         * Returns: Void
         */
        this.displayError = function (text) {
            $('#welcome #error_text').fadeOut(function () {
                $(this).html(text);
                $(this).fadeIn();
            });
        };

        /*
         * Name: setLanguage()
         * Purpose: Sets the source language (native language)
         * Arguments:
         *      - Object el: The element to extract the language data from
         *      - Integer type: The type of language to set (source/destination)
         * Returns: Boolean denotting whether operation completed successfully
         */
        this.setLanguage = function (el, type) {

            var lang = $(el).attr('data-lang');

            switch (type) {
                case Constants.LanguageTypes().SOURCE:
                    console.log('Set source to ' + lang);
                    self.source = lang;
                    break;

                case Constants.LanguageTypes().DESTINATION:
                    console.log('Set dest to ' + lang);
                    self.dest = lang;
                    break;
            }
        };

        /*
         * Name: launchChat()
         * Purpose: Begins a new chat with the specified languages
         * Arguments:
         *      - Map map: The Google Maps object to use
         *      - String sourceLang: The source (native) language
         *      - String destLang: The destination (learned) language
         * Returns: Void
         */
        this.launchChat = function (map, sourceLang, destLang) {
            var chat = new Chat(sourceLang, destLang, userid, socket);
            if (sourceLang === null || destLang === null) {
                self.displayError(Dictionary.Errors().ERR_SELECTION);
            } else if (sourceLang === destLang) {
                self.displayError(Dictionary.Errors().ERR_LEARN_OWN_LANG);
            } else {
                chat.initialize(this.map);
                $('#welcome').hide();
            }
        };

        /*
         * Name: initialize()
         * Purpose: Initializes the view by importing our HTML
         * Arguments: None
         * Returns: Void
         */
        this.initialize = function (map) {

            // Retrieve the HTML from our view directory
            $.get('views/welcome', function (html) {

                // The Google map
                var map = new Map();
                map.initialize();

                //Fade out the main window first
                $('#welcome').fadeOut(function () {

                    // Load the HTML into the chat DIV
                    $('#welcome').html(html);
                    $('#welcome #error_text').hide();

                    // Enable language selection
                    $('#welcome .lang_list li').click(function () {
                        $(this.parentNode).eq(0).find('li').removeClass('selected');
                        $(this).addClass('selected');
                    });

                    // Allow selectboxes and buttons to wire the language settings
                    $('#welcome').find('#native-mobile').change(function () { self.setLanguage($(this).find(':selected')[0], Constants.LanguageTypes().SOURCE); });
                    $('#welcome').find('#studying-mobile').change(function () { self.setLanguage($(this).find(':selected')[0], Constants.LanguageTypes().DESTINATION); });

                    $('#welcome').find('#native li').click(function () { self.setLanguage(this, Constants.LanguageTypes().SOURCE); });
                    $('#welcome').find('#studying li').click(function () { self.setLanguage(this, Constants.LanguageTypes().DESTINATION); });

                    // The 'Enter' button
                    $('#start_button').click(function () { self.launchChat(map, self.source, self.dest); });

                    $('#welcome').fadeIn();
                });
            });
        };
    };

    return Welcome;
});
