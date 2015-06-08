define([
    'jquery',
    'underscore',
    'backbone',
    'util/Dictionary',
    'util/Constants',
    './message',
    '../collections/message'
], function ($, _, Backbone, Dictionary, Constants, MessageModel, MessageCollection) {

    'use strict';

    var ChatModel = Backbone.Model.extend({

        defaults: {
            user: null,
            partner: null,
            ui_state: Constants.Chat().UIStates().WAITING,
            messages: new MessageCollection()
        },

        addMessage: function (message) {

            this.get('messages').add(new MessageModel({
                sender: message.sender,
                text: message.text
            }));

        }

    });

    return ChatModel;

});
