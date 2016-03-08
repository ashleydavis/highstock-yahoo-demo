'use strict';

module.exports = function (dataForge) {

	var assert = require('chai').assert;
	var Enumerable = require('linq');

	/**
	 * Convert the data-frame to Highstock date+OHLC format.
	 */
	dataForge.DataFrame.prototype.toHighstockOHLC = function () {

        var self = this;
		assert(self.getColumnNames().length >= 5); // Expect columns for date + OHLC.

        return Enumerable.from(self.toValues())
            .select(function (entry) {
            	assert.instanceOf(entry[0], Date, "Expected column 0 to contain dates!");
            	assert.isNumber(entry[1], "Expected column 1 to contain numbers!");
            	assert.isNumber(entry[2], "Expected column 2 to contain numbers!");
            	assert.isNumber(entry[3], "Expected column 3 to contain numbers!");
            	assert.isNumber(entry[4], "Expected column 4 to contain numbers!");

                return [
                    entry[0].getTime(),
                    entry[1],
                    entry[2],
                    entry[3],
                    entry[4],
                ];
            })
            .toArray();
    };

    /**
	 * Convert the data-frame to Highstock date+value format.
     */
    dataForge.DataFrame.prototype.toHighstock = function () {

        var self = this;

        return Enumerable.from(self.getIndex().toValues())
            .zip(self.toValues(), function (index, values) {
                assert.instanceOf(index, Date, "Expected index to contain dates!");
                return [index.getTime()].concat(values);
            })
            .toArray();
    };

    /**
     * Convert the column to Highstock date+value format.
     */
    dataForge.Series.prototype.toHighstock = function () {

        var self = this;

        return Enumerable.from(self.getIndex().toValues())
            .zip(self.toValues(), function (index, value) {
                assert.instanceOf(index, Date, "Expected column index to contain dates!");
                assert.isNumber(value, "Expected column values to contain numbers!");

                return [
                    index.getTime(),
                    value,
                ];
            })
            .toArray();
    };
};