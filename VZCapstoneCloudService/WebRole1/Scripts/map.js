var modeFilter = 0;
var injuryFilter = 0;
var yearFilter = new Date().getFullYear() - 1;
var descriptions = [
    {key:"INCDATE", value:"Incident Date"}, 
    {key:"COLLISIONTYPE", value:"Collision Type"}, 
    {key:"SERIOUSINJURIES", value:"Serious Injuries"},
    {key:"PERSONCOUNT", value:"Total People Involved"}, 
    {key:"PEDCOUNT", value:"Pedestrian Count"}, 
    {key:"PEDCYLCOUNT", value:"Cyclist Count"},
    {key:"VEHCOUNT", value:"Vehicle Count"}, 
    {key:"LIGHTCOND", value:"Light Condition"}
];

require([
    "esri/map",
    "esri/layers/FeatureLayer",
    "esri/InfoTemplate",
    "esri/dijit/Search",
    "esri/geometry/Extent", 
    "esri/SpatialReference",
    "esri/geometry/Point",
    "esri/tasks/QueryTask",
    "esri/tasks/query",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/Color",
    "esri/renderers/SimpleRenderer",

], function (Map, FeatureLayer, InfoTemplate, Search, Extent, SpatialReference, Point, QueryTask, Query, SimpleMarkerSymbol, Color, SimpleRenderer) {
    var map = new Map("mapid", {
        basemap: 'gray',
        sliderOrientation : "horizontal",
        center: [-122.3321, 47.6062],
        zoom: 16,
        minZoom: 12
    });

    //Dom manipulation
    var classname = document.getElementsByClassName("filterButton");
    for (var i = 0; i < classname.length; i++) {
        classname[i].addEventListener('click', updateClass, false);
    }

    var currentYear = new Date().getFullYear();
    for (var i = 2004; i <= currentYear; i++) {
        if (i == currentYear - 1) {
            $('#yearSelector').append('<option value="' + i + '" selected>' + i + '</option>');
        } else {
            $('#yearSelector').append('<option value="' + i + '">' + i + '</option>');
        }
    }

    $("#yearSelector").selectmenu({
        position: { my : "left bottom", at: "left bottom" },
        select: function(item) {
            yearFilter = $('.ui-selectmenu-text')[0].innerHTML;
            executeQueryTask();
        }
    });

    $('#yearSelector-button').unbind('mouseout keyup mouseup hover');
    $('#yearSelector-button').click(function(ev){ ev.preventDefault(); });


    //Feature Later    
    var featureLayer = new FeatureLayer("http://gisrevprxy.seattle.gov/arcgis/rest/services/SDOT_EXT/DSG_datasharing/MapServer/51", {
        infoTemplate: new InfoTemplate("Collision:", "${OBJECTID:getData}")
    });

    featureLayer.setDefinitionExpression("INCDATE > date'1-1-2015' AND INCDATE < date'1-1-2016'");
    setIcons(modeFilter);
    map.addLayer(featureLayer);

    function executeQueryTask() {
        var queryString = "";

        //SI & F
        if (injuryFilter > 0) {
            queryString += "(SERIOUSINJURIES > 0 OR FATALITIES > 0) AND "
        }

        //MODE
        if (modeFilter == 1) {
            queryString += "VEHCOUNT > 0 AND PEDCYLCOUNT < 1 and PEDCOUNT < 1 AND "
        } else if (modeFilter == 2) {
            queryString += "PEDCYLCOUNT > 0 AND "
        } else if (modeFilter == 3) {
            queryString += "PEDCOUNT > 0 AND "
        } 

        queryString += "INCDATE > date'1-1-" + yearFilter + "' AND INCDATE < date'1-1-" + (parseInt(yearFilter) + 1) +"'";

        map.removeLayer(featureLayer);
        featureLayer.setDefinitionExpression(queryString);
        setIcons(modeFilter);
        map.addLayer(featureLayer);
    }

    function updateClass() {
        var val = $(this).val();
        //mode case
        if (val > 0) {
            if (modeFilter == val) {
                modeFilter = 0;
            } else {
                modeFilter = val;
            }
        } else {
            if (injuryFilter == 1) {
                injuryFilter = 0;
            } else {
                injuryFilter = 1;
            }
        }

        if (!$(this).hasClass('activeButton') && $(this).hasClass('radio')) {
            $('.radio').each(function() {
                if($(this).hasClass('activeButton')) {
                    $(this).removeClass('activeButton');
                }
            });
        }
        $(this).toggleClass('activeButton');
        executeQueryTask();
    }

    function setIcons(index) {
        var colors = [
            new Color([255, 170, 0, .3]), 
            new Color([135, 169, 107, .3]), 
            new Color([0, 107, 148, .3]), 
            new Color([0, 163, 224, .3])]
        var symbol = new SimpleMarkerSymbol();
        symbol.style = SimpleMarkerSymbol.STYLE_CIRCLE;
        symbol.setSize(8);
        symbol.setColor(colors[index]);
        var renderer = new SimpleRenderer(symbol);
        featureLayer.setRenderer(renderer);
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
        map.centerAndZoom(new Point(evt.mapPoint.x, evt.mapPoint.y - 115, evt.mapPoint.spatialReference),16);
    }
});

function getData(id) {
    var url = "http://gisrevprxy.seattle.gov/arcgis/rest/services/SDOT_EXT/DSG_datasharing/MapServer/51/query?where=&text=&objectIds=" + parseInt(id) + "&time=&geometry=&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=" 
        + "LOCATION%2C+INCDATE%2C+COLLISIONTYPE%2C+FATALITIES%2C+INJURIES%2C+SERIOUSINJURIES%2C+PERSONCOUNT%2C+PEDCOUNT%2C+PEDCYLCOUNT%2C+VEHCOUNT%2C+LIGHTCOND%2C+WEATHER" + 
        "&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=pjson";
    getResults(url, function(resultData) {
        var html = "";
        for (var key in resultData) {
            var newKey = key;
            for(var object in descriptions) {
                if (descriptions[object].key == key) {
                    newKey = descriptions[object].value;
                }
            }
            html += "<strong>" + capitalizeFirstLetter(newKey.toLowerCase()) + "</strong>: ";
            if (typeof resultData[key] == "string") {
                html += toTitleCase(resultData[key]) + "<br />";
            } else if (key === "INCDATE") {
                var dateString = new Date(resultData[key]).toString();
                dateString = dateString.substring(0, dateString.length - 23);
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