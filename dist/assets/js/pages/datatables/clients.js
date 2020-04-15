"use strict";
// Class definition

var clientsDT = function () {
	// Private functions
	var token = $.cookie("access_token");
	var _dt = new DataTableEntry(),
		datatable, _status = 0,
		_sId;
	var arrows;



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

	//end--convert form to json
	// basic demo
	var datatable;
	var clients = function () {
		if (datatable) datatable.destroy();
		datatable = _dt.bindDataTable('#dataTable', [0, 1, 2, 3, 4, 5, 6],
			function (data, a, b, c) {
				// console.log(a)
				if (c.col == 6) {
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
			'http://tatweer-api.ngrok.io/api/Client/GetAllClientsPaging', 'POST', {
			pagenumber: 1,
			pageSize: 10
		}, [{
			"data": "id"
		},
		{
			"data": "name"
		},
		{
			"data": "address"
		},
		{
			"data": "email"
		},
		{
			"data": "mobile"
		},
		{
			"data": "fax"
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
			$(".modal-title").text("View Client");
			$('#addModal #addNewForm input').prop("disabled", true);
			$('#addModal #addNew').hide();

			$.ajax({
				url: "http://tatweer-api.ngrok.io/api/Client/GetClient/" + id,
				type: "GET",

				headers: {
					"Authorization": "Berear " + token
				},
				success: function (response) {
					console.log(response)
					$('#addModal').modal('show');
					console.log(viewForm)
					$('#addModal #addNewForm input[name="name"]').val(response.data.name);
					$('#addModal #addNewForm input[name="address"]').val(response.data.address);
					$('#addModal #addNewForm input[name="email"]').val(response.data.email);
					$('#addModal #addNewForm input[name="mobile"]').val(response.data.mobile);
					$('#addModal #addNewForm input[name="fax"]').val(response.data.fax);
					$('#addModal #addNewForm input[name="lastUpdateTime"]').val(response.data.fax);
					// datatable.ajax.reload();

				},
				error: function (xhr, ajaxOptions, thrownError) {
					swal.fire("Error deleting!", "Please try again", "error");
				}
			})

		});

		$('body').on('click', '#showAddNewModal', function (e) {
			$(".modal-title").text("Add Client");
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
					name: {
						required: true
					},
					address: {
						required: true
					},
					email: {
						required: true,
						email: true
					},
					mobile: {
						required: true
					},

					password: {
						required: true
					},
					lastUpdateTime: {
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
				url: "http://tatweer-api.ngrok.io/api/Client/AddClient",
				method: "POST",
				data: {
					...formData,
					roleId: 2,
					isActive: true,

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
				},
				error: function (response) {
					console.log(response);
					showErrorMsg(form, 'danger', response.message);
				}
			});
		});
		$('body').on('click', 'a.edit', function (e) {
			let id = e.currentTarget.dataset.id;
			let viewForm = $('#addModal #addNewForm')
			// console.log(e.currentTarget.dataset.id); 
			$(".modal-title").text("Edit Client");
			$('#addModal #addNewForm input').prop("disabled", false);
			$('#addModal #addNew').hide();
			$('#addModal #update').show();

			$.ajax({
				url: "http://tatweer-api.ngrok.io/api/Client/GetClient/" + id,
				type: "GET",

				headers: {
					"Authorization": "Berear " + token
				},
				success: function (response) {
					console.log(response)
					$('#addModal').modal('show');
					// console.log(viewForm)
					$('#addModal #addNewForm input[name="name"]').val(response.data.name);
					$('#addModal #addNewForm input[name="address"]').val(response.data.address);
					$('#addModal #addNewForm input[name="email"]').val(response.data.email);
					$('#addModal #addNewForm input[name="mobile"]').val(response.data.mobile);
					$('#addModal #addNewForm input[name="fax"]').val(response.data.fax);
					$('#addModal #addNewForm input[name="lastUpdateTime"]').val(response.data.lastUpdateTime);
					$('#addModal #addNewForm input[name="id"]').val(response.data.id);
					// swal.fire("Doneosdflsdfsodfjo!", "It was succesfully deleted!", "success");
					datatable.ajax.reload();

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
					name: {
						required: true
					},
					address: {
						required: true
					},
					email: {
						required: true,
						email: true
					},
					mobile: {
						required: true
					},
					lastUpdateTime: {
						required: true
					},




				}
			});

			if (!form.valid()) {
				return;
			}


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
			console.log(formData);
			btn.addClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', true);
			form.ajaxSubmit({
				url: "http://tatweer-api.ngrok.io/api/Client/UpdateClient",
				method: "POST",
				data: {
					...formData,
					roleId: 2,
					isActive: true,

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
				error: function (response) {
					console.log(response);
					showErrorMsg(form, 'danger', response.message);
				}
			});
		});
	};

	return {
		// public functions
		init: function () {
			clients();
		},
	};
}();

jQuery(document).ready(function () {
	clientsDT.init();
});
