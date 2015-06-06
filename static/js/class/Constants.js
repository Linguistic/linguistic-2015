define(function (require) {

    "use strict";

    require('gettext');

    var Constants = {

        LanguageTypes: function () {
            return {
                SOURCE: 0,
                DESTINATION: 1
            };
        }

    };

    return Constants;

});
