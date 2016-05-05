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


var paddingProgress = {top: 40, right: 40, bottom: 60, left:40};
var widthProgress = outerW * .55;
var heightProgress = outerH * .35;

var xScale = d3.scale.linear()
	.domain([2004, 2030])
	.range([0, widthProgress - paddingProgress.left - paddingProgress.right]);

var xAxis = d3.svg.axis()
				.scale(xScale)
			    .tickFormat(d3.format("d"));	

var svg = d3.select("#progress")
			.append("svg")
    		.attr("width", widthProgress + paddingProgress.left + paddingProgress.right)
    		.attr("height", heightProgress + paddingProgress.top + paddingProgress.bottom);

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


	data.forEach(function(d) {
	    d.date = +d.date;
	    d.y = +d.y;
	});


	console.log(data[0].year);

	var max = d3.max(data, function(d) { return d.y; });
	console.log(max);
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

	svg.append('path')
	  	.attr("transform","translate(" + paddingProgress.left + "," + paddingProgress.top + ")")
		.attr('d', line(data))
	  	.attr('stroke', "#00A3E0")
	  	.attr('stroke-width', 3)
	  	.attr('fill', 'none')
	  	.on('mouseover', mouseOver)
	  	.on('mouseout', mouseOut);


	//draws target line based off of starting value 
	var targetLine = [{
					    "y": start,
					    "year": 2004
					}, {
					    "y": 0,
					    "year": 2030
					}];
	svg.append('path')
	  	.attr("transform","translate(" + paddingProgress.left + "," + paddingProgress.top + ")")
		.attr('d', line(targetLine))
	  	.attr('stroke', 'grey')
	  	.attr('stroke-width', 2)
	  	.attr('fill', 'none');
})
