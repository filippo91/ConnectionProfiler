/**
 * Created by philip on 10/7/2016.
 */
$(function () {
    $(document).on('load, scroll', function () {
        if ($(this).scrollTop() <= $(window).height()/1.5) {
            $('nav').removeClass('little-navbar');
        } else {
            $('nav').addClass('little-navbar');
        }
    });
});