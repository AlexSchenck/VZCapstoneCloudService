var outerW = window.outerWidth;
var outerH = window.outerHeight;
d3.select(".progressSection").attr("width", "700px").attr("height", "300px");

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
			.attr("viewBox", "0 0 " + svgWidth + " " + svgHeight);
			// .classed("svg-content", true); 


svg.append("g") 	
	.attr("class","x axis")
	// adds x axis and moves to correct height
	.attr("transform","translate(" + paddingProgress.left + "," + (heightProgress - paddingProgress.bottom) + ")")
	.call(xAxis)
  .selectAll("text")
    .style("text-anchor", "middle");

var start = 0;
var yScale;

var runningTotalSoFar = 0; 

// Define the div for the tooltip
var div = d3.select("body").append("div")	
    .attr("class", "tooltip")			
    .style("opacity", 0);

d3.json("./Data/progress.json", function(error, data) {
	console.log(error);

	// sets the running total of collisions in seattle. 
	// Does not pertain to progress bar	
	var temp = data[0];
	console.log(temp[temp.length - 1].y);
	runningTotalSoFar = temp[temp.length - 1].y;
	d3.select("#runningTotal").html(runningTotalSoFar);

	start = data[0][0].y;

	for (var i = 0; i < data.length; i++) {
		// coerce the data given into integers
		data[i].forEach(function(d) {
		    d.date = +d.date;
		    d.y = +d.y;
		});
	}

	var max = d3.max(data[1], function(d) { return d.y; });
	max = (Math.round(max / 100)) * 100
	// console.log(max);
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
		.interpolate("monotone");

	//draws target line based off of starting value in 2004
	var targetLine = [{ "y": start, "year": 2004 },{ "y": 0, "year": 2030 }];
	svg.append('path')
	  	.attr("transform","translate(" + paddingProgress.left + "," + paddingProgress.top + ")")
		.attr('d', line(targetLine))
	  	.attr('stroke', 'grey')
	  	.attr('stroke-width', 2)
	  	.attr('fill', 'none')
	  	.on("mouseover", function(d) {		
            div.transition()		
                .duration(200)		
                .style("opacity", 1);		
            div.html("Goal number of collisions");
        })					
        .on("mousemove", function(){
			return div.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})				
		.on("mouseout", function(d) {		
            div.transition()		
                .duration(500)		
                .style("opacity", 0);	
    	});

	var colors = ["#006b94", "#87a96b"];


	drawCollisionDots(data[0]);
	drawFatalDots(data[1]);


	for (var i = 0; i < data.length; i++) {
		// draws actual trend line of progress
		svg.append('path')
		  	.attr("transform","translate(" + paddingProgress.left + "," + paddingProgress.top + ")")
			.attr('d', line(data[i]))
		  	.attr('stroke', colors[i])
		  	.attr('stroke-width', 1.5)
		  	.attr('fill', 'none')
		  	.style('opacity', .9);
	}

	// adding in titles and axis labels
	svg.append("text")
		.attr("transform","rotate(-90)")
		.attr("x", 0- svgHeight / 2)
		.attr("y", -2)
		.attr("dy","1em")
		.text("Frequency");

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
	  	.attr('stroke',  "#00A3E0")
	  	.attr('stroke-width', 3)
	  	.attr('fill', 'none')
	  	.on("mouseover", function(d) {		
            div.transition()		
                .duration(200)		
                .style("opacity", 1);		
            div.html("Vision Zero Seattle Start Date")
            	.style("left", xScale(2015))
            	.style("top", yScale(0));	
            })					
	  	.on("mousemove", function(){
			// console.log(xScale(2006) + " " + event.pageX + " " + event.pageY);
			return div.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})				
        .on("mouseout", function(d) {		
            div.transition()		
                .duration(500)		
                .style("opacity", 0);	
    	});	
})

