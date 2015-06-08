define([
    'backbone',
    './models/chat',
    './models/map',
    './models/message',
    './models/user',
    './models/welcome',
    './models/window'
], function (Backbone, ChatModel, MapModel, MessageModel, UserModel, WelcomeModel, WindowModel) {

    var Models = {

        Chat: function (args) { return new ChatModel(args); },
        Map: function (args) { return new MapModel(args); },
        Message: function (args) { return new MessageModel(args); },
        User: function (args) { return new UserModel(args); },
        Welcome: function (args) { return new WelcomeModel(args) },
        Window: function (args) { return new WindowModel(args); }

    };

    return Models;

});
