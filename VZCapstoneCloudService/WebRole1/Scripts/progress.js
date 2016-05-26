function sleepFor( sleepDuration ){
    var now = new Date().getTime();
    while(new Date().getTime() < now + sleepDuration){ /* do nothing */ } 
}

var paddingProgress = {top: 40, right: 40, bottom: 60, left:50};
var widthProgress = outerW * .45;
var heightProgress = outerH * .26; // make this based off of the svg that it's in

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
	.attr("class","axis")
	// adds x axis and moves to correct height
	.attr("transform","translate(" + paddingProgress.left + "," 
		  + (heightProgress - paddingProgress.bottom) + ")")
	.call(xAxis)
  .selectAll("text")
    .style("text-anchor", "middle");

var start = 0;
var yScale;

// Define the div for the tooltip
var div = d3.select("body").append("div")	
    .attr("class", "tooltip")			
    .style("opacity", 0);

d3.json("./Data/progress.json", function(error, data) {
	console.log(error);

	// chill for a second until the progress data is loaded
	sleepFor(2000);

	// sets the running total of collisions in seattle. 
	// Does not pertain to progress bar	

	var runningTotalSoFar = data[data.length - 1].y;	
	d3.select("#runningTotal").html(runningTotalSoFar);

	start = data[0].y;

	for (var i = 0; i < data.length; i++) {
		// coerce the data given into integers
		data.forEach(function(d) {
		    d.date = +d.date;
		    d.y = +d.y;
		});
	}

	// find the max value and make the y axis tall enough
	// multiples of 100
	var max = d3.max(data, function(d) { return d.y; });
	max = (Math.round(max / 100)) * 100
	console.log(max);
	yScale = d3.scale.linear()
		.domain([0, max])
 		.range([heightProgress - paddingProgress.bottom - paddingProgress.top, -20]);

	// draws the y axis
	var yAxis = d3.svg.axis()
				   .scale(yScale)
				   .orient("left")
				   .ticks(4);
	
	// draws the y axis				 
	svg.append("g")
		.attr("class","y axis")
		.attr("transform","translate(" + paddingProgress.left + "," 
			  + paddingProgress.top + ")")
		.call(yAxis);

	// line function for drawing the actual line
	var line = d3.svg.line()
		.x(function(d) {
		    return xScale(d.year);
		})
		.y(function(d) {
		    return yScale(d.y);
		})
		.interpolate("monotone");


	// //draws target line based off of starting value in 2004
	var targetLine = [{ "y": start, "year": 2004 },{ "y": 0, "year": 2030 }];


	// draws the target line for vision zero for each year
	svg.append('path')
	  	.attr("transform","translate(" + paddingProgress.left + "," 
	  		  + paddingProgress.top + ")")
		.attr('d', line(targetLine))
	  	.attr('stroke', 'grey')
	  	.attr('stroke-width', 2.75)
	  	.attr('fill', 'none')
	  	.on("mouseover", function(d) {		
            div.transition()		
                .duration(200)		
                .style("opacity", 1);		
            div.html("Goal number of collisions");
        })					
        .on("mousemove", function(){
			return div.style("top", (event.pageY - 10) + "px")
					.style("left", (event.pageX + 10) + "px");})				
		.on("mouseout", function(d) {		
            div.transition()		
                .duration(500)		
                .style("opacity", 0);	
    	});

	// draws actual trend line of progress
	svg.append('path')
	  	.attr("transform","translate(" + paddingProgress.left + ","
	  		  + paddingProgress.top + ")")
		.attr('d', line(data))
	  	.attr('stroke', "#87a96b")
	  	.attr('stroke-width', 3)
	  	.attr('fill', 'none')
	  	.style('opacity', .9);

	drawDots(data);
	
	// adding in titles and axis labels
	svg.append("text")
		.attr("transform","rotate(-90)")
		.attr("x", 0 - svgHeight / 2 - 40)
		.attr("y", -2)
		.attr("dy","1em")
		.text("Fatalities or Serious Injuries");

	svg.append("text")
	   .attr("x", svgWidth / 2)
	   .attr("y", svgHeight - paddingProgress.bottom)
	   .attr("text-anchor","middle")
	   .text("Year");

	var visionZeroStartDate = [{"y":-20,"year":2015},{"y":20,"year":2015}]

	// draws the vision zero start date
	svg.append('path')
	  	.attr("transform","translate(" + paddingProgress.left + "," + paddingProgress.top + ")")
		.attr('d', line(visionZeroStartDate))
	  	.attr('stroke',  "#00A3E0")
	  	.attr('stroke-width', 3)
	  	.attr('fill', 'none')
	  	.on("mouseover", function(d) {		
            div.transition()		
                .duration(200)		
                .style("opacity", 1);		
            div.html("Vision Zero Seattle start date")
            	.style("left", xScale(2015))
            	.style("top", yScale(0));	
            })					
	  	.on("mousemove", function(){
			return div.style("top", (event.pageY - 10) + "px")
					.style("left", (event.pageX + 10) + "px");})			
		.on("mouseout", function(d) {		
            div.transition()		
                .duration(500)		
                .style("opacity", 0);	
    	});	
})

// draws the dots over the trend line so that
// you know where to hover for the tool tip
function drawDots(data) {
	var radiusOfDot = 4;
	// Add the dots
    svg.selectAll("dot")	
        .data(data)			
    .enter().append("circle")
    	.attr("transform","translate(" + paddingProgress.left + "," 
    		  + paddingProgress.top + ")")					
        .attr("r", radiusOfDot)		
        .attr("cx", function(d) { return xScale(d.year); })		 
        .attr("cy", function(d) { return yScale(d.y); })
        .attr("fill", "#63666A")
        .attr("fill-opacity", .8)
        .on("mouseover", function(d) {		
        	var duration = 200; 
            div.transition()		
                .duration(duration)		
                .style("opacity", 1);		
            div.html("" + d.y + " fatalities and serious injuries in " + d.year)
            	.style("left", xScale(d.year))
            	.style("top", yScale(d.y));	

            var circleEnlarge = d3.select(this)
		            .transition()
		            .duration(duration)
		            .attr("r", radiusOfDot + 2);
            })	
		.on("mousemove", function(){
			return div.style("top", (event.pageY - 10) + "px")
					.style("left", (event.pageX + 10) + "px");})				
        .on("mouseout", function(d) {
        	var duration = 500;		
            div.transition()		
                .duration(duration)		
                .style("opacity", 0);	

    		var circleShrink = d3.select(this)
    			.transition()
    			.duration(duration)
    			.attr("r", radiusOfDot);
		});	
}