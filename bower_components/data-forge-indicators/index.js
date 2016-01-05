'use strict';

module.exports = function (dataForge) {

	var assert = require('chai').assert;
    var Enumerable = require('linq');

	/*
	 * Generate a simple moving average from the column.
	 *
	 * @param {int} period - The time period of the moving average.
	 */
    dataForge.BaseColumn.prototype.sma = function (period) {

    	assert.isNumber(period, "Expected 'period' parameter to 'sma' to be a number that specifies the time period of the moving average.");

        var self = this;
        return self.rollingWindow(period, function (indices, values) {
                return [indices[indices.length-1], Enumerable.from(values).sum() / period];
            });
    };
};