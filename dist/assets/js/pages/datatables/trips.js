"use strict";
// Class definition

var tripsDT = function () {
	// Private functions
	var token = $.cookie("access_token");
	var user = JSON.parse($.cookie("user"))

	var _dt = new DataTableEntry(),
		datatable, _status = 0,
		_sId, routes, arrows, passengersdatatable;
	$('.tripDate').datepicker({
		rtl: KTUtil.isRTL(),
		todayHighlight: true,
		orientation: "bottom left",
		templates: arrows
	});

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
	var loadAllRoutes = function () {
		routes = [];
		$.ajax({
			url: "http://tatweer-api.ngrok.io/api/Route/GetAllRoutes",
			type: "POST",
			data: {
				clientId: user.id
			},
			headers: {
				"Authorization": "Berear " + token
			},
			success: function (res) {
				console.log(res)
				if (res) {
					res.data.map(route => {
						routes.push({ ...route, text: route.routeName })
					})
					$("#routes").select2({
						placeholder: "Select a value",
						data: routes
					});
				}

			},
			error: function (xhr, ajaxOptions, thrownError) {
				swal.fire("Error !", "Please try again", "error");
			}
		})

	};
	var trips = function () {
		var datatable;

		if (datatable) datatable.destroy();
		datatable = _dt.bindDataTable('#dataTable', [0, 1, 2],
			function (data, a, b, c) {
				// console.log(a)

				if (c.col == 2) {
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
			'http://tatweer-api.ngrok.io/api/Trip/GetAllTripsPaging', 'POST', {
			pagenumber: 1,
			pageSize: 10,
			clientId: user.id
		},
			[{
				"data": "id"
			},
			{
				"data": "routeName"
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
						url: "http://tatweer-api.ngrok.io/api/Trip/UpdateTrip",
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
			$(".modal-title").text("View Trip");
			$('#addModal #addNewForm input').prop("disabled", true);
			$('#addModal #addNew,#addModal #update').hide();

			$.ajax({
				url: "http://tatweer-api.ngrok.io/api/Trip/GetTrip/" + id,
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


		// $('#addNew').click(function (e) {
		// 	e.preventDefault();
		// 	var btn = $(this);
		// 	var form = $('#addNewForm');

		// 	form.validate({
		// 		rules: {
		// 			routeId: {
		// 				required: true
		// 			},
		// 			tripDate: {
		// 				required: true
		// 			},
		// 			tripTime: {
		// 				required: true
		// 			}


		// 		}
		// 	});

		// 	if (!form.valid()) {
		// 		return;
		// 	}
		// 	var formData = $('#addNewForm').extractObject();


		// 	console.log(formData);
		// 	btn.addClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', true);
		// 	form.ajaxSubmit({
		// 		url: "http://tatweer-api.ngrok.io/api/Trip/AddTrip",
		// 		method: "POST",
		// 		data: {
		// 			...formData,
		// 			roleId: 4,
		// 			picURL: "",
		// 			isActive: true,
		// 			createDate: new Date(),
		// 			modifyDate: new Date(),
		// 			modifyBy: 1
		// 		},
		// 		headers: {
		// 			"Authorization": "Berear " + token
		// 		},
		// 		success: function (response) {
		// 			// similate 2s delay
		// 			// docCookies.setItem('access_token', response.access_token);
		// 			btn.removeClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', false);
		// 			console.log(response);
		// 			$('#addModal').modal('hide');
		// 			datatable.ajax.reload()
		// 		},
		// 		error: function (res) {
		// 			console.log(res);
		// 			showErrorMsg(form, 'danger', res.message);
		// 		}
		// 	});
		// });
		$('body').on('click', 'a.edit', function (e) {
			let id = e.currentTarget.dataset.id;
			let viewForm = $('#addModal #addNewForm')
				// console.log(e.currentTarget.dataset.id);
				;

			$(".modal-title").text("Edit Trip");
			$('#addModal #addNewForm input').prop("disabled", false);
			$('#addModal #addNew').hide();
			$('#addModal #update').show();

			$.ajax({
				url: "http://tatweer-api.ngrok.io/api/Trip/GetTrip/" + id,
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
			form.validate({
				rules: {
					routeId: {
						required: true
					},
					tripDate: {
						required: true
					},
					tripTime: {
						required: true
					}
				}
			});

			if (!form.valid()) {
				return;
			}

			var formData = $('#addNewForm').extractObject();

			btn.addClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', true);
			form.ajaxSubmit({
				url: "http://tatweer-api.ngrok.io/api/Trip/UpdateTrip",
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


		// Delete
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
						url: "http://tatweer-api.ngrok.io/api/Trip/UpdateStatus",
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
		//view
		$('body').on('click', 'a.view', function (e) {
			let id = e.currentTarget.dataset.id;
			let viewForm = $('#addModal #addNewForm')
			// console.log(e.currentTarget.dataset.id);
			$(".modal-title").text("View Trip");
			$('#addModal #addNewForm input').prop("disabled", true);
			$('#addModal #addNew,#addModal #update').hide();
			// loadAllTrips(true)

			$.ajax({
				url: "http://tatweer-api.ngrok.io/api/Trip/GetTrip/" + id,
				type: "GET",

				headers: {
					"Authorization": "Berear " + token
				},
				success: function (res) {
					console.log(res)
					$('#addModal').modal('show');
					console.log(viewForm)
					$('#addModal #addNewForm input[name="routeName"]').val(res.data.routeName);
					$('#addModal #addNewForm input[name="latitude"]').val(res.data.latitude);
					$('#addModal #addNewForm input[name="longitude"]').val(res.data.longitude);
					$('#clients').val(res.data.clientID);
					$('#clients').trigger('change');

					$('#addModal #addNewForm input[name="id"]').val(res.data.id);
					// swal.fire("Doneosdflsdfsodfjo!", "It was succesfully deleted!", "success");
					// datatable.reload();

				},
				error: function (xhr, ajaxOptions, thrownError) {
					swal.fire("Error deleting!", "Please try again", "error");
				}
			})

		});
		// show add new modal
		$('body').on('click', '#showAddNewModal', function (e) {
			$("#showAddNewModal .modal-title").text("Add Trip");
			$('#addModal #addNewForm input').prop("disabled", false);
			$('#addModal #addNew').show();
			$('#addModal #update').hide();
			$('#addModal').modal('show');
			loadAllRoutes()
			// loadAllRoutes(true);
			let viewForm = $('#addModal #addNewForm')
			viewForm.each(function () {
				this.reset();
			});
			let passengers;
			$.ajax({
				url: "http://tatweer-api.ngrok.io/api/Passenger/GetAllPassenger",
				type: "POST",
				data: {
					pagenumber: 1,
					pageSize: 9999999,
					clientId: user.id
				},
				headers: {
					"Authorization": "Berear " + token
				},
				success: function (res) {
					passengers = res.data.data
					// var rowData = passengersdatatable.rows({ selected: true }).data().toArray();
					var options = {
						// datasource definition
						data: {
							type: 'local',
							source: passengers,
							pageSize: 10,
						},

						// layout definition
						layout: {
							scroll: true, // enable/disable datatable scroll both horizontal and
							// vertical when needed.
							height: 350, // datatable's body's fixed height
							footer: false // display/hide footer
						},

						// column sorting
						sortable: true,

						pagination: true,

						// columns definition

						columns: [{
							field: 'id',
							title: '#',
							sortable: false,
							width: 20,
							selector: {
								class: 'kt-checkbox--solid'
							},
							textAlign: 'center',
						}, {
							field: 'workid',
							title: 'ID'
						}, {
							field: 'firstName',
							title: 'Name'
						}],
					};

					options.search = {
						input: $('#generalSearch'),
					};

					var datatablePassenger = $('#local_record_selection').KTDatatable(options);

					// $('#kt_form_status,#kt_form_type').selectpicker();

					// datatable.on(
					// 	'kt-datatable--on-check kt-datatable--on-uncheck kt-datatable--on-layout-updated',
					// 	function (e) {
					// 		var checkedNodes = datatable.rows('.kt-datatable__row--active').nodes();
					// 		var count = checkedNodes.length;
					// 		$('#kt_datatable_selected_number').html(count);
					// 		if (count > 0) {
					// 			$('#kt_datatable_group_action_form').collapse('show');
					// 		} else {
					// 			$('#kt_datatable_group_action_form').collapse('hide');
					// 		}
					// 	});
					$('#addNew').click(function (e) {
						e.preventDefault();
						var btn = $(this);
						var form = $('#addNewForm');
						var formData = $('#addNewForm').extractObject();
						delete formData.search;
						// delete formData.endPoint;
						// delete formData.id;
						console.log(formData);
						var ids = datatablePassenger.rows('.kt-datatable__row--active').
							nodes().
							find('.kt-checkbox--single > [type="checkbox"]').
							map(function (i, chk) {
								return $(chk).val();
							});
						var c = [];
						for (var i = 0; i < ids.length; i++) {
							c.push({
								id: ids[i]
							});

						}
						console.log(c)
						btn.addClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', true);
						form.ajaxSubmit({
							url: "http://tatweer-api.ngrok.io/api/Trip/AddTrip",
							method: "POST",
							data: {
								...formData,
								clientId: user.id,
								passenger: c,
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
								console.log(res);
								btn.removeClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', false);
								// showErrorMsg(form, 'danger', res.message);
							}
						});
					});
					// $('#kt_modal_fetch_id').on('click', function (e) {

					// 	$(e.target).find('.kt-datatable_selected_ids').append(c);

					// })

				},

				error: function (xhr, ajaxOptions, thrownError) {
					swal.fire("Error !", "Please try again", "error");
				}
			})
		});
		// add new

		$('body').on('click', 'a.edit', function (e) {
			let id = e.currentTarget.dataset.id;
			let viewForm = $('#addModal #addNewForm')
			// console.log(e.currentTarget.dataset.id);
			// loadAllRoutes(true);

			$(".modal-title").text("Edit Trip");
			$('#addModal #addNewForm input').prop("disabled", false);
			$('#addModal #addNew').hide();
			$('#addModal #update').show();

			$.ajax({
				url: "http://tatweer-api.ngrok.io/api/Trip/GetTrip/" + id,
				type: "GET",

				headers: {
					"Authorization": "Berear " + token
				},
				success: function (res) {
					$('#addModal').modal('show');
					$('#addModal #addNewForm input[name="name"]').val(res.data.name);
					$('#addModal #addNewForm input[name="latitude"]').val(res.data.latitude);
					$('#addModal #addNewForm input[name="longitude"]').val(res.data.longitude);
					$('#clients').val(res.data.clientID);
					$('#clients').trigger('change');
					$('#addModal #addNewForm input[name="id"]').val(res.data.id);


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
				url: "http://tatweer-api.ngrok.io/api/Trip/UpdateTrip",
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
		$('body').on('click', 'a.passengers', function (e) {
			let id = e.currentTarget.dataset.id;
			// console.log(e.currentTarget.dataset.id);	
			// $('#checkid').val(id);
			if (passengersdatatable) passengersdatatable.destroy()
			passengersdatatable = $('#passengersTable1').DataTable({
				responsive: true,
				searchDelay: 500,
				processing: true,
				serverSide: true,
				searching: true,
				ajax: {
					url: "http://tatweer-api.ngrok.io/api/Passenger/GetAllPassenger",
					type: "POST",
					data: {
						pagenumber: 1,
						pageSize: 10,
						clientId: user.id
					},
					headers: {
						"Authorization": "Berear " + token
					},
				},
				columns: [
					{ data: 'id' },
					{ data: 'firstName' }
				]
			});
			$('#passengersModal').modal('show');

		});

		// if (passengersdatatable) passengersdatatable.destroy()
		// passengersdatatable = $('#passengersTable1').DataTable({
		// 	responsive: true,
		// 	searchDelay: 500,
		// 	processing: true,
		// 	serverSide: true,
		// 	searching: true,
		// 	ajax: {
		// 		url: "http://tatweer-api.ngrok.io/api/Passenger/GetAllPassenger",
		// 		type: "POST",
		// 		data: {
		// 			pagenumber: 1,
		// 			pageSize: 10,
		// 			clientId: user.id
		// 		},
		// 		headers: {
		// 			"Authorization": "Berear " + token
		// 		},
		// 	},
		// 	columns: [
		// 		{ data: 'id' },
		// 		{ data: 'firstName' }
		// 	]
		// });
		$('body').on('click', 'a.passengers', function (e) {
			let id = e.currentTarget.dataset.id;
			let passenger = e.currentTarget.dataset.passenger;
			console.log(e.currentTarget.dataset.is);
			$('#passengersModal').modal('show');
			// $('#checkid').val(id);
			if (passengersdatatable) passengersdatatable.destroy()

			passengersdatatable = $('#passengersTable1').DataTable({
				responsive: true,
				searchDelay: 500,
				processing: false,
				serverSide: false,
				searching: false,
				ajax: {
					url: "http://tatweer-api.ngrok.io/api/Passenger/GetAllPassenger",
					type: "POST",
					data: {
						pagenumber: 1,
						pageSize: 10,
						clientId: user.id
					},
					headers: {
						"Authorization": "Berear " + token
					},
				},
				columns: [
					{ data: 'id' },
					{ data: 'firstName' }
				]
			});

		});




	}


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
