define([
    'backbone',
    './views/window',
    './views/welcome',
    './views/map',
    './views/chat',
    './views/alone'
], function (Backbone, WindowView, WelcomeView, MapView, ChatView, AloneView) {

    var Views = {

        Alone: function (args) { return new AloneView(args); },
        Chat: function (args) { return new ChatView(args); },
        Map: function (args) { return new MapView(args); },
        Welcome: function (args) { return new WelcomeView(args); },
        Window: function (args) { return new WindowView(args); }

    };

    return Views;

});
