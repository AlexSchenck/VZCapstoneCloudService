var sizeOfImages = 20;
var spaceBetween = 30;
var heightOfImages = 20;
var pedImages = d3.select("#pedImages").append("svg");

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
sizeOfImages = 20;
spaceBetween = 30;

var bikeImages = d3.select("#bikeImages").append("svg");
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