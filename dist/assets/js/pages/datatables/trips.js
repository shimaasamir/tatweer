"use strict";
// Class definition

var tripsDT = function () {
	// Private functions
	var token = $.cookie("access_token");

	var _dt = new DataTableEntry(),
		datatable, _status = 0,
		_sId, clients, arrows, checkPointsdatatable = $('#checkPointsTable').DataTable();

	function makeTimer(tripCreation, containerID, lastUpdateTime) {
		// tripCreation = moment.utc(tripCreation).local().format();
		// console.log(tripCreation)
		// var eventTime = moment(addHours(tripCreation, lastUpdateTime)).toDate().getTime() / 1000; // Timestamp - Sun, 21 Apr 2013 13:00:00 GMT
		var startTime = moment(moment(tripCreation).add(1, 'hours').format('YYYY-MM-DD hh:mm:ss')).toDate().getTime() / 1000; // Timestamp - Sun, 21 Apr 2013 12:30:00 GMT
		var currentTime = moment().toDate().getTime() / 1000;
		var interval = 1000;
		var timer;
		var diffTime = startTime - currentTime;
		var duration = moment.duration(diffTime * 1000, 'milliseconds');
		if (duration._milliseconds < 0) {
			clearInterval(timer);
			$("#" + containerID).text("You can approve");
			$("#" + containerID).parents("tr").find(".assign").show()

		} else {
			timer = setInterval(function () {
				duration = moment.duration(duration - interval, 'milliseconds');
				// console.log(duration._milliseconds)
				$("#" + containerID).text(duration.days() + ":" + duration.hours() + ":" + duration.minutes() + ":" + duration.seconds())

			}, interval);
		}

	}
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
			datatable = _dt.bindDataTable('#dataTable', [0, 1, 2, 3, 4, 5, 6],
				function (data, a, b, c) {
					// console.log(a)
					// console.log(b.route.routeName)
					makeTimer(b.tripDateTime, b.id);
					// countDown(b.tripDateTime, b.id)
					if (c.col == 1) {
						return b.route.routeName;
					}
					if (c.col == 2) {
						return b.route.start.name;
					}
					if (c.col == 3) {
						return b.route.end.name;
					}
					if (c.col == 4) {
						return formatDate(b.tripDateTime);
					}
					if (c.col == 5) {
						return '<div id="' + b.id + '"></div>'
					}
					if (c.col == 6) {
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
				clientId: clientID,
				statusId: 0
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
					"data": "tripDateTime"
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
