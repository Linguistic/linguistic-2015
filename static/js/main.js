/* 
 * Main Javascript for Linguist
 *
 * Author: Tyler Nickerson
 * Copyright 2015 Linguist
 */

// Configuration for gettext
var json_locale_data;

// Initialize require.js        
require.config({
    baseUrl: '/static/js/',
    paths: {
        jquery: '/node_modules/jquery/dist/jquery.min',
        socketio: '/socket.io/socket.io',
        gettext: '/node_modules/i18n-abide/static/gettext'
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

require(['jquery', 'class/Welcome', 'socketio', 'gettext'], function ($, Welcome, io) {

    // Current language
    var current_lang = $("html").attr("lang");

    // Set the correct logo localization
    $("#logo").attr("src", "/static/images/logos/" + current_lang + ".png").show();

    $.ajax({
        url: 'locale/' + current_lang.replace('-','_') + '/messages.json',
        dataType: 'json',
        method: 'GET',
        success: function (data) {

            json_locale_data = {
                client: data["messages"]
            };

            var socket = io();

            // Occurs when a new user logs in or out
            socket.on('update_count', function (count) {
                $("#user_count").html(count + gettext('people online'));
            });

            // Occurs when a user is assigned a new user ID
            socket.on('assign', function (data) {
                var user = data["user"];
                var welcome = new Welcome(user, socket);
                welcome.initialize();
            });
        }
    });
});