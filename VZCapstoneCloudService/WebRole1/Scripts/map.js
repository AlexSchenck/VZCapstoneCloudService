require([
    "esri/map",
    "esri/layers/FeatureLayer",
    "esri/InfoTemplate",
    "esri/dijit/Search",
    "esri/geometry/Extent", 
    "esri/SpatialReference",
    "esri/geometry/Point",
    "esri/tasks/QueryTask",
    "esri/tasks/query"
], function (Map, FeatureLayer, InfoTemplate, Search, Extent, SpatialReference, Point, QueryTask, Query) {
    var map = new Map("mapid", {
        basemap: 'gray',
        sliderOrientation : "horizontal",
        center: [-122.3321, 47.6062],
        zoom: 16,
        minZoom: 12
    });

    //Dom manipulation
    $("select").horizontalSelector();

    var classname = document.getElementsByClassName("filterButton");
    for (var i = 0; i < classname.length; i++) {
        classname[i].addEventListener('click', updateClass, false);
    }

    //Feature Later    
    var featureLayer = new FeatureLayer("http://gisrevprxy.seattle.gov/arcgis/rest/services/SDOT_EXT/DSG_datasharing/MapServer/51", {
        infoTemplate: new InfoTemplate("Collision:", "${OBJECTID:getData}")
    });

    featureLayer.setDefinitionExpression("INCDATE > date'1-1-2015' AND INCDATE < date'1-1-2016'");
    map.addLayer(featureLayer);

    //Query
    var queryTask = new QueryTask("http://gisrevprxy.seattle.gov/arcgis/rest/services/SDOT_EXT/DSG_datasharing/MapServer/51");
    
    var query = new Query();
    query.returnGeometry = true;
    query.outFields = ["INCDATE", "VEHCOUNT", "PEDCOUNT", "PEDCYLCOUNT", "SERIOUSINJURIES", "FATALITIES"];

    function executeQueryTask(population) {
      //set query based on what user typed in for population;
      var year = $('#yearSelector').find(":selected").text();
      // var 
      query.where = "POP04 > " + population;

      //execute query
      queryTask.execute(query,showResults);
    }

    //Search Bar
    var search = new Search({
        enableInfoWindow: false,
        map: map
    }, "search");
    search.startup();

    //Zoom handling
    var mapExtentChange = map.on("extent-change", changeHandler);

    function changeHandler(evt){
        if(map.getZoom() < 16) {
            $('#zoom').css("display", "block");
        } else {
            $('#zoom').css("display", "none");
        }
    }

    //Centering
    dojo.connect(map, "onClick", center);

    function center(evt) {
        map.centerAndZoom(new Point(evt.mapPoint.x, evt.mapPoint.y - 200, evt.mapPoint.spatialReference),16);
    }
});

function updateClass() {
    // $(this).not(this).removeClass('click');
    $(this).toggleClass('activeButton');
    //run query
}

$("table").on("change", function() {
    console.log("blah", $("#yearSelector").val());
});

function getData(id) {
    var url = "http://gisrevprxy.seattle.gov/arcgis/rest/services/SDOT_EXT/DSG_datasharing/MapServer/51/query?where=&text=&objectIds=" + parseInt(id) + "&time=&geometry=&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=" 
        + "LOCATION%2C+INCDATE%2C+COLLISIONTYPE%2C+FATALITIES%2C+INJURIES%2C+SERIOUSINJURIES%2C+PERSONCOUNT%2C+PEDCOUNT%2C+PEDCYLCOUNT%2C+VEHCOUNT%2C+LIGHTCOND%2C+WEATHER" + 
        "&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=pjson";
    getResults(url, function(resultData) {
        var html = ""
        for (var key in resultData) {
            html += "<strong>" + capitalizeFirstLetter(key.toLowerCase()) + "</strong>: ";
            if (typeof resultData[key] == "string") {
                html += toTitleCase(resultData[key]) + "<br />";
            } else if (key === "INCDATE") {
                var dateString = new Date(resultData[key]).toString();
                html += dateString.split("GMT")[0] + "<br />";
            } else {
                html += resultData[key] + "<br />";
            }
        }
        $(".contentPane").html(html);
    });
}

function capitalizeFirstLetter(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function toTitleCase(str) {
    return str.replace(/\w\S*/g, 
        function(text) {
            return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
        }
    );
}

function getResults(url, callback) {
    var temp = $.getJSON(url + "&callback=?",function (data) {
        callback(data.features[0].attributes);
    });
}