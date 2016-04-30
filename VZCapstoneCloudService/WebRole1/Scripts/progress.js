var outerW = window.outerWidth;
var outerH = window.outerHeight;

var widthProgress = outerW * .65;
var heightProgress = outerH * .25 - 20;
var paddingProgress = {top: 40, right: 40, bottom: 60, left:40};

var xScale = d3.time.scale()
	.domain([2004, 2030])
	.rangeRound([0, widthProgress - paddingProgress.left - paddingProgress.right]);

var xAxis = d3.svg.axis()
			   .scale(xScale);	

var svg = d3.select("#progress")
			.append("svg")
			.attr("width", widthProgress)
			.attr("height", heightProgress);

svg.append("g")
	.attr("class","x axis")
	// adds x axis and moves to correct height
	.attr("transform","translate(" + paddingProgress.left + "," + (heightProgress - paddingProgress.bottom) + ")")
	.call(xAxis)
  .selectAll("text")
    .style("text-anchor", "middle");

var start = 0;

d3.json("./Data/progress.json", function(error, result){
	console.log(error);
	data = result;
	start = data[0].y;

	// for (var i = 0; i < data.length; i++) {
 //        data.forEach(function(d) {
 //            d.date = 10 * (+d.date - 2010);
 //            d.sale = +d.sale;
 //        });
 //    }

	var max = d3.max(data, function(d) { return d.y; });
	console.log(max);
	var yScale = d3.scale.linear()
		.domain([0, max + 5])
 		.range([heightProgress - paddingProgress.bottom - paddingProgress.top, 0]);

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
		  	console.log(d.year);
		    return xScale(d.year);
		})
		.y(function(d) {
		  	console.log(typeof d.y);
		    return yScale(d.y);
		});

	svg.append('path')
	  	.attr("transform","translate(" + paddingProgress.left + "," + paddingProgress.top + ")")
		.attr('d', line(data))
	  	.attr('stroke', 'blue')
	  	.attr('stroke-width', 1)
	  	.attr('fill', 'none');
})