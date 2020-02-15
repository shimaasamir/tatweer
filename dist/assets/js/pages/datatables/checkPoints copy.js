"use strict";
// Class definition

var checkPointsDT = function () {
	// Private functions
	var token = $.cookie("access_token");
	var _dt = new DataTableEntry(),
		datatable, _status = 0,
		_sId, routes;
	var arrows;
	function initialize() {
		var input = document.getElementById('searchTextField');
		var autocomplete = new google.maps.places.Autocomplete(input);
		google.maps.event.addListener(autocomplete, 'place_changed', function () {
			var place = autocomplete.getPlace();
			document.getElementById('city2').value = place.name;
			document.getElementById('cityLat').value = place.geometry.location.lat();
			document.getElementById('cityLng').value = place.geometry.location.lng();
		});
	}
	google.maps.event.addDomListener(window, 'load', initialize);
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
	var loadAllRoutes = function () {
		routes = [];
		$.ajax({
			url: "http://196.221.197.203:5252/api/Route/GetAllRoutes",
			type: "GET",

			headers: {
				"Authorization": "Berear " + token
			},
			success: function (res) {

				res.data.map(route => {
					routes.push({ ...route, text: route.routeName })
				})
				console.log(routes)
				$("#routes").select2({
					placeholder: "Select a value",
					data: routes
				});

				$('#addModal').modal('show');

			},
			error: function (xhr, ajaxOptions, thrownError) {
				swal.fire("Error deleting!", "Please try again", "error");
			}
		})

	};


	//start--convert form to json
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
	//end--convert form to json
	// basic demo
	var datatable;
	var checkPoints = function () {
		if (datatable) datatable.destroy();
		datatable = _dt.bindDataTable('#dataTable', [0, 1, 2, 3, 4], function (data, a, b, c) {
			// console.log(a)
			if (c.col == 4) {
				return '\
						<a href="javascript:;" data-id="' + b.id + '" class="btn btn-sm btn-clean btn-icon btn-icon-sm view"  title="View details">\
                                <i class="flaticon-eye">\</i>\
							</a>\
						<a href="javascript:;" data-id="' + b.id + '" class="btn btn-sm btn-clean btn-icon btn-icon-sm edit" title="Edit details">\
							<i class="flaticon2-paper"></i>\
						</a>\
						<a href="javascript:;" data-id="' + b.id + '" class="btn btn-sm btn-clean btn-icon btn-icon-sm delete" title="Delete">\
							<i class="flaticon2-trash"></i>\
						</a>\
					';
			}
			return data;
		},
			'http://196.221.197.203:5252/api/CheckPoints/GetAllCheckPointsPaging', 'POST', {
			pagenumber: 1,
			pageSize: 10
		}, [{
			"data": "id"
		},
		{
			"data": "name"
		},
		{
			"data": "latitude"
		},
		{
			"data": "longitude"
		},
		{
			data: 'Actions',
			responsivePriority: -1
		}
		]);



		$('body').on('click', 'a.delete', function (e) {
			let id = e.currentTarget.dataset.id;
			// console.log(e.currentTarget.dataset.id);
			swal.fire({
				title: 'Are you sure?',
				text: "You won't be able to revert this!",
				type: 'warning',
				showCancelButton: true,
				confirmButtonText: 'Yes, delete it!'
			}).then(function (result) {
				// console.log(result)
				if (!result.value) return;

				if (result.value) {
					$.ajax({
						url: "http://196.221.197.203:5252/api/CheckPoints/UpdateCheckPoint",
						type: "POST",
						data: {
							ID: id,
							isActive: false
						},
						headers: {
							"Authorization": "Berear " + token
						},
						success: function (res) {
							console.log(res)
							swal.fire("Done!", "It was succesfully deleted!", "success");
							datatable.ajax.reload();

						},
						error: function (xhr, ajaxOptions, thrownError) {
							swal.fire("Error deleting!", "Please try again", "error");
						}
					})
				}
			});
		});
		$('body').on('click', 'a.view', function (e) {
			let id = e.currentTarget.dataset.id;
			let viewForm = $('#addModal #addNewForm')
			// console.log(e.currentTarget.dataset.id);
			$(".modal-title").text("View Check Point");
			$('#addModal #addNewForm input').prop("disabled", true);
			$('#addModal #addNew,#addModal #update').hide();
			loadAllRoutes()

			$.ajax({
				url: "http://196.221.197.203:5252/api/CheckPoints/GetCheckPoint/" + id,
				type: "GET",

				headers: {
					"Authorization": "Berear " + token
				},
				success: function (res) {
					console.log(res)
					$('#addModal').modal('show');
					console.log(viewForm)
					$('#addModal #addNewForm input[name="name"]').val(res.data.name);
					$('#addModal #addNewForm input[name="latitude"]').val(res.data.latitude);
					$('#addModal #addNewForm input[name="longitude"]').val(res.data.longitude);
					$('#routes').val(res.data.routeID);
					$('#routes').trigger('change');

					$('#addModal #addNewForm input[name="id"]').val(res.data.id);
					// swal.fire("Doneosdflsdfsodfjo!", "It was succesfully deleted!", "success");
					// datatable.reload();

				},
				error: function (xhr, ajaxOptions, thrownError) {
					swal.fire("Error deleting!", "Please try again", "error");
				}
			})

		});

		$('body').on('click', '#showAddNewModal', function (e) {
			loadAllRoutes();
			$(".modal-title").text("Add Check Point");
			$('#addModal #addNewForm input').prop("disabled", false);
			$('#addModal #addNew').show();
			$('#addModal #update').hide();
			let viewForm = $('#addModal #addNewForm')
			viewForm.each(function () {
				this.reset();
			});

		});
		$('#addNew').click(function (e) {
			e.preventDefault();
			var btn = $(this);
			var form = $('#addNewForm');


			var formData = $('#addNewForm').extractObject();


			console.log(formData);
			btn.addClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', true);
			form.ajaxSubmit({
				url: "http://196.221.197.203:5252/api/CheckPoints/AddCheckPoint",
				method: "POST",
				data: {
					...formData,
					isActive: true,
					createDate: new Date(),
					modifyDate: new Date(),
					modifyBy: 1
				},
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
		$('body').on('click', 'a.edit', function (e) {
			let id = e.currentTarget.dataset.id;
			let viewForm = $('#addModal #addNewForm')
			// console.log(e.currentTarget.dataset.id);
			loadAllRoutes();

			$(".modal-title").text("Edit Check Point");
			$('#addModal #addNewForm input').prop("disabled", false);
			$('#addModal #addNew').hide();
			$('#addModal #update').show();

			$.ajax({
				url: "http://196.221.197.203:5252/api/CheckPoints/GetCheckPoint/" + id,
				type: "GET",

				headers: {
					"Authorization": "Berear " + token
				},
				success: function (res) {
					console.log(res.data.routeID)
					$('#addModal').modal('show');
					// console.log(viewForm)
					$('#addModal #addNewForm input[name="name"]').val(res.data.name);
					$('#addModal #addNewForm input[name="latitude"]').val(res.data.latitude);
					$('#addModal #addNewForm input[name="longitude"]').val(res.data.longitude);

					$('#routes').val(res.data.routeID);
					$('#routes').trigger('change');
					$('#addModal #addNewForm input[name="id"]').val(res.data.id);
					// swal.fire("Doneosdflsdfsodfjo!", "It was succesfully deleted!", "success");
					// datatable.reload();

				},
				error: function (xhr, ajaxOptions, thrownError) {
					swal.fire("Error !", "Please try again", "error");
				}
			})

		});
		$('#update').click(function (e) {
			e.preventDefault();
			var btn = $(this);
			var form = $('#addNewForm');


			var formData = $('#addNewForm').extractObject();
			console.log(formData)
			btn.addClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', true);
			form.ajaxSubmit({
				url: "http://196.221.197.203:5252/api/CheckPoints/UpdateCheckPoint",
				method: "POST",
				data: {
					...formData,
					isActive: true,
					createDate: new Date(),
					modifyDate: new Date(),
					modifyBy: 1
				},
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
					console.log(r); es
					showErrorMsg(form, 'danger', res.message);
				}
			});
		});
	};

	return {
		// public functions
		init: function () {
			checkPoints();
		},
	};
}();

jQuery(document).ready(function () {
	checkPointsDT.init();
});
