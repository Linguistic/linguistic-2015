define([
    'backbone',
    './views/window',
    './views/welcome',
    './views/map',
    './views/chat'
], function (Backbone, WindowView, WelcomeView, MapView, ChatView) {

    var Views = {

        Chat: function (args) { return new ChatView(args); },
        Map: function (args) { return new MapView(args); },
        Welcome: function (args) { return new WelcomeView(args); },
        Window: function (args) { return new WindowView(args); }

    };

    return Views;

});
