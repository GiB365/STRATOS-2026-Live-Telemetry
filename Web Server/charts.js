let graphs = document.getElementById("graphs");
let graphs_elements = [];
let database = [];

let database_rows = {
    Time: [0, "Time"],
    Latitude: [1, "Latitude"],
    Longitude: [2, "Longitude"],
    Altitude: [3, "Altitude"],
    Climb_Rate: [4, "Climb Rate"],
    Drift: [5, "Drift"],
    Temperature: [6, "Temperature"],
    Humidity: [7, "Humidity"],
    Pressure: [8, "Pressure"],
    Satellites: [9, "Satellites"]
}

async function updateFromDatabase() {
    fetch("./script.php", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    }
    })
    .then(response => response.json())
    .then(data => {
        database = [];

        for (let i = 0; i < data.length; i++) {
            let reading_time = data[i].reading_time.substring(10);
            let latitude = Number(data[i].latitude).toFixed(2);
            let longitude = Number(data[i].longitude).toFixed(2);
            let altitude = (data[i].altitude/3.281).toFixed(2);
            let climb_rate = Number(data[i].climb).toFixed(4);
            let temperature = Number(data[i].temperature).toFixed(2);
            let humidity = Number(data[i].humidity).toFixed(2);
            let pressure = Number(data[i].pressure).toFixed(2);
            let satellites = Number(data[i].satellites);
            
            let drift = 0.0;
            
            if (i != 0) {
                let lat_drift = data[i].latitude - data[i-1].latitude;
                let long_drift = data[i].longitude - data[i-1].longitude;

                drift = Math.sqrt(lat_drift**2 + long_drift**2);
            }

            database.push([reading_time, latitude, longitude, altitude, climb_rate, drift, temperature, humidity, pressure, satellites]);   
        }

        if (graphs_elements.length == 0) {
            graphs_elements.push(newChart(database_rows.Time, database_rows.Altitude));
            graphs_elements.push(newChart(database_rows.Altitude, database_rows.Climb_Rate));
            graphs_elements.push(newChart(database_rows.Altitude, database_rows.Drift));
            graphs_elements.push(newChart(database_rows.Altitude, database_rows.Temperature));
            graphs_elements.push(newChart(database_rows.Altitude, database_rows.Humidity));
            graphs_elements.push(newChart(database_rows.Altitude, database_rows.Pressure));
        }
        else {
            updateChart(graphs_elements[0], database_rows.Time, database_rows.Altitude);
            updateChart(graphs_elements[1], database_rows.Altitude, database_rows.Climb_Rate);
            updateChart(graphs_elements[2], database_rows.Altitude, database_rows.Drift);
            updateChart(graphs_elements[3], database_rows.Altitude, database_rows.Temperature);
            updateChart(graphs_elements[4], database_rows.Altitude, database_rows.Humidity);
            updateChart(graphs_elements[5], database_rows.Altitude, database_rows.Pressure);
        }
    })
    .catch(error => console.error("Error:", error));
}

function updateChart(chart, label_index, data_index) {
    let labels = [];
    let data = [];

    database.forEach(row => {
        labels.push(row[label_index[0]]);
        data.push(row[data_index[0]]);
    });

    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();

    return chart;
}
function newChart(label_index, data_index) {
    let labels = [];
    let data = [];

    database.forEach(row => {
        labels.push(row[label_index[0]]);
        data.push(row[data_index[0]]);
    });

    let container = document.createElement("div");
    container.className = "graph";

    let element = document.createElement("canvas");
    graphs.appendChild(container)
    container.appendChild(element)

    return new Chart(element, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
                beginAtZero: true,

                title: {
                    display: true,
                    text: `${data_index[1]}`
                }
            },
            x: {
                title: {
                    display: true,
                    text: `${label_index[1]}`
                }
            }
            
            
          },
          plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: `${data_index[1]} over ${label_index[1]}`
            }
          }
        }
    });
}

updateFromDatabase();
setInterval(updateFromDatabase, 10000);
