define([
    'jquery',
    'underscore',
    'backbone',
    'util/Dictionary',
    'util/Constants',
    'text!templates/chat_message_bar.underscore'
], function ($, _, Backbone, Dictionary, Constants, MessageBarTmpl) {

    var MessageBarView = Backbone.View.extend({

        tagName: 'form',

        id: 'send_form',

        events: {

            'submit': function (e) {
                this.eventBus.trigger('send_message', this.message());
                this.clear();
                return false;
            },

            'keydown #send_box': function (e) {
                if (e.keyCode > 32) {
                    this.eventBus.trigger('user_typing_start');
                }
            },

            'keyup #send_box': function () {
                this.eventBus.trigger('user_typing_stop');
            },

            'click #new_button': function (e) {
                e.preventDefault();
                this.eventBus.trigger('new_chat');
            },

            'click #disconnect_button': function (e) {
                e.preventDefault();
                this.eventBus.trigger('disconnect');
            },

            'click #send_button': function () {
                this.$el.submit();
            }
        },

        template: _.template(MessageBarTmpl),

        initialize: function (options) {
            this.eventBus = options.eventBus;
            this.model = options.model;

            this.listenTo(this.model, 'change:ui_state', this.render);
        },

        message: function () {
            return this.$el.find('#send_box').val();
        },

        clear: function () {
            this.$el.find('#send_box').val('');
        },

        showButtons: function (buttons) {
            var i, button_id;
            this.$el.find('.message_button').hide();
            for (i = 0; i < buttons.length; i++) {
                button_id = buttons[i];
                this.$el.find('#' + button_id).show();
            }
            this.delegateEvents(); //Redelegate events after change
        },

        resetTextbox: function (placeholder, disabled) {
            this.$el.find('#send_box')
                .val('')
                .attr('placeholder', placeholder)
                .prop('disabled', disabled);
        },

        render: function () {
            this.$el.html(this.template);
            this.postRender();
            return this;
        },

        postRender: function () {

            var state = this.model.get('ui_state') || Constants.Chat().UIStates().WAITING;

            switch (state) {
                case Constants.Chat().UIStates().WAITING:
                    this.showButtons([ 'wait_preloader' ]);
                    this.resetTextbox(Dictionary.Messages().MSG_WAIT, true);
                    break;

                case Constants.Chat().UIStates().CHATTING:
                    this.showButtons([ 'send_button', 'disconnect_button' ]);
                    this.resetTextbox(Dictionary.Messages().MSG_CHAT_PLACEHOLDER, false);
                    break;

                case Constants.Chat().UIStates().ENDED:
                    this.showButtons([ 'new_button' ]);
                    this.resetTextbox(Dictionary.Messages().MSG_NEW, true);
                    break;
            }
        }

    });

    return MessageBarView;
});
