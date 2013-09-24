
;(function ($) {
        var $$ = $.dambf = function $$(arg) {
            return $.extend($(arg), methods);
        },
        handlers = {
            'error.dambf': function (err) {
                var player = $$(this);

                console.log("error", arguments);

                player.def().reject(err);
            },
            'canplay.dambf': function () {
                $$(this).def().resolve(arguments);
            }
        },
        methods = {
            init: function (options) {
                // turn each player in the current set into dambf
                return this.each(function () {
                    var player = $$(this);

                    player.data('dambf', {
                        def: $.Deferred()
                    }).on(handlers);

                    // check if we are done initialising already!
                    if( player.prop('readyState') == player.prop('HAVE_ENOUGH_DATA')){
                        player.trigger('canplay');
                    } else {
                        // check for errors right away
                        if( player.monitor() === false){
                            player.trigger('error');
                        }
                    }
                });
            },

            monitor: function(){
                /* browsers do have bugs. so fix em like a pro! 
                 * return true if an error was detected but fixed,
                 * return false if an error could not be fixed
                 * return undefined if no error was detected
                 */
                var was, dealtwithit = false, children,
                    player = $$(this);

                if (player.prop('error') /* check if the error applies */) {
                    children = player.children('source');

                    if (was = player.attr('src')) {
                        player.removeAttr('src');
                        dealtwithit = true;
                    } else if ( children.length) {
                        was = children.first().attr('src');
                        children.first().remove();
                        dealtwithit = true;
                    }

                    if( dealtwithit){
                        player.def().notify({
                            action: 'removed source',
                            src: was
                        });
                        return true;
                    }
                    return false;
                }
            },

            def: function () {
                return this.data('dambf').def;
            },

            promise: function () {
                return this.data('dambf').def.promise();
            },

            play: function (time) {
                return this.each(function () {
                    var player = $$(this),
                        rawPlayer = this;

                    player.promise().then(function () {
                        player.prop('currentTime', time);
                        rawPlayer.play();
                    });
                });
            },

            pause: function () {
                return this.each(function () {
                    this.pause();
                });
            }
        },
        dambf = $.fn.dambf = function (method) {
            if (method in methods) {
                return methods[method].apply(this, [].slice.call(arguments, 1));
            } else if (typeof method === 'object' || !method) {
                return methods.init.apply(this, [].slice.call(arguments, 0));
            }

            return this;
        };
    dambf.methods = methods;
    dambf.handlers = handlers;
})(jQuery);
