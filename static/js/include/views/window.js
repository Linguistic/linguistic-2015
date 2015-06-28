define([
    'jquery',
    'underscore',
    'backbone',
    'util/Dictionary'
], function ($, _, Backbone, Dictionary) {

    'use strict';

    var WindowView = Backbone.View.extend({

        el: '#container',

        initialize: function (options) {

            this.model = options.model;

            this.listenTo(this.model, 'change:screen', this.render);
            this.listenTo(this.model, 'change:user_count', this.updateUserCount);
        },

        updateUserCount: function () {
            var user_count = this.model.get('user_count');
            this.$el.parent().find('#user_count').html(user_count + Dictionary.Labels().LBL_PEOPLE_ONLINE);
        },

        render: function () {
            var screen = this.model.get('screen');
            this.$el.find('#content').html(screen.render().el);
            return this;
        }

    });

    return WindowView;
});
