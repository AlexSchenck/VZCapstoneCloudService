var names = ["age", "contributingFactors"];
var titles = ["Age (Years)", "Contributing Factor"];
var headers = ["Drivers", "Frequency"];
var labels = ["drivers", "collisions involving fatatilies and serious injuries"];

// alert(10vw + " " );

var margin = {top: 5, right: 40, bottom: 5, left: 80};
var widthFull = 300;
var width = widthFull - margin.left - margin.right;
var height = 30 + (((width + margin.left + margin.right) - 250) / 5) - margin.top - margin.bottom;

var chart = d3.bullet()
    .width(width)
    .height(height);

drawBulletKey();

for (var i = 0; i < names.length; i++) {
	drawBulletCharts(names[i], labels[i]);
	drawTitles(names[i], titles[i], headers[i]);
	drawSparkLines(names[i]);
}

// draws the title of the spark lines 
function drawTitles(name, title, header) {
    d3.select("#" + name + "BulletTitle").append("svg")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "-5 -5 100 10")
            .classed("svg-content", true)
        .append("text")
	        .style("font-size", 4)
	        .style("font-family", "Open Sans Condensed")
	        .text(title);

    d3.select("#" + name + "BulletTitle").append("svg")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "-40 -5 100 10")
            .classed("svg-content", true)
        .append("text")
	        .style("font-size", 4)
	        .style("font-family", "Open Sans Condensed")
	        .text(header);

    d3.select("#" + name + "SparkTitle").append("svg")
	        .attr("preserveAspectRatio", "xMinYMin meet")
	        .attr("viewBox", "0 -12 100 20")
	        .classed("svg-content", true)
	    .append("text")
		    .style("font-size", 11)
		    .style("font-family", "Open Sans Condensed")
		    .text("Past 5 years");
}


// draws the key for the bullet charts at the
// top right hand corner of the section
function drawBulletKey() {
    var heightOfKey = 10;
    var fontSizeOfKey = 16;

    var key = d3.selectAll(".bulletKey").append("svg")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "-20 15 190 50")
            .classed("svg-content", true);

    key.append("rect")
        .attr("transform", "translate(" + (margin.right - 20) + "," + (margin.top * 5 - 2) + ")")
        .attr("width", 30)
        .attr("height", heightOfKey + 3)
        .style("fill", "#00A3E0");

    key.append("text")
        .attr("transform", "translate(" + (margin.right + 17) + "," + (margin.top * 5) + ")")
        .attr("y", heightOfKey)
        .style("font-size", fontSizeOfKey)
        .style("font-weight", "normal")
        .text("2015");

    key.append("line")
        .attr("transform", "translate(" + (margin.right + 66) + "," + (margin.top * 5 + 2) + ")")
        .attr("x1", 0)
        .attr("y1", -10)
        .attr("x2", 0)
        .attr("y2", 15)
        .attr("stroke-width", 3)
        .attr("stroke", "black");

    key.append("text")
        .attr("transform", "translate(" + (margin.right + 72) + "," + (margin.top * 5) + ")")
        .attr("y", heightOfKey)
        .style("font-size", fontSizeOfKey)
        .style("font-weight", "normal")
        .text("2014");
}

