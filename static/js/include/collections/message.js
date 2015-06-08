define([
    'jquery',
    'underscore',
    'backbone',
    'util/Dictionary',
    'util/Constants',
    '../models/message'
], function ($, _, Backbone, Dictionary, Constants, MessageModel) {

    var MessageCollection = Backbone.Collection.extend({
        model: MessageModel
    });

    return MessageCollection;

});
