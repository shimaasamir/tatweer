"use strict";

// Class definition
var KTDashboard = function () {
    var token = $.cookie("access_token");


    //Dashboard summery
    var dashboardSummery = function () {
        var sales = $('#sales');
        var clients = $('#clients');
        var trips = $('#trips');
        var drivers = $('#drivers');
        var passengers = $('#passengers');
        $(document).ready(function () {
            console.log("ready!");
            $.ajax({
                url: "http://tatweer-api.ngrok.io/api/dashboard/summary",
                type: "GET",
                headers: {
                    "Authorization": "Berear " + token
                },
                success: function (response) {

                    sales.html(response.data.sales)
                    clients.html(response.data.clients)
                    trips.html(response.data.trips)
                    drivers.html(response.data.drivers)
                    passengers.html(response.data.passengers)
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    swal.fire("Error !", "Please try again", "error");
                }
            })
        });
    }
    //Trip Analysis
    var tripAnalysis = function () {

        var tripAnalysis = $('#tripAnalysis');
        $(document).ready(function () {
            console.log("ready!");
            $.ajax({
                url: "http://tatweer-api.ngrok.io/api/dashboard/tripStatusAnalysis",
                type: "GET",
                headers: {
                    "Authorization": "Berear " + token
                },
                success: function (response) {

                    $.map(response.data, function (value, key) {
                        $('#' + key).html(response.data[key])

                    });
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    swal.fire("Error !", "Please try again", "error");
                }
            })
        });

    }
    //Trip Analysis
    var topClients = function () {

        var topClients = $('#topClients');
        $(document).ready(function () {
            console.log("ready!");
            $.ajax({
                url: "http://tatweer-api.ngrok.io/api/dashboard/topClients",
                type: "GET",
                headers: {
                    "Authorization": "Berear " + token
                },
                success: function (response) {

                    $.map(response.data, function (client) {
                        let row;
                        row = `
                        <div class="kt-widget6__item">
                            <span>`+ client.clientName + `</span>
                            <span>`+ client.totalTrips + `</span>
                            <span class="kt-font-success kt-font-bold">`+ client.sales + ` EGP</span>
                         </div>
                      `
                        topClients.append(row)
                    });
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    swal.fire("Error !", "Please try again", "error");
                }
            })
        });

    }
    //Dashboard summery
    var recentTrips = function () {
        var recentTrips = $('#recentTrips');
        var datatable = recentTrips.KTDatatable({
            // datasource definition
            data: {
                type: 'remote',
                source: {
                    read: {
                        url: 'http://tatweer-api.ngrok.io/api/dashboard/recentTrips',
                        // sample custom headers
                        // headers: {'x-my-custom-header': 'some value', 'x-test-header': 'the value'},
                        method: "GET",
                        headers: {
                            "Authorization": "Berear " + token
                        },
                        map: function (raw) {
                            // sample data mapping
                            var dataSet = raw;
                            if (typeof raw.data !== 'undefined') {
                                dataSet = raw.data;
                            }
                            return dataSet;
                        },
                    },
                },
                pageSize: 5,

            },

            // layout definition
            layout: {
                scroll: false, // enable/disable datatable scroll both horizontal and vertical when needed.
                // height: 350,
                footer: false,
            },

            // column sorting
            sortable: false,

            pagination: false,



            // columns definition
            columns: [
                {
                    field: 'Client',
                    title: 'Client',
                    width: '200',
                    template: function (row) {
                        return row.client.name;
                    },
                }, {
                    field: 'tripDateTime',
                    title: 'Trip Date & Time',
                    type: 'date',
                    format: 'MM/DD/YYYY hh:mm',
                    template: function (row) {
                        return formatDate(row.tripDateTime) + " " + getTime(row.tripDateTime);
                    },
                }, {
                    field: 'amount',
                    title: 'Cost',
                }, {
                    field: 'statusId',
                    title: 'Status',
                    width: '100',
                    // callback function support for column rendering

                    template: function (row) {
                        var status = {
                            1: { 'title': 'Pending', 'class': 'kt-badge--warning' },
                            2: { 'title': 'Approved', 'class': ' kt-badge--success' },
                            3: { 'title': ' In Progress', 'class': ' kt-badge--primary' },
                            4: { 'title': 'Finished', 'class': ' kt-badge--success' },
                            5: { 'title': 'Canceled', 'class': ' kt-badge--danger' },
                        };
                        return '<span class="kt-badge ' + status[row.statusId].class + ' kt-badge--inline kt-badge--pill">' + status[row.statusId].title + '</span>';
                    },
                }],

        });

    }
    //revenue Chart
    var initChart = function (start, end) {
        var settings = {
            "url": "http://tatweer-api.ngrok.io/api/trip/GetTripsRevenueByDate",
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            "data": JSON.stringify({ "PageNumber": 1, "PageSize": 10, "from": start, "to": end, "statusId": 0, "clientId": 137 }),
        };

        $.ajax(settings).done(function (response) {
            console.log(response);

            let chartData = [];
            $.map(response.data.data, function (trip) {
                // console.log(trip)
                let item = {
                    date: formatDate(trip.tripDateTime) + " " + getTime(trip.tripDateTime),
                    amount: trip.amount + Math.floor((Math.random() * 100) + 1)
                }
                chartData.push(item)
            });

            console.log(chartData);

            // Themes begin
            am4core.useTheme(am4themes_animated);
            // Themes end


            var chart = am4core.create("revenueChart", am4charts.XYChart);
            chart.scrollbarX = new am4core.Scrollbar();

            // Add data
            chart.data = chartData;

            // Create axes
            var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            categoryAxis.dataFields.category = "date";
            categoryAxis.renderer.grid.template.location = 0;
            categoryAxis.renderer.minGridDistance = 30;
            categoryAxis.renderer.labels.template.horizontalCenter = "right";
            categoryAxis.renderer.labels.template.verticalCenter = "middle";
            categoryAxis.renderer.labels.template.rotation = 330;
            categoryAxis.tooltip.disabled = true;
            categoryAxis.renderer.minHeight = 110;

            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.renderer.minWidth = 50;

            // Create series
            var series = chart.series.push(new am4charts.ColumnSeries());
            series.sequencedInterpolation = true;
            series.dataFields.valueY = "amount";
            series.dataFields.categoryX = "date";
            series.tooltipText = "[{categoryX}: bold]{valueY}[/]";
            series.columns.template.strokeWidth = 0;

            series.tooltip.pointerOrientation = "vertical";

            series.columns.template.column.cornerRadiusTopLeft = 10;
            series.columns.template.column.cornerRadiusTopRight = 10;
            series.columns.template.column.fillOpacity = 0.8;

            // on hover, make corner radiuses bigger
            var hoverState = series.columns.template.column.states.create("hover");
            hoverState.properties.cornerRadiusTopLeft = 0;
            hoverState.properties.cornerRadiusTopRight = 0;
            hoverState.properties.fillOpacity = 1;

            series.columns.template.adapter.add("fill", function (fill, target) {
                return chart.colors.getIndex(target.dataItem.index);
            });

            // Cursor
            chart.cursor = new am4charts.XYCursor();
        });
    }
    var revenueChart = function () {
        var revenueChart = $('#revenueChart');
        initChart(moment().subtract(1, 'months'), moment())
        $('.dateRange').daterangepicker({
            buttonClasses: ' btn',
            applyClass: 'btn-primary',
            cancelClass: 'btn-secondary',
            startDate: moment().subtract(1, 'months'),
            endDate: moment(),
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
            initChart(start, end)
        });
    }

    return {
        // Init demos
        init: function () {

            dashboardSummery()
            recentTrips()
            tripAnalysis()
            topClients()
            revenueChart()
            // demo loading
            var loading = new KTDialog({ 'type': 'loader', 'placement': 'top center', 'message': 'Loading ...' });
            loading.show();

            setTimeout(function () {
                loading.hide();
            }, 3000);
        }
    };
}();

// Class initialization on page load
jQuery(document).ready(function () {
    KTDashboard.init();
});
