define(function (require) {

    "use strict";

    require('gettext');

    var ContextMenu = function ($menu) {

        var self = this;
        this.$menu = $menu;
        
        this.initialize = function ($parent) {
            $parent.bind('contextmenu', function (e) {
                e.preventDefault();
                $('body').prepend($menu.css('z-index', '10000')); // Move the menu to the topmost level
                self.$menu.css('left', e.pageX + 'px').css('top', e.pageY + 'px').finish().toggle(100);
            });
            
            $(document).bind('mousedown', function (e) {
               if ($(e.target).parents('#' + self.$menu.attr('id')).length <= 0) {
                   self.$menu.hide(100);
               }
            });
        };
    };

    return ContextMenu;

});