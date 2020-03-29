"use strict";
// Class definition

var passengersDT = function () {
	// Private functions
	var token = $.cookie("access_token");
	var user = JSON.parse($.cookie("user"))
	console.log(user)
	var _dt = new DataTableEntry(),
		datatable, _status = 0,
		_sId;
	var arrows;
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

	$('.dateOfBirth').datepicker({
		rtl: KTUtil.isRTL(),
		todayHighlight: true,
		orientation: "bottom left",
		templates: arrows
	});
	var licensePicURL = new KTAvatar('licensePicURL');
	var picURL = new KTAvatar('picURL');
	var roles = [];
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
	var passengers = function () {
		if (datatable) datatable.destroy();
		datatable = _dt.bindDataTable('#dataTable', [0, 1, 2, 3, 4, 5],
			function (data, a, b, c) {
				// console.log(a)
				if (c.col == 5) {
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
			'http://tatweer-api.ngrok.io/api/Passenger/GetAllPassenger', 'POST', {
			pagenumber: 1,
			pageSize: 10,
			clientId: user.id
		}, [{
			"data": "id"
		},
		{
			"data": "firstName"
		},
		{
			"data": "lastName"
		},
		{
			"data": "dateOfBirth"
		},
		{
			"data": "email"
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
						url: "http://tatweer-api.ngrok.io/api/User/updateStatus",
						type: "POST",
						data: {
							ID: id,
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
			$(".modal-title").text("View Passenger");
			$('#addModal #addNewForm input').prop("disabled", true);
			$('#addModal #addNew,#addModal #update').hide();

			$.ajax({
				url: "http://tatweer-api.ngrok.io/api/Passenger/GetPassenger/" + id,
				type: "GET",

				headers: {
					"Authorization": "Berear " + token
				},
				success: function (res) {
					console.log(res)
					$('#addModal').modal('show');
					console.log(viewForm)
					$('#addModal #addNewForm input[name="firstName"]').val(res.data[0].firstName);
					$('#addModal #addNewForm input[name="lastName"]').val(res.data[0].lastName);
					$('#addModal #addNewForm input[name="dateOfBirth"]').val(res.data[0].dateOfBirth);
					$('#addModal #addNewForm input[name="email"]').val(res.data[0].email);
					$('#addModal #addNewForm input[name="password"]').val(res.data[0].password);
					$('#addModal #addNewForm input[name="workid"]').val(res.data[0].workid);
					// $('#roles').val(res.data[0].roleID);
					// $('#roles').trigger('change');

					// $('#licensePicURL').css('background-image', 'url(' + res.data[0].licensePicURL + ')');
					$('#picURL').css('background-image', 'url(' + res.data[0].picURL + ')');
					// $('#addModal #addNewForm input[name="isEmployee]').prop("checked", res.data[0].هisEmployee ? true : false)
					$('#addModal #addNewForm input[name="id"]').val(res.data[0].id);
					// swal.fire("Doneosdflsdfsodfjo!", "It was succesfully deleted!", "success");
					// datatable.reload();

				},
				error: function (xhr, ajaxOptions, thrownError) {
					swal.fire("Error deleting!", "Please try again", "error");
				}
			})

		});

		$('body').on('click', '#showAddNewModal', function (e) {
			;
			$(".modal-title").text("Add Passenger");
			$('#addModal #addNewForm input').prop("disabled", false);
			$('#addModal #addNew').show();
			$('#addModal #update').hide();
			$('#addModal').modal('show');

			let viewForm = $('#addModal #addNewForm')
			viewForm.each(function () {
				this.reset();
			});

		});
		$('#addNew').click(function (e) {
			e.preventDefault();
			var btn = $(this);
			var form = $('#addNewForm');

			form.validate({
				rules: {
					firstName: {
						required: true
					},
					email: {
						required: true,
						email: true
					},
					lastName: {
						required: true
					},
					dateOfBirth: {
						required: true
					},
					workid: {
						required: true
					},

					password: {
						required: true
					},



				}
			});

			if (!form.valid()) {
				return;
			}

			var formData = $('#addNewForm').extractObject();


			console.log(formData);
			btn.addClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', true);
			form.ajaxSubmit({
				url: "http://tatweer-api.ngrok.io/api/Passenger/AddPassenger",
				method: "POST",
				data: {
					...formData,
					roleId: 4,
					clientId: user.id,
					picURL: "",
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
				;

			$(".modal-title").text("Edit Passenger");
			$('#addModal #addNewForm input').prop("disabled", false);
			$('#addModal #addNew').hide();
			$('#addModal #update').show();

			$.ajax({
				url: "http://tatweer-api.ngrok.io/api/Passenger/GetPassenger/" + id,
				type: "GET",

				headers: {
					"Authorization": "Berear " + token
				},
				success: function (res) {
					console.log(res)
					$('#addModal').modal('show');
					// console.log(viewForm)
					$('#addModal #addNewForm input[name="firstName"]').val(res.data[0].firstName);
					$('#addModal #addNewForm input[name="lastName"]').val(res.data[0].lastName);
					$('#addModal #addNewForm input[name="dateOfBirth"]').val(res.data[0].dateOfBirth);
					$('#addModal #addNewForm input[name="email"]').val(res.data[0].email);
					$('#addModal #addNewForm input[name="password"]').val(res.data[0].password);
					$('#addModal #addNewForm input[name="workid"]').val(res.data[0].workid);
					// $('#roles').val(res.data[0].roleID);
					// $('#roles').trigger('change');

					// $('#licensePicURL').css('background-image', 'url(' + res.data[0].licensePicURL + ')');
					$('#picURL').css('background-image', 'url(' + res.data[0].picURL + ')');
					// $('#addModal #addNewForm input[name="isEmployee]').prop("checked", res.data[0].هisEmployee ? true : false)
					$('#addModal #addNewForm input[name="id"]').val(res.data[0].id);
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
			// formData = {
			// 	...formData,
			// 	isAsset: $('#addModal #addNewForm input[name="isAsset"]:checked').length > 0,
			// 	isActive: true,
			// 	createDate: new Date(),
			// 	modifyDate: new Date(),
			// 	modifyBy: 1
			// }
			// console.log("formData");
			// console.log(formData);
			btn.addClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', true);
			form.ajaxSubmit({
				url: "http://tatweer-api.ngrok.io/api/passenger/UpdatePassenger",
				method: "POST",
				data: {
					...formData,
					// isEmployee: $('#addModal #addNewForm input[name="isEmployee"]:checked').length > 0,
					roleId: 4,
					picURL: "",
					clientId: user.id,
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
			passengers();
		},
	};
}();

jQuery(document).ready(function () {
	passengersDT.init();
});
