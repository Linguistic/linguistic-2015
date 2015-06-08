define([
    'jquery',
    'underscore',
    'backbone',
    'util/Dictionary',
    'util/Constants'
], function ($, _, Backbone, Dictionary, Constants) {

    var MessageAreaView = Backbone.View.extend({

        tagName: 'ul',

        initialize: function (options) {

            var chat_messages, partner;

            this.model = options.model;

            this.listenTo(this.model, 'change:disconnected', this.pushDisconnect);
            this.listenTo(this.model, 'change:partner', this.pushPartnerStatus);
            this.listenTo(this.model, 'change:ui_state', this.render);

            this.listenTo(this.model.get('messages'), 'add', this.pushMessage);
        },

        hideElement: function (id) {
            this.$el.find('#' + id).first().hide();
        },

        showElement: function (id) {
            this.$el.find('#' + id).first().show();
        },

        removeItem: function (id, method) {

            switch (method) {

                // TODO: Replace these with variable constants
                case 'hard':
                    this.$el.find('#' + id).remove();
                    break;

                case 'soft':
                    this.$el.find('#' + id).fadeOut(
                        Constants.Chat().DEFAULT_TIMEOUT,
                        function () {
                            $(this).remove();
                        }
                    );
                    break;
            }
        },

        appendItem: function (html, css_class, id) {

            var $message_bullet, $prepends;

            // Create a new list element
            $message_bullet = $('<li>').addClass(css_class).html(html);

            // All list items where text should be prepended
            $prepends = this.$el.find('.prepend');

            // Add an id to the element if there is one
            if (id !== undefined && id !== null) {
                if (jQuery.trim(id).length !== 0) {
                    $message_bullet.attr('id', id);
                }
            }

            // Post text above all prepend items if applicable
            if ($prepends.length !== 0) {
                $prepends.eq($prepends.length - 1).before($message_bullet.fadeIn());
            } else {
                this.$el.append($message_bullet.fadeIn());
            }
        },

        pushMessage: function(model) {

            var css_class,
                current_user,
                is_current_user,
                sender,
                sender_label,
                text;

            current_user = this.model.get('user');

            sender = model.get('sender');
            text   = model.get('text');

            is_current_user = (sender === current_user.get('id'));

            sender_label = (is_current_user) ? Dictionary.Labels().LBL_ME : Dictionary.Labels().LBL_STRANGER;

            css_class = (is_current_user) ? 'me' : 'stranger';

            this.appendItem('<span>' + sender_label + ': </span>' + text, css_class);
        },

        pushDisconnect: function () {
            if(this.model.get('disconnected') === true) {
                this.appendItem(Dictionary.Messages().MSG_YOU_DISCONNECT, 'disconnected');
            }
        },

        updateUserTyping: function () {
            var
            partner = this.model.get('partner'),
            method = partner.get('typing_method'),
            //Conditions that must be met to say the partner is typing
            no_typing_tag = (this.$el.find('#typing_tag').length === 0),
            partner_is_typing = (partner && partner.get('typing'));

            if (no_typing_tag && partner_is_typing) {
                this.appendItem(Dictionary.Messages().MSG_PARTNER_TYPING, 'status_text prepend', 'typing_tag');
            } else {
                if (method !== 'hard') {
                    method = 'soft'
                }
                this.removeItem('typing_tag', method);
            }
        },

        pushPartnerStatus: function () {

            var city,
                location_text,
                partner,
                region;

            partner = this.model.get('partner');

            // If a partner exists, they just joined
            if (partner) {

                location_text = Dictionary.Messages().MSG_RAND_USER;

                city    = partner.get('city'),
                region  = partner.get('region');

                // Print their location information if it exists
                if (city && region) {
                    location_text   = 'You are now speaking to a native speaker from ' + city + ', ' + region;
                }

                this.appendItem(location_text, 'status_text', 'location_tag');

                this.listenTo(partner, 'change:typing', this.updateUserTyping);
            }

            // If a partner does not exist, they disconnected
            else {

                // Print the disconnect message
                this.appendItem(Dictionary.Messages().MSG_PARTNER_DISCONNECT, 'disconnected');
            }
        },

        render: function () {
            return this;
        }

    });

    return MessageAreaView;
});
