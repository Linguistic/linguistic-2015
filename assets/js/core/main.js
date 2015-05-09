/* 
 * Main Javascript for Linguist
 *
 * Author: Tyler Nickerson
 * Copyright 2015 Linguist
 */

// Initialize require.js
require.config({
    baseUrl: '/assets/js/core',
    paths: {
        jquery:   '/node_modules/jquery/dist/jquery.min',
        socketio: '/socket.io/socket.io'
    },
    shim: {
        jquery: {
            exports: '$'
        },
        socketio: {
            exports: 'io'
        }
    }
});

require(['main'], function() {
   require(['jquery', 'class/Chat'], function($, Chat) {
       var chat = new Chat();
       chat.initialize();
   }); 
});