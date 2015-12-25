'use strict';

$(function() {

    //
    // Load data in format required by highstock.
    //
    var loadHighstockData = function (code, options) {
        return loadYahooData(code, options)
            .then(function (data) {
                var reversed = Enumerable.from(data).reverse().toArray();

                return {

                    price: Enumerable.from(reversed)
                        .select(function (entry) {
                            var time = entry.Date.getTime();
                            return [
                                time,
                                entry.Open,
                                entry.High,
                                entry.Low,
                                entry.Close,
                            ];
                        })
                        .toArray(),

                    volume: Enumerable.from(reversed)
                        .select(function (entry) {
                            return [
                                entry.Date.getTime(),
                                entry.Volume,
                            ];
                        })
                        .toArray(),
                };
            });
    };

    //
    // Destroy the existing chart.
    //
    var destroyChart = function () {
        var chart = $('#container').highcharts();
        if (chart) {
            chart.destroy();
        }
    };

    //
    // Destroy and reload the chart.
    //
    var reloadChart = function () {
        destroyChart();
        loadChart();
    };

    $("#company").change(function() {
        reloadChart();
    });

    $('#loadChart').click(function () {
        reloadChart();
    });

    //
    // Load new data depending on the selected date range.
    //
    var afterSetExtremes = function(e) {

        var chart = $('#container').highcharts();

        chart.showLoading('Loading data...');

        loadHighstockData('ABC', {
                fromDate: new Date(e.min),
                toDate: new Date(e.max),
            })
            .then(function (data) {
                chart.series[0].setData(data.price);
                chart.series[1].setData(data.volume);
                chart.hideLoading();
            })
            .catch(function (err) {
                chart.hideLoading();
                console.error(err);  
            });
    };

    //
    // Resize the chart to fit the page.
    //
    var resizeChart = function () {
        var chart = $('#container').highcharts();
        chart.setSize($(window).width(), $(window).height()-50);
    };

    //
    // Load the chart.
    //
    var loadChart = function () {

        var code = $("#company").val();
        console.log('Loading ' + code);

        loadHighstockData(code, {})
            .then(function (data) {
                var price = data.price;
                var volume = data.volume;

                var groupingUnits = [
                    [
                        'week',                         // unit name
                        [1]                             // allowed multiples
                    ], 
                    [
                        'month',
                        [1, 2, 3, 4, 6]
                    ]
                ];
                
                // create the chart
                $('#container').highcharts('StockChart', {

                    navigator: {
                        adaptToUpdatedData: false,
                        series: [
                            {
                                data: price
                            },
                            {
                                data: volume
                            },
                        ]
                    },

                    scrollbar: {
                        liveRedraw: false
                    },

                    title: {
                        text: code.toUpperCase() + ' price history'
                    },

                    subtitle: {
                        text: 'A demo of Highstock using Data-Forge with data loaded from Yahoo.'
                    },

                    rangeSelector: {
                        buttons: [
                            {
                                type: 'hour',
                                count: 1,
                                text: '1h'
                            }, 
                            {
                                type: 'day',
                                count: 1,
                                text: '1d'
                            }, 
                            {
                                type: 'month',
                                count: 1,
                                text: '1m'
                            }, 
                            {
                                type: 'year',
                                count: 1,
                                text: '1y'
                                }, {
                                type: 'all',
                                text: 'All'
                            }
                        ],
                        inputEnabled: true,
                        selected: 4 // all
                    },

                    xAxis: {
                        events: {
                            afterSetExtremes: afterSetExtremes
                        },
                        minRange: 3600 * 1000 * 24 * 5 // 1 week
                    },

                    yAxis: [
                        {
                            labels: {
                                align: 'right',
                                x: -3
                            },
                            title: {
                                text: 'Price'
                            },
                            height: '60%',
                            lineWidth: 2
                        }, 
                        {
                            labels: {
                                align: 'right',
                                x: -3
                            },
                            title: {
                                text: 'Volume'
                            },
                            top: '65%',
                            height: '35%',
                            offset: 0,
                            lineWidth: 2
                        }
                    ],

                    series: [
                        {
                            type: 'candlestick',
                            name: 'Price',
                            data: price,
                            dataGrouping: {
                                units: groupingUnits
                            }
                        },
                        {
                            type: 'column',
                            name: 'Volume',
                            data: volume,
                            yAxis: 1,
                            dataGrouping: {
                                units: groupingUnits
                            }
                        }
                    ]
                });

                resizeChart();
            })
            .catch(function (err) {
                console.error(err);  
            });
    };

    loadChart();

    //
    // Resize chart when window size changes.
    //
    $(window).resize(function() {
        resizeChart();
    });
});
