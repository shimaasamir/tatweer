"use strict";
// Class definition


var vehiclesDT = function () {
	// Private functions
	var token = $.cookie("access_token");
	var user = JSON.parse($.cookie("user"));
	console.log(user);
	var _dt = new DataTableEntry(),
		datatable, _status = 0,
		_sId;
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
	var vehicles = function () {
		// console.log(token)
		if (datatable) datatable.destroy();

		datatable = _dt.bindDataTable('#dataTable', [0, 1, 2, 3, 4, 5, 6, 7],
			function (data, a, b, c) {
				// console.log(a)
				if (c.col == 7) {
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
			'https://aa4f0a57.ngrok.io/api/Vehicle/GetAllVehiclesPaging', 'POST', {
			pagenumber: 1,
			pageSize: 10
		}, [{
			"data": "id"
		},
		{
			"data": "model"
		},
		{
			"data": "brand"
		},
		{
			"data": "color"
		},
		{
			"data": "plateNumber"
		},
		{
			"data": "engineNumber"
		},
		{
			"data": "chassisNumber"
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
						url: "https://aa4f0a57.ngrok.io/api/Vehicle/updateStatus",
						type: "POST",
						data: {
							id: id,
							statusId: 4
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
			$(".modal-title").text("View Vehicle");
			$('#addModal #addNewForm input').prop("disabled", true);
			$('#addModal #addNew').hide();

			$.ajax({
				url: "https://aa4f0a57.ngrok.io/api/Vehicle/GetVehicle/" + id,
				type: "GET",
				headers: {
					"Authorization": "Berear " + token
				},
				success: function (res) {
					console.log(res)
					$('#addModal').modal('show');
					console.log(viewForm)
					$('#addModal #addNewForm input[name="brand"]').val(res.data.brand);
					$('#addModal #addNewForm input[name="model"]').val(res.data.model);
					$('#addModal #addNewForm input[name="color"]').val(res.data.color);
					$('#addModal #addNewForm input[name="plateNumber"]').val(res.data.plateNumber);
					$('#addModal #addNewForm input[name="engineNumber"]').val(res.data.engineNumber);
					$('#addModal #addNewForm input[name="chassisNumber"]').val(res.data.chassisNumber);
					$('#addModal #addNewForm input[name="isAsset"]').prop("checked", res.data.isAsset ? true : false)
					$('#addModal #addNewForm input[name="capacity"]').val(res.data.capacity);
					// swal.fire("Doneosdflsdfsodfjo!", "It was succesfully deleted!", "success");
					// datatable.ajax.reload();

				},
				error: function (xhr, ajaxOptions, thrownError) {
					swal.fire("Error deleting!", "Please try again", "error");
				}
			})

		});

		$('body').on('click', '#showAddNewModal', function (e) {
			$(".modal-title").text("Add Vehicle");
			$('#addModal #addNewForm input').prop("disabled", false);
			$('#addModal #addNew').show();
			$('#addModal #update').hide();
			$('#addModal').modal('show');
			let viewForm = $('#addModal #addNewForm')
			viewForm.each(function () {
				this.reset();
			});

		});
		$('body').on('click', 'a.edit', function (e) {
			let id = e.currentTarget.dataset.id;
			let viewForm = $('#addModal #addNewForm')
			// console.log(e.currentTarget.dataset.id);
			$(".modal-title").text("Edit Vehicle");
			$('#addModal #addNewForm input').prop("disabled", false);
			$('#addModal #addNew').hide();
			$('#addModal #update').show();

			$.ajax({
				url: "https://aa4f0a57.ngrok.io/api/Vehicle/GetVehicle/" + id,
				type: "GET",

				headers: {
					"Authorization": "Berear " + token
				},
				success: function (res) {
					console.log(res)
					$('#addModal').modal('show');
					// console.log(viewForm)
					$('#addModal #addNewForm input[name="brand"]').val(res.data.brand);
					$('#addModal #addNewForm input[name="model"]').val(res.data.model);
					$('#addModal #addNewForm input[name="color"]').val(res.data.color);
					$('#addModal #addNewForm input[name="plateNumber"]').val(res.data.plateNumber);
					$('#addModal #addNewForm input[name="engineNumber"]').val(res.data.engineNumber);
					$('#addModal #addNewForm input[name="chassisNumber"]').val(res.data.chassisNumber);
					$('#addModal #addNewForm input[name="isAsset"]').prop("checked", res.data.isAsset ? true : false)
					$('#addModal #addNewForm input[name="capacity"]').val(res.data.capacity);
					$('#addModal #addNewForm input[name="id"]').val(res.data.id);
					// swal.fire("Doneosdflsdfsodfjo!", "It was succesfully deleted!", "success");
					// datatable.ajax.reload();

				},
				error: function (xhr, ajaxOptions, thrownError) {
					swal.fire("Error !", "Please try again", "error");
				}
			})

		});
		$('#addNew').click(function (e) {
			e.preventDefault();
			var btn = $(this);
			var form = $('#addNewForm');


			var formData = $('#addNewForm').extractObject();

			btn.addClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', true);
			form.ajaxSubmit({
				url: "https://aa4f0a57.ngrok.io/api/Vehicle/AddVehicle",
				method: "POST",
				data: {
					...formData,
					isAsset: $('#addModal #addNewForm input[name="isAsset"]:checked').length > 0,
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
		$('#update').click(function (e) {
			e.preventDefault();
			var btn = $(this);
			var form = $('#addNewForm');


			var formData = $('#addNewForm').extractObject();

			btn.addClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', true);
			form.ajaxSubmit({
				url: "https://aa4f0a57.ngrok.io/api/Vehicle/UpdateVehicle",
				method: "POST",
				data: {
					...formData,
					isAsset: $('#addModal #addNewForm input[name="isAsset"]:checked').length > 0,
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
	};

	return {
		// public functions
		init: function () {
			vehicles();
		},
	};
}();



jQuery(document).ready(function () {
	vehiclesDT.init();
});
