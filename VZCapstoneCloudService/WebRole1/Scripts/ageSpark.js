var marginAgeSpark = {top: 5, right: 40, bottom: 5, left: 20};
var svgContainer1 = d3.select("#ageSpark1").append("svg")
        .attr("width", 80)
        .attr("height",30);
var svgContainer2 = d3.select("#ageSpark2").append("svg")
        .attr("width", 80)
        .attr("height", 30);
var svgContainer3 = d3.select("#ageSpark3").append("svg")
        .attr("width", 80)
        .attr("height", 30);

d3.json("./Data/ageSpark.json", function(error, data) {
    if (error) throw error;

    console.log(data);
    for (var i = 0; i < data.length; i++) {
        data[i].forEach(function(d) {
            d.date = 10 * (+d.date - 2010);
            d.yValue = +d.yValue;
        });
    }

    var lineFunction = d3.svg.line()
        .x(function(d) { return d.date; })
        .y(function(d) { return d.yValue; })
        .interpolate("linear");

    console.log(lineFunction);

    svgContainer1.append("path")
        .attr("d", lineFunction(data[0]))
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("fill", "none");

    svgContainer2.append("path")
        .attr("d", lineFunction(data[1]))
        .attr("stroke", "black")
        .attr("stroke-width", 1)    
        .attr("fill", "none");

    svgContainer3.append("path")
        .attr("d", lineFunction(data[2]))
        .attr("stroke", "black")
        .attr("stroke-width", 1)    
        .attr("fill", "none");
})
// var marginAgeSpark = {top: 5, right: 40, bottom: 5, left: 20};
// var widthOfSpark = 80;
// var heightOfSpark = 50;

// var svgContainer1 = d3.select("#ageSpark1").append("svg")
//         .attr("width", widthOfSpark)
//         .attr("height",heightOfSpark);
// var svgContainer2 = d3.select("#ageSpark2").append("svg")
//         .attr("width", widthOfSpark)
//         .attr("height",heightOfSpark);
// var svgContainer3 = d3.select("#ageSpark3").append("svg")
//         .attr("width", widthOfSpark)
//         .attr("height",heightOfSpark);

// d3.json("/Data/ageSpark.json", function(error, data) {
//     if (error) throw error;

//     console.log(data);
//     // coercing each value to an integer for the date
//     // and an integer for the y value
//     for (var i = 0; i < data.length; i++) {
//         data[i].forEach(function(d) {
//             d.date = 10 * (+d.date - 2010);
//             d.yValue = +d.yValue;
//         });
//     }

//     var lineFunction = d3.svg.line()
//         .x(function(d) { return d.date; })
//         .y(function(d) { return d.yValue; })
//         .interpolate("linear");


//     svgContainer1.append("path")
//         .attr("d", lineFunction(data[0]))
//         .attr("stroke", "black")
//         .attr("stroke-width", 1)
//         .attr("fill", "none");

//     svgContainer2.append("path")
//         .attr("d", lineFunction(data[1]))
//         .attr("stroke", "black")
//         .attr("stroke-width", 1)    
//         .attr("fill", "none");

//     svgContainer3.append("path")
//         .attr("d", lineFunction(data[2]))
//         .attr("stroke", "black")
//         .attr("stroke-width", 1)    
//         .attr("fill", "none");
// })