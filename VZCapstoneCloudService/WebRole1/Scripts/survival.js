var outerW = window.outerWidth * .42 * .49;
var pedH = window.outerHeight * .43 * .477 * .35;
console.log(pedH);

var sizeOfImages = outerW / 30 * 3;
var spaceBetween = outerW / 9.8;
var heightOfImages = pedH / 4;

//47 of 42 percent
var pedImages = d3.select("#pedImages").append("svg")
				.attr("preserveAspectRatio", "xMinYMin meet")
	            .attr("viewBox", "0 0 " + outerW + " " + pedH)
	            .classed("svg-content", true); 

var pedSurvive = 330;
var pedTotal = 500;

var fatalSIRatio = Math.round(pedSurvive / pedTotal * 10);

d3.select("#pedSurvivalRatio").html(pedSurvive + "/" + pedTotal);

for (var i = 0; i < fatalSIRatio; i++) {
	pedImages.append("svg:image")
		.attr("xlink:href", "./Images/pedestrian-black.svg")
		.attr("x", (spaceBetween * i))
	    .attr("y", heightOfImages)
	    .attr("width", sizeOfImages)
	    .attr("height", sizeOfImages); 
}

for (var i = fatalSIRatio; i < 10; i++) {
	pedImages.append("svg:image")
		.attr("xlink:href", "./Images/pedestrian-green.svg")
		.attr("x", (spaceBetween * i))
	    .attr("y", heightOfImages)
	    .attr("width", sizeOfImages)
	    .attr("height", sizeOfImages); 
}

var bikeSurvive = 408;
var bikeTotal = 1000;
sizeOfImages = outerW / 30 * 3;
spaceBetween = outerW / 10;

fatalSIRatio = Math.round(bikeSurvive / bikeTotal * 10);


d3.select("#bikeSurvivalRatio").html(bikeSurvive + "/" + bikeTotal);

var bikeImages = d3.select("#bikeImages").append("svg")
				.attr("preserveAspectRatio", "xMinYMin meet")
	            .attr("viewBox", "0 0 " + outerW + " " + pedH)
	            .classed("svg-content", true); 
	            
for (var i = 0; i < fatalSIRatio; i++) {
	bikeImages.append("svg:image")
		.attr("xlink:href", "./Images/cyclist-black.svg")
		.attr("x", (spaceBetween * i))
	    .attr("y", heightOfImages)
	    .attr("width", sizeOfImages)
	    .attr("height", sizeOfImages); 
}

for (var i = fatalSIRatio; i < 10; i++) {
	bikeImages.append("svg:image")
		.attr("xlink:href", "./Images/cyclist-green.svg")
		.attr("x", (spaceBetween * i))
	    .attr("y", heightOfImages)
	    .attr("width", sizeOfImages)
	    .attr("height", sizeOfImages); 
}