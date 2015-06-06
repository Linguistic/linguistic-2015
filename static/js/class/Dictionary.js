define(function (require) {

    "use strict";

    require('gettext');

    var Dictionary = {

        Labels: function () {
            return {
                LBL_ME: gettext('Me'),
                LBL_STRANGER: gettext('Stranger')
            };
        },

        Messages: function () {
            return {
                MSG_CHAT_PLACEHOLDER: gettext('Click here to start typing'),
                MSG_WAIT: gettext('Waiting for a chat partner...'),
                MSG_NEW: gettext('Start a new chat'),
                MSG_RAND_USER: gettext('You are now talking to a native speaker somewhere in the world'),
                MSG_YOU_DISCONNECT: gettext('You have disconnected'),
                MSG_PARTNER_DISCONNECT: gettext('Your chat partner has disconnected'),
                MSG_PARTNER_TYPING: gettext('Your partner is typing...')
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
