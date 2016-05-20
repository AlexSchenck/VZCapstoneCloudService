var outerW = window.outerWidth;
var outerH = window.outerHeight;

var padding = {top: 40, right: 40, bottom: 60, left:40};
var dataset;


var w = outerW / 3 - 60;       
var h = outerH / 3 - 60;     
var previousBarColor;
console.log(w / 13 / 2.5);

//Set up stack method
var stack = d3.layout.stack();
// Define the div for the tooltip

var divStack = d3.select("body").append("div")	
    .attr("class", "tooltip")	
    .style("opacity", 0);

d3.json("./Data/stackedBar.json", function(error, result){
	console.log(error);
	dataset = result;

	//Data, stacked
	stack(dataset);

	var color_hash = {
	    0 : ["Pedestrian","#00A3E0"],
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
		.attr("transform","translate("+ (padding.left + 15) + "," + (h - padding.bottom) +")")
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
			return -(- yScale(d.y0) - yScale(d.y) + (h - padding.top - padding.bottom)*2);
		})
		.attr("height", function(d) {
			return -yScale(d.y) + (h - padding.top - padding.bottom);
		})
		// width of bars
		.attr("width", w / 13 / 2.5)
		.style("fill-opacity", 1)
		.on("mouseover", function(d) {		
            divStack.transition()		
                .duration(200)		
                .style("opacity", 1);		
            divStack.html(d.y + " people")
            .style("left", xScale(new Date(d.year, 0, 1)))
            .style("top", yScale(d.y));	
           

			// gets the color of the bar that was already there
			// because of the way stacked bars are set up
			previousBarColor = d3.select(this.parentNode).attr("style");
			var curr = d3.select(this).attr("fill", '#63666A');
			console.log(previousBarColor);
			
            })					
		.on("mousemove", function(){
			console.log(xScale(2006) + " " + event.pageX + " " + event.pageY);
			return divStack.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})				

        .on("mouseout", function(d) {		
            divStack.transition()		
                .duration(500)		
                .style("opacity", 0);	
            // resets to the previous color of the bar that was hovered over
			var curr = d3.select(this).attr("fill", previousBarColor.substring(6));
    	});			

	   //  .on('mouseover', mouseOverStackedBar)
	  	// .on('mouseout', mouseOutStackedBar);

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
			// adds x axis and moves to correct height - might need to get rid of -2
			.attr("transform","translate(" + (padding.left + 15 + w / 13 / 4 - 2) + "," + (h - padding.bottom) + ")")
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
		.attr("x", 0- h / 2 - 50)
		.attr("y", -3)
		.attr("dy","1em")
		.text("Number of Individuals");

	svg.append("text")
	   .attr("class","xtext")
	   .attr("x",w/2)
	   .attr("y",h - 20)
	   .attr("text-anchor","middle")
	   .text("Year");
});


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
        divStack.html("Collisions resulting in fatalities and serious injuries involving vehicles only.")
        .style("left", 0)
        .style("top", yPosition);	
    })					
	.on("mousemove", function(){
		return divStack.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
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
        divStack.html("Collisions resulting in fatalities and serious injuries involving cyclists.")
        .style("left", 0)
        .style("top", yPosition);	
    })					
	.on("mousemove", function(){
		return divStack.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
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
        divStack.html("Collisions resulting in fatalities and serious injuries involving pedestrians.")
        .style("left", 0)
        .style("top", yPosition);	
    })					
	.on("mousemove", function(){
		return divStack.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
    .on("mouseout", function(d) {		
        divStack.transition()		
            .duration(500)		
            .style("opacity", 0);
	});	  