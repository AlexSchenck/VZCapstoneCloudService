var outerW = screen.width;
var outerH = screen.height;

// loads in the data for the pedestrian and cyclist
// serious injury and fatalities rates
// bikes are first, pedestrians are second
d3.json("./Data/injuryRates.json", function(error, data) {
	console.log(error);

	// manually loads in each data
	var bike = data[0];
	var ped = data[1];

	// gets the numerator and denominator for each of the ratios
	var bikeInjury = bike.bicInjury;
	var bikeTotal = bike.bicParticipant;
	var pedInjury = ped.pedInjury;
	var pedTotal = ped.pedParticipant;


	var pedW = window.outerWidth * .42 * .49;
	var pedH = window.outerHeight * .43 * .477 * .17;

	console.log(pedW + " " + pedH);

	var sizeOfImages = pedW / 30 * 3;
	var spaceBetween = pedW / 9.8;
	var heightOfImages = 0;

	//47 of 42 percent
	var pedImages = d3.select("#pedImages").append("svg")
					.attr("preserveAspectRatio", "xMinYMin meet")
		            .attr("viewBox", "0 0 " + pedW + " " + pedH)
		            .classed("svg-content", true); 

    // rounded value of the percentage for the number of images
    // to display, then displays the actual number
	var fatalSIRatio = Math.round(pedInjury / pedTotal * 10);
	d3.select("#pedSurvivalRatio").html(pedInjury + "/" + pedTotal);

	// black icons for fatalities and serious injuries
	for (var i = 0; i < fatalSIRatio; i++) {
		pedImages.append("svg:image")
			.attr("xlink:href", "./Images/pedestrian-black.svg")
			.attr("x", (spaceBetween * i))
		    .attr("y", heightOfImages)
		    .attr("width", sizeOfImages)
		    .attr("height", sizeOfImages); 
	}

	// green icons for no injuries 
	for (var i = fatalSIRatio; i < 10; i++) {
		pedImages.append("svg:image")
			.attr("xlink:href", "./Images/pedestrian-green.svg")
			.attr("x", (spaceBetween * i))
		    .attr("y", heightOfImages)
		    .attr("width", sizeOfImages)
		    .attr("height", sizeOfImages); 
	}

	// same for the cyclists
	sizeOfImages = pedW / 30 * 3;
	spaceBetween = pedW / 10;

	fatalSIRatio = Math.round(bikeInjury / bikeTotal * 10);
	d3.select("#bikeSurvivalRatio").html(bikeInjury + "/" + bikeTotal);

	var bikeImages = d3.select("#bikeImages").append("svg")
					.attr("preserveAspectRatio", "xMinYMin meet")
		            .attr("viewBox", "0 0 " + pedW + " " + pedH)
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