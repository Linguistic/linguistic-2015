define([
    'jquery',
    'underscore',
    'backbone',
    'util/Dictionary',
    'util/Constants',
    'text!templates/welcome_language_list.underscore'
], function ($, _, Backbone, Dictionary, Constants, LanguageListTmpl) {

    'use strict';

    var LanguageListView = Backbone.View.extend({

        template: _.template(LanguageListTmpl),

        events: {
            'click li': 'setLanguage',
            'change .mobile-select': 'setLanguage'
        },

        initialize: function (options) {
            this.eventBus = options.eventBus;
            this.type = options.type;
            this.user = options.model.get('user');
        },

        render: function () {

            this.$el.html(this.template);

            var self = this,
                list_elements = this.$el.find('li');

            list_elements.each(function () {

                var element = $(this),
                    source = self.user.get('source'),
                    dest = self.user.get('dest'),
                    lang = (self.type === Constants.LanguageTypes().DESTINATION) ? dest : source;

                if (element.attr('data-lang') === lang) {
                    element.addClass('selected');
                }

            });

            return this;
        },

        setLanguage: function (e) {

            var $item = $(e.currentTarget),
                language_code = $item.attr('data-lang');

            switch (this.type) {

            case Constants.LanguageTypes().SOURCE:
                this.eventBus.trigger('set_user_source', language_code);
                break;

            case Constants.LanguageTypes().DESTINATION:
                this.eventBus.trigger('set_user_dest', language_code);
                break;
            }
        }

    });

    return LanguageListView;

});
