"use strict";
// Class definition

var tripsDT = function () {
	// Private functions
	var token = $.cookie("access_token");

	var _dt = new DataTableEntry(),
		datatable, _status = 0,
		_sId, clients, arrows, checkPointsdatatable = $('#checkPointsTable').DataTable();


	loadAllClients(false)

	$('.dateRange').daterangepicker({
		buttonClasses: ' btn',
		applyClass: 'btn-primary',
		cancelClass: 'btn-secondary',
		locale: {
			"format": "MM/DD/YYYY",
			"separator": " - ",
			"applyLabel": "Apply",
			"cancelLabel": "Cancel",
			"fromLabel": "From",
			"toLabel": "To",
			"customRangeLabel": "Custom",
			"daysOfWeek": [
				"Su",
				"Mo",
				"Tu",
				"We",
				"Th",
				"Fr",
				"Sa"
			],
			"monthNames": [
				"January",
				"February",
				"March",
				"April",
				"May",
				"June",
				"July",
				"August",
				"September",
				"October",
				"November",
				"December"
			],
			"firstDay": 1
		}

	}, function (start, end, label) {
		$('.dateRange').val(start.format('YYYY-MM-DD') + ' / ' + end.format('YYYY-MM-DD'));
		$('.formDate').val(start.format('YYYY-MM-DD'));
		$('.toDate').val(end.format('YYYY-MM-DD'));
	});
	//start--convert form to json

	//end--convert form to json
	// basic demo
	var datatable = $('#dataTable').DataTable();
	$('.tableContainer').hide()
	var trips = function () {
		// load trips based on client


		$('body').on('click', '.find', function (e) {
			var clientID = $('#clients').val();
			var from = $('.formDate').val();
			var to = $('.toDate').val();

			$('.tableContainer').show();

			if (datatable) datatable.destroy();
			datatable = _dt.bindDataTable('#dataTable', [0, 1, 2, 3, 4, 5],
				function (data, a, b, c) {
					// console.log(a)
					// console.log(b.route.routeName)
					// makeTimer(b.tripDateTime, b.id);
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
						return b.amount;

					}


					return data;
				},
				'http://tatweer-api.ngrok.io/api/Trip/GetTripsRevenueByDate', 'POST', {
				pagenumber: 1,
				pageSize: 10,
				from: from,
				to: to,
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
				}
				]);



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
