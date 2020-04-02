
var arrows, roles;
var token = $.cookie("access_token");

$('#logOut').click(function (e) {
    // e.perventDefault();
    $.cookie('access_token', null);
    console.log($.cookie("access_token"))
    window.location.href = "index.html"

});
var showErrorMsg = function (form, type, msg) {
    var alert = $('<div class="alert alert-' + type + ' alert-dismissible" role="alert">\
        <div class="alert-text">'+ msg + '</div>\
        <div class="alert-close">\
            <i class="flaticon2-cross kt-icon-sm" data-dismiss="alert"></i>\
        </div>\
    </div>');

    form.find('.alert').remove();
    alert.prependTo(form);
    //alert.animateClass('fadeIn animated');
    KTUtil.animateClass(alert[0], 'fadeIn animated');
    alert.find('span').html(msg);
}

$.fn.extractObject = function () {
    var accum = {};
    function add(accum, namev, value) {
        if (namev.length == 1)
            accum[namev[0]] = value;
        else {
            if (accum[namev[0]] == null)
                accum[namev[0]] = {};
            add(accum[namev[0]], namev.slice(1), value);
        }
    };
    this.find('input, textarea, select').each(function () {
        add(accum, $(this).attr('name').split('.'), $(this).val());
    });
    return accum;
};

if (KTUtil.isRTL()) {
    arrows = {
        leftArrow: '<i class="la la-angle-right"></i>',
        rightArrow: '<i class="la la-angle-left"></i>'
    }
} else {
    arrows = {
        leftArrow: '<i class="la la-angle-left"></i>',
        rightArrow: '<i class="la la-angle-right"></i>'
    }
}


$('.modal').on('hidden.bs.modal', function () {
    $('#addNewForm').validate().destroy();
    console.log("object")
})
// 
var loadAllRoles = function () {
    roles = [];
    $.ajax({
        url: "http://tatweer-api.ngrok.io/api/Role/GetAllRoles",
        type: "GET",

        headers: {
            "Authorization": "Berear " + token
        },
        success: function (response) {

            response.data.map(role => {
                roles.push({ ...role, text: role.name })
            })
            console.log(roles)
            $("#roles").select2({
                placeholder: "Select a value",
                data: roles
            });

            $('#addModal').modal('show');

        },
        error: function (xhr, ajaxOptions, thrownError) {
            swal.fire("Error deleting!", "Please try again", "error");
        }
    })

};

$('.datePicker').datepicker({
    rtl: KTUtil.isRTL(),
    todayHighlight: true,
    orientation: "bottom left",
    templates: arrows,
    format: "dd/mm/yyyy"
});

$('.checkboxInput').change(function () {

    $('.checkboxInput').val($(this).is(':checked'));
    console.log($('.checkboxInput').val());
});
$(document).on('change', '#licensePicURLInput', function (event) {
    console.log("formData")

    // $('#licensePicURLInput').change(function (event) {
    var files = $('#licensePicURLInput')[0].files[0];

    if (files.length > 0) {

        // if (files[0].size > 81920) {
        //     /* Check the image size before upload not to be more than 80K */
        //     return false;
        // }

        var formData = new FormData($("#addNewForm")[0]);
        // var files = $('#licensePicURLInput')[0].files[0];
        formData.append('licensePicURL', files);
        console.log("formData")
        console.log(formData)
        $.ajax({
            url: "http://tatweer-api.ngrok.io/api/driver/upload/image",
            type: 'POST',
            headers: {
                "Content-Type": "multipart / form-data",
                "Authorization": "Berear " + token
            },
            data: formData,
            async: false,
            success: function (res) {
                var list, vType;
                var types = ['png', 'jpg', 'jpeg'];
                for (var i = 0; i < res.data.length; i++) {
                    if (res.data[i].status == 200) {
                        $("[VIEW_IMAGE_SELECTOR]").attr('src', res.data[i].url);
                    }
                    else {
                        alert(res.data[i].Message);
                    }
                }
                /* HIDE LOADER */
                $('[LOADER_SELECTOR]').hide();
            },
            xhr: function () {
                var xhr = $.ajaxSettings.xhr();
                xhr.upload.onprogress = function (evt) { };
                xhr.upload.onload = function () { console.log('DONE!') };
                return xhr;
            },
            cache: false,
            contentType: false,
            processData: false,
            async: true
        });
        return false;


    }
});
// $('#licensePicURL').change(function () {
//     var licURL
//     $.ajax({
//         url: "http://tatweer-api.ngrok.io/api/driver/upload/image",
//         type: "POST",

//         headers: {
//             "Content-Type": multipart / form - data
//         },
//         success: function (response) {

//             response.data.map(role => {
//                 roles.push({ ...role, text: role.name })
//             })
//             console.log(roles)
//             $("#roles").select2({
//                 placeholder: "Select a value",
//                 data: roles
//             });

//             $('#addModal').modal('show');

//         },
//         error: function (xhr, ajaxOptions, thrownError) {
//             swal.fire("Error deleting!", "Please try again", "error");
//         }
//     })
// });


