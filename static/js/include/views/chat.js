define([
    'jquery',
    'underscore',
    'backbone',
    'util/Dictionary',
    'util/Constants',
    './chat_message_area',
    './chat_message_bar',
    'text!templates/chat_window.underscore'
], function ($, _, Backbone, Dictionary, Constants, MessageAreaView, MessageBarView, ChatTmpl) {

    'use strict';

    var ChatView = Backbone.View.extend({

        id: 'chat',

        template: _.template(ChatTmpl),

        initialize: function (options) {

            var child_options;

            this.model = options.model;
            this.eventBus = options.eventBus;

            child_options = {
                eventBus: this.eventBus,
                model: this.model
            };

            this.messageBar = new MessageBarView(child_options);
            this.messageArea = new MessageAreaView(child_options);

            this.listenTo(this.model, 'change:ui_state', this.render);
            this.listenTo(this.model, 'change:disconnected', this.pushDisconnect);
        },

        render: function () {

            this.$el.html(this.template);

            this.$el.find('#message_area').html(this.messageArea.render().el);
            this.$el.find('#message_bar').html(this.messageBar.render().el);

            return this;
        }

    });

    return ChatView;
});
