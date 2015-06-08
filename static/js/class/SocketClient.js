define([
    'jquery',
    'underscore',
    'backbone',
    'socketio',
    'util/Dictionary',
    'util/Constants'
], function ($, _, Backbone, io, Dictionary, Constants) {

    'use strict';

    var SocketClient = function (eventBus) {

        var self = this,
            timer = null;

        self.events = eventBus;

        self.connect = function () {
            self.socket = io();
            self.listen();
        };

        self.leave = function () {
            self.socket.emit('leave');
        }

        self.requestNew = function (source, dest) {
            self.socket.emit('request', {
                source: source,
                dest: dest
            });
        };

        self.sendMessage = function (user, message) {
            self.socket.emit('typing_stop', {
                method: 'hard'
            });
            self.socket.emit('message', {
                sender: user,
                text: message
            });
        }

        self.startTyping = function () {
            clearTimeout(timer);
            self.socket.emit('typing_start');
        };

        self.stopTyping = function () {
            timer = setTimeout(function () {
                self.socket.emit('typing_stop', {
                    method: 'soft'
                });
            }, 1000);
        };

        self.listen = function () {

            self.socket.on('assign', function (data) {
                self.events.trigger('assign', data);
            });

            self.socket.on('enter', function (data) {
                self.events.trigger('enter', data);
            });

            self.socket.on('ended', function (data) {
                self.events.trigger('ended', data);
            });

            self.socket.on('message', function (data) {
                self.events.trigger('message', data);
            });

            self.socket.on('typing_start', function (data) {
                self.events.trigger('typing_start', data);
            });

            self.socket.on('typing_stop', function (data) {
                self.events.trigger('typing_stop', data);
            });

            self.socket.on('update_count', function (data) {
                self.events.trigger('update_count', data);
            });
        };
    };

    return SocketClient;

});
