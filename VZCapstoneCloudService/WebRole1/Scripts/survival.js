var outerW = screen.width;
var outerH = screen.height;

d3.select("#topLeft").style("min-height", outerH * .47 * .35);
d3.select("#topRight").style("min-height", outerH * .47 * .35);
d3.select("#bottomLeft").style("min-height", outerH * .47 * .35);
d3.select("#bottomRight").style("min-height", outerH * .47 * .35);


d3.json("./Data/injuryRates.json", function(error, data) {
	console.log(error);

	var bike = data[0];
	var ped = data[1];

	var pedInjury = ped.pedInjury;
	var pedTotal = ped.pedParticipant;

	var bikeInjury = bike.bicInjury;
	var bikeTotal = bike.bicParticipant;

	var outerW = window.outerWidth * .42 * .49;
	var pedH = window.outerHeight * .43 * .477 * .35;

	var sizeOfImages = outerW / 30 * 3;
	var spaceBetween = outerW / 9.8;
	var heightOfImages = pedH / 4;

	//47 of 42 percent
	var pedImages = d3.select("#pedImages").append("svg")
					.attr("preserveAspectRatio", "xMinYMin meet")
		            .attr("viewBox", "0 0 " + outerW + " " + pedH)
		            .classed("svg-content", true); 


	var fatalSIRatio = Math.round(pedInjury / pedTotal * 10);

	d3.select("#pedSurvivalRatio").html(pedInjury + "/" + pedTotal);

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


	sizeOfImages = outerW / 30 * 3;
	spaceBetween = outerW / 10;

	fatalSIRatio = Math.round(bikeInjury / bikeTotal * 10);


	d3.select("#bikeSurvivalRatio").html(bikeInjury + "/" + bikeTotal);

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

});