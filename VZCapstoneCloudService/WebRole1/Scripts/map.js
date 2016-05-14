require([
    "esri/map",
    "esri/layers/FeatureLayer",
    "esri/InfoTemplate",
    "esri/dijit/Search"
], function (Map, FeatureLayer, InfoTemplate, Search) {
    var map = new Map("mapid", {
        basemap: 'streets-navigation-vector',
        sliderOrientation : "horizontal",
        center: [-122.3321, 47.6062],
        zoom: 15
    });

    var featureLayer = new FeatureLayer("http://gisrevprxy.seattle.gov/arcgis/rest/services/SDOT_EXT/DSG_datasharing/MapServer/51", {
        infoTemplate: new InfoTemplate("Collision:", "${OBJECTID:getData}")
    });
    map.addLayer(featureLayer);

    var search = new Search({
        map: map
    }, "search");
    search.startup();
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
