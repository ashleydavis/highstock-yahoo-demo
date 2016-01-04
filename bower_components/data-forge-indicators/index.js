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

        var indices = self.getIndex().toValues();
        var values = self.toValues();
        var outputIndices = [];
        var outputValues = [];
        for (var i = values.length-1; i > period; --i) {
            
            var sample = values[i];
            var index = indices[i];

            for (var j = 1; j < period; ++j) {
                sample += values[i-j];
            }

            sample /= period;

            outputIndices.push(index);
            outputValues.push(sample);            
        }

        return new dataForge.Column(
        	"SMA" + period,
        	outputValues.reverse(),
            new dataForge.Index(self.getIndex().getName(), outputIndices.reverse())
        );
    };
};