"use strict";
// Class definition

var tripsDT = function () {
	// Private functions
	var token = $.cookie("access_token");

	var _dt = new DataTableEntry(),
		datatable, _status = 0,
		_sId, clients, arrows, checkPointsdatatable = $('#checkPointsTable').DataTable();


	loadAllClients(false)


	//start--convert form to json

	//end--convert form to json
	// basic demo
	var datatable = $('#dataTable').DataTable();
	$('.tableContainer').hide()
	var trips = function () {
		// load trips based on client
		$('#clients').on('select2:select', function (e) {
			// console.log(e)
			var clientID = $(this).val();
			// console.log($(this).val())
			// var table = $('#kt_table_1');
			$('.tableContainer').show();

			if (datatable) datatable.destroy();
			datatable = _dt.bindDataTable('#dataTable', [0, 1, 2, 3, 4],
				function (data, a, b, c) {
					// console.log(a)

					if (c.col == 4) {
						return '\
								<a href="javascript:;" data-id="' + b.id + '" class="btn btn-sm btn-clean btn-icon btn-icon-sm assign"  title="Confirm Trip">\
										<i class="fas fa-tasks">\</i>\
									</a>\
							';
					}

					return data;
				},
				'http://tatweer-api.ngrok.io/api/Trip/GetAllTripsPaging', 'POST', {
				pagenumber: 1,
				pageSize: 10,
				clientId: clientID
			},
				[{
					"data": "id"
				},
				{
					"data": "routeName"
				},
				{
					"data": "startName"
				},
				{
					"data": "endName"
				},
				{
					data: 'Actions',
					responsivePriority: -1
				}
				]);


		});

		$('body').on('click', 'a.assign', function (e) {
			let id = e.currentTarget.dataset.id;
			// let viewForm = $('#addModal #addNewForm')
			// console.log(e.currentTarget.dataset.id);
			// $(".modal-title").text("View Trip");
			$('#addModal #addNewForm input').prop("disabled", true);

			// $('#addModal #addNew,#addModal #update').hide();
			loadAllVehicles()
			loadAllDrivers()

			$.ajax({
				url: "http://tatweer-api.ngrok.io/api/Trip/GetTripWithPassenges/" + id,
				type: "GET",

				headers: {
					"Authorization": "Berear " + token
				},
				success: function (res) {

					console.log(res)
					$('#addModal').modal('show');

					$('#addModal #addNewForm input[name="routeName"]').val(res.data.routeName);
					$('#addModal #addNewForm input[name="passengersCount"]').val(res.data.passenger.length);
					$('#addModal #addNewForm input[name="tripDate"]').val(formatDate(res.data.tripDate));
					$('#addModal #addNewForm input[name="startTime"]').val(getTime(res.data.startTime));
					$('#addModal #addNewForm input[name="id"]').val(res.data.id);
					$('#vehicles').val(res.data.vehicleID);
					$('#vehicles').trigger('change');
					$('#drivers').val(res.data.driverID);
					$('#drivers').trigger('change');



				},
				error: function (xhr, ajaxOptions, thrownError) {
					swal.fire("Error deleting!", "Please try again", "error");
				}
			})

		});
		$('#update').click(function (e) {
			let id = e.currentTarget.dataset.id;

			// e.preventDefault();
			var btn = $(this);
			var form = $('#addNewForm');
			// let viewForm = $('#addModal #addNewForm')
			form.each(function () {
				this.reset();
			});
			form.validate({
				rules: {
					driverID: {
						required: true
					},
					vehicleID: {
						required: true
					}
				}
			});

			if (!form.valid()) {
				return;
			}
			if (!$("#vehicles").val() || !$("#drivers").val()) {
				showErrorMsg(form, 'danger', "please assign deriver and vehicle");
				return;
			}
			// console.log("ids", c)
			var submitdata = {
				tripId: id,
				vehicleID: $("#vehicles").val(),
				driverId: $("#drivers").val()
			}
			btn.addClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', true);
			form.ajaxSubmit({
				url: "http://tatweer-api.ngrok.io/api/Trip/confirm",
				method: "POST",
				data: submitdata,
				headers: {
					"Authorization": "Berear " + token
				},
				success: function (response) {
					// similate 2s delay
					// docCookies.setItem('access_token', response.access_token);
					btn.removeClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', false);
					console.log(response);
					$('#addModal').modal('hide');
					datatable.ajax.reload()
				},
				error: function (res) {
					console.log(response);
					showErrorMsg(form, 'danger', res.message);
				}
			});
		});
	};

	return {
		// public functions
		init: function () {
			trips();
		},
	};
}();

jQuery(document).ready(function () {
	tripsDT.init();
});
