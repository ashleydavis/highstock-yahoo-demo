# highstock-yahoo-demo

A demo of [Highstock](http://www.highcharts.com/stock/demo) using [Data-Forge](https://github.com/Real-Serious-Games/data-forge-js) with financial data loaded from Yahoo.

[Click here for live demo](http://codecapers.github.io/highstock-yahoo-demo/).

README still under construction, please check back soon for more info.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Introduction](#introduction)
- [Highstock](#highstock)
- [Data-Forge](#data-forge)
- [Pulling data from Yahoo](#pulling-data-from-yahoo)
- [Simple moving average](#simple-moving-average)
- [jQuery to handle UI events](#jquery-to-handle-ui-events)
- [Resize to fit](#resize-to-fit)
- [Publishing the live demo](#publishing-the-live-demo)
- [Conclusion](#conclusion)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Introduction

This post explains my demo of Highstock. It is aimed at developers who are interested in processing and visualisation of financial data. I'll assume that you have a basic knowledge of [JavasScript](https://en.wikipedia.org/wiki/JavaScript) and [jQuery](https://en.wikipedia.org/wiki/JQuery). Most of the useful information you'll find by studying the code, here I'll just give a brief overview of the technology involved.

This example demonstrates the following:

- [Asynchronous](https://en.wikipedia.org/wiki/Ajax_(programming)) data loading into a Highstock [candlestick chart](https://en.wikipedia.org/wiki/Candlestick_chart).
- A [simple moving average (SMA)](https://en.wikipedia.org/wiki/Moving_average#Simple_moving_average) is generated and displayed over the [OHLC data](https://en.wikipedia.org/wiki/Open-high-low-close_chart).
- [Trading volume](https://en.wikipedia.org/wiki/Volume_(finance)) is displayed below the main stock price chart.
- Variables can be edited (company, SMA period, time interval) and the chart is regenerated.
- The time interval (daily, weekly or monthly) is changeable (this demonstrates aggregation of the data by time). 
- The chart resizes to fit the web page.   

## Highstock

Highstock is a pure Javascript, client-side stock charting toolkit that is free for non-commercial use. The company behind Highstock, [Highsoft](https://en.wikipedia.org/wiki/Highsoft), also have a general charting toolkit called [Highcharts](https://en.wikipedia.org/wiki/Highcharts). Highsoft have many commercial customers and their libraries are stable and mature.

For this example code I started with the [Highstock async loading demo](http://www.highcharts.com/stock/demo/lazy-loading). I also incorporated elements of [candlestick and volume demo](http://www.highcharts.com/stock/demo/candlestick-and-volume).

There are [many other demos](http://www.highcharts.com/stock/demo) of Highstock that will give a good idea of its full capabilities. Highstock also has good [docs](http://www.highcharts.com/docs) and an [API](http://api.highcharts.com/highstock) reference. You need to read this to fully understand your way around Highstock.

The basic setup for Highstock is very easy. Use jQuery to get the element that will contain the chart and call the *highcharts* function. Pass in the options that define the chart.

	var chartOptions = {
		// ... options that defined the chart ...
	};
	$('#container').highcharts('StockChart', chartOptions);  

The options are where we can set the chart type, axis options and initial data.

Multiple data series can be stacked on top of each other. This is how the SMA is overloaid on the OHLC data. Multiple Y axis' can be stacked separately on top of each other, as is done in this example with OHLC/SMA above the volume chart.

In this example I use the chart types [*candlestick*](https://en.wikipedia.org/wiki/Candlestick_chart), *line* and *column*. There are [many more chart types available](http://api.highcharts.com/highstock#plotOptions). The [OHLC chart type](http://www.highcharts.com/stock/demo/ohlc) is another you might be interested in that is relevant to financial data.

This example loads data asynchronously when the user zooms in on the data. Initially we must load data for the entire time frame so that Highstock has something to show in its [navigator](http://api.highcharts.com/highstock#navigator) which allows the user to see the entire time series and then zoom in on parts of it. Because it would be very expensive to download daily financial data for all time for any company we only download monthly data at the start. Then when the user zooms in for a closer look we download weekly or daily data as appropriate. We can download async data for Highcharts by handling the [`afterSetExtremes`](http://api.highcharts.com/highstock#xAxis.events.afterSetExtremes) event. You can also see a fairly simple example of this in the [Highstock async loading demo](http://www.highcharts.com/stock/demo/lazy-loading). 

	var chartOptions = {
		
		// ...

		xAxis: {
			events: {
				afterSetExtremes: function (event) {
					var fromDate = new Date(event.min);
					var toDate = new Date(event.max);

					// ... load new data in the requested date range ...
				},
			},

			// ...
		},

		// ...
	};

## Pulling data from Yahoo

Yahoo financial API is great. A ready source of share market data. It's a little difficult to get started though because there is no documentation besides user contributed content.

- Show the link and parameters.
- Show how to use the data-forge plugin.
- Pulls data in CSV format. Show the format.
- Getting around CORs, setting your own proxy, make your own rest api.

## Data-Forge

- What it is? What is it good for?
- Talk about how it is in development. Prototype stage only.
- How to get it?
- How does it help here?
-- Yahoo plugin for pulling financial data (brief).
-- Plugin for SMA and other financial functions.
 

## Simple moving average

- Talk about the maths to generate this.
- Talk about the data forge plugin to do this.
- Talk about abit about the need for this.

## jQuery to handle UI events

- Responding to input change and button click to update the chart.

## Resize to fit

- Window resize and updating the graph.
- This is suprisingly difficult to figure out and doesn't feel like an elegant solution.

## Publishing the live demo

- The process of publishing the live demo to github pages.

## Conclusion

- Summarize what you learnt?
- Refer back to Data-Forge and the Investment Tracker.
- Please let me know if this is useful and you want to see more examples/posts like this.  

## Resources


- Highstock demos: [http://www.highcharts.com/stock/demo](http://www.highcharts.com/stock/demo)
- Highstock docs: [http://www.highcharts.com/docs](http://www.highcharts.com/docs)
- Highstock API reference: [http://api.highcharts.com/highstock](http://api.highcharts.com/highstock)



