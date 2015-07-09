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

        selectCorrectLanguage: function ($elements, callback, failed_callback) {

            var $element = null,
                source = this.user.get('source'),
                dest = this.user.get('dest'),
                lang = (this.type === Constants.LanguageTypes().DESTINATION) ? dest : source,
                failed = true;

            $elements.each(function () {

                var $element = $(this);

                if ($element.attr('data-lang') === lang) {
                    failed = false;
                    callback.call(this);
                }

            });

            if (failed) failed_callback();
        },

        render: function () {

            this.$el.html(this.template);

            var self = this,
                list_elements = this.$el.find('li'),
                option_elements = this.$el.find('option');

            this.selectCorrectLanguage(list_elements, function () {
                $(this).addClass('selected');
            }, function () {
                list_elements.each(function () {
                    $(this).removeClass('selected');
                });
            });

            this.selectCorrectLanguage(option_elements, function () {
                $(this).prop('selected', true);
            }, function () {
                option_elements.eq(0).prop('selected', true);
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
            var data_lang = $(e.currentTarget).attr('data-lang');
            this.setLanguage(data_lang);
        },

        mobileSelect: function (e) {
            var data_lang = $(e.currentTarget).find(':selected').eq(0).attr('data-lang');
            this.setLanguage(data_lang);
        }

    });

    return LanguageListView;

});
