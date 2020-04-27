"use strict";
// Class definition

var routesDT = function () {
	// Private functions
	var token = $.cookie("access_token");

	var _dt = new DataTableEntry(),
		datatable, _status = 0,
		_sId, clients, arrows, checkPointsdatatable = $('#checkPointsTable').DataTable();

	google.maps.event.addDomListener(window, 'load', startPoint);

	function startPoint() {
		var input = document.getElementById('StartPoint');
		var autocomplete = new google.maps.places.Autocomplete(input);
		autocomplete.setComponentRestrictions(
			{ 'country': ['eg'] });
		google.maps.event.addListener(autocomplete, 'place_changed', function () {
			var place = autocomplete.getPlace();
			$('#startLatitude').val(place.geometry['location'].lat());
			$('#startLongitude').val(place.geometry['location'].lng());
		});
	}



	google.maps.event.addDomListener(window, 'load', endPoint);

	function endPoint() {
		var input = document.getElementById('EndPoint');
		var autocomplete = new google.maps.places.Autocomplete(input);
		autocomplete.setComponentRestrictions(
			{ 'country': ['eg'] });
		google.maps.event.addListener(autocomplete, 'place_changed', function () {
			var place = autocomplete.getPlace();
			$('#endLatitude').val(place.geometry['location'].lat());
			$('#endLongitude').val(place.geometry['location'].lng());
		});
	}
	google.maps.event.addDomListener(window, 'load', checkPoint);

	function checkPoint() {
		var input = document.getElementById('checkPoint');
		var autocomplete = new google.maps.places.Autocomplete(input);
		autocomplete.setComponentRestrictions(
			{ 'country': ['eg'] });
		google.maps.event.addListener(autocomplete, 'place_changed', function () {
			var place = autocomplete.getPlace();
			$('#latitude').val(place.geometry['location'].lat());
			$('#longitude').val(place.geometry['location'].lng());
		});
	}


	loadAllClients(false)


	//start--convert form to json

	//end--convert form to json
	// basic demo
	var datatable = $('#dataTable').DataTable();
	$('.tableContainer').hide()
	var routes = function () {
		// load routes based on client
		$('#clients').on('select2:select', function (e) {
			// console.log(e)
			var clientID = $(this).val();
			// console.log($(this).val())
			if (datatable) datatable.destroy();
			// var table = $('#kt_table_1');
			$('.tableContainer').show();

			// begin first table
			datatable = $('#dataTable').DataTable({
				responsive: true,
				searchDelay: 500,
				processing: false,
				serverSide: false,
				searching: false,
				paging: false,
				ajax: {
					url: "http://tatweer-api.ngrok.io/api/Route/GetAllRoutes",
					type: "POST",
					data: {
						clientId: clientID
					},
					headers: {
						"Authorization": "Berear " + token
					},
				},
				columns: [
					{ data: 'id' },
					{ data: 'routeName' },
					{ data: 'Actions', responsivePriority: -1 },
				],
				columnDefs: [
					{
						targets: -1,
						title: 'Actions',
						orderable: false,
						width: 200,
						render: function (data, type, b, meta) {
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
							<a href="javascript:;" data-id="' + b.id + '" class="btn btn-sm btn-clean btn-icon btn-icon-sm points" title="Check Points Setup">\
								<i class="fa fa-route"></i>\
							</a>\
						';
						},
					}
				],
			});


		});
		$('body').on('click', '#update', function (e) {
			console.log("update action")
			// e.preventDefault();
			var btn = $(this);
			var form = $('#addNewForm');
			form.validate({
				rules: {
					routeName: {
						required: true,
					},
					startName: {
						required: true,
					},
					endName: {
						required: true
					},
					clientId: {
						required: true
					},
					distance: {
						required: true,
						number: true
					},
					cost: {
						required: true,
						number: true
					}



				}
			});
			if (!form.valid()) {
				return;
			}
			var formData = $('#addNewForm').extractObject();
			console.log(formData)
			btn.addClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', true);
			form.ajaxSubmit({
				url: "http://tatweer-api.ngrok.io/api/Route/UpdateRoute",
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
				error: function (response) {
					console.log(r); es
					showErrorMsg(form, 'danger', response.message);
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
						url: "http://tatweer-api.ngrok.io/api/Route/UpdateRoute",
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
		//view
		$('body').on('click', 'a.view', function (e) {
			let id = e.currentTarget.dataset.id;
			let viewForm = $('#addModal #addNewForm')
			// console.log(e.currentTarget.dataset.id);
			$(".modal-title").text("View Route");
			$('#addModal #addNewForm input').prop("disabled", true);
			$('#addModal #addNew,#addModal #update').hide();
			loadAllClients(true)

			$.ajax({
				url: "http://tatweer-api.ngrok.io/api/Route/GetRoute/" + id,
				type: "GET",

				headers: {
					"Authorization": "Berear " + token
				},
				success: function (response) {
					console.log(response)
					$('#addModal').modal('show');
					console.log(viewForm)
					$('#addModal #addNewForm input[name="routeName"]').val(response.data.routeName);
					$('#addModal #addNewForm input[name="startLatitude"]').val(response.data.startLatitude);
					$('#addModal #addNewForm input[name="startLongitude"]').val(response.data.startLongitude);
					$('#addModal #addNewForm input[name="endLatitude"]').val(response.data.endLatitude);
					$('#addModal #addNewForm input[name="endlongitude"]').val(response.data.endlongitude);
					$('#clientsModal').val(response.data.clientId);
					$('#clientsModal').trigger('change');
					$('#addModal #addNewForm input[name="startName"]').val(response.data.startName);
					$('#addModal #addNewForm input[name="endName"]').val(response.data.endName);
					$('#addModal #addNewForm input[name="cost"]').val(response.data.cost);
					$('#addModal #addNewForm input[name="distance"]').val(response.data.distance);
					$('#addModal #addNewForm input[name="id"]').val(response.data.id);
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
			$("#showAddNewModal .modal-title").text("Add Route");
			$('#addModal #addNewForm input').prop("disabled", false);
			$('#addModal #addNew').show();
			$('#addModal #update').hide();
			$('#addModal').modal('show');
			loadAllClients(true);
			let viewForm = $('#addModal #addNewForm')
			viewForm.each(function () {
				this.reset();
				$("#addModal #addNewForm input:hidden").val('');
			});



		});
		// add new
		$('#addNew').click(function (e) {

			var btn = $(this);
			var form = $('#addNewForm');
			form.validate({
				rules: {
					routeName: {
						required: true,
					},
					startName: {
						required: true,
					},
					endName: {
						required: true
					},
					clientId: {
						required: true
					},
					distance: {
						required: true,
						number: true
					},
					cost: {
						required: true,
						number: true
					}



				}
			});
			if (!form.valid()) {
				return;
			}
			var formData = $('#addNewForm').extractObject();
			delete formData.id;
			console.log(formData);
			btn.addClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', true);
			form.ajaxSubmit({
				url: "http://tatweer-api.ngrok.io/api/Route/AddRoute",
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
				error: function (response) {
					console.log(response);
					btn.removeClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', false);
					// showErrorMsg(form, 'danger', response.message);
				}
			});
		});
		$('body').on('click', 'a.edit', function (e) {
			let id = e.currentTarget.dataset.id;
			let viewForm = $('#addModal #addNewForm')
			// console.log(e.currentTarget.dataset.id);
			loadAllClients(true);

			$(".modal-title").text("Edit Route");
			$('#addModal #addNewForm input').prop("disabled", false);
			$('#addModal #addNew').hide();
			$('#addModal #update').show();

			$.ajax({
				url: "http://tatweer-api.ngrok.io/api/Route/GetRoute/" + id,
				type: "GET",

				headers: {
					"Authorization": "Berear " + token
				},
				success: function (response) {
					$('#addModal #addNewForm input[name="routeName"]').val(response.data.routeName);
					$('#addModal #addNewForm input[name="startLatitude"]').val(response.data.startLatitude);
					$('#addModal #addNewForm input[name="startLongitude"]').val(response.data.startLongitude);
					$('#addModal #addNewForm input[name="endLatitude"]').val(response.data.endLatitude);
					$('#addModal #addNewForm input[name="endlongitude"]').val(response.data.endlongitude);
					$('#addModal #addNewForm input[name="startName"]').val(response.data.startName);
					$('#addModal #addNewForm input[name="endName"]').val(response.data.endName);
					$('#addModal #addNewForm input[name="cost"]').val(response.data.cost);
					$('#addModal #addNewForm input[name="distance"]').val(response.data.distance);
					$('#clientsModal').val(response.data.clientId);
					$('#clientsModal').trigger('change');
					$('#addModal #addNewForm input[name="id"]').val(response.data.id);
					$('#addModal').modal('show');


				},
				error: function (xhr, ajaxOptions, thrownError) {
					swal.fire("Error !", "Please try again", "error");
				}
			})

		});

		//view
		$('body').on('click', 'a.points', function (e) {
			let id = e.currentTarget.dataset.id;
			// console.log(e.currentTarget.dataset.id);	
			$('#checkPointsModal').modal('show');
			$("#checkPointsModal .modal-title").text("Manage Check/ Assembly points ");

			$('#checkid').val(id);
			if (checkPointsdatatable) checkPointsdatatable.destroy()
			checkPointsdatatable = $('#checkPointsTable').DataTable({
				responsive: true,
				searchDelay: 500,
				processing: false,
				serverSide: false,
				searching: false,
				ajax: {
					url: "http://tatweer-api.ngrok.io/api/CheckPoints/GetAllCheckPoints",
					type: "POST",
					data: {
						routeId: id
					},
					headers: {
						"Authorization": "Berear " + token
					},
				},
				columns: [
					{ data: 'id' },
					{ data: 'name' },
					{ data: 'Actions', responsivePriority: -1 },
				],
				columnDefs: [
					{
						targets: -1,
						title: 'Actions',
						orderable: false,
						width: 50,
						render: function (data, type, b, meta) {
							return '\
							<a href="javascript:;" data-id="' + b.id + '" class="btn btn-sm btn-clean btn-icon btn-icon-sm deleteCheckPoint" title="Delete">\
								<i class="flaticon2-trash"></i>\
							</a>\
						';
						},
					}
				],
			});

		});



		// add new 
		$('body').on('click', '#addNewCheckPoint', function (e) {
			e.preventDefault();
			var btn = $(this);
			var formpoint = $('#checkPointForm');
			var formData = $('#checkPointForm').extractObject();

			console.log(formData);
			btn.addClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', true);
			formpoint.ajaxSubmit({
				url: "http://tatweer-api.ngrok.io/api/CheckPoints/AddCheckPoint",
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
					$('#checkPoint').val('');
					$('#latitude').val('');
					$('#longitude').val('');
					checkPointsdatatable.ajax.reload()
				},
				error: function (response) {
					console.log(response);
					btn.removeClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', false);
					// showErrorMsg(form, 'danger', response.message);
				}
			});
		});

		// Delete
		$('body').on('click', 'a.deleteCheckPoint', function (e) {
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
						url: "http://tatweer-api.ngrok.io/api/CheckPoints/UpdateCheckPoint",
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
							checkPointsdatatable.ajax.reload();

						},
						error: function (xhr, ajaxOptions, thrownError) {
							swal.fire("Error deleting!", "Please try again", "error");
						}
					})
				}
			});
		});

	};

	return {
		// public functions
		init: function () {
			routes();
		},
	};
}();

jQuery(document).ready(function () {

	routesDT.init();
});
