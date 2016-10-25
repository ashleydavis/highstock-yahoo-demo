'use strict';

$(function() {

    //
    // Period for simple moving average.
    //
    var smaPeriod = 30;

    //
    // Data loaded for the current graph.
    //
    var curDataFrame = null;

    //
    // Default company code.
    //
    var defaultCompanyCode = 'ABC.AX';

    //
    // Used to suppress chart reload while resizing the chart.
    //
    var resizingChart = false;

    //
    // Load data in format required by highstock.
    //
    var loadHighstockData = function (code, options) {

        var extendedOptions = $.extend({}, options, {
            baseUrl: location.protocol + '//' + location.hostname + ':' + location.port + '/yahoo',
        });

        return dataForge.fromYahoo(code, extendedOptions)
            .then(function (dataFrame) {
                curDataFrame = dataFrame.reverse()
                    .setIndex("Date")
                    .bake();
                return curDataFrame;
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

    $('#SMA-period').change(function () {
        smaPeriod = $('#SMA-period').val();
        var chart = $('#container').highcharts();
        if (chart && curDataFrame) {
            computeSMA(chart, curDataFrame);
        }
    });

    $('#recalcSMA').click(function () {
        smaPeriod = parseInt($('#SMA-period').val());
        var chart = $('#container').highcharts();
        if (chart && curDataFrame) {
            computeSMA(chart, curDataFrame);
        }
    });

    //
    // Load new data depending on the selected date range.
    //
    var afterSetExtremes = function(e) {

        if (resizingChart) {
            // Don't need to reload data when resizing the chart.
            return; 
        }

        var chart = $('#container').highcharts();

        chart.showLoading('Loading data...');

        var fromDate = new Date(e.min);
        var toDate = new Date(e.max);
        var elapsedMonths = moment(toDate).diff(fromDate, 'months');
        var interval = 'daily';
        if (elapsedMonths > 50) {
            interval = 'monthly';
        }
        else if (elapsedMonths > 18) {
            interval = 'weekly';
        }

        loadHighstockData(defaultCompanyCode, {
                fromDate: fromDate,
                toDate: toDate,
                interval: interval,
            })
            .then(function (dataFrame) {
                var price = dataFrame.subset(["Date", "Open", "High", "Low", "Close"]).toHighstockOHLC();
                var volume = dataFrame.subset(["Date", "Volume"]).toHighstock();

                chart.series[0].setData(price);
                chart.series[2].setData(volume);

                computeSMA(chart, dataFrame);
                chart.hideLoading();
            })
            .catch(function (err) {
                chart.hideLoading();
                console.error(err);  
            });
    };

    //
    // Compute simple moving average of the price.
    //
    var computeSMA = function (chart, dataFrame) {
        var sma = dataFrame.getSeries("Close")
            .sma(smaPeriod)
            .toHighstock();
        chart.series[1].setData(sma);
    };

    //
    // Resize the chart to fit the page.
    //
    var resizeChart = function () {
        try {
            resizingChart = true;
            var chart = $('#container').highcharts();
            chart.setSize($(window).width(), $(window).height()-50);            
        }
        finally {
            resizingChart = false;
        }
    };

    //
    // Load the chart.
    //
    var loadChart = function () {

        var code = $("#company").val();
        console.log('Loading ' + code);

        loadHighstockData(code, {
                interval: 'monthly'
            })
            .then(function (dataFrame) {
                var price = dataFrame.toHighstockOHLC();
                var volume = dataFrame.getSeries("Volume").toHighstock();
                var sma = dataFrame.getSeries("Close")
                    .sma(smaPeriod)
                    .toHighstock();

                var groupingUnits = [
                    [
                        'day',
                        [1]
                    ],
                    [
                        'week',                         // unit name
                        [1]                             // allowed multiples
                    ], 
                    [
                        'month',
                        [1, 2, 3, 4, 6]
                    ]
                ];

                var chartOptions =
                {
                    chart: {
                        width: $(window).width(),
                        height: $(window).height()-50
                    },

                    navigator: {
                        adaptToUpdatedData: false,
                        series: [
                            {
                                data: price
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
                            type: 'line',
                            name: 'SMA',
                            color: 'red',
                            data: sma,
                            dataGrouping: {
                                units: groupingUnits
                            },
                            tooltip: {
                                valueDecimals: 5
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
                };
                
                // create the chart
                $('#container').highcharts('StockChart', chartOptions);
            })
            .catch(function (err) {
                console.error(err.stack || err);  
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
