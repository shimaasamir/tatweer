
var arrows, roles, drivers, vehicles;
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
    $('.kt-avatar__holder').css('background-image', '');
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

var loadAllDrivers = function () {
    drivers = [];
    $.ajax({
        url: "http://tatweer-api.ngrok.io/api/Driver/GetAllDriversPaging",
        type: "POSt",
        data: {
            pagenumber: 1,
            pageSize: 9999999
        },
        headers: {
            "Authorization": "Berear " + token
        },
        success: function (response) {

            response.data.data.map(driver => {
                drivers.push({ ...driver, text: driver.firstName + " " + driver.lastName })
            })
            console.log(drivers)
            $("#drivers").select2({
                placeholder: "Select a value",
                data: drivers
            });

            $('#addModal').modal('show');

        },
        error: function (xhr, ajaxOptions, thrownError) {
            swal.fire("Error deleting!", "Please try again", "error");
        }
    })

};
var loadAllVehicles = function () {
    vehicles = [];
    $.ajax({
        url: "http://tatweer-api.ngrok.io/api/Vehicle/GetAllVehicles",
        type: "GET",

        headers: {
            "Authorization": "Berear " + token
        },
        success: function (response) {

            response.data.map(vehicle => {
                vehicles.push({ ...vehicle, text: vehicle.brand + "-" + vehicle.model + "-" + vehicle.color })
            })
            console.log(vehicles)
            $("#vehicles").select2({
                placeholder: "Select a value",
                data: vehicles
            });

            $('#addModal').modal('show');

        },
        error: function (xhr, ajaxOptions, thrownError) {
            swal.fire("Error deleting!", "Please try again", "error");
        }
    })

};
var loadAllClients = function (modal) {
    clients = [];
    $.ajax({
        url: "http://tatweer-api.ngrok.io/api/Client/GetAllClients",
        type: "GET",

        headers: {
            "Authorization": "Berear " + token
        },
        success: function (response) {

            response.data.map(client => {
                clients.push({ ...client, text: client.name })
            })
            console.log(clients)
            // $("#clients").select2({
            // 	placeholder: "Select a value",
            // 	data: clients
            // })
            // $("#clientsModal").select2({
            // 	placeholder: "Select a value",
            // 	data: clients
            // });
            if (modal) {
                $("#clientsModal").select2({
                    placeholder: "Select a value",
                    data: clients
                });
            } else {
                $("#clients").select2({
                    placeholder: "Select a value",
                    data: clients
                });
            }






            // $('#addModal').modal('show');

        },
        error: function (xhr, ajaxOptions, thrownError) {
            swal.fire("Error !", "Please try again", "error");
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
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('/');
}
function getTime(date) {
    var d = new Date(date)
    return d.toLocaleTimeString();
}
var uploadFile = function (inputSelector, formSelector, uploadURL, fileNameField) {
    $('#imageUploding').hide();

    $(document).on('change', inputSelector, function (event) {
        $('#imageUploding').show();

        var files = event.target.files;
        if (files.length > 0) {
            var _form = $(this).closest(formSelector);
            // if (files[0].size > 81920) {
            //     /* Check the image size before upload not to be more than 80K */
            //     showErrorMsg($('#addNewForm'), 'danger', 'File is must be smaller than 100K');
            //     $('#imageUploding').hide();


            // }
            var formData = new FormData($(_form)[0]);
            $.ajax({
                url: uploadURL,
                type: 'POST',
                headers: { Authorization: 'Bearer ' + token },
                data: formData,
                async: false,
                success: function (res) {
                    var list, vType;
                    var types = ['png', 'jpg', 'jpeg'];
                    for (var i = 0; i < res.data.length; i++) {
                        if (res.data[i].status == 200) {
                            // var img = new Image();
                            fileNameField.val(res.data[i].url);
                            // $(".kt-avatar__holder").append(img);

                        }
                        else {
                            showErrorMsg($('#addNewForm'), 'danger', res.data[i].Message);

                        }
                    }
                    /* HIDE LOADER */
                    $('#imageUploding').hide();

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
}

uploadFile('#license_upload', 'form#licenseUpload', 'http://tatweer-api.ngrok.io/api/upload/driver/image', $('#licensePicURLField'))
uploadFile('#picURL_upload', 'form#picURLUpload', 'http://tatweer-api.ngrok.io/api/upload/driver/image', $('#picUrlField'))
uploadFile('#vehicleLic_upload', 'form#vehicleLicUpload', 'http://tatweer-api.ngrok.io/api/upload/vehicle/license', $('#vehicleLicense'))
