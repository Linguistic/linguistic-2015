define(function (require) {

    "use strict";

    var Constants = {

        LanguageTypes: function () {
            return {
                SOURCE: 0,
                DESTINATION: 1
            };
        },

        Chat: function () {
            return {
                UIStates: function () {
                    return {
                        WAITING: 0,
                        CHATTING: 1,
                        ENDED: 2
                    };
                },
                // TODO: Move this to an animation namespace
                DEFAULT_TIMEOUT: 400 // milliseconds
            };
        }

    };

    return Constants;

});
