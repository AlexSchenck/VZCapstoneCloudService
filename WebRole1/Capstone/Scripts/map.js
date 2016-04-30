window.onload = function() {
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    var mapData = [
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [-122.35311796399998, 47.526519044000054]
            },
            "properties": {
                "location": "14TH AVE SW AND SW CLOVERDALE ST",
                "weather": "Overcast"
            }
        }, {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [-122.31219326099995, 47.68850815600007]
            },
            "properties": {
                "location": "15TH AVE NE AND NE 82ND ST",
                "weather": "Cloudy",
            }
        }
    ];

    L.mapbox.accessToken = 'pk.eyJ1IjoiaG1jZDMxMSIsImEiOiJjaW1qbG9kdDUwMHJudXRrZ2c5bGtqb3pjIn0._7P5gdh66m7J9kVHJ58Dyw';
    var mapboxTiles = L.tileLayer('https://api.mapbox.com/v4/hmcd311.pj06k4fi/{z}/{x}/{y}.png?access_token=' + L.mapbox.accessToken, {
        attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    var map = L.map('mapid')
        .addLayer(mapboxTiles)
        .setView([47.6062, -122.3321], 15);

    function onEachFeature(feature, layer) {
        if (feature.properties && feature.properties.location) {
            var popup = L.popup()
                .setContent('<p>Location: ' + feature.properties.location + '<br />Weather: ' + feature.properties.weather + '</p>');
            layer.bindPopup(popup);
        }
    }

    L.geoJson(mapData, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    }).addTo(map);
    
    map.on('popupopen', function(e) {
        var px = map.project(e.popup._latlng); // find the pixel location on the map where the popup anchor is
        px.y -= e.popup._container.clientHeight/2 // find the height of the popup container, divide by 2, subtract from the Y axis of marker location
        map.panTo(map.unproject(px),{animate: true}); // pan to new center
    });

};