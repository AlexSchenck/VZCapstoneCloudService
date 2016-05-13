// draws the bullet charts

var name = "age";

var margin = {top: 5, right: 40, bottom: 5, left: 80};
var width = 300 - margin.left - margin.right;
var height = 30 + (((width + margin.left + margin.right) - 250) / 5) - margin.top - margin.bottom;

var chart = d3.bullet()
    .width(width)
    .height(height);

// draws the spark lines
// var widthOfSpark = 20;
// var heightOfSpark = 40;
// var sparkData;
// d3.json("./Data/" + name + "Spark.json", function(error, data) {
//     if (error) throw error;
//     sparkData = data;

//     var startDate = data[0][0].date;
//     console.log(typeof(data[0][0].date));

//     // coercing each value to an integer for the date
//     // and an integer for the y value
//     for (var i = 0; i < sparkData.length; i++) {
//         sparkData[i].forEach(function(d) {
//             d.date = (widthOfSpark / 8) * (+d.date - startDate);
//             currentValue[i] = d.yValue;            
//             d.yValue = (heightOfSpark / 2) - (+d.yValue);  
//         });
//     }

// }



// draws bullet charts
d3.json("./Data/" + name + ".json", function(error, data) {
    if (error) throw error;

    console.log(data.length);

    // draws all of the bullet charts manually so that they are able to scale
    for (var i = 1; i <= data.length; i++) {
        //establishes svg size
    	var svg = d3.select("#" + name + i).selectAll("svg")
    		.data([data[i - 1]])
    	.enter().append("svg")
    	  	.attr("class", "bullet")
    	  	// .attr("width", width + margin.left + margin.right)
        //     .attr("height", height + margin.top + margin.bottom);
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 " + 300    + " " + 40)
            .classed("svg-content", true); 
    	
    	// adds the title to the left side of each bullet chart
      	var titles = svg.append("g")
          	.style("text-anchor", "start")
          	.attr("transform", "translate(15," + ((height / 2) + 7) + ")")
      	.append("text")
          	.attr("class", "title")
            .style("font-size", 14)
          	.text(function(d) { return d.title; });

        svg.append("g")
            .attr("transform", "translate(" + (margin.left + margin.right - 10) + "," + margin.top + ")")
            .call(chart);
    }

    // domain that the bullet charts are all scaled to
    var x = d3.scale.linear()
    	.domain([0, 10])
    	.range([0, width]);

    // adds the scale at the bottom with ticks 
	var key = d3.select("#" + name + "Key").append("svg")
	    // .attr("width", width + margin.left + margin.right)
	    // .attr("height", height + margin.top + margin.bottom)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "-" + (margin.left + margin.right - 10) + " 0 300 300")
        .classed("svg-content", true)
	  .append("g")
	    .attr("class", "axis")
	    .call(d3.svg.axis()
	      .scale(x)
	      .orient("bottom")
	      .ticks(3)
	      .tickFormat(d3.format("s")));

    var heightOfKey = 10;
    var shift = 40;
    // var key = d3.select("#" + name + "Bullets").append("svg")
    //     // .attr("width", width + margin.left + margin.right)
    //     // .attr("height", height + margin.top + margin.bottom);
    //     .attr("preserveAspectRatio", "xMinYMin meet")
    //     .attr("viewBox", "0 0 " + 300 + " " + 300)
    //     .classed("svg-content", true);

    var fontSizeOfKey = 10;

    key.append("text")
        .attr("transform", "translate(" + 0 + "," + (margin.top * 5) + ")")
        .attr("y", heightOfKey)
        .style("font-size", fontSizeOfKey)
        .text("2015");

    key.append("rect")
        .attr("transform", "translate(" + (margin.right - 10) + "," + (margin.top * 5 + 1) + ")")
        .attr("width", 50)
        .attr("height", heightOfKey)
        .style("fill", "#00A3E0")
        .attr("opacity", 0.7);

    key.append("text")
        .attr("transform", "translate(" + (margin.right + 75) + "," + (margin.top * 5) + ")")
        .attr("y", heightOfKey)
        .style("font-size", fontSizeOfKey)
        .text("2014");

    key.append("line")
        .attr("transform", "translate(" + (margin.right + 105) + "," + (margin.top * 5) + ")")
        .attr("x1", 0)
        .attr("y1", -5)
        .attr("x2", 0)
        .attr("y2", 15)
        .attr("stroke-width", 2)
        .attr("stroke", "black");
});


// draws the spark lines
var widthOfSpark = 20;
var heightOfSpark = 40;

var containers = [];
var currentValue = [];
// var title = d3.select("#" + name + "SparkTitle")
//     .style("font-size", "8px") 
//     .text("Last 5 Years");

d3.json("./Data/" + name + "Spark.json", function(error, data) {
    if (error) throw error;

    console.log(data.length);


    var startDate = data[0][0].date;
    console.log(typeof(data[0][0].date));

    // coercing each value to an integer for the date
    // and an integer for the y value
    for (var i = 0; i < data.length; i++) {
        data[i].forEach(function(d) {
            d.date = (widthOfSpark / 8) * (+d.date - startDate);
            currentValue[i] = d.yValue;            
            d.yValue = (heightOfSpark / 2) - (+d.yValue);  
        });
    }

    // containers are made for the amount of spark lines desired
    // if the number of spark lines changes, then you have to add
    // and <div id="ageSpark(number)"></div> into #ageSparkId
    // otherwise there would be an existing div there
    for (var i = 1; i <= data.length; i++) {
        var svgContainer = d3.select("#" + name + "Spark" + i).append("svg")
            // .attr("height", heightOfSpark)
            // .attr("width", widthOfSpark)
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 " + 100 + " " + 50)
            .classed("svg-content", true); 
        containers.push(svgContainer);
    }

    // function for drawing a line. Linear is the style
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
            .attr("y", heightOfSpark / 2)
            .style("font-size", "10px") 
            .text(currentValue[i]);
    }

    // var years = d3.scale.linear()
    //     .domain([2012, 2016])
    //     .range([0, width]);

    // var svgContainer = d3.select("#ageSparkKey").append("svg")
    //         .attr("width", (widthOfSpark - 10))
    //         .attr("height", heightOfSpark)
    //   .append("g")
    //     // .attr("transform", "translate(" + 0 + "," + 75 + ")")
    //     .attr("class", "axis")
    //     .call(d3.svg.axis()
    //       .scale(years)
    //       .orient("bottom")
    //       .ticks(3)
    //       .tickFormat(d3.format("d")));
})
