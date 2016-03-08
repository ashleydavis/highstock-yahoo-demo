'use strict';

module.exports = function (dataForge) {

	var assert = require('chai').assert;
    var Enumerable = require('linq');

	/*
	 * Generate a simple moving average from the column.
	 *
	 * @param {int} period - The time period of the moving average.
	 */
    dataForge.Series.prototype.sma = function (period) {

    	assert.isNumber(period, "Expected 'period' parameter to 'sma' to be a number that specifies the time period of the moving average.");

        var self = this;
        return self.rollingWindow(period, function (window) {
                return [window.getIndex().last(), window.average()];
            });
    };
};