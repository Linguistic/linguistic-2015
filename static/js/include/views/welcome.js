define([
    'jquery',
    'underscore',
    'backbone',
    'util/Dictionary',
    'util/Constants',
    './welcome_language_list',
    'text!templates/welcome_window.underscore'
], function ($, _, Backbone, Dictionary, Constants, LanguageListView, WelcomeWindowTmpl) {

    'use strict';

    var WelcomeView = Backbone.View.extend({

        id: 'welcome',

        template: _.template(WelcomeWindowTmpl),

        events: {
            'click #start_button': 'startChat'
        },

        initialize: function(options) {

            this.model = options.model;
            this.eventBus = options.eventBus;

            this.listenTo(this.model, 'change:error', this.renderError);
            this.listenTo(this.model.get('user'), 'change:source change:dest', this.render);
        },

        renderError: function() {

            var self = this,
                error = self.model.get('error'),
                $error_text = null;

            if(error && jQuery.trim(error).length !== 0) {

                $error_text = this.$el.find('#error_text');

                $error_text.fadeOut(function() {
                    $(this).html(self.model.get('error')).fadeIn();
                });

                return true;

            } else {

                return false;

            }
        },

        render: function () {
            console.log(this.model.get('error'));
            this.$el.html(this.template({
                error_text: this.model.get('error')
            }));

            this.nativeLanguageList = new LanguageListView({
                model: this.model,
                type: Constants.LanguageTypes().SOURCE,
                eventBus: this.eventBus
            });

            this.studyLanguageList = new LanguageListView({
                model: this.model,
                type: Constants.LanguageTypes().DESTINATION,
                eventBus: this.eventBus
            });

            this.$el.find('#native_list').html(this.nativeLanguageList.render().el);
            this.$el.find('#studying_list').html(this.studyLanguageList.render().el);

            return this;
        },

        startChat: function () {
            this.eventBus.trigger('new_chat');
        }

    });

    return WelcomeView;
});
