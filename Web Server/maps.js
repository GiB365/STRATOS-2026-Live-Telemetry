var balloonIcon = L.divIcon({
    className: 'icons-sprite icon-balloon', // Combined CSS classes
    iconSize: [32, 32],                // Match your icon dimensions
    iconAnchor: [16, 32],              // Tip of the icon layout point
    popupAnchor: [0, -32]              // Popup appearance offset
});

let markers = [];
var map;

function initLeaflet() {
  map = L.map('map').setView([48.4758, -81.3305], 13);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
}

function connectDots(data) {
    var features = data.features,
        feature,
        c = [],
        i;

    for (i = 0; i < features.length; i += 1) {
        feature = features[i];
        // Make sure this feature is a point.
        if (feature.geometry === "Point") {
            c.push(feature.geometry.coordinates);
        }
        else {
          console.log("Feature is not a point")
        }
    }
    return c;
}


function updateFromDatabase() {
  fetch("./script.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log("Success:", data)

    markers.forEach(marker => {
      marker.remove();
    })

    let trailPoints = [];

    for (let i = 0; i < data.length; i++) {
      let latitude = Number(data[i].latitude).toFixed(2);
      let longitude = Number(data[i].longitude).toFixed(2);
      let altitude = (data[i].altitude/3.281).toFixed(2);
      let climb_rate = Number(data[i].climb).toFixed(4);
      let temperature = Number(data[i].temperature).toFixed(2);
      let humidity = Number(data[i].humidity).toFixed(2);
      let pressure = Number(data[i].pressure).toFixed(2);
      let satellites = Number(data[i].satellites);

      markers.push(L.marker([data[i].latitude, data[i].longitude],
        {icon: balloonIcon}).addTo(map).bindPopup(
        `${data[i].reading_time} <br> Lat: ${latitude}° Long: ${longitude}° <br>
        Alt: ${altitude}m Climb rate: ${climb_rate} m/s <br>
        Temp: ${temperature}° Hum: ${humidity}% Pres: ${pressure}hPa <br>
        Sats: ${satellites}`).getElement());

      trailPoints.push([data[i].latitude, data[i].longitude]);
    }

    console.log(trailPoints)
    let polyline = L.polyline(trailPoints, {color: 'blue'}).addTo(map);
    
  })
  .catch(error => console.error("Error:", error));
}

initLeaflet();

console.log(markers)

updateFromDatabase();
setInterval(updateFromDatabase, 10000);