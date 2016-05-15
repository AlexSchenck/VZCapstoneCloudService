var mouseOver = function() {
	var curr = d3.select(this).attr("stroke", "blue");
	console.log(d3.select(this));
}

var mouseOut = function() {
	var curr = d3.select(this).attr("stroke", "#00A3E0");
	console.log(curr);
}

var outerW = window.outerWidth;
var outerH = window.outerHeight;


var paddingProgress = {top: 40, right: 40, bottom: 60, left:50};
var widthProgress = outerW * .55;
var heightProgress = outerH * .35;

var xScale = d3.scale.linear()
	.domain([2004, 2030])
	.range([0, widthProgress - paddingProgress.left - paddingProgress.right]);

var xAxis = d3.svg.axis()
				.scale(xScale)
			    .tickFormat(d3.format("d"));	

var svgWidth = widthProgress;
var svgHeight = heightProgress + paddingProgress.top;

var svg = d3.select("#progress")
			.append("svg")
    		.attr("preserveAspectRatio", "xMinYMin meet")
			.attr("viewBox", "0 0 " + svgWidth + " " + svgHeight)
			.classed("svg-content", true); 


svg.append("g") 	
	.attr("class","x axis")
	// adds x axis and moves to correct height
	.attr("transform","translate(" + paddingProgress.left + "," + (heightProgress - paddingProgress.bottom) + ")")
	.call(xAxis)
  .selectAll("text")
    .style("text-anchor", "middle");

var start = 0;
var yScale;

d3.json("./Data/progress.json", function(error, result) {
	console.log(error);
	data = result;
	start = data[0].y;


	// coerce the data given into integers
	data.forEach(function(d) {
	    d.date = +d.date;
	    d.y = +d.y;
	});

	var max = d3.max(data, function(d) { return d.y; });
	// console.log(max);
	yScale = d3.scale.linear()
		.domain([0, max + 5])
 		.range([heightProgress - paddingProgress.bottom - paddingProgress.top, -20]);

	// draws the y axis
	var yAxis = d3.svg.axis()
				   .scale(yScale)
				   .orient("left")
				   .ticks(4);
	
	// draws the y axis				 
	svg.append("g")
		.attr("class","y axis")
		.attr("transform","translate(" + paddingProgress.left + "," + paddingProgress.top + ")")
		.call(yAxis);

	// line function for drawing the actual line
	var line = d3.svg.line()
		.x(function(d) {
		    return xScale(d.year);
		})
		.y(function(d) {
		    return yScale(d.y);
		})
		.interpolate("linear");

	//draws target line based off of starting value in 2004
	var targetLine = [{ "y": start, "year": 2004 },{ "y": 0, "year": 2030 }];
	svg.append('path')
	  	.attr("transform","translate(" + paddingProgress.left + "," + paddingProgress.top + ")")
		.attr('d', line(targetLine))
	  	.attr('stroke', 'grey')
	  	.attr('stroke-width', 2)
	  	.attr('fill', 'none');

	// draws actual trend line of progress
	svg.append('path')
	  	.attr("transform","translate(" + paddingProgress.left + "," + paddingProgress.top + ")")
		.attr('d', line(data))
	  	.attr('stroke', "#00A3E0")
	  	.attr('stroke-width', 3)
	  	.attr('fill', 'none')
	  	.on('mouseover', mouseOver)
	  	.on('mouseout', mouseOut);


	// adding in titles and axis labels
	svg.append("text")
		.attr("transform","rotate(-90)")
		.attr("x", 0- svgHeight / 2 - 70)
		.attr("y", -2)
		.attr("dy","1em")
		.text("Number of Fatalities and Serious Injuries");

	svg.append("text")
	   .attr("class","xtext")
	   .attr("x", svgWidth / 2)
	   .attr("y", svgHeight - paddingProgress.bottom)
	   .attr("text-anchor","middle")
	   .text("Year");

	var visionZeroStartDate = [{"y":-20,"year":2015},{"y":20,"year":2015}]

	svg.append('path')
	  	.attr("transform","translate(" + paddingProgress.left + "," + paddingProgress.top + ")")
		.attr('d', line(visionZeroStartDate))
	  	.attr('stroke', "green")
	  	.attr('stroke-width', 3)
	  	.attr('fill', 'none')
	  	.on('mouseover', mouseOver)
	  	.on('mouseout', mouseOut);

})