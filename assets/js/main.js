/* 
 * Main Javascript for Linguist
 *
 * Author: Tyler Nickerson
 * Copyright 2015 Linguist
 */

// Initialize require.js
require.config({
    baseUrl: '/assets/js/',
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
   require(['jquery', 'class/Welcome', 'socketio'], function($, Welcome, io) {
       
        var socket = io();

        // Occurs when a new user logs in or out
        socket.on('update_count', function(count) {
            $("#user_count").html(count + " people online");
        });
       
        // Occurs when a user is assigned a new user ID
        socket.on('assign', function(data) {
            var user = data["user"];
            var welcome = new Welcome(user, socket);
            welcome.initialize();
        });


    
   }); 
});