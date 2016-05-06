require([
    "esri/map",
    "esri/layers/FeatureLayer"
], function (Map, FeatureLayer) {
    var map = new Map("mapid", {
        basemap: 'topo',
        sliderOrientation : "horizontal",
        center: [-122.3321, 47.6062],
        zoom: 13
    });

    var featureLayer = new FeatureLayer("http://gisrevprxy.seattle.gov/arcgis/rest/services/SDOT_EXT/DSG_datasharing/MapServer/51");

    map.addLayer(featureLayer);
});
