define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/alone.underscore'
], function ($, _, Backbone, template) {

    'use strict';

    var AloneView = Backbone.View.extend({

      id: 'alone',

      template: _.template(template),

      render: function () {
          this.$el.html(this.template);
          return this;
      }

    });

    return AloneView;
});
