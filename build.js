({
    baseUrl: 'static/js/',
    paths: {
        jquery: '../../node_modules/jquery/dist/jquery.min',
        gettext: '../../node_modules/i18n-abide/static/gettext'
    },
    shim: {
        jquery: {
            exports: '$'
        }
    },
    name: "main",
    out: "main-built.js"
})