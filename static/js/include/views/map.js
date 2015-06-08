define([
    'jquery',
    'underscore',
    'backbone',
    'async!http://maps.google.com/maps/api/js?sensor=false'
], function ($, _, Backbone) {

    var MapView = Backbone.View.extend({

        el: '#map-canvas',

        initialize: function (options) {
            this.model = options.model;
            this.listenTo(this.model, 'change:x change:y', this.render);
        },

        render: function () {
            var
            mapCanvas = this.el,
            mapOptions = {
                center: new google.maps.LatLng(this.model.get('x'), this.model.get('y')),
                zoom: 16,
                mapTypeId: google.maps.MapTypeId.SATELLITE,
                disableDefaultUI: true
            };

            map = new google.maps.Map(mapCanvas, mapOptions);
        }
    });

    return MapView;

});
