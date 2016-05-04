var outerW = window.outerWidth;
var outerH = window.outerHeight;

var padding = {top: 40, right: 40, bottom: 60, left:40};
var width = outerW * .2;
var height = outerH * .25 - 20;

var svg = d3.select("#currentFatal")
			.append("svg")
    		.attr("width", width + padding.left + padding.right)
    		.attr("height", height + padding.top + padding.bottom);
svg.append("text")
    .attr("x", 95)
    .attr("y", 20)
    .attr("dy", ".95em")
    .text("17");


var goal = d3.select("#goal")
			.append("svg")
    		.attr("width", width + padding.left + padding.right)
    		.attr("height", height + padding.top + padding.bottom);
goal.append("text")
    .attr("x", 105)
    .attr("y", 20)
    .attr("dy", ".95em")
    .text("0");

d3.select("#ped")
            .append("svg")
            .attr("width", width + padding.left + padding.right)
            .attr("height", height + padding.top + padding.bottom)
            .append("text")
    .attr("x", 60)
    .attr("y", 20)
    .attr("dy", ".95em")
    .text("9 / 10");

d3.select("#cycle")
            .append("svg")
            .attr("width", width + padding.left + padding.right)
            .attr("height", height + padding.top + padding.bottom)
            .append("text")
    .attr("x", 60)
    .attr("y", 20)
    .attr("dy", ".95em")
    .text("7 / 10");
