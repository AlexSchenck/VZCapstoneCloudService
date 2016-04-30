var outerW = window.outerWidth;
var outerH = window.outerHeight;

var w = outerW / 3 - 60;       
var width = w;                 
var h = outerH / 3 - 90;     
var height = h;                   
var padding = {top: 40, right: 40, bottom: 60, left:40};
var dataset;

//Set up stack method
var stack = d3.layout.stack();

d3.json("./Data/mperday.json", function(error, result){
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
    	.domain([new Date(2010, 0, 1), new Date(2015, 0, 1)])
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
				   .scale(xScale);

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
				.attr("width", w)
				.attr("height", h);

	// Add a group for each row of data
	var groups = svg.selectAll("g")
		.data(dataset)
		.enter()
		.append("g")
		.attr("class","rgroups")
		.attr("transform","translate("+ padding.left + "," + (h - padding.bottom) +")")
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


	rects.transition()
	     .duration(function(d,i){
	    	 return 300;
	     })
	     .ease("linear")
	    .attr("x", function(d) {
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
		.style("fill-opacity", 0.9);

	svg.append("g")
		.attr("class","x axis")
		// adds x axis and moves to correct height
		.attr("transform","translate(" + 44 + "," + (h - padding.bottom) + ")")
		.call(xAxis)
	  .selectAll("text")
	    .attr("y", 0)
	    .attr("x", 9)
	    .attr("dy", ".35em")
	    .attr("transform", "rotate(90)")
	    .style("text-anchor", "start");

	svg.append("g")
		.attr("class","y axis")
		.attr("transform","translate(" + padding.left + "," + padding.top + ")")
		.call(yAxis);

	var legend = svg.append("g")
		.attr("class","legend")
		.attr("x", w - padding.right - 65)
		.attr("y", 25)
		.attr("height", 80)
		.attr("width",80);

	legend.selectAll("g").data(dataset)
	  .enter()
	  .append('g')
	  .each(function(d,i){
	  	var g = d3.select(this);
	  	g.append("rect")
	  		.attr("x", w - padding.right - 30)
	  		.attr("y", i*25 + 3)
	  		.attr("width", 7)
	  		.attr("height",7)
	  		.style("fill",color_hash[String(i)][1]);

	  	g.append("text")
	  	 .attr("x", w - padding.right - 15)
	  	 .attr("y", i*25 + 12)
	  	 .attr("height",30)
	  	 .attr("width",100)
	  	 .style("fill",color_hash[String(i)][1])
	  	 .text(color_hash[String(i)][0]);
	});


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
	   .attr("y",h - 5)
	   .attr("text-anchor","middle")
	   .text("Year");

	// svg.append("text")
	//     .attr("class","title")
	//     .attr("x", (w /3 ))             
	//     .attr("y", 20)
	//     .attr("text-anchor", "middle")  
	//     .style("font-size", "16px") 
	//     .text("Serious Injury and Fatal Collisions");

});