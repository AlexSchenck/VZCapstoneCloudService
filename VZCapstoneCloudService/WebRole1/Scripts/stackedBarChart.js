var padding = {top: 40, right: 40, bottom: 60, left:40};

var w = outerW / 3 - 60;       
var h = outerH / 3 - 95;     
var previousBarColor;

//Set up stack method
var stack = d3.layout.stack();

// Define the div for the tooltip
var divStack = d3.select("body").append("div")	
    .attr("class", "tooltip")	
    .style("opacity", 0);

drawStackedBars();
drawStackedKey();

function drawStackedBars() {
	d3.json("./Data/stackedBar.json", function(error, dataset) {
		console.log(error);

		//Data, stacked
		stack(dataset);

		// these must be lower case letters
		var color_hash = {
		    0 : ["pedestrians","#00a3e0"],
			1 : ["cyclists","#006b94"],
			2 : ["drivers","#87a96b"]

		};

		//Set up scales
		var xScale = d3.time.scale()
	    	.domain([new Date(2004, 0, 1), new Date(2016, 0, 1)])
			.rangeRound([0, w-padding.left-padding.right]);
		var yScale = d3.scale.linear()
			.domain([0,				
				d3.max(dataset, function(d) {
					return d3.max(d, function(d) {
						return Math.round((d.y0 + d.y) / 100) * 100;
					});
				})
			])
			.range([h-padding.bottom-padding.top,0]);

		// draws the x axis
		var xAxis = d3.svg.axis()
						.scale(xScale)
	    				.tickFormat(d3.time.format("'%y"));
		// draws the y axis
		var yAxis = d3.svg.axis()
					   .scale(yScale)
					   .orient("left")
					   .ticks(5);

		//Easy colors accessible via a 10-step ordinal scale
		var colors = d3.scale.category10();

		//Create SVG element
		var svg = d3.select("#stackedBarChart")
					.append("svg")
		    		.attr("preserveAspectRatio", "xMinYMin meet")
					.attr("viewBox", "0 20 " + (w + 10) + " " + (h))
					.classed("svg-content", true); 

		// Add a group for each row of data
		var groups = svg.selectAll("g")
			.data(dataset)
			.enter()
			.append("g")
			.attr("class","rgroups")
			.attr("transform","translate("+ (padding.left + 15) + "," 
				  + (h - padding.bottom) +")")
			.style("fill", function(d, i) {
				return color_hash[dataset.indexOf(d)][1];
			});

		// Add a rect for each data value
		var rects = groups.selectAll("rect")
			.data(function(d) { return d; })
			.enter()
			.append("rect");


		rects.attr("x", function(d) {
				return xScale(new Date(d.year));
			})
			.attr("y", function(d) {
				return -(- yScale(d.y0) - yScale(d.y) + (h - padding.top - padding.bottom) * 2);
			})
			.attr("height", function(d) {
				return -yScale(d.y) + (h - padding.top - padding.bottom);
			})
			// width of bars
			.attr("width", w / 13 / 2.5)
			.style("fill-opacity", 1)
			.on("mouseover", function(d) {	
				// gets the color of the bar that was already there
				// because of the way stacked bars are set up
				previousBarColor = d3.select(this.parentNode).attr("style");
				var curr = d3.select(this).attr("fill", '#63666A');
				// alert(typeof(previousBarColor));
				var textTip = "people"; // default if can't be found 
				var convertedRGB;
				if (previousBarColor.indexOf("#") < 0) {
					// gets individual components of the rbg
					var hexComponents = previousBarColor.split(', ');
					var first = hexComponents[0].split('(')[1];
					var middle = hexComponents[1];
					var last = hexComponents[2].split(')')[0];

					convertedRGB = rgbToHex(parseInt(first), parseInt(middle), parseInt(last));

				} else {
		        	previousBarColor = previousBarColor.substring(6, 13);
		        	convertedRGB = previousBarColor;
		        }

	            divStack.transition()		
	                .duration(200)		
	                .style("opacity", 1);

	            // checks to see which title to display
	            if (convertedRGB == color_hash[2][1]) {
	            	textTip = color_hash[2][0];
	            } else if (convertedRGB == color_hash[1][1]) {
	            	textTip = color_hash[1][0];
	            } else if (convertedRGB == color_hash[0][1]) {
	            	textTip = color_hash[0][0];
	            }
	        

	            divStack.html(d.y + " " + textTip)
		            .style("left", xScale(new Date(d.year, 0, 1)))
		            .style("top", yScale(d.y));	
				
	            })					
			.on("mousemove", function(){
				return divStack.style("top", (event.pageY - 10) + "px")
							.style("left", (event.pageX + 10) + "px");})				
	        .on("mouseout", function(d) {		
	            divStack.transition()		
	                .duration(500)		
	                .style("opacity", 0);	
	            // resets to the previous color of the bar that was hovered over
				var curr = d3.select(this).attr("fill", previousBarColor);
	    	});			

	    // draws the xaxis
		svg.append("g") 	
				.attr("class","x axis")
				// adds x axis and moves to correct height - might need to get rid of -2
				.attr("transform","translate(" + (padding.left + 15 + w / 13 / 4 - 2) 
					  + "," + (h - padding.bottom) + ")")
				.call(xAxis)
		  	.selectAll("text")
		    	.style("text-anchor", "middle");

		// draws the y axis
		svg.append("g")
			.attr("class","y axis")
			.attr("transform","translate(" + (padding.left + 15) + "," + padding.top + ")")
			.call(yAxis);

		// adding in titles and axis labels
		svg.append("text")
			.attr("transform","rotate(-90)")
			.attr("x", - h / 2 - 70)
			.attr("y", -3)
			.attr("dy","1em")
			.text("Fatalities or Serious Injuries");

		svg.append("text")
		   .attr("x", w / 2)
		   .attr("y", h - 20)
		   .attr("text-anchor","middle")
		   .text("Year");
	});
}

