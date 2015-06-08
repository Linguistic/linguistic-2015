/*
 * Main Javascript for Linguist
 *
 * Author: Tyler Nickerson
 * Copyright 2015 Linguist
*/

var json_locale_data = [];

require(['jquery',
         'socketio',
         'class/SocketClient',
         'class/EventBus',
         'stacktrace',
         'gettext'], function ($, io, SocketClient, EventBus, printStackTrace) {

    var current_lang = 'en-US';
    $("#logo").attr("src", "/static/images/logos/" + current_lang + ".png").show();

    var eventBus = new EventBus(),
        socketClient = new SocketClient(eventBus.socketEvents());

    eventBus.attachClient(socketClient);
    eventBus.init();

    socketClient.connect();

//    window.onbeforeunload = function (e) {
//
//      var message = "Your confirmation message goes here.",
//      e = e || window.event;
//
//      // For IE and Firefox
//      if (e) {
//        e.returnValue = message;
//      }
//
//      var trace = printStackTrace();
//      console.log(trace);
//
//      // For Safari
//      return message;
//    };


});
