"use strict";

// Class Definition
var KTLoginGeneral = function () {

    var login = $('#kt_login');
    //start--convert form to json

    //end--convert form to json



    var handleSignInFormSubmit = function () {
        $('#kt_login_signin_submit').click(function (e) {
            e.preventDefault();
            var btn = $(this);
            var form = $(this).closest('form');

            var formData = $('#signIn').extractObject();
            form.validate({
                rules: {
                    username: {
                        required: true,
                        email: true
                    },
                    password: {
                        required: true
                    }
                }
            });

            if (!form.valid()) {
                return;
            }

            btn.addClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', true);

            form.ajaxSubmit({
                url: "http://tatweer-api.ngrok.io/api/token",
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"

                },
                data: {
                    // ...formData,
                    "grant_type": "2"
                },
                success: function (response, status, xhr, $form) {
                    // similate 2s delay
                    // docCookies.setItem('access_token', response.access_token);
                    $.cookie("access_token", response.access_token, { expires: response.expires_in });
                    var token = $.cookie("access_token");
                    console.log(response)
                    if (response.access_token == null) {
                        showErrorMsg(form, 'danger', "Please check your cridentials");
                        btn.removeClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', false);

                    } else {

                        $.ajax({
                            url: "http://tatweer-api.ngrok.io/api/login",
                            method: "POST",
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded",
                                "Authorization": "Berear " + token
                            },
                            data: {
                                ...formData,
                                "grant_type": "1"
                            },
                            success: function (response) {
                                $.cookie("user", JSON.stringify(response));

                                window.location.href = "vehicles.html"
                                console.log(response)

                            },

                        })
                    }

                },

                error: function (response) {
                    console.log(response);

                    showErrorMsg(form, 'danger', response.message);

                }
            });
        });
    }



    // Public Functions
    return {
        // public functions
        init: function () {
            handleSignInFormSubmit();
        }
    };
}();



// Class Initialization
jQuery(document).ready(function () {
    KTLoginGeneral.init();
});
