// Linguistic Chat Event Bus
// Events for use by chat sockets and views

// Copyright 2015 Linguistic

define([
    'jquery',
    'underscore',
    'backbone',
    'push',
    'util/Dictionary',
    'util/Constants',
    'include/models',
    'include/views',
], function ($, _, Backbone, Push, Dictionary, Constants, Models, Views) {

    'use strict';

    var EventBus = function () {

        var self = this,
            models = {},
            client = null,
            is_alone = false,
            viewBus = _.extend({}, Backbone.Events),
            socketBus = _.extend({}, Backbone.Events),
            initSocketBus,
            initViewBus;

        self.viewEvents = function () {
            return viewBus;
        };

        self.socketEvents = function () {
            return socketBus;
        };

        self.init = function () {
            initSocketBus();
            initViewBus();
        };

        self.attachClient = function (chat_client) {
            client = chat_client;
        };

        initSocketBus = function () {

            socketBus.on('assign', function (data) {

                var user_id,
                    mapView,
                    windowView,
                    welcomeView;

                user_id = data.id;

                // Initialize models
                models.user = Models.User({
                    id: user_id
                });

                models.welcome = Models.Welcome({
                    user: models.user
                });

                models.window = Models.Window();

                models.map = Models.Map({
                    x: 44.5403,
                    y: -78.5463
                });

                // Initialize window view
                windowView = Views.Window({
                    model: models.window
                });

                // Load the map
                mapView = Views.Map({
                    model: models.map
                });

                mapView.render();
            });

            socketBus.on('enter', function (data) {

                var city,
                    latitude,
                    longitude,
                    region;

                latitude = data.points.x;
                longitude = data.points.y;
                city = data.city;
                region = data.region;

                models.partner = Models.User({
                    city: city,
                    region: region,
                    typing:false
                });

                models.chat.set({
                    partner: models.partner,
                    disconnected: false,
                    ui_state: Constants.Chat().UIStates().CHATTING
                });

                models.map.set({
                    x: latitude,
                    y: longitude
                });

            });

            socketBus.on('ended', function (data) {
                models.partner.set({
                    typing: false,
                    typing_method: 'hard'
                });
                models.chat.unset('partner');
                models.partner = null;
                models.chat.set({
                    ui_state: Constants.Chat().UIStates().ENDED
                });
            });

            socketBus.on('message', function (data) {

                var // Variables to validate valid data
                data_has_user = data.hasOwnProperty('sender'),
                data_has_message = data.hasOwnProperty('text');

                if (data_has_user && data_has_message) {

                    models.chat.addMessage({
                        sender: data.sender,
                        text: data.text
                    });

                } else {
                    console.error('Invalid data passed to message_received callback');
                }
            });

            socketBus.on('typing_start', function (data) {
                if (models.partner) {
                    models.partner.set({
                        typing: true
                    });
                }
            });

            socketBus.on('typing_stop', function (data) {
                if (models.partner) {
                    models.partner.set({
                        typing: false,
                        typing_method: data.method
                    });
                }
            });

            socketBus.on('update_count', function (count) {

                var active_screen, welcomeView, aloneView;

                // Update the count in the window
                models.window.set({
                    user_count: count
                });

                if (count > 1) {

                    // If the user was previously alone...
                    if  (is_alone) {

                        // Push a notification to the user's desktop
                        Push.create('Linguistic', {
                            icon: '/favicon.png',
                            body: 'Someone has logged on! You can now begin chatting.',
                            tag: 'chat_available'
                        });

                    }

                    // If no screen is currently showing
                    if (!models.window.get('screen')) {

                        // Create a welcome view
                        welcomeView = Views.Welcome({
                            model: models.welcome,
                            eventBus: self.viewEvents()
                        });

                    }

                    // The user is no longer alone
                    is_alone = false;

                    // Set the welcome view as the active screen
                    active_screen = welcomeView;

                } else {

                    // Create a default 'alone' view
                    aloneView = Views.Alone();

                    // Set this view as the default
                    active_screen = aloneView;

                    // The user is alone
                    is_alone = true;
                }

                // Set the active screen of the window
                models.window.set({
                    screen: active_screen
                });

            });
        };

        initViewBus = function () {

            viewBus.on('disconnect', function () {

                client.leave();

                models.chat.set({
                    disconnected: true,
                    ui_state: Constants.Chat().UIStates().ENDED
                });
            });

            viewBus.on('new_chat', function () {

                var chatView;

                if (!models.user.get('source') ||
                    !models.user.get('dest')) {

                    models.welcome.set({
                        error: 'Please select a language for each category first'
                    });

                } else if (models.user.get('source') === models.user.get('dest')) {

                    models.welcome.set({
                        error: 'You cannot learn your native language'
                    });

                } else {

                    models.welcome.unset('error');

                    if (client) {

                        client.requestNew(
                            models.user.get('source'),
                            models.user.get('dest')
                        );

                        models.chat = Models.Chat({
                            user: models.user
                        });

                        chatView = Views.Chat({
                            model: models.chat,
                            eventBus: self.viewEvents()
                        });

                        models.window.set({
                            screen: chatView
                        });

                    } else {

                        console.error('Chat client required to request partner (missing attachClient() call)');

                    }

                }

            });

            viewBus.on('send_message', function(message) {

                var user_id = models.user.get('id');

                if (jQuery.trim(message)) {
                    client.sendMessage(user_id, message);
                }

            });

            viewBus.on('set_user_dest', function (language_code) {
                models.user.set({
                    dest: language_code
                });
            });

            viewBus.on('set_user_source', function (language_code) {
                models.user.set({
                    source: language_code
                });
            });

            viewBus.on('user_typing_start', function () {
                client.startTyping();
            });

            viewBus.on('user_typing_stop', function () {
                client.stopTyping();
            });
        };

    };

    return EventBus;

});
