require([
    "esri/map",
    "esri/layers/FeatureLayer",
    "esri/InfoTemplate"
], function (Map, FeatureLayer, InfoTemplate) {
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
});

function getData(id) {
    var url = "http://gisrevprxy.seattle.gov/arcgis/rest/services/SDOT_EXT/DSG_datasharing/MapServer/51/query?where=&text=&objectIds=" + parseInt(id) + "&time=&geometry=&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=FATALITIES%2C+PEDCOUNT%2C+LIGHTCOND%2C+LOCATION%2C+INJURIES%2C+PEDCYLCOUNT%2C+PERSONCOUNT%2C+VEHCOUNT%2C+WEATHER&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=pjson";
    return getResults(url, function(resultData) {
        console.log("got here, data = " + JSON.stringify(resultData));
        $(".contentPane").html(JSON.stringify(resultData));
        return JSON.stringify(resultData);
    });
}

function getResults(url, callback) {
    var temp = $.getJSON(url + "&callback=?",function (data) {
        console.log(data);
        callback(data.features[0].attributes);
    });
}
