var outerW = window.outerWidth;
var outerH = window.outerHeight;

var w = outerW / 3 - 60;       
var h = outerH / 3 - 90;     
var padding = {top: 40, right: 40, bottom: 60, left:40};
var dataset;

//Set up stack method
var stack = d3.layout.stack();

d3.json("./Data/stackedBar.json", function(error, result){
	console.log(error);
	dataset = result;

	//Data, stacked
	stack(dataset);

	var color_hash = {
	    0 : ["Ped","#00A3E0"],
		1 : ["Bicycle","#006b94"],
		2 : ["Vehicle","#87a96b"]

	};

	//Set up scales
	var xScale = d3.time.scale()
    	.domain([new Date(2004, 0, 1), new Date(2016, 0, 1)])
		.rangeRound([0, w-padding.left-padding.right]);

	var yScale = d3.scale.linear()
		.domain([0,				
			d3.max(dataset, function(d) {
				return d3.max(d, function(d) {
					return d.y0 + d.y;
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
				   .orient("left");

	//Easy colors accessible via a 10-step ordinal scale
	var colors = d3.scale.category10();

	//Create SVG element
	var svg = d3.select("#stackedBarChart")
				.append("svg")
	    		.attr("preserveAspectRatio", "xMinYMin meet")
				.attr("viewBox", "0 0 " + w + " " + h)
				.classed("svg-content", true); 

	// Add a group for each row of data
	var groups = svg.selectAll("g")
		.data(dataset)
		.enter()
		.append("g")
		.attr("class","rgroups")
		.attr("transform","translate("+ (padding.left + 15) + "," + (h - padding.bottom) +")")
		.style("fill", function(d, i) {
			return color_hash[dataset.indexOf(d)][1];
		});

	// Add a rect for each data value
	var rects = groups.selectAll("rect")
		.data(function(d) { return d; })
		.enter()
		.append("rect")
		.attr("width", 2)
		.style("fill-opacity",1e-6);


	rects.attr("x", function(d) {
			return xScale(new Date(d.year));
		})
		.attr("y", function(d) {
			return -(- yScale(d.y0) - yScale(d.y) + (h - padding.top - padding.bottom)*2);
		})
		.attr("height", function(d) {
			return -yScale(d.y) + (h - padding.top - padding.bottom);
		})
		// width of bars
		.attr("width", 10)
		.style("fill-opacity", 0.9)
		.on('mouseover', mouseOverStackedBar)
	  	.on('mouseout', mouseOutStackedBar);

	// svg.append("g")
	// 	.attr("class","x axis")
	// 	// adds x axis and moves to correct height
	// 	.attr("transform","translate(" + (padding.left + 5) + "," + (h - padding.bottom) + ")")
	// 	.call(xAxis)
	//   .selectAll("text")
	//     .attr("y", 0)
	//     .attr("x", 9)
	//     .attr("dy", ".35em")
	//     .attr("transform", "rotate(90)")
	//     .style("text-anchor", "start");

	svg.append("g") 	
			.attr("class","x axis")
			// adds x axis and moves to correct height
			.attr("transform","translate(" + (padding.left + 20) + "," + (h - padding.bottom) + ")")
			.call(xAxis)
	  	.selectAll("text")
	    	.style("text-anchor", "middle");

	svg.append("g")
		.attr("class","y axis")
		.attr("transform","translate(" + (padding.left + 15) + "," + padding.top + ")")
		.call(yAxis);

	// adding in titles and axis labels
	svg.append("text")
		.attr("transform","rotate(-90)")
		.attr("x", 0-h/2 - 40)
		.attr("y", -3)
		.attr("dy","1em")
		.text("Number of Collisions");

	svg.append("text")
	   .attr("class","xtext")
	   .attr("x",w/2)
	   .attr("y",h - 20)
	   .attr("text-anchor","middle")
	   .text("Year");
});


var sizeOfLegendIcons = 35;
var yPosition = 20;

var key = d3.select("#stackedKey").append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "-80 15 220 50")
        .classed("svg-content", true);

key.append("svg:image")
	.attr("xlink:href", "./Images/car-trip.svg")
	.attr("x", 0)
    .attr("y", yPosition)
    .attr("width", sizeOfLegendIcons)
    .attr("height", sizeOfLegendIcons); 

key.append("svg:image")
	.attr("xlink:href", "./Images/bicycle.svg")
	.attr("x", 45)
    .attr("y", yPosition)
    .attr("width", sizeOfLegendIcons)
    .attr("height", sizeOfLegendIcons); 

key.append("svg:image")
	.attr("xlink:href", "./Images/pedestrian-walking.svg")
	.attr("x", 80)
    .attr("y", yPosition)
    .attr("width", sizeOfLegendIcons)
    .attr("height", sizeOfLegendIcons - 5); 

// bar hovering stuff
var previousBarColor;

var mouseOverStackedBar = function() {
	// gets the color of the bar that was already there
	// because of the way stacked bars are set up
	previousBarColor = d3.select(this.parentNode).attr("style");
	var curr = d3.select(this).attr("fill", 'lightsteelblue');
	console.log(previousBarColor);
}

var mouseOutStackedBar = function() {
	var curr = d3.select(this).attr("fill", previousBarColor.substring(6));
	console.log(curr);
}