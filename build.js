({
    baseUrl: './static/js',
    paths: {
        async: '../../node_modules/requirejs-plugins/src/async',
        backbone: '../../node_modules/backbone/backbone-min',
        gettext: '../../node_modules/i18n-abide/static/gettext',
        jquery: '../../node_modules/jquery/dist/jquery.min',
        socketio: '../../node_modules/socket.io/node_modules/socket.io-client/socket.io',
        stacktrace: '../../node_modules/stacktrace-js/stacktrace',
        templates: '../templates',
        text: '../../node_modules/requirejs-text/text',
        underscore: '../../node_modules/backbone/node_modules/underscore/underscore-min'
    },
    shim: {
        jquery: {
            exports: '$'
        },
        socketio: {
            exports: 'io'
        },
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        }
    },
    name: "main",
    out: "public/js/main.min.js",
    preserveLicenseComments: false
})
