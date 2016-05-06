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
        infoTemplate: new InfoTemplate("Collision:", "${*}") // "${*}")
    });

    map.addLayer(featureLayer);
});
