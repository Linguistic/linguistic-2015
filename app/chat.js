/**
 * Linguistic Chat Server
 *
 * Copyright (c) 2015 Linguistic
 * All Rights Reserved
 */

var ChatServer = function (http, io) {

    var

    // Used to maintain state consistency
    self = this,

    // Used for generating UUIDs
    chance = require('chance')(),

    // The number of users online
    user_count = 0;

    // Used to store users who are currently available to chat
    available = [];

    // Socket.io
    self.io = io;

    // HTTP object
    self.http = http;

    /**
     * Removes a user from the available users array
     * @param {socket} user A socket that contains user information
     * @return {void}
     */
     function takeUser (user) {
        for (var i = 0; i < available.length; i++) {
            if (available[i].username == user.username) {
                available.splice(i, 1);
            }
        }
    }

    /**
     * Attempts to match a user with another user to chat with
     * @param {socket} user - A socket that contains user information
     * @return {socket} The socket of the matched user
     */
    function tryMatch (user) {

        for (var i = 0; i < available.length; i++) {

            var available_user = available[i];

            if ((available_user.source == user.dest) &&
                (available_user.dest == user.source)) {

                takeUser(available_user);

                return available_user;

            }

        }

        return null;
    }

    /**
     * Extracts the location data from a ipinfo.io JSON object
     * @param {string} data - A JSON string with location data
     * @return {array} An array of the location, city, and region data from the original JSON
     */
    function extractLocation (data) {

        try {
            var
            data_json = JSON.parse(data),
            data_loc = data_json.loc.split(','),
            data_city = data_json.city,
            data_region = data_json.region;

            return {
                points: {
                    x: data_loc[0],
                    y: data_loc[1]
                },
                city: data_city,
                region: data_region
            };
        } catch (e) {
            return [];
        }
    }

    /**
     * Disconnects a socket from its current room
     * @param {socket} socket The socket to disconnect
     * @return {void}
     */
    function leaveRoom (socket) {

        if (socket.room &&
            socket.partner &&
            socket.partner.room) {

            var room = socket.room;

            // Leave the room and tell the partner you left
            socket.leave(room);
            self.io.in(room).emit('ended');
            socket.partner.leave(room);

            socket.room = null;
            socket.partner.room = null;

            return true;

        } else {

            // Return false if the socket isn't in a room
            return false;
        }
    }

    self.init = function () {
        self.io.on('connection', function (socket) {
            self.createUser(socket);
        });
    };

    /**
     * Create a new user
     * @param {socket} socket - Socket in which to write the data
     * @return {void}
     */
    self.createUser = function (socket) {

        var

        // Get the user's IP address
        ip = socket.request.headers['x-forwarded-for'] || socket.request.connection.remoteAddress,

        // Make a request to ipinfo to get their location
        req_socket = http.get({
            host: 'ipinfo.io',
            port: 80,
            path: '/' + ip,
            method: 'GET'
        }, function (res_socket) {

            res_socket.setEncoding('utf8');

            // Process the returned data
            res_socket.on('data', function (data) {

                // Generate user UUID
                var new_user = chance.guid();

                // Write data to the socket
                socket.location = extractLocation(data);
                socket.username = new_user;

                // Assign this info to the new user
                socket.emit('assign', {
                    id: new_user
                });

                // Increment the user count
                user_count++;
                self.io.emit('update_count', user_count);

                console.log("User " + socket.username + " has logged on");

                // Initiate listener events
                self.listen(socket);
            });
        });
    };

    /**
     * Initialize socket listeners
     * @param {socket} socket - The socket to listen on
     * @return {void}
     */
    self.listen = function (socket) {

        // When the user disconnects completely
        socket.on('disconnect', function (data) {

            // If the user isn't in a room,
            // remove them from the available users list
            if (!leaveRoom(socket)) {
                takeUser(socket);
            }

            // Decrement the user count
            user_count--;
            self.io.emit('update_count', user_count);

            console.log("User " + socket.username + " has logged off");
        });

        // When a user requests to leave a chat
        socket.on('leave', function (data) {

            // Remove them from the room they're in
            leaveRoom(socket);

            console.log(socket.username + " has left the current room");
        });

        // When a message has been received
        socket.on('message', function (data) {
            self.io.in(socket.room).emit('message', data);
        });

        // When the user desires a new chat partner
        socket.on('request', function (data) {

            var next, chat;

            if (data.hasOwnProperty('source') && data.hasOwnProperty('dest')) {

                // Set the known and desired language of choice
                socket.source = data.source;
                socket.dest = data.dest;

                // Tell the world the user is available to chat
                available.push(socket);

                console.log("User " + socket.username + " is currently available to chat");
                console.log("User " + socket.username + " is looking to speak " + data.dest + " and knows " + data.source);

                // If there is someone to talk to
                if (available.length > 1) {

                    // Attempt to find the user a partner
                    next = tryMatch(socket);

                    // If that person is a valid person to talk to
                    if (next !== null) {

                        // Remove them from the available users list
                        takeUser(socket);

                        chat = chance.guid();

                        socket.join(chat);
                        socket.room = chat;
                        socket.partner = next;
                        socket.emit('enter', next.location);

                        next.join(chat);
                        next.room = chat;
                        next.partner = socket;
                        next.emit('enter', socket.location);

                        console.log("User " + socket.username + " has entered a chat with " + next.username + " in room " + socket.room);
                    }
                }
            }
        });

        // When a user starts typing
        socket.on('typing_start', function (data) {
            socket.broadcast.emit('typing_start');
        });

        // When a user stops typing
        socket.on('typing_stop', function (data) {
            socket.broadcast.emit('typing_stop', data);
        });

    };

};

module.exports = ChatServer;