function drawFatalDots(data) {
	// Add the dots
    svg.selectAll("dot")	
        .data(data)			
    .enter().append("circle")
    	.attr("transform","translate(" + paddingProgress.left + "," + paddingProgress.top + ")")					
        .attr("r", 3)		
        .attr("cx", function(d) { return xScale(d.year); })		 
        .attr("cy", function(d) { return yScale(d.y); })
        .attr("fill", "#63666A")
        .on("mouseover", function(d) {		
        	var duration = 200; 
            div.transition()		
                .duration(duration)		
                .style("opacity", 1);		
            div.html("" + d.y + " fatalities and serious injuries in " + d.year)
            	.style("left", xScale(d.year))
            	.style("top", yScale(d.y));	
            var circleEnlarge = d3.select(this).transition().duration(duration).attr("r", 5);
            })	
		.on("mousemove", function(){
			// console.log(xScale(2006) + " " + event.pageX + " " + event.pageY);
			return div.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})				
        .on("mouseout", function(d) {
        	var duration = 500;		
            div.transition()		
                .duration(duration)		
                .style("opacity", 0);	
    		var circleShrink = d3.select(this).transition().duration(duration).attr("r", 3);
		});	
}

function drawCollisionDots(data) {
	// Add the dots
    svg.selectAll("dot")	
        .data(data)			
    .enter().append("circle")
    	.attr("transform","translate(" + paddingProgress.left + "," + paddingProgress.top + ")")					
        .attr("r", 3)		
        .attr("cx", function(d) { return xScale(d.year); })		 
        .attr("cy", function(d) { return yScale(d.y); })
        .attr("fill", "#63666A")
        .on("mouseover", function(d) {		
        	var duration = 200; 
            div.transition()		
                .duration(duration)		
                .style("opacity", 1);		
            div.html("" + d.y + " collisions in " + d.year)
            	.style("left", xScale(d.year))
            	.style("top", yScale(d.y));	
            var circleEnlarge = d3.select(this).transition().duration(duration).attr("r", 5);
            })	
		.on("mousemove", function(){
			// console.log(xScale(2006) + " " + event.pageX + " " + event.pageY);
			return div.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})				
        .on("mouseout", function(d) {
        	var duration = 500;		
            div.transition()		
                .duration(duration)		
                .style("opacity", 0);	
    		var circleShrink = d3.select(this).transition().duration(duration).attr("r", 3);
		});	
}

















// var tooltip = d3.select('#top')            // NEW 
//   .append('div')                             // NEW
//   .attr('class', 'tooltip');                 // NEW

// tooltip.append('div')                        // NEW
//   .attr('class', 'label');                   // NEW

// tooltip.append('div')                        // NEW
//   .attr('class', 'count');                   // NEW

// tooltip.append('div')                        // NEW
//   .attr('class', 'percent');                 // NEW


// var mouseOver = function() {
// 	var curr = d3.select(this).attr("stroke", "blue");
// 	console.log(d3.select(this));
// }

// var mouseOut = function() {
// 	var curr = d3.select(this).attr("stroke", "#00A3E0");
// 	console.log(curr);
// }


// // Detect if the browser is IE or not.
// // If it is not IE, we assume that the browser is NS.
// var IE = document.all?true:false

// // If NS -- that is, !IE -- then set up for mouse capture
// if (!IE) document.captureEvents(Event.MOUSEMOVE)

// // Set-up to use getMouseXY function onMouseMove
// document.onmousemove = getMouseXY;

// // Temporary variables to hold mouse x-y pos.s
// var tempX = 0
// var tempY = 0

// // Main function to retrieve mouse x-y pos.s

// function getMouseXY(e) {
//   if (IE) { // grab the x-y pos.s if browser is IE
//     tempX = event.clientX + document.body.scrollLeft
//     tempY = event.clientY + document.body.scrollTop
//   } else {  // grab the x-y pos.s if browser is NS
//     tempX = e.pageX
//     tempY = e.pageY
//   }  
//   // catch possible negative values in NS4
//   if (tempX < 0){tempX = 0}
//   if (tempY < 0){tempY = 0}  
//   return true
// }






