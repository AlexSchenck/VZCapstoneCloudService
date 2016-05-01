// draws the bullet charts

var name = "age";

var margin = {top: 5, right: 40, bottom: 5, left: 80};
var width = 300 - margin.left - margin.right;
var height = 30 + (((width + margin.left + margin.right) - 250) / 5) - margin.top - margin.bottom;

var chart = d3.bullet()
    .width(width)
    .height(height);

// draws bullet charts
d3.json("./Data/" + name + ".json", function(error, data) {
  if (error) throw error;

  	// // adds the title of the graph to the top 
  	// var titleGraph = d3.select("#age")
  	// 	.append("text")
   //      .style("font-size", "16px") 
   //      .text("Collisions by Age");	

    // establishes svg size
	var svg = d3.select("#" + name).selectAll("svg")
		.data(data)
	.enter().append("svg")
	  	.attr("class", "bullet")
	  	.attr("width", width + margin.left + margin.right)
	  	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	  	.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	  	.call(chart);

	// adds the title to the left side of each bullet chart
  	var titles = svg.append("g")
      	.style("text-anchor", "end")
      	.attr("transform", "translate(-10," + ((height / 2) + 7) + ")")
  	.append("text")
      	.attr("class", "title")
      	.text(function(d) { return d.title; });

    // domain that the bullet charts are all scaled to
    var x = d3.scale.linear()
    	.domain([0, 10])
    	.range([0, width]);

    // adds the scale at the bottom with ticks 
	d3.select("#" + name).append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	    .attr("class", "axis")
	    .call(d3.svg.axis()
	      .scale(x)
	      .orient("bottom")
	      .ticks(3)
	      .tickFormat(d3.format("s")));
});


// draws the spark lines
var widthOfSpark = 100;
var heightOfSpark = 40;

var containers = [];
var currentValue = [];
var title = d3.select("#" + name + "SparkTitle")
    .style("font-size", "8px") 
    .text("Last 5 Years");

d3.json("/Data/" + name + "Spark.json", function(error, data) {
    if (error) throw error;

    console.log(data.length);


    // coercing each value to an integer for the date
    // and an integer for the y value
    for (var i = 0; i < data.length; i++) {
        data[i].forEach(function(d) {
            d.date = (widthOfSpark / 8) * (+d.date - 2010);
            currentValue[i] = d.yValue;            
            d.yValue = 13 - +d.yValue;  
        });
    }

    // containers are made for the amount of spark lines desired
    // if the number of spark lines changes, then you have to add
    // and <div id="ageSpark(number)"></div> into #ageSparkId
    // otherwise there would be an existing div there
    for (var i = 1; i <= data.length; i++) {
        var svgContainer = d3.select("#" + name + "Spark" + i).append("svg")
            .attr("width", widthOfSpark)
            .attr("height",heightOfSpark);
        containers.push(svgContainer);
    }

    // functino for drawing a line. Linear is the style
    // of the line that's being drawn
    var lineFunction = d3.svg.line()
        .x(function(d) { return d.date; })
        .y(function(d) { return d.yValue; })
        .interpolate("linear");

    // for each container, add a spark line with 
    // the data associated with that index
    for (var i = 0; i < containers.length; i++) {
        var svgContainer = containers[i];
        //console.log(lineFunction(data[i]).split(","));
        var endingPoint = lineFunction(data[i]).split(",");        
        var xCircle = endingPoint[endingPoint.length - 2].split("L")[1];
        var yCircle = endingPoint[endingPoint.length - 1];

        svgContainer.append("path")
            .attr("d", lineFunction(data[i]))
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("fill", "none");

        svgContainer.append("circle")
            .attr("cx", xCircle)
            .attr("cy", yCircle)
            .attr("r", 2);

        svgContainer.append("text")
            .attr("x", 60)
            .attr("y", 12)
            .style("font-size", "10px") 
            .text(currentValue[i]);
    }
})