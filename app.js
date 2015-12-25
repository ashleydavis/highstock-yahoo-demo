'use strict';

$(function() {

    //
    // Load new data depending on the selected min and max
    //
    var afterSetExtremes = function(e) {

        var chart = $('#container').highcharts();

        chart.showLoading('Loading data...');

        loadYahooData('ABC', {
                fromDate: new Date(e.min),
                toDate: new Date(e.max),
            })
            .then(function (data) {

                var volume = Enumerable.from(data)
                    .reverse()
                    .select(function (entry) {
                        return [
                            entry.Date.getTime(),
                            entry.Volume,
                        ];
                    })
                    .toArray();

                data = Enumerable
                    .from(data)
                    .reverse()
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
                    .toArray();

                    chart.series[0].setData(data);
                    chart.hideLoading();
                });
    };

    loadYahooData('ABC', {
        })
        .then(function (data) {

            var volume = Enumerable.from(data)
                .reverse()
                .select(function (entry) {
                    return [
                        entry.Date.getTime(),
                        entry.Volume,
                    ];
                })
                .toArray();

            data = Enumerable
                .from(data)
                .reverse() //todo: move to load data.
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
                .toArray();

            // create the chart
            $('#container').highcharts('StockChart', {
                chart: {
                    type: 'candlestick',
                    zoomType: 'x'
                },

                navigator: {
                    adaptToUpdatedData: false,
                    series: {
                        data: data
                    }
                },

                scrollbar: {
                    liveRedraw: false
                },

                title: {
                    text: 'ABC price history'
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
                    minRange: 3600 * 1000 // one hour
                },

                yAxis: [
                    {
                        labels: {
                            align: 'right',
                            x: -3
                        },
                        title: {
                            text: 'OHLC'
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
                        data: data,
                        dataGrouping: {
                            enabled: true
                        },
                    },
                    {
                        type: 'column',
                        name: 'Volume',
                        data: volume,
                        yAxis: 1,
                        dataGrouping: {
                            enabled: true,
                        },
                    }
                ]
            });
        });
});
