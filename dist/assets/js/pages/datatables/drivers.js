"use strict";
// Class definition

var driversDT = function () {
	// Private functions
	var token = $.cookie("access_token");
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
	var loadAllRoles = function () {
		roles = [];
		$.ajax({
			url: "http://196.221.197.203:5252/api/Role/GetAllRoles",
			type: "GET",

			headers: {
				"Authorization": "Berear " + token
			},
			success: function (res) {

				res.data.map(role => {
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
	var drivers = function () {

		datatable = $('.kt-datatable').KTDatatable({
			// datasource definition
			data: {
				type: 'remote',
				source: {
					read: {
						// /api/token
						// url: 'https://keenthemes.com/metronic/tools/preview/api/datatables/demos/default.php',
						url: 'http://196.221.197.203:5252/api/Driver/GetAllDriversPaging',
						// sample custom headers
						method: "POST",
						timeout: 3000,
						headers: {
							"Authorization": "Berear " + token
						},
						data: {
							PageNumber: 1,
							PageSize: 10
						},
						map: function (raw) {
							// sample data mapping
							console.log(raw);
							var dataSet = raw;
							if (typeof raw.data.data !== 'undefined') {
								dataSet = raw.data.data;
							}
							return dataSet;
						},
					},
				},
				pageSize: 10,
				serverPaging: true,
				serverFiltering: true,
				serverSorting: true,
			},

			// layout definition
			layout: {
				scroll: false,
				footer: false,
			},

			// column sorting
			sortable: true,

			pagination: true,

			search: {
				input: $('#generalSearch'),
			},

			// columns definition
			columns: [
				{
					field: 'id',
					title: '#',
					sortable: 'asc',
					width: 30,
					type: 'number',
					selector: false,
					textAlign: 'center',
				}, {
					field: 'firstName',
					title: 'First Name',
				}, {
					field: 'lastName',
					title: 'Last Name',

				}, {
					field: 'dateOfBirth',
					title: 'Date Of Birth',
					type: 'date',
					format: 'MM/DD/YYYY',
				},
				{
					field: 'email',
					title: 'Email',
				}, {
					field: 'Actions',
					title: 'Actions',
					sortable: false,
					width: 110,
					overflow: 'visible',
					autoHide: false,
					template: function (row) {
						return '\
						<a href="javascript:;" data-id="'+ row.id + '" class="btn btn-sm btn-clean btn-icon btn-icon-sm view"  title="View details">\
                                <i class="flaticon-eye">\</i>\
							</a>\
						<a href="javascript:;" data-id="'+ row.id + '" class="btn btn-sm btn-clean btn-icon btn-icon-sm edit" title="Edit details">\
							<i class="flaticon2-paper"></i>\
						</a>\
						<a href="javascript:;" data-id="'+ row.id + '" class="btn btn-sm btn-clean btn-icon btn-icon-sm delete" title="Delete">\
							<i class="flaticon2-trash"></i>\
						</a>\
					';
					},
				}],
		});

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
						url: "http://196.221.197.203:5252/api/Driver/UpdateDRiver",
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
							datatable.reload();

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
				url: "http://196.221.197.203:5252/api/Driver/GetDriver/" + id,
				type: "GET",

				headers: {
					"Authorization": "Berear " + token
				},
				success: function (res) {
					console.log(res)
					$('#addModal').modal('show');
					console.log(viewForm)
					$('#addModal #addNewForm input[name="firstName"]').val(res.data.firstName);
					$('#addModal #addNewForm input[name="lastName"]').val(res.data.lastName);
					$('#addModal #addNewForm input[name="dateOfBirth"]').val(res.data.dateOfBirth);
					$('#addModal #addNewForm input[name="email"]').val(res.data.email);
					$('#addModal #addNewForm input[name="password"]').val(res.data.password);
					$('#roles').val('res.data.roleID');

					$('#licensePicURL').css('background-image', 'url(' + res.data.licensePicURL + ')');
					$('#picURL').css('background-image', 'url(' + res.data.picURL + ')');
					$('#addModal #addNewForm input[name="isEmployee]').prop("checked", res.data.هisEmployee ? true : false)
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
			loadAllRoles();
			$(".modal-title").text("Add Driver");
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
				url: "http://196.221.197.203:5252/api/Driver/AddDriver",
				method: "POST",
				data: {
					...formData,
					licensePicURL: "",
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
					datatable.reload()
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
			loadAllRoles();

			$(".modal-title").text("Edit Driver");
			$('#addModal #addNewForm input').prop("disabled", false);
			$('#addModal #addNew').hide();
			$('#addModal #update').show();

			$.ajax({
				url: "http://196.221.197.203:5252/api/Driver/GetDriver/" + id,
				type: "GET",

				headers: {
					"Authorization": "Berear " + token
				},
				success: function (res) {
					console.log(res)
					$('#addModal').modal('show');
					// console.log(viewForm)
					$('#addModal #addNewForm input[name="firstName"]').val(res.data.firstName);
					$('#addModal #addNewForm input[name="lastName"]').val(res.data.lastName);
					$('#addModal #addNewForm input[name="dateOfBirth"]').val(res.data.dateOfBirth);
					$('#addModal #addNewForm input[name="email"]').val(res.data.email);
					$('#addModal #addNewForm input[name="password"]').val(res.data.password);
					$('#roles').val('res.data.roleID');

					$('#licensePicURL').css('background-image', 'url(' + res.data.licensePicURL + ')');
					$('#picURL').css('background-image', 'url(' + res.data.picURL + ')');
					$('#addModal #addNewForm input[name="isEmployee]').prop("checked", res.data.هisEmployee ? true : false)
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
				url: "http://196.221.197.203:5252/api/Driver/UpdateDriver",
				method: "POST",
				data: {
					...formData,
					isEmployee: $('#addModal #addNewForm input[name="isEmployee"]:checked').length > 0,
					licensePicURL: "",
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
					datatable.reload()
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
			drivers();
		},
	};
}();

jQuery(document).ready(function () {
	driversDT.init();
});
