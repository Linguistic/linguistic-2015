define(function (require) {

    "use strict";

    require('gettext');

    var Dictionary = {

        Messages: function () {
            return {
                MSG_CHAT_PLACEHOLDER: gettext('Click here to start typing (press \'Esc\' to disconnect)'),
                MSG_WAIT: gettext('Waiting for a chat partner...'),
                MSG_NEW: gettext('Start a new chat'),
                MSG_RAND_USER: gettext('You are now talking to a native speaker somewhere in the world')
            };
        },

        Errors: function () {
            return {
                ERR_LEARN_OWN_LANG: gettext('You cannot learn your native language'),
                ERR_SELECTION: gettext('Please select a language for each category first')
            };
        }

    };

    return Dictionary;

});