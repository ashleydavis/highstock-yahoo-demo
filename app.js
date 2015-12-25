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
                            }, {
                            type: 'day',
                            count: 1,
                            text: '1d'
                        }, {
                            type: 'month',
                            count: 1,
                            text: '1m'
                        }, {
                            type: 'year',
                            count: 1,
                            text: '1y'
                            }, {
                            type: 'all',
                            text: 'All'
                        }
                    ],
                    inputEnabled: false, // it supports only days
                    selected: 4 // all
                },

                xAxis: {
                    events: {
                        afterSetExtremes: afterSetExtremes
                    },
                    minRange: 3600 * 1000 // one hour
                },

                yAxis: {
                    floor: 0
                },

                series: [
                    {
                        data: data,
                        dataGrouping: {
                            enabled: false
                        }
                    }
                ]
            });
        });
});
