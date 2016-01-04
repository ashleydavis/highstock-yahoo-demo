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
    // Load data in format required by highstock.
    //
    var loadHighstockData = function (code, options) {
        return dataForge.fromYahoo(code, options)
            .then(function (dataFrame) {
                //todo: data-forge needs a reverse fn.
                var reversed = Enumerable.from(dataFrame.toObjects())
                    .reverse()
                    .toArray();

                var df = new dataForge.DataFrame({ rows: reversed });
                curDataFrame = df;

                var origGetColumnsSubset = df.getColumnsSubset;

                var toHighstockSMA = function (period) {
                    var self = this;
                    var inputData = self.toValues();
                    var output = [];
                    for (var i = inputData.length-1; i > period; --i) {
                        
                        var sample = inputData[i][1];
                        var date = inputData[i][0].getTime();

                        for (var j = 1; j < period; ++j) {
                            sample += inputData[i-j][1];
                        }

                        sample /= period;

                        output.push([date, sample]);
                    }

                    return output.reverse();
                };    

                df.getColumnsSubset = function (columnNames) { //todo: shouldn't have to replace this.
                    var newDf = origGetColumnsSubset.call(this, columnNames);
                    newDf.toHighstockSMA = toHighstockSMA;  
                    return newDf;
                };

                return df;
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
        smaPeriod = $('#SMA-period').val();
        var chart = $('#container').highcharts();
        if (chart && curDataFrame) {
            computeSMA(chart, curDataFrame);
        }
    });

    //
    // Load new data depending on the selected date range.
    //
    var afterSetExtremes = function(e) {

        var chart = $('#container').highcharts();

        chart.showLoading('Loading data...');

        loadHighstockData(defaultCompanyCode, {
                fromDate: new Date(e.min),
                toDate: new Date(e.max),
            })
            .then(function (dataFrame) {
                var price = dataFrame.getColumnsSubset(["Date", "Open", "High", "Low", "Close"]).toHighstockOHLC();
                var volume = dataFrame.getColumnsSubset(["Date", "Volume"]).toHighstock();

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
        chart.series[1].setData(dataFrame.getColumnsSubset(["Date", "Close"]).toHighstockSMA(smaPeriod));
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
            .then(function (dataFrame) {
                var price = dataFrame.getColumnsSubset(["Date", "Open", "High", "Low", "Close"]).toHighstockOHLC();
                var volume = dataFrame.getColumnsSubset(["Date", "Volume"]).toHighstock();

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

                var chartOptions =
                {
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
                            type: 'line',
                            name: 'SMA',
                            color: 'red',
                            data: dataFrame.getColumnsSubset(["Date", "Close"]).toHighstockSMA(smaPeriod),
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

                resizeChart();
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
