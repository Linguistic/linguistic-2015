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
            'click li': 'desktopSelect',
            'change .mobile-select': 'mobileSelect'
        },

        initialize: function (options) {
            this.eventBus = options.eventBus;
            this.type = options.type;
            this.user = options.model.get('user');
        },

        selectCorrectLanguage: function ($elements, callback) {

            var $element = null,
                source = this.user.get('source'),
                dest = this.user.get('dest'),
                lang = (this.type === Constants.LanguageTypes().DESTINATION) ? dest : source;

            $elements.each(function () {

                var $element = $(this);

                if ($element.attr('data-lang') === lang) {
                    callback.call(this);
                }

            });
        },

        render: function () {

            this.$el.html(this.template);

            var self = this,
                list_elements = this.$el.find('li'),
                option_elements = this.$el.find('option');

            this.selectCorrectLanguage(list_elements, function () {
                $(this).addClass('selected');
            });

            this.selectCorrectLanguage(option_elements, function () {
                $(this).prop('selected', true);
            });

            return this;
        },

        setLanguage: function (language_code) {

            switch (this.type) {

            case Constants.LanguageTypes().SOURCE:
                this.eventBus.trigger('set_user_source', language_code);
                break;

            case Constants.LanguageTypes().DESTINATION:
                this.eventBus.trigger('set_user_dest', language_code);
                break;
            }
        },

        desktopSelect: function (e) {
            this.setLanguage(
                $(e.currentTarget).attr('data-lang')
            );
        },

        mobileSelect: function (e) {
            this.setLanguage(
                $(e.currentTarget).find(':selected').eq(0).attr('data-lang')
            );
        }

    });

    return LanguageListView;

});
