"use strict";
// Class definition

var driversDT = function () {
	// Private functions
	var token = $.cookie("access_token");
	var _dt = new DataTableEntry(),
		datatable, _status = 0,
		_sId;
	var licensePicURL = new KTAvatar('licensePicURL');
	var picURL = new KTAvatar('picURL');

	//start--convert form to json

	//end--convert form to json
	// basic demo
	var datatable;
	var drivers = function () {
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
			'http://tatweer-api.ngrok.io/api/Driver/GetAllDriversPaging', 'POST', {
			pagenumber: 1,
			pageSize: 10
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
						url: "http://tatweer-api.ngrok.io/api/Driver/UpdateDRiver",
						type: "POST",
						data: {
							ID: id,
							statusId: 4
						},
						headers: {
							"Authorization": "Berear " + token
						},
						success: function (response) {
							console.log(response)
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
			$(".modal-title").text("View Driver");
			$('#addModal #addNewForm input').prop("disabled", true);
			$('#addModal #addNew').hide();

			$.ajax({
				url: "http://tatweer-api.ngrok.io/api/Driver/GetDriver/" + id,
				type: "GET",

				headers: {
					"Authorization": "Berear " + token
				},
				success: function (response) {
					console.log(response)
					$('#addModal').modal('show');

					$('#addModal #addNewForm input[name="firstName"]').val(response.data.firstName);
					$('#addModal #addNewForm input[name="lastName"]').val(response.data.lastName);
					$('#addModal #addNewForm input[name="dateOfBirth"]').val(formatDate(response.data.dateOfBirth));
					$('#addModal #addNewForm input[name="email"]').val(response.data.email);
					$('#addModal #addNewForm input[name="password"]').val(response.data.password);
					$('#addModal #addNewForm input[name="licensePicURL"]').val(response.data.licensePicURL);
					$('#addModal #addNewForm input[name="picUrl"]').val(response.data.picUrl);


					$('#licensePicURL .kt-avatar__holder').css('background-image', 'url(' + response.data.licensePicURL + ')');
					$('#picURL .kt-avatar__holder').css('background-image', 'url(' + response.data.picUrl + ')');
					$('#addModal #addNewForm #employee').prop('checked', response.data.isEmployee)
					$('#addModal #addNewForm input[name="id"]').val(response.data.id);
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
			$(".modal-title").text("Add Driver");
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
			// e.preventDefault();
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

					password: {
						required: true
					},
					mobile: {
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
				url: "http://tatweer-api.ngrok.io/api/Driver/AddDriver",
				method: "POST",
				data: {
					...formData,

					roleId: 3,
					isEmployee: $("#employee").val(),
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
					if (response.errorCode == 304) {
						showErrorMsg(form, 'danger', "This email is already registered");

					} else {

						$('#addModal').modal('hide');
						datatable.ajax.reload()
					}
					// $('#addModal').modal('hide');
				},
				error: function (response) {
					console.log(response);
					showErrorMsg(form, 'danger', "Error!, Please try Again");
				}
			});
		});
		$('body').on('click', 'a.edit', function (e) {
			let id = e.currentTarget.dataset.id;
			let viewForm = $('#addModal #addNewForm')
				// console.log(e.currentTarget.dataset.id);
				;

			$(".modal-title").text("Edit Driver");
			$('#addModal #addNewForm input').prop("disabled", false);
			$('#addModal #addNew').hide();
			$('#addModal #update').show();

			$.ajax({
				url: "http://tatweer-api.ngrok.io/api/Driver/GetDriver/" + id,
				type: "GET",

				headers: {
					"Authorization": "Berear " + token
				},
				success: function (response) {
					console.log(response)
					$('#addModal').modal('show');
					// console.log(viewForm)
					$('#addModal #addNewForm input[name="firstName"]').val(response.data.firstName);
					$('#addModal #addNewForm input[name="lastName"]').val(response.data.lastName);
					$('#addModal #addNewForm input[name="dateOfBirth"]').val(formatDate(response.data.dateOfBirth));
					$('#addModal #addNewForm input[name="email"]').val(response.data.email);
					$('#addModal #addNewForm input[name="password"]').val(response.data.password);
					$('#addModal #addNewForm input[name="licensePicURL"]').val(response.data.licensePicURL);
					$('#addModal #addNewForm input[name="picUrl"]').val(response.data.picUrl);

					// $('.kt-avatar__holder').css('background-image', 'url(' + res.data.picUrl + ')');

					$('#licensePicURL .kt-avatar__holder').css('background-image', 'url(' + response.data.licensePicURL + ')');
					$('#picURL .kt-avatar__holder').css('background-image', 'url(' + response.data.picUrl + ')');
					$('#addModal #addNewForm #employee').prop('checked', response.data.isEmployee)
					$('#addModal #addNewForm input[name="id"]').val(response.data.id);
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
					mobile: {
						required: true
					},
				}
			});

			if (!form.valid()) {
				return;
			}


			var formData = $('#addNewForm').extractObject();

			btn.addClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', true);
			form.ajaxSubmit({
				url: "http://tatweer-api.ngrok.io/api/Driver/UpdateDriver",
				method: "POST",
				data: {
					...formData,
					isEmployee: $('#addModal #addNewForm input[name="isEmployee"]:checked').length > 0,

					isActive: true,
					roleId: 3,
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
					if (response.errorCode == 304) {
						showErrorMsg(form, 'danger', "This email is already registered");

					} else {

						$('#addModal').modal('hide');
						datatable.ajax.reload()
					}
					// $('#addModal').modal('hide');
					// datatable.ajax.reload()
				},
				error: function (response) {
					console.log(response);
					showErrorMsg(form, 'danger', "Error!, Please try Again");
				}
			});
		});
	};

	return {
		// public functions
		init: function () {
			drivers();
		},
	};
}();

jQuery(document).ready(function () {
	driversDT.init();
});
