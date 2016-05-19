var outerW = window.outerWidth * .42 * .49;
var pedH = window.outerHeight * .43 * .477 * .35;
console.log(pedH);

var sizeOfImages = outerW / 30 * 2.3;
var spaceBetween = outerW / 9.8;
var heightOfImages = pedH / 2.5;

//47 of 42 percent
var pedImages = d3.select("#pedImages").append("svg")
				.attr("preserveAspectRatio", "xMinYMin meet")
	            .attr("viewBox", "0 0 " + outerW + " " + pedH)
	            .classed("svg-content", true); 

var pedSurvive = 9;

for (var i = 0; i < pedSurvive; i++) {
	pedImages.append("svg:image")
		.attr("xlink:href", "./Images/pedestrian-walking-green.svg")
		.attr("x", (spaceBetween * i))
	    .attr("y", heightOfImages)
	    .attr("width", sizeOfImages)
	    .attr("height", sizeOfImages); 
}

for (var i = pedSurvive; i < 10; i++) {
	pedImages.append("svg:image")
		.attr("xlink:href", "./Images/pedestrian-walking-black.svg")
		.attr("x", (spaceBetween * i))
	    .attr("y", heightOfImages)
	    .attr("width", sizeOfImages)
	    .attr("height", sizeOfImages); 
}

var bikeSurvive = 7;
sizeOfImages = outerW / 30 * 2;
spaceBetween = outerW / 9.8;

var bikeImages = d3.select("#bikeImages").append("svg")
				.attr("preserveAspectRatio", "xMinYMin meet")
	            .attr("viewBox", "0 0 " + outerW + " " + pedH)
	            .classed("svg-content", true); 
	            
for (var i = 0; i < bikeSurvive; i++) {
	bikeImages.append("svg:image")
		.attr("xlink:href", "./Images/bicycle-rider-green.svg")
		.attr("x", (spaceBetween * i))
	    .attr("y", heightOfImages)
	    .attr("width", sizeOfImages)
	    .attr("height", sizeOfImages); 
}

for (var i = bikeSurvive; i < 10; i++) {
	bikeImages.append("svg:image")
		.attr("xlink:href", "./Images/bicycle-rider.svg")
		.attr("x", (spaceBetween * i))
	    .attr("y", heightOfImages)
	    .attr("width", sizeOfImages)
	    .attr("height", sizeOfImages); 
}