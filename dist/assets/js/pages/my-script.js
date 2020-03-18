
var arrows, roles;
$('#logOut').click(function (e) {
    // e.perventDefault();
    $.cookie('access_token', null);
    window.location.href = "login.html"

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

function GetAddress(lat, lng, input) {
    var latlng = new google.maps.LatLng(lat, lng);
    var geocoder = geocoder = new google.maps.Geocoder();
    // var service = new google.maps.places.PlacesService();
    // var request = {
    //     placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
    //     fields: ['name', 'formatted_address', 'place_id', 'geometry']
    // };
    // service.getDetails(request, function (place, status) {
    //     if (status === google.maps.places.PlacesServiceStatus.OK) {
    //         console.log(place.name)
    //         // google.maps.event.addListener(marker, 'click', function () {
    //         //     infowindow.setContent('<div><strong>' + place.name + '</strong><br>' +
    //         //         'Place ID: ' + place.place_id + '<br>' +
    //         //         place.formatted_address + '</div>');
    //         //     infowindow.open(map, this);
    //         // });
    //     }
    // });
    geocoder.geocode({ 'latLng': latlng }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[1]) {
                console.log(results[1])
                input.val(results[1].formatted_address)
                // alert("Location: " + results[1].formatted_address);
            }
        }
    });
}