function drawStackedKey() {
	var sizeOfLegendIcons = 55;
	var yPosition = 15;

	var key = d3.select("#stackedKey").append("svg")
	        .attr("preserveAspectRatio", "xMinYMin meet")
	        .attr("viewBox", "-80 15 220 50")
	        .classed("svg-content", true);

	key.append("svg:image")
		.attr("xlink:href", "./Images/vehicle-green.svg")
		.attr("x", 0)
	    .attr("y", yPosition - 3)
	    .attr("width", sizeOfLegendIcons)
	    .attr("height", sizeOfLegendIcons)
	    .on("mouseover", function(d) {		
	        divStack.transition()		
	            .duration(200)		
	            .style("opacity", 1);		
	        divStack.html("Fatalities and serious injuries of vehicular drivers and passengers.")
	        .style("left", 0)
	        .style("top", yPosition);	
	    })					
		.on("mousemove", function(){
			return divStack.style("top", (event.pageY - 10) + "px")
						.style("left", (event.pageX + 10) + "px");})	
	    .on("mouseout", function(d) {		
	        divStack.transition()		
	            .duration(500)		
	            .style("opacity", 0);
		});	 

	key.append("svg:image")
		.attr("xlink:href", "./Images/cyclist-turquoise.svg")
		.attr("x", 50)
	    .attr("y", yPosition - 1)
	    .attr("width", sizeOfLegendIcons)
	    .attr("height", sizeOfLegendIcons)
	    .on("mouseover", function(d) {		
	        divStack.transition()		
	            .duration(200)		
	            .style("opacity", 1);		
	        divStack.html("Fatalities and serious injuries of cyclist drivers and passengers.")
	        .style("left", 0)
	        .style("top", yPosition);	
	    })					
		.on("mousemove", function(){
			return divStack.style("top", (event.pageY - 10) + "px")
						.style("left", (event.pageX + 10) + "px");})	
	    .on("mouseout", function(d) {		
	        divStack.transition()		
	            .duration(500)		
	            .style("opacity", 0);
		});	 

	key.append("svg:image")
		.attr("xlink:href", "./Images/pedestrian-blue.svg")
		.attr("x", 90)
	    .attr("y", yPosition)
	    .attr("width", sizeOfLegendIcons)
	    .attr("height", sizeOfLegendIcons - 5)
	    .on("mouseover", function(d) {		
	        divStack.transition()		
	            .duration(200)		
	            .style("opacity", 1);		
	        divStack.html("Fatalities and serious injuries of pedestrians.")
	        .style("left", 0)
	        .style("top", yPosition);	
	    })					
		.on("mousemove", function(){
			return divStack.style("top", (event.pageY - 10) + "px")
						.style("left", (event.pageX + 10) + "px");})	
	    .on("mouseout", function(d) {		
	        divStack.transition()		
	            .duration(500)		
	            .style("opacity", 0);
		});	  
} 
// functions for conversion of rbg and hexes
// due to ie compability issues
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
