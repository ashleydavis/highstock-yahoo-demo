'use strict';

//
// Create the URL for pulling data from Yahoo.
//
var formatYahooUrl = function (code, options) {

    options = options || {};

    var url = 'http://ichart.yahoo.com/table.csv?s=' + code.toUpperCase();

    if (options.fromDate) {                
        url += '&a=' + options.fromDate.getMonth(); // Month. Yahoo expects 0-based month.
        url += '&b=' + options.fromDate.getDate(); // Date.
        url += '&c=' + options.fromDate.getFullYear(); // Year.
    }

    if (options.toDate) {
        
        url += '&d=' + options.toDate.getMonth(); // Month. Yahoo expects 0-based month.             
        url += '&e=' + options.toDate.getDate(); // Date.                
        url += '&f=' + options.toDate.getFullYear(); // Year.
    }

    if (options.interval) {
        // Time interval.
        // https://code.google.com/p/yahoo-finance-managed/wiki/enumHistQuotesInterval
        var intervalCode;
        if (options.interval === 'daily') {
            intervalCode = 'd';
        }
        else if (options.interval === 'weekly') {
            intervalCode = 'w';
        }
        else if (options.interval === 'monthly') {
            intervalCode = 'm';
        }
        else {
            observer.onError(new Error("Invalid interval: " + options.interval + ", should be one of daily, weekly or monthly."));
        }

        url += '&g=' + intervalCode;
    }


    url += '&ignore=.csv'; // Docs say to add this.

    return url;
};

//
// Parse CSV data from Yahoo API.
//
var parseYahooCsv = function (csv) {
    var lines = Enumerable.from(csv.split('\n'))
        .select(function (row) {
            return Enumerable.from(row.split(','))
                .select(function (col) {
                    return col.trim();
                })
                .toArray();
        })
        .where(function (cols) {
            if (cols.length > 1) {
                return true;
            }
            else if (cols.length == 1) {
                return cols[0].length > 0;
            }
            else {
                return false;
            }
        })
        .toArray();

    var header = lines[0];
    var rows = Enumerable.from(lines)
        .skip(1) // Cut out header.
        .select(function (cols) {
            return Enumerable.from(cols)
                .select(function (value, index) {
                    if (index === 0) {
                        value = moment(value).toDate(); // Treat first column as date.
                    }
                    else {
                        value = parseFloat(value); // Every other column is a number.
                    }
                    return value;
                })
                .toArray();
        })
        .toArray();

    return new dataForge.DataFrame({ columnNames: header, rows: rows });
};

// 
// Load CSV data from Yahoo.
//
var loadYahooData = function (code, options) {

    return new Promise(function (resolve, reject) {

        var yahooUrl = formatYahooUrl(code, options);
        var proxyUrl = 'http://cors.io/?u=' + encodeURIComponent(yahooUrl);
        $.ajax({
            type: 'GET',
            url: proxyUrl, 
            dataType: 'text',
            crossDomain: true,
            success: function (data) {
                resolve(parseYahooCsv(data));
            },
            error: function (err) {
                reject(err);
            },
        });
    });
};