function drawBulletCharts(name, label) {
	// var name = "age";
	d3.json("./Data/" + name + ".json", function(error, data) {
		if (error) throw error;

	    // draws all of the bullet charts manually so that they are able to scale
	    for (var i = 1; i <= data.length; i++) {
	        //establishes svg size
	    	var svg = d3.select("#" + name + i).selectAll("svg")
	    		.data([data[i - 1]])
	    	.enter().append("svg")
	    	  	.attr("class", "bullet")
	            .attr("preserveAspectRatio", "xMinYMin meet")
	            .attr("viewBox", "0 0 " + (width + margin.left + margin.right + 5) + " " + (height + 10))
	            .classed("svg-content", true); 
	    	
	    	// adds the title to the left side of each bullet chart
	      	svg.append("g")
	          	// .attr("width", "50")
	          	.style("text-anchor", "start")
	          	.attr("transform", "translate(15," + ((height / 2) + 7) + ")")
	      	.append("text")
	          	.attr("class", "title")
	            .style("font-size", 14)
	          	.text(function(d) {
	          		var title = d.title; 
	          		if(title.length > 14) {
	          			title = title.substring(0, 13) + "..."
	          		}
	          		return title; 
	          	})
	          	.on("mouseover", function(d) {		
		            div.transition()		
		                .duration(200)		
		                .style("opacity", 1);		
		            div.html(d.title);
		        })					
		        .on("mousemove", function(){
					return div.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})				
				.on("mouseout", function(d) {		
		            div.transition()		
		                .duration(500)		
		                .style("opacity", 0);	
		    	});


		        svg.append("g")
		            .attr("transform", "translate(" + (margin.left + margin.right) + "," + margin.top + ")")
		            .call(chart);

		        var currentYear = 2015;

		        // creates tooltip for each of the blue lines
		        d3.selectAll("#" + name + "Bullets .bullet .measure.s0")
			        .on("mouseover", function(d) {	
			        	var node = d3.select(this).attr("width");
			        	var rectWidth = d3.selectAll(".bullet .range.s0").attr("width");
			            div.transition()		
			                .duration(200)		
			                .style("opacity", 1);		
			            div.html(parseInt(node / rectWidth * parseInt(data[0].ranges[1])) + " " + label + " in " + currentYear);
			        })					
			        .on("mousemove", function(){
						return div.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})				
					.on("mouseout", function(d) {		
			            div.transition()		
			                .duration(500)		
			                .style("opacity", 0);	
			    	});

			    var lastYear = currentYear - 1;

				// creates tooltip for each of the black markers for previous year
			    d3.selectAll("#" + name + "Bullets .bullet .marker")
			        .on("mouseover", function(d) {	
			        	var node = d3.select(this).attr("x1");
			        	var rectWidth = d3.selectAll(".bullet .range.s0").attr("width");
			            div.transition()		
			                .duration(200)		
			                .style("opacity", 1);		
			            div.html(parseInt(node / rectWidth * parseInt(data[0].ranges[1])) + " " + label + " in " + lastYear);
			        })					
			        .on("mousemove", function(){
						return div.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})				
					.on("mouseout", function(d) {		
			            div.transition()		
			                .duration(500)		
			                .style("opacity", 0);	
			    	});
		    }	

	    // get the range of the bullets for the scale at the bottom
	    var range = data[0].ranges[1];

	    // domain that the bullet charts are all scaled to
	    var bulletScale = d3.scale.linear()
	        .domain([0, range])
	        .range([0, width]);


	    // adds the scale at the bottom with ticks 
	    d3.select("#" + name + "Axis").append("svg")
	            .attr("preserveAspectRatio", "xMinYMin meet")
	            .attr("viewBox", "0 0 " + (width + margin.left + margin.right + 5) + " " + (height + 10))
	            .classed("svg-content", true)
	        .append("g")
	        	.attr("transform", "translate(" + (margin.left + margin.right) + "," + 0 + ")")
	            .attr("class", "axis")
	            .call(d3.svg.axis()
	               .scale(bulletScale)
	               .orient("bottom")
	               .ticks(4)
	               .tickFormat(d3.format("s")));
	});
}

function drawSparkLines(name) {
	// draws the spark lines
	var widthOfSpark = 20;
	var heightOfSpark = 40;

	var containers = [];
	var currentValue = [];

	d3.json("./Data/" + name + "Spark.json", function(error, data) {
	    if (error) throw error;

	    var startDate = data[0][0].date;


	    // coercing each value to an integer for the date
	    // and an integer for the y value
	    for (var i = 0; i < data.length; i++) {
	        var maxHeight = 30;
	        var max = d3.max(data[i], function(d) { return d.yValue; });
	        var shift = Math.round(max / 30);
	        if (shift == 0) {
	            shift = 1;
	        }
	        data[i].forEach(function(d) {
	            d.date = (widthOfSpark/ 3 * 2) * (+d.date - startDate);
	            currentValue[i] = d.yValue;  
	            d.yValue = (maxHeight * shift - +d.yValue) / 2;   
	            if (d.yValue < 2) {
	                d.yValue = 2;
	            } else if (d.yValue > maxHeight) {
	                d.yValue = maxHeight;
	            }
	        });
	    }

	    // containers are made for the amount of spark lines desired
	    // if the number of spark lines changes, then you have to add
	    // and <div id="ageSpark(number)"></div> into #ageSparkId
	    // otherwise there would be an existing div there
	    for (var i = 1; i <= data.length; i++) {
	        var svgContainer = d3.select("#" + name + "Spark" + i).append("svg")
	            .attr("preserveAspectRatio", "xMinYMin meet")
	            .attr("viewBox", "0 0 95 30")
	            .classed("svg-content", true)
	             .on("mouseover", function(d) {	
		            div.transition()		
		                .duration(200)		
		                .style("opacity", 1);		
		            div.html("Trend line of the last 5 years");
		        })					
		        .on("mousemove", function(){
					return div.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})				
				.on("mouseout", function(d) {		
		            div.transition()		
		                .duration(500)		
		                .style("opacity", 0);	
		    	});
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
	            .style("font-size", 10) 
	            .text(currentValue[i]);
	    }

	    var years = d3.time.scale()
	        .domain([new Date(startDate, 0, 1), new Date(startDate + 4, 0, 1)])
	        .rangeRound([0, width / 2]);

	    var svgContainer = d3.select("#" + name + "SparkKey").append("svg")
	            .attr("preserveAspectRatio", "xMinYMin meet")
	            .attr("viewBox", "-5 0 200 30")
	            .classed("svg-content", true)
	        .append("g")
	        	.attr("transform", "translate(" + 0 + ", -5" + ")")
	            .attr("class", "axis")
	        .call(d3.svg.axis()
	            .scale(years)
	            .orient("bottom")
	            .ticks(2)
	            .tickFormat(d3.time.format("'%y")));
	})
